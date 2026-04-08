import { test, expect } from '../../fixtures/pages';

const clusterProperties = require('../../fixtures/osd-aws/osd-ccs-aws-advanced-cluster-creation.spec.json');
const clusterName = process.env.CLUSTER_NAME || clusterProperties?.ClusterName || '';

const htpasswdDefinitions = {
  testDummyHtpasswdName: Array.from({ length: 3 }, (_, i) => `OsdAwsHtpasswdName${i + 1}`),
  dummyUserNames: Array.from({ length: 15 }, (_, i) => `playwrightUsr${i + 1}`),
  dummyPassword: `OcmPlaywrightTest!${123}`,
  dummyNewUserName: `${'ocm'}addnewuser`,
}; // notsecret

const htpasswdValidations = {
  HtPasswdName: {
    DefaultNameInformation: 'Unique name for the identity provider. This cannot be changed later.',
    EmptyNameError: 'Name must not contain whitespaces',
    InvalidHtPasswdName: ['OsdR%%'],
    InvalidHtPasswdNameError: 'Name should contain only alphanumeric and dashes',
  },
  Usernames: {
    EmptyUserNameError: 'Username is required',
    InvalidUserNameInput: ['Osd%aws:asd', '1234567890'],
    InValidUserNameError: 'Username must not contain /, :, %, or empty spaces.',
    DefaultUsernameInformation: 'Unique name of the user within the cluster.',
    NoMatchingUserName: 'No results found',
  },
  Password: {
    DefaultPasswordInformation: [
      'At least 14 characters (ASCII-standard) without whitespaces',
      'Include lowercase letters',
      'Include uppercase letters',
      'Include numbers or symbols (ASCII-standard characters only)',
    ],
    ConfirmPassword: 'Retype the password to confirm.',
  },
};

