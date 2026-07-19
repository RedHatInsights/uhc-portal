import { expect, test } from '../../fixtures/pages';
import { ClusterIdentityProviderPage } from '../../page-objects/cluster-identity-provider-page';

const {
  'rosa-hosted-public-advanced': clusterProfile,
} = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const htpasswdProfile = require('../../fixtures/access-control/identity-provider-htpasswd.json');

const clusterName = process.env.CLUSTER_NAME || clusterProfile['day1-profile'].ClusterName;
const commonIdpName = htpasswdProfile.Htpasswd.Common.IDPName;
const manualProfile = htpasswdProfile.Htpasswd.Manual;

// Short suffix makes each run's IDP names unique, preventing collisions on retries or shared clusters.
const runId = Math.random().toString(36).slice(2, 5);
const htpasswdIdpNames = [`HtpasswdSingleUser-${runId}`, `HtpasswdMultipleUsers-${runId}`];
const singleUserUsername = manualProfile.Usernames.ValidUsernameWithSpaces;
// >10 users required to exercise per-page-10 pagination; +1 extra reserved for the add-user edit modal test
const BULK_USER_COUNT = 15;
const bulkUsers = Array.from({ length: BULK_USER_COUNT + 1 }, (_, i) => `ocmplaywright${i + 1}`);

const fillHtpasswdUsersSequentially = async (
  clusterIdentityProviderPage: ClusterIdentityProviderPage,
  userCount: number,
) => {
  /* eslint-disable no-await-in-loop -- each user must be added before the next Add user click */
  for (let index = 0; index < userCount; index += 1) {
    await clusterIdentityProviderPage.htpasswdUsernameInput().fill(bulkUsers[index]);
    await clusterIdentityProviderPage.fillSuggestedPassword();
    await clusterIdentityProviderPage.fillSuggestedConfirmPassword();

    if (index < userCount - 1) {
      await clusterIdentityProviderPage.addUserButton().click();
    }
  }
  /* eslint-enable no-await-in-loop */
};

