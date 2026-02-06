import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetails from '../../pageobjects/ClusterDetails.page';
import ClusterIdentityProviderDetails from '../../pageobjects/ClusterAddIdentityProvider.page';
import { CLUSTER_LIST_PATH } from '../../support/routePaths';

const clusterProfiles = require('../../fixtures/rosa-hosted/RosaHostedClusterCreatePublic.json');
const clusterProperties = clusterProfiles['rosa-hosted-public']['day2-profile'];
const clusterDetails = clusterProfiles['rosa-hosted-public']['day1-profile'];

const selectIdpDefinitions = clusterProperties.IDPs.HtPasswd;
const validHtpasswdUserName = selectIdpDefinitions.Definitions.ValidUserNames;

describe(
  'ROSA Hosted Public Cluster - Htpasswd validation - (OCP-42373, OCP-42372, OCP-28661)',
  { tags: ['day2', 'hosted', 'rosa', 'public', 'hcp'] },
  () => {
    beforeEach(() => {
      if (
        Cypress.currentTest.title.match(
          /Navigate to the ROSA Hosted Access Control tab for .* cluster/,
        )
      ) {
        cy.visit(CLUSTER_LIST_PATH);
        ClusterListPage.waitForDataReady();
        ClusterListPage.isClusterListScreen();
        ClusterListPage.filterTxtField().should('be.visible').click();
      }
    });

    it(`Step - Navigate to the ROSA Hosted Access Control tab for ${clusterDetails.ClusterName} cluster`, () => {
      ClusterListPage.filterTxtField().clear().type(clusterDetails.ClusterName);
      ClusterListPage.waitForDataReady();
      ClusterListPage.openClusterDefinition(clusterDetails.ClusterName);
      ClusterDetails.waitForInstallerScreenToLoad();
      ClusterDetails.accessControlTab().click();
    });

    it(`Step - Validate the elements of ROSA Hosted ${clusterDetails.ClusterName} Htpasswd Idp page for errors`, () => {
      ClusterIdentityProviderDetails.selectAddIdentityProviderDropdown().click();
      ClusterIdentityProviderDetails.clickHtpasswdButton();
      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.HtPasswdName.DefaultNameInformation,
      );
      ClusterIdentityProviderDetails.inputHtpasswdName().clear().type(' ').blur();
      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.HtPasswdName.EmptyNameError,
      );
      ClusterIdentityProviderDetails.inputHtpasswdName()
        .clear()
        .type(selectIdpDefinitions.Validations.HtPasswdName.InvalidHtPasswdName[0])
        .blur();
      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.HtPasswdName.InvalidHtPasswdNameError,
      );

      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.Usernames.DefaultUsernameInformation,
      );
      ClusterIdentityProviderDetails.inputHtpasswdUserNameField().type(' ').clear();

      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.Usernames.EmptyUserNameError,
      );

      ClusterIdentityProviderDetails.inputHtpasswdUserNameField()
        .clear()
        .type(selectIdpDefinitions.Validations.Usernames.InvalidUserNameInput[0]);

      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.Usernames.InValidUserNameError,
      );

      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.Password.DefaultPasswordInformation[0],
      );
      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.Password.DefaultPasswordInformation[1],
      );
      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.Password.DefaultPasswordInformation[2],
      );
      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.Password.DefaultPasswordInformation[3],
      );

      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.Password.ConfirmPassword,
      );

      ClusterIdentityProviderDetails.addUserButton().should('be.disabled');

      ClusterIdentityProviderDetails.inputHtpasswdName()
        .clear()
        .type(selectIdpDefinitions.Definitions.ValidHtPasswdName[0]);
      ClusterIdentityProviderDetails.inputHtpasswdUserNameField()
        .clear()
        .type(selectIdpDefinitions.Definitions.ValidUserNames[0]);

      ClusterIdentityProviderDetails.inputPasswordField()
        .clear()
        .type(selectIdpDefinitions.Definitions.ValidPassword)
        .blur();

      ClusterIdentityProviderDetails.inputConfirmPasswordField()
        .type(selectIdpDefinitions.Definitions.ValidPassword)
        .blur();

      ClusterIdentityProviderDetails.addUserButton().click({ force: true });
      ClusterIdentityProviderDetails.removeUserList().click();
      ClusterIdentityProviderDetails.cancelButton();
    });

    it(`Step - Verify the default elements of ROSA Hosted ${clusterDetails.ClusterName} Access Control tab`, () => {
      ClusterIdentityProviderDetails.selectAddIdentityProviderDropdown().click();
      ClusterIdentityProviderDetails.clickHtpasswdButton();
      ClusterIdentityProviderDetails.inputHtpasswdName()
        .clear()
        .type(selectIdpDefinitions.Definitions.ValidHtPasswdName[1]);
      ClusterIdentityProviderDetails.inputHtpasswdUserNameField()
        .clear()
        .type(selectIdpDefinitions.Definitions.ValidUserNames[1]);
      ClusterIdentityProviderDetails.inputHtpasswdPasswordField(0);
      ClusterIdentityProviderDetails.inputHtpasswdConfirmPasswordField(0);
      ClusterIdentityProviderDetails.clickAddButton();
    });

    it(`Step - Input Htpasswd username and password fields names for the ROSA Hosted ${clusterDetails.ClusterName} window`, () => {
      ClusterIdentityProviderDetails.accessControlTabLink();
      ClusterIdentityProviderDetails.selectAddIdentityProviderDropdown().click();
      ClusterIdentityProviderDetails.clickHtpasswdButton();

      let isLastIteration = false;

      validHtpasswdUserName.forEach((value, index) => {
        const isLastIteration = index === validHtpasswdUserName.length - 1;

        ClusterIdentityProviderDetails.inputHtpasswdUserNameField().clear().type(value);
        ClusterIdentityProviderDetails.inputHtpasswdPasswordField(0);
        ClusterIdentityProviderDetails.inputHtpasswdConfirmPasswordField(0);
        if (!isLastIteration) {
          ClusterIdentityProviderDetails.addUserButton().click({ force: true });
        }
      });
      ClusterIdentityProviderDetails.inputHtpasswdName()
        .clear()
        .type(selectIdpDefinitions.Definitions.ValidHtPasswdName[2]);
      ClusterIdentityProviderDetails.clickAddButton();
      ClusterIdentityProviderDetails.waitForAddButtonSpinnerToComplete();
    });

    it(`Step - Verify the Htpasswd IDP details for the ROSA Hosted ${clusterDetails.ClusterName} modal window`, () => {
      ClusterIdentityProviderDetails.verifyIdentityProviderElementValues('Name');
      ClusterIdentityProviderDetails.verifyIdentityProviderElementValues('Type');
      ClusterIdentityProviderDetails.verifyIdentityProviderElementValues('Auth callback URL');
    });

    it(`Step - Expand the Htpasswd IDP collapsible for the ${clusterDetails.ClusterName} modal window`, () => {
      ClusterIdentityProviderDetails.collapseIdpDefinitions(
        selectIdpDefinitions.Definitions.ValidHtPasswdName[2],
      );
      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Definitions.ValidUserNames[3],
      );
    });

    it(`Step - Select the ROSA ${clusterDetails.ClusterName} Edit actions dropdown for httpasswd IDP created in the above steps`, () => {
      ClusterIdentityProviderDetails.editHtpasswdIDPToggle(
        selectIdpDefinitions.Definitions.ValidHtPasswdName[2],
      );
      ClusterIdentityProviderDetails.isEditIdpPageTitle();
      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Definitions.ValidUserNames[1],
      );
      ClusterIdentityProviderDetails.filterByUsernameField().type(
        selectIdpDefinitions.Validations.Usernames.InvalidUserNameInput[0],
      );
      ClusterIdentityProviderDetails.isTextContainsInPage(
        selectIdpDefinitions.Validations.Usernames.NoMatchingUserName,
      );
      ClusterIdentityProviderDetails.clickClearAllFiltersLink();
      ClusterListPage.scrollToPagination();
    });

    it(`Step - Validations for ROSA ${clusterDetails.ClusterName} edit httpasswd IDP Modal`, () => {
      ClusterListPage.scrollClusterListPageTo('bottom');
      ClusterIdentityProviderDetails.verifyEditIdentityProviderTableElementValues(
        validHtpasswdUserName.length,
      );

      ClusterListPage.itemPerPage().click();
      ClusterListPage.clickPerPageItem('10');

      const truncatedUsername = validHtpasswdUserName.slice(0, 10);
      ClusterIdentityProviderDetails.verifyEditIdentityProviderTableElementValues(
        truncatedUsername.length,
      );

      ClusterListPage.itemPerPage().click();
      ClusterListPage.clickPerPageItem('20');
      ClusterIdentityProviderDetails.verifyEditIdentityProviderTableElementValues(
        validHtpasswdUserName.length,
      );

      ClusterListPage.itemPerPage().click();
      ClusterListPage.clickPerPageItem('50');
      ClusterListPage.itemPerPage().click();
      ClusterListPage.clickPerPageItem('100');
    });

    it(`Step - Click on the ROSA ${clusterDetails.ClusterName} Add user button for httpasswd IDP created in the above steps`, () => {
      ClusterIdentityProviderDetails.editModalAddUserButton().click();
      ClusterIdentityProviderDetails.inputHtpasswdUserNameField()
        .clear()
        .type(selectIdpDefinitions.Definitions.AddNewUserName);
      ClusterIdentityProviderDetails.inputHtpasswdPasswordField(0);
      ClusterIdentityProviderDetails.inputHtpasswdConfirmPasswordField(0);
      ClusterIdentityProviderDetails.clickAddUserModalButton();
      ClusterIdentityProviderDetails.waitForAddUserModalToLoad();
    });

    it(`Step - Delete httpasswd IDP created in the above steps for ROSA cluster ${clusterDetails.ClusterName}`, () => {
      ClusterIdentityProviderDetails.accessControlTabLink();
      ClusterIdentityProviderDetails.deleteHtpasswdIDP(
        selectIdpDefinitions.Definitions.ValidHtPasswdName[1],
      );

      ClusterIdentityProviderDetails.waitForDeleteClusterActionComplete();
      ClusterIdentityProviderDetails.deleteHtpasswdIDP(
        selectIdpDefinitions.Definitions.ValidHtPasswdName[2],
      );

      ClusterIdentityProviderDetails.waitForDeleteClusterActionComplete();
    });
  },
);