test.describe.serial(
  'OSD AWS CCS Public Cluster - Htpasswd validation - clusters (OCP-42373, OCP-42372, OCP-28661)',
  { tag: ['@day2', '@osd', '@public', '@multi-zone', '@aws'] },
  () => {
    test.beforeAll(async ({ clusterListPage, navigateTo }) => {
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test(`Navigate to the Access Control tab for ${clusterName} cluster`, async ({
      clusterListPage,
      clusterDetailsPage,
    }) => {
      await clusterListPage.searchAndOpenClusterDetailsPage(clusterName);
      await clusterDetailsPage.waitForInstallerScreenToLoad();
      await clusterDetailsPage.accessControlTab().click();
    });

    test(`Validate the elements of ${clusterName} Htpasswd Idp page for errors`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.selectAddIdentityProviderDropdown().click();
      await clusterIdentityProviderPage.clickHtpasswdButton();

      // Validate default name information
      await clusterIdentityProviderPage.isTextContainsInPage(
        htpasswdValidations.HtPasswdName.DefaultNameInformation,
      );

      // Validate empty name error
      await clusterIdentityProviderPage.inputHtpasswdName().clear();
      await clusterIdentityProviderPage.inputHtpasswdName().fill(' ');
      await clusterIdentityProviderPage.inputHtpasswdName().blur();
      await clusterIdentityProviderPage.isTextContainsInPage(
        htpasswdValidations.HtPasswdName.EmptyNameError,
      );

      // Validate invalid htpasswd name error
      await clusterIdentityProviderPage.inputHtpasswdName().clear();
      await clusterIdentityProviderPage
        .inputHtpasswdName()
        .fill(htpasswdValidations.HtPasswdName.InvalidHtPasswdName[0]);
      await clusterIdentityProviderPage.inputHtpasswdName().blur();
      await clusterIdentityProviderPage.isTextContainsInPage(
        htpasswdValidations.HtPasswdName.InvalidHtPasswdNameError,
      );

      // Validate default username information
      await clusterIdentityProviderPage.isTextContainsInPage(
        htpasswdValidations.Usernames.DefaultUsernameInformation,
      );

      // Validate empty username error
      await clusterIdentityProviderPage.inputHtpasswdUserNameField().fill(' ');
      await clusterIdentityProviderPage.inputHtpasswdUserNameField().clear();
      await clusterIdentityProviderPage.isTextContainsInPage(
        htpasswdValidations.Usernames.EmptyUserNameError,
      );

      // Validate invalid username error
      await clusterIdentityProviderPage.inputHtpasswdUserNameField().clear();
      await clusterIdentityProviderPage
        .inputHtpasswdUserNameField()
        .fill(htpasswdValidations.Usernames.InvalidUserNameInput[0]);
      await clusterIdentityProviderPage.isTextContainsInPage(
        htpasswdValidations.Usernames.InValidUserNameError,
      );

      // Validate password information
      for (const passwordInfo of htpasswdValidations.Password.DefaultPasswordInformation) {
        await clusterIdentityProviderPage.isTextContainsInPage(passwordInfo);
      }

      // Validate confirm password information
      await clusterIdentityProviderPage.isTextContainsInPage(
        htpasswdValidations.Password.ConfirmPassword,
      );

      // Verify add user button is disabled
      await expect(clusterIdentityProviderPage.addUserButton()).toBeDisabled();

      // Fill valid data and test add/remove user flow
      await clusterIdentityProviderPage.inputHtpasswdName().clear();
      await clusterIdentityProviderPage
        .inputHtpasswdName()
        .fill(htpasswdDefinitions.testDummyHtpasswdName[0]);
      await clusterIdentityProviderPage.inputHtpasswdUserNameField().clear();
      await clusterIdentityProviderPage
        .inputHtpasswdUserNameField()
        .fill(htpasswdDefinitions.dummyUserNames[0]);

      await clusterIdentityProviderPage.inputPasswordField().clear();
      await clusterIdentityProviderPage
        .inputPasswordField()
        .fill(htpasswdDefinitions.dummyPassword);
      await clusterIdentityProviderPage.inputPasswordField().blur();

      await clusterIdentityProviderPage
        .inputConfirmPasswordField()
        .fill(htpasswdDefinitions.dummyPassword);
      await clusterIdentityProviderPage.inputConfirmPasswordField().blur();

      await clusterIdentityProviderPage.addUserButton().click();
      await clusterIdentityProviderPage.removeUserButton().click();
      await clusterIdentityProviderPage.cancelButton().click();
    });

    test(`Verify the default elements of ${clusterName} Access Control tab`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.selectAddIdentityProviderDropdown().click();
      await clusterIdentityProviderPage.clickHtpasswdButton();

      await clusterIdentityProviderPage.inputHtpasswdName().clear();
      await clusterIdentityProviderPage
        .inputHtpasswdName()
        .fill(htpasswdDefinitions.testDummyHtpasswdName[1]);

      await clusterIdentityProviderPage.inputHtpasswdUserNameField().clear();
      await clusterIdentityProviderPage
        .inputHtpasswdUserNameField()
        .fill(htpasswdDefinitions.dummyUserNames[1]);

      await clusterIdentityProviderPage.inputHtpasswdPasswordWithSuggestion();
      await clusterIdentityProviderPage.inputHtpasswdConfirmPasswordField('');
      await clusterIdentityProviderPage.clickAddButton();
    });

    test(`Input Htpasswd username and password fields names for the ${clusterName} window`, async ({
      clusterDetailsPage,
      clusterIdentityProviderPage,
      page,
    }) => {
      await clusterDetailsPage.accessControlTab().click();
      await clusterIdentityProviderPage.selectAddIdentityProviderDropdown().click();
      await clusterIdentityProviderPage.clickHtpasswdButton();

      const validUserNames = htpasswdDefinitions.dummyUserNames;

      for (let index = 0; index < validUserNames.length; index++) {
        const isLastIteration = index === validUserNames.length - 1;
        const userName = validUserNames[index];
        await clusterIdentityProviderPage.inputHtpasswdUserNameField().fill(userName);
        const password = await clusterIdentityProviderPage.inputHtpasswdPasswordWithSuggestion();
        await clusterIdentityProviderPage.inputHtpasswdConfirmPasswordField(password);

        if (!isLastIteration) {
          await clusterIdentityProviderPage.addUserButton().click();
        }
      }
      await clusterIdentityProviderPage.inputHtpasswdName().clear();
      await clusterIdentityProviderPage
        .inputHtpasswdName()
        .fill(htpasswdDefinitions.testDummyHtpasswdName[2]);
      await clusterIdentityProviderPage.clickAddButton();
      await clusterIdentityProviderPage.waitForAddButtonSpinnerToComplete();
    });

    test(`Verify the Htpasswd IDP details for the OSD ${clusterName} modal window`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.checkIdentityProviderColumnNames('Name');
      await clusterIdentityProviderPage.checkIdentityProviderColumnNames('Type');
      await clusterIdentityProviderPage.checkIdentityProviderColumnNames('Auth callback URL');
    });

    test(`Expand the Htpasswd IDP collapsible for the ${clusterName} modal window`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.collapseIdpDefinitions(
        htpasswdDefinitions.testDummyHtpasswdName[2],
      );
      await clusterIdentityProviderPage.isTextContainsInPage(htpasswdDefinitions.dummyUserNames[3]);
    });

    test(`Select the ${clusterName} Edit actions dropdown for httpasswd IDP created in the above steps`, async ({
      clusterListPage,
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.editHtpasswdIDPToggle(
        htpasswdDefinitions.testDummyHtpasswdName[2],
      );
      await clusterIdentityProviderPage.isEditIdpPageTitle();
      await clusterIdentityProviderPage.isTextContainsInPage(htpasswdDefinitions.dummyUserNames[1]);

      await clusterIdentityProviderPage
        .filterByUsernameField()
        .fill(htpasswdValidations.Usernames.InvalidUserNameInput[0]);
      await clusterIdentityProviderPage.isTextContainsInPage(
        htpasswdValidations.Usernames.NoMatchingUserName,
      );

      await clusterIdentityProviderPage.clickClearAllFiltersLink();
      await clusterListPage.scrollClusterListPageTo('bottom');
    });

    test(`Validations for ${clusterName} edit httpasswd IDP Modal`, async ({
      clusterListPage,
      clusterIdentityProviderPage,
    }) => {
      await clusterListPage.scrollClusterListPageTo('bottom');

      await clusterListPage.itemPerPage().click();
      await clusterListPage.clickPerPageItem('10');

      const truncatedUsername = htpasswdDefinitions.dummyUserNames.slice(0, 10);
      // including the table headers
      await clusterIdentityProviderPage.verifyHTPasswdTableRowCounts(truncatedUsername.length + 1);

      await clusterListPage.itemPerPage().click();
      await clusterListPage.clickPerPageItem('20');
      // including the table headers
      await clusterIdentityProviderPage.verifyHTPasswdTableRowCounts(
        htpasswdDefinitions.dummyUserNames.length + 1,
      );

      await clusterListPage.itemPerPage().click();
      await clusterListPage.clickPerPageItem('50');
      await clusterListPage.itemPerPage().click();
      await clusterListPage.clickPerPageItem('100');
    });

    test(`Click on the ${clusterName} Add user button for httpasswd IDP created in the above steps`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.editModalAddUserButton().click();

      await clusterIdentityProviderPage.inputHtpasswdUserNameField().clear();
      await clusterIdentityProviderPage
        .inputHtpasswdUserNameField()
        .fill(htpasswdDefinitions.dummyNewUserName);

      const password = await clusterIdentityProviderPage.inputHtpasswdPasswordWithSuggestion();
      await clusterIdentityProviderPage.inputHtpasswdConfirmPasswordField(password);
      await clusterIdentityProviderPage.clickAddUserModalButton();
      await clusterIdentityProviderPage.waitForAddUserModalToLoad();
    });

    test(`Delete httpasswd IDP created in the above steps for OSD cluster ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.accessControlTabLink().click();
      await clusterIdentityProviderPage.deleteHtpasswdIDP(
        htpasswdDefinitions.testDummyHtpasswdName[1],
      );
      await clusterIdentityProviderPage.waitForDeleteClusterActionComplete();
      await clusterIdentityProviderPage.deleteHtpasswdIDP(
        htpasswdDefinitions.testDummyHtpasswdName[2],
      );
      await clusterIdentityProviderPage.waitForDeleteClusterActionComplete();
    });
  },
);