test.describe.serial(
  'ROSA Hosted Public Cluster - Htpasswd IDP validation (OCP-42373, OCP-42372, OCP-28661)',
  { tag: ['@day2', '@access-control', '@rosa-hosted', '@hcp', '@idp', '@htpasswd'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test.afterAll(async ({ clusterIdentityProviderPage }) => {
      await clusterIdentityProviderPage.deleteHtpasswdIDP(htpasswdIdpNames[0]).catch(() => {});
      await clusterIdentityProviderPage.deleteHtpasswdIDP(htpasswdIdpNames[1]).catch(() => {});
    });

    test(`Navigate to the ROSA Hosted Access Control tab for ${clusterName} cluster`, async ({
      clusterListPage,
      clusterRolesAndAccessPage,
      clusterIdentityProviderPage,
    }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterRolesAndAccessPage.goToAccessControlTab();
      await clusterIdentityProviderPage.goToIdentityProvidersTab();
    });

    test(`Validate Htpasswd IDP form field errors for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await expect(
        clusterIdentityProviderPage.getByText(commonIdpName.DefaultNameInformation),
      ).toBeVisible();

      await clusterIdentityProviderPage.htpasswdNameInput().fill(' ');
      await clusterIdentityProviderPage.htpasswdNameInput().blur();
      await expect(
        clusterIdentityProviderPage.getByText(commonIdpName.EmptyNameError),
      ).toBeVisible();

      await clusterIdentityProviderPage
        .htpasswdNameInput()
        .fill(commonIdpName.InvalidHtPasswdName[0]);
      await clusterIdentityProviderPage.htpasswdNameInput().blur();
      await expect(
        clusterIdentityProviderPage.getByText(commonIdpName.InvalidHtPasswdNameError),
      ).toBeVisible();

      await expect(
        clusterIdentityProviderPage.getByText(manualProfile.Usernames.DefaultUsernameInformation),
      ).toBeVisible();

      await clusterIdentityProviderPage.htpasswdUsernameInput().fill(' ');
      await clusterIdentityProviderPage.htpasswdUsernameInput().clear();
      await clusterIdentityProviderPage.htpasswdUsernameInput().blur();
      await expect(
        clusterIdentityProviderPage.getByText(manualProfile.Usernames.EmptyUserNameError),
      ).toBeVisible();

      await clusterIdentityProviderPage
        .htpasswdUsernameInput()
        .fill(manualProfile.Usernames.InvalidUserNameInput[0]);
      await expect(
        clusterIdentityProviderPage.getByText(manualProfile.Usernames.InValidUserNameError),
      ).toBeVisible();

      await clusterIdentityProviderPage
        .htpasswdUsernameInput()
        .fill(manualProfile.Usernames.InvalidUsernameWithLeadingSpace);
      await clusterIdentityProviderPage.htpasswdUsernameInput().blur();
      await expect(
        clusterIdentityProviderPage.getByText(manualProfile.Usernames.LeadingTrailingSpaceError),
      ).toBeVisible();

      await clusterIdentityProviderPage
        .htpasswdUsernameInput()
        .fill(manualProfile.Usernames.InvalidUsernameWithTrailingSpace);
      await clusterIdentityProviderPage.htpasswdUsernameInput().blur();
      await expect(
        clusterIdentityProviderPage.getByText(manualProfile.Usernames.LeadingTrailingSpaceError),
      ).toBeVisible();

      await clusterIdentityProviderPage.htpasswdUsernameInput().fill('a'.repeat(256));
      await clusterIdentityProviderPage.htpasswdUsernameInput().blur();
      await expect(
        clusterIdentityProviderPage.getByText(manualProfile.Usernames.UsernameTooLongError),
      ).toBeVisible();

      await clusterIdentityProviderPage.htpasswdUsernameInput().fill(singleUserUsername);
      await clusterIdentityProviderPage.htpasswdUsernameInput().blur();
      await expect(
        clusterIdentityProviderPage.getByText(manualProfile.Usernames.InValidUserNameError),
      ).not.toBeVisible();

      await Promise.all(
        manualProfile.Password.DefaultPasswordInformation.map((info: string) =>
          expect(clusterIdentityProviderPage.getByText(info)).toBeVisible(),
        ),
      );
      await expect(
        clusterIdentityProviderPage.getByText(manualProfile.Password.ConfirmPassword),
      ).toBeVisible();

      await expect(clusterIdentityProviderPage.addUserButton()).toBeDisabled();
      await clusterIdentityProviderPage.cancelIdpForm();
    });

    test(`Create Htpasswd IDP with a single user for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await clusterIdentityProviderPage.htpasswdNameInput().fill(htpasswdIdpNames[0]);
      await clusterIdentityProviderPage.htpasswdUsernameInput().fill(singleUserUsername);
      await clusterIdentityProviderPage.fillSuggestedPassword();
      await clusterIdentityProviderPage.fillSuggestedConfirmPassword();

      await clusterIdentityProviderPage.idpFormSubmitButton().click();
      await clusterIdentityProviderPage.waitForIdpToAppearInTable(htpasswdIdpNames[0]);
    });

    test(`Create Htpasswd IDP  with multiple users for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await fillHtpasswdUsersSequentially(clusterIdentityProviderPage, BULK_USER_COUNT);

      await clusterIdentityProviderPage.htpasswdNameInput().fill(htpasswdIdpNames[1]);
      await clusterIdentityProviderPage.idpFormSubmitButton().click();
      await clusterIdentityProviderPage.waitForIdpToAppearInTable(htpasswdIdpNames[1]);
    });

    test(`Verify IDP table shows Name, Type and Auth callback URL columns for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await Promise.all(
        ['Name', 'Type', 'Auth callback URL'].map((column) =>
          expect(
            clusterIdentityProviderPage
              .identityProvidersTable()
              .getByRole('columnheader')
              .filter({ hasText: column }),
          ).toBeVisible({ timeout: 20000 }),
        ),
      );
    });

    test(`Expand  IDP collapsible and verify users are listed`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.identityProviderExpandToggle(htpasswdIdpNames[1]).click();
      await expect(clusterIdentityProviderPage.getByText(bulkUsers[3])).toBeVisible();
    });

    test(`Open Edit modal for an IDP and verify user filter behaviour`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.editHtpasswdIDP(htpasswdIdpNames[1]);

      await expect(clusterIdentityProviderPage.editIdpPageTitle()).toBeVisible();
      await expect(clusterIdentityProviderPage.getByText(bulkUsers[1])).toBeVisible();

      await clusterIdentityProviderPage
        .filterByUsernameInput()
        .fill(manualProfile.Usernames.InvalidUserNameInput[0]);
      await expect(
        clusterIdentityProviderPage.getByText(manualProfile.Usernames.NoMatchingUserName),
      ).toBeVisible();

      await clusterIdentityProviderPage.clearAllFiltersButton().click();
      await clusterIdentityProviderPage.scrollToBottom();
    });

    test(`Verify edit modal user table pagination for an IDP`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.scrollToBottom();
      await expect(clusterIdentityProviderPage.editModalUsersTableRows()).toHaveCount(
        BULK_USER_COUNT,
      );

      await clusterIdentityProviderPage.itemPerPage().click();
      await clusterIdentityProviderPage.clickPerPageItem('10');
      await expect(clusterIdentityProviderPage.editModalUsersTableRows()).toHaveCount(
        Math.min(BULK_USER_COUNT, 10),
      );

      await clusterIdentityProviderPage.itemPerPage().click();
      await clusterIdentityProviderPage.clickPerPageItem('20');
      await expect(clusterIdentityProviderPage.editModalUsersTableRows()).toHaveCount(
        BULK_USER_COUNT,
      );

      await clusterIdentityProviderPage.itemPerPage().click();
      await clusterIdentityProviderPage.clickPerPageItem('50');

      await clusterIdentityProviderPage.itemPerPage().click();
      await clusterIdentityProviderPage.clickPerPageItem('100');
    });

    test(`Add a new user to an IDP via the edit modal`, async ({ clusterIdentityProviderPage }) => {
      await clusterIdentityProviderPage.addUserButton().click();

      await clusterIdentityProviderPage.htpasswdUsernameInput().fill(bulkUsers[BULK_USER_COUNT]);
      await clusterIdentityProviderPage.fillSuggestedPassword();
      await clusterIdentityProviderPage.fillSuggestedConfirmPassword();

      await clusterIdentityProviderPage.addUserModalSubmitButton().click();
      await clusterIdentityProviderPage.waitForAddUserDialogToClose();
    });

    test(`Delete both htpasswd IDPs created during the test for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.goToAccessControlTab();

      await clusterIdentityProviderPage.deleteHtpasswdIDP(htpasswdIdpNames[0]);
      await clusterIdentityProviderPage.waitForDeleteIdpDialogToClose();

      await clusterIdentityProviderPage.deleteHtpasswdIDP(htpasswdIdpNames[1]);
      await clusterIdentityProviderPage.waitForDeleteIdpDialogToClose();
    });
  },
);
