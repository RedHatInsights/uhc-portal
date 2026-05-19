import { expect, test } from '../../fixtures/pages';

const {
  'rosa-hosted-public-advanced': clusterProfile,
} = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const testData = require('../../fixtures/access-control/identity-providers-github.spec.json');

test.describe.serial(
  'GitHub Identity Provider - Access Control (OCP-23708, OCP-32006)',
  { tag: ['@day2', '@access-control', '@rosa-hosted', '@hcp', '@idp'] },
  () => {
    const clusterName = process.env.CLUSTER_NAME || clusterProfile['day1-profile'].ClusterName;
    const clientId = process.env.GITHUB_CLIENT_ID || testData.ClientId;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || testData.ClientSecret;
    const testOrg = process.env.GITHUB_TEST_ORG || testData.Organization;

    const idpNameSuffix = Math.random().toString(36).slice(2, 7);
    const idpName = `GitHub-${idpNameSuffix}`;
    const idpNameTeams = `GitHub-Teams-${idpNameSuffix}`;

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
    });

    test('Navigate to cluster and Access Control > Identity Providers tab', async ({
      clusterListPage,
      identityProvidersPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);

      await identityProvidersPage.goToAccessControlTab();
      await identityProvidersPage.goToIdentityProvidersTab();
      await identityProvidersPage.isIdentityProvidersPage();
    });

    test('Verify Identity Providers section layout', async ({ identityProvidersPage }) => {
      await expect(identityProvidersPage.identityProvidersHeading()).toBeVisible();
      await expect(identityProvidersPage.learnMoreLink()).toBeVisible();
      await expect(identityProvidersPage.addIdentityProviderDropdown()).toBeVisible();
    });

    test('Verify Add identity provider dropdown contains GitHub option', async ({
      identityProvidersPage,
    }) => {
      await identityProvidersPage.openAddIdpDropdown();
      await expect(identityProvidersPage.addIdpDropdownItem('GitHub')).toBeVisible();
      await identityProvidersPage.pressKey('Escape');
    });

    test('Create GitHub IDP with Organizations - verify form and submit (OCP-23708)', async ({
      identityProvidersPage,
    }) => {
      await identityProvidersPage.selectIdpType('GitHub');

      await expect(identityProvidersPage.nameInput()).toBeVisible();
      await expect(identityProvidersPage.clientIdInput()).toBeVisible();
      await expect(identityProvidersPage.clientSecretInput()).toBeVisible();
      await expect(identityProvidersPage.hostnameInput()).toBeVisible();
      await expect(identityProvidersPage.useOrganizationsRadio()).toBeVisible();
      await expect(identityProvidersPage.useTeamsRadio()).toBeVisible();

      const nameValue = await identityProvidersPage.nameInput().inputValue();
      expect(nameValue).toMatch(/^GitHub/);

      await expect(identityProvidersPage.createButton()).toBeDisabled();

      await identityProvidersPage.nameInput().clear();
      await identityProvidersPage.nameInput().fill(idpName);
      await identityProvidersPage.clientIdInput().fill(clientId);
      await identityProvidersPage.clientSecretInput().fill(clientSecret);
      await identityProvidersPage.useOrganizationsRadio().click();
      await identityProvidersPage.organizationsInput().fill(testOrg);

      await identityProvidersPage.submitCreateAndVerify();
    });

    test('Verify created GitHub IDP appears in table', async ({ identityProvidersPage }) => {
      await identityProvidersPage.goToAccessControlTab();
      await identityProvidersPage.goToIdentityProvidersTab();

      await identityProvidersPage.verifyIdpExists(idpName, 'GitHub');
      await expect(identityProvidersPage.copyCallbackUrlButton(idpName)).toBeVisible();
    });

    test('Create GitHub IDP with Teams, Hostname, and CA (OCP-23708)', async ({
      identityProvidersPage,
      page,
    }) => {
      await page.reload();
      await identityProvidersPage.goToIdentityProvidersTab();
      await identityProvidersPage.selectIdpType('GitHub');
      await expect(identityProvidersPage.nameInput()).toHaveValue(/^GitHub/);

      await identityProvidersPage.nameInput().fill(idpName);
      await identityProvidersPage.nameInput().blur();
      await expect(identityProvidersPage.duplicateNameError()).toBeVisible();
      await expect(identityProvidersPage.createButton()).toBeDisabled();

      await identityProvidersPage.nameInput().clear();
      await identityProvidersPage.nameInput().fill(idpNameTeams);

      await identityProvidersPage.clientIdInput().fill(clientId);
      await identityProvidersPage.clientSecretInput().fill(clientSecret);

      await identityProvidersPage.hostnameInput().fill(testData.Hostname);
      await identityProvidersPage.uploadCaFile(testData.CaContent);

      await identityProvidersPage.useTeamsRadio().click();
      await identityProvidersPage.teamsInput().fill(testData.Team);

      await identityProvidersPage.submitCreateAndVerify();
    });

    test('Verify Teams-based GitHub IDP appears in table', async ({ identityProvidersPage }) => {
      await identityProvidersPage.goToAccessControlTab();
      await identityProvidersPage.goToIdentityProvidersTab();

      await identityProvidersPage.verifyIdpExists(idpNameTeams, 'GitHub');
    });

    test('Edit Teams IDP - verify Hostname and CA, validate Hostname required (OCP-32006)', async ({
      identityProvidersPage,
      page,
    }) => {
      await page.reload();
      await identityProvidersPage.goToAccessControlTab();
      await identityProvidersPage.goToIdentityProvidersTab();
      await identityProvidersPage.clickEditIdp(idpNameTeams);
      await expect(identityProvidersPage.editIdpHeading()).toBeVisible();

      const hostnameValue = await identityProvidersPage.hostnameInput().inputValue();
      expect(hostnameValue).toBe(testData.Hostname);

      await expect(identityProvidersPage.caFileTextarea()).toBeVisible();

      await identityProvidersPage.uploadCaFile(testData.CaContent);
      await identityProvidersPage.hostnameInput().clear();
      await identityProvidersPage.hostnameInput().blur();
      await expect(identityProvidersPage.confirmButton()).toBeDisabled();

      await identityProvidersPage.cancelFormAndReturnToIdpTab();
    });

    test('Edit GitHub IDP - verify pre-filled values including Mapping Method (OCP-32006)', async ({
      identityProvidersPage,
    }) => {
      await identityProvidersPage.clickEditIdp(idpName);
      await expect(identityProvidersPage.editIdpHeading()).toBeVisible();

      await expect(identityProvidersPage.mappingMethodValue()).toContainText(testData.MappingMethod);

      const clientIdValue = await identityProvidersPage.clientIdInput().inputValue();
      expect(clientIdValue).toBe(clientId);

      const clientSecretValue = await identityProvidersPage.clientSecretInput().inputValue();
      expect(clientSecretValue).toBeTruthy();

      await expect(identityProvidersPage.useOrganizationsRadio()).toBeChecked();
      const orgValue = await identityProvidersPage.organizationsInput().inputValue();
      expect(orgValue).toBe(testOrg);

      await identityProvidersPage.cancelFormAndReturnToIdpTab();
    });

    test('Edit GitHub IDP - update Client ID and verify change (OCP-32006)', async ({
      identityProvidersPage,
    }) => {
      await identityProvidersPage.clickEditIdp(idpName);
      await expect(identityProvidersPage.editIdpHeading()).toBeVisible();

      await identityProvidersPage.clientIdInput().clear();
      await identityProvidersPage.clientIdInput().blur();
      await expect(identityProvidersPage.requiredFieldError()).toBeVisible();
      await expect(identityProvidersPage.confirmButton()).toBeDisabled();

      await identityProvidersPage.clientIdInput().fill(testData.UpdatedClientId);

      await identityProvidersPage.submitEditAndVerify();
    });

    test('Edit GitHub IDP - switch from Organizations to Teams (OCP-32006)', async ({
      identityProvidersPage,
      page,
    }) => {
      await page.reload();
      await identityProvidersPage.goToAccessControlTab();
      await identityProvidersPage.goToIdentityProvidersTab();

      await identityProvidersPage.clickEditIdp(idpName);
      await expect(identityProvidersPage.editIdpHeading()).toBeVisible();

      await identityProvidersPage.useTeamsRadio().click();
      await expect(identityProvidersPage.teamsInput()).toBeVisible();
      await identityProvidersPage.teamsInput().fill(testData.UpdatedTeam);

      await identityProvidersPage.submitEditAndVerify();
    });

    test('Delete GitHub IDP (Organizations) and verify removal', async ({ identityProvidersPage }) => {
      await identityProvidersPage.goToAccessControlTab();
      await identityProvidersPage.goToIdentityProvidersTab();

      await identityProvidersPage.deleteIdp(idpName);
      await expect(identityProvidersPage.idpRow(idpName)).toBeHidden({ timeout: 30000 });
    });

    test('Delete GitHub IDP (Teams) and verify removal', async ({ identityProvidersPage }) => {
      await identityProvidersPage.deleteIdp(idpNameTeams);
      await expect(identityProvidersPage.idpRow(idpNameTeams)).toBeHidden({ timeout: 30000 });
    });

    test.afterAll(async ({ identityProvidersPage }) => {
      try {
        await identityProvidersPage.goToAccessControlTab();
        await identityProvidersPage.goToIdentityProvidersTab();

        for (const name of [idpName, idpNameTeams]) {
          const idpRowVisible = await identityProvidersPage.idpRow(name).isVisible();
          if (idpRowVisible) {
            await identityProvidersPage.deleteIdp(name);
          }
        }
      } catch {
        console.log('IDP cleanup: some IDPs already deleted or not found');
      }
    });
  },
);
