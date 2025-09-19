import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetails from '../../pageobjects/ClusterDetails.page';
import ClusterRolesAndAccess from '../../pageobjects/ClusterRolesAndAccess.page';

const clusterProfiles = require('../../fixtures/rosa/RosaClusterClassicCreatePublic.json');
const userDetails = clusterProfiles['rosa-classic-public']['day2-profile']['RolesAndAccess'];
const ClusterName = clusterProfiles['rosa-classic-public']['day1-profile']['ClusterName'];

describe(
  'Rosa Classic Cluster - Cluster Roles and Access validation - OCP-29399',
  { tags: ['day2', 'rosa', 'public'] },
  () => {
    before(() => {
      cy.visit('/cluster-list');
      ClusterListPage.waitForDataReady();
      ClusterListPage.isClusterListScreen();
      ClusterListPage.filterTxtField().should('be.visible').click();
      ClusterListPage.filterTxtField().clear().type(ClusterName);
      ClusterListPage.waitForDataReady();
      ClusterListPage.openClusterDefinition(ClusterName);
      ClusterDetails.waitForInstallerScreenToLoad();
      ClusterDetails.accessControlTab().click();
      ClusterRolesAndAccess.clusterRolesAndAccessTab().click();
    });

    it(`Step - Validate the Add cluster user modal of ${ClusterName} for multiple errors`, () => {
      ClusterRolesAndAccess.addRoleButton().click();
      ClusterRolesAndAccess.addUserModalTitle().should('be.visible');
      ClusterRolesAndAccess.addUserModalButton().should('be.disabled');

      ClusterRolesAndAccess.userIDInput().type(' ').clear().blur();
      ClusterRolesAndAccess.getUserIDErrorText().should(
        'contain.text',
        userDetails.Validations.UserID.EmptyError,
      );
      ClusterRolesAndAccess.addUserModalButton().should('be.disabled');

      ClusterRolesAndAccess.userIDInput()
        .clear()
        .type(userDetails.Validations.UserID.InvalidScenarios[0].input)
        .blur();
      ClusterRolesAndAccess.getUserIDErrorText().should(
        'contain.text',
        userDetails.Validations.UserID.InvalidScenarios[0].error,
      );
      ClusterRolesAndAccess.addUserModalButton().should('be.disabled');

      ClusterRolesAndAccess.userIDInput()
        .clear()
        .type(userDetails.Validations.UserID.InvalidScenarios[1].input)
        .blur();
      ClusterRolesAndAccess.getUserIDErrorText().should(
        'contain.text',
        userDetails.Validations.UserID.InvalidScenarios[1].error,
      );
      ClusterRolesAndAccess.addUserModalButton().should('be.disabled');

      ClusterRolesAndAccess.userIDInput()
        .clear()
        .type(userDetails.Validations.UserID.InvalidScenarios[2].input)
        .blur();
      ClusterRolesAndAccess.getUserIDErrorText().should(
        'contain.text',
        userDetails.Validations.UserID.InvalidScenarios[2].error,
      );
      ClusterRolesAndAccess.addUserModalButton().should('be.disabled');

      ClusterRolesAndAccess.userIDInput()
        .clear()
        .type(userDetails.Validations.UserID.InvalidScenarios[3].input)
        .blur();
      ClusterRolesAndAccess.getUserIDErrorText().should(
        'contain.text',
        userDetails.Validations.UserID.InvalidScenarios[3].error,
      );
      ClusterRolesAndAccess.addUserModalButton().should('be.disabled');

      ClusterRolesAndAccess.userIDInput().clear().type(userDetails['dedicated-admin-user'].UserID);
      ClusterRolesAndAccess.addUserModalButton().should('be.enabled');

      ClusterRolesAndAccess.cancelModalButton().click();
    });

    it(`Step - Add a new dedicated admin user for ${ClusterName} and verify it appear in the list`, () => {
      ClusterRolesAndAccess.addRoleButton().click();
      ClusterRolesAndAccess.userIDInput().type(userDetails['dedicated-admin-user'].UserID);
      ClusterRolesAndAccess.dedicatedAdminsCheck().should('be.checked');
      ClusterRolesAndAccess.addUserModalButton().click();
      ClusterRolesAndAccess.waitForClosingModal();
      ClusterRolesAndAccess.verifyUserInList(
        userDetails['dedicated-admin-user'].UserID,
        userDetails['dedicated-admin-user'].Group,
      );

      ClusterRolesAndAccess.deleteUser(userDetails['dedicated-admin-user'].UserID);
      ClusterRolesAndAccess.verifyUserNotInList(userDetails['dedicated-admin-user'].UserID);
    });

    it(`Step - Add and then delete cluster admin user for ${ClusterName}`, () => {
      ClusterRolesAndAccess.addRoleButton().click();
      ClusterRolesAndAccess.userIDInput().type(userDetails['cluster-admin-user'].UserID);
      ClusterRolesAndAccess.clusterAdminsCheck().check();
      ClusterRolesAndAccess.addUserModalButton().click();
      ClusterRolesAndAccess.waitForClosingModal();
      ClusterRolesAndAccess.verifyUserInList(
        userDetails['cluster-admin-user'].UserID,
        userDetails['cluster-admin-user'].Group,
      );
      ClusterRolesAndAccess.deleteUser(userDetails['cluster-admin-user'].UserID);
      ClusterRolesAndAccess.verifyUserNotInList(userDetails['cluster-admin-user'].UserID);
    });
  },
);
