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
      clusterIdentityProviderPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName, 'startsWith');

      await clusterIdentityProviderPage.goToAccessControlTab();
      await clusterIdentityProviderPage.goToIdentityProvidersTab();
      await clusterIdentityProviderPage.isIdentityProvidersPage();
    });

    test('Verify Identity Providers section layout', async ({ clusterIdentityProviderPage }) => {
      await expect(clusterIdentityProviderPage.identityProvidersHeading()).toBeVisible();
      await expect(clusterIdentityProviderPage.learnMoreLink()).toBeVisible();
      await expect(clusterIdentityProviderPage.addIdentityProviderDropdown()).toBeVisible();
    });

    test('Verify Add identity provider dropdown contains GitHub option', async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openAddIdpDropdown();
      await expect(clusterIdentityProviderPage.addIdpDropdownItem('GitHub')).toBeVisible();
      await clusterIdentityProviderPage.pressKey('Escape');
    });

    test('Create GitHub IDP with Organizations - verify form and submit (OCP-23708)', async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.selectIdpType('GitHub');

      await expect(clusterIdentityProviderPage.nameInput()).toBeVisible();
      await expect(clusterIdentityProviderPage.clientIdInput()).toBeVisible();
      await expect(clusterIdentityProviderPage.clientSecretInput()).toBeVisible();
      await expect(clusterIdentityProviderPage.hostnameInput()).toBeVisible();
      await expect(clusterIdentityProviderPage.useOrganizationsRadio()).toBeVisible();
      await expect(clusterIdentityProviderPage.useTeamsRadio()).toBeVisible();

      const nameValue = await clusterIdentityProviderPage.nameInput().inputValue();
      expect(nameValue).toMatch(/^GitHub/);

      await expect(clusterIdentityProviderPage.createButton()).toBeDisabled();

      await clusterIdentityProviderPage.nameInput().clear();
      await clusterIdentityProviderPage.nameInput().fill(idpName);
      await clusterIdentityProviderPage.clientIdInput().fill(clientId);
      await clusterIdentityProviderPage.clientSecretInput().fill(clientSecret);
      await clusterIdentityProviderPage.useOrganizationsRadio().click();
      await clusterIdentityProviderPage.organizationsInput().fill(testOrg);

      await clusterIdentityProviderPage.submitCreateAndVerify();
    });

    test('Verify created GitHub IDP appears in table', async ({ clusterIdentityProviderPage }) => {
      await clusterIdentityProviderPage.goToAccessControlTab();
      await clusterIdentityProviderPage.goToIdentityProvidersTab();

      await clusterIdentityProviderPage.verifyIdpExists(idpName, 'GitHub');
      await expect(clusterIdentityProviderPage.copyCallbackUrlButton(idpName)).toBeVisible();
    });

    test('Create GitHub IDP with Teams, Hostname, and CA (OCP-23708)', async ({
      clusterIdentityProviderPage,
      page,
    }) => {
      await page.reload();
      await clusterIdentityProviderPage.goToIdentityProvidersTab();
      await clusterIdentityProviderPage.selectIdpType('GitHub');
      await expect(clusterIdentityProviderPage.nameInput()).toHaveValue(/^GitHub/);

      await clusterIdentityProviderPage.nameInput().fill(idpName);
      await clusterIdentityProviderPage.nameInput().blur();
      await expect(clusterIdentityProviderPage.duplicateNameError()).toBeVisible();
      await expect(clusterIdentityProviderPage.createButton()).toBeDisabled();

      await clusterIdentityProviderPage.nameInput().clear();
      await clusterIdentityProviderPage.nameInput().fill(idpNameTeams);

      await clusterIdentityProviderPage.clientIdInput().fill(clientId);
      await clusterIdentityProviderPage.clientSecretInput().fill(clientSecret);

      await clusterIdentityProviderPage.hostnameInput().fill(testData.Hostname);
      await clusterIdentityProviderPage.uploadCaFile(testData.CaContent);

      await clusterIdentityProviderPage.useTeamsRadio().click();
      await clusterIdentityProviderPage.teamsInput().fill(testData.Team);

      await clusterIdentityProviderPage.submitCreateAndVerify();
    });

    test('Verify Teams-based GitHub IDP appears in table', async ({ clusterIdentityProviderPage }) => {
      await clusterIdentityProviderPage.goToAccessControlTab();
      await clusterIdentityProviderPage.goToIdentityProvidersTab();

      await clusterIdentityProviderPage.verifyIdpExists(idpNameTeams, 'GitHub');
    });

    test('Edit Teams IDP - verify Hostname and CA, validate Hostname required (OCP-32006)', async ({
      clusterIdentityProviderPage,
      page,
    }) => {
      await page.reload();
      await clusterIdentityProviderPage.goToAccessControlTab();
      await clusterIdentityProviderPage.goToIdentityProvidersTab();
      await clusterIdentityProviderPage.clickEditIdp(idpNameTeams);
      await expect(clusterIdentityProviderPage.editIdpHeading()).toBeVisible();

      const hostnameValue = await clusterIdentityProviderPage.hostnameInput().inputValue();
      expect(hostnameValue).toBe(testData.Hostname);

      await expect(clusterIdentityProviderPage.caFileTextarea()).toBeVisible();

      await clusterIdentityProviderPage.uploadCaFile(testData.CaContent);
      await clusterIdentityProviderPage.hostnameInput().clear();
      await clusterIdentityProviderPage.hostnameInput().blur();
      await expect(clusterIdentityProviderPage.confirmButton()).toBeDisabled();

      await clusterIdentityProviderPage.cancelFormAndReturnToIdpTab();
    });

    test('Edit GitHub IDP - verify pre-filled values including Mapping Method (OCP-32006)', async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.clickEditIdp(idpName);
      await expect(clusterIdentityProviderPage.editIdpHeading()).toBeVisible();

      await expect(clusterIdentityProviderPage.mappingMethodValue()).toContainText(testData.MappingMethod);

      const clientIdValue = await clusterIdentityProviderPage.clientIdInput().inputValue();
      expect(clientIdValue).toBe(clientId);

      const clientSecretValue = await clusterIdentityProviderPage.clientSecretInput().inputValue();
      expect(clientSecretValue).toBeTruthy();

      await expect(clusterIdentityProviderPage.useOrganizationsRadio()).toBeChecked();
      const orgValue = await clusterIdentityProviderPage.organizationsInput().inputValue();
      expect(orgValue).toBe(testOrg);

      await clusterIdentityProviderPage.cancelFormAndReturnToIdpTab();
    });

    test('Edit GitHub IDP - update Client ID and verify change (OCP-32006)', async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.clickEditIdp(idpName);
      await expect(clusterIdentityProviderPage.editIdpHeading()).toBeVisible();

      await clusterIdentityProviderPage.clientIdInput().clear();
      await clusterIdentityProviderPage.clientIdInput().blur();
      await expect(clusterIdentityProviderPage.requiredFieldError()).toBeVisible();
      await expect(clusterIdentityProviderPage.confirmButton()).toBeDisabled();

      await clusterIdentityProviderPage.clientIdInput().fill(testData.UpdatedClientId);

      await clusterIdentityProviderPage.submitEditAndVerify();
    });

    test('Edit GitHub IDP - switch from Organizations to Teams (OCP-32006)', async ({
      clusterIdentityProviderPage,
      page,
    }) => {
      await page.reload();
      await clusterIdentityProviderPage.goToAccessControlTab();
      await clusterIdentityProviderPage.goToIdentityProvidersTab();

      await clusterIdentityProviderPage.clickEditIdp(idpName);
      await expect(clusterIdentityProviderPage.editIdpHeading()).toBeVisible();

      await clusterIdentityProviderPage.useTeamsRadio().click();
      await expect(clusterIdentityProviderPage.teamsInput()).toBeVisible();
      await clusterIdentityProviderPage.teamsInput().fill(testData.UpdatedTeam);

      await clusterIdentityProviderPage.submitEditAndVerify();
    });

    test('Delete GitHub IDP (Organizations) and verify removal', async ({ clusterIdentityProviderPage }) => {
      await clusterIdentityProviderPage.goToAccessControlTab();
      await clusterIdentityProviderPage.goToIdentityProvidersTab();

      await clusterIdentityProviderPage.deleteIdp(idpName);
      await expect(clusterIdentityProviderPage.idpRow(idpName)).toBeHidden({ timeout: 30000 });
    });

    test('Delete GitHub IDP (Teams) and verify removal', async ({ clusterIdentityProviderPage }) => {
      await clusterIdentityProviderPage.deleteIdp(idpNameTeams);
      await expect(clusterIdentityProviderPage.idpRow(idpNameTeams)).toBeHidden({ timeout: 30000 });
    });

    test.afterAll(async ({ clusterIdentityProviderPage }) => {
      try {
        await clusterIdentityProviderPage.goToAccessControlTab();
        await clusterIdentityProviderPage.goToIdentityProvidersTab();

        for (const name of [idpName, idpNameTeams]) {
          const idpRowVisible = await clusterIdentityProviderPage.idpRow(name).isVisible();
          if (idpRowVisible) {
            await clusterIdentityProviderPage.deleteIdp(name);
          }
        }
      } catch {
        console.log('IDP cleanup: some IDPs already deleted or not found');
      }
    });
  },
);
