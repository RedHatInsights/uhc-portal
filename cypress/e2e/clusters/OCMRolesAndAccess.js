import { v4 } from 'uuid';

import { getAuthConfig } from '../../pageobjects/authConfig';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import ClusterListPage from '../../pageobjects/ClusterList.page';
import OCMRolesAndAccessPage from '../../pageobjects/OCMRolesAndAccess.page';
import RegisterClusterPage from '../../pageobjects/RegisterCluster.page';
import { CLUSTER_LIST_PATH } from '../../support/routePaths';

describe('OCM Roles And Access', { tags: ['ci'] }, () => {
  before(() => {
    cy.visit(CLUSTER_LIST_PATH);
    ClusterListPage.waitForDataReady();
    ClusterListPage.isClusterListScreen();
  });

  const clusterID = v4();
  const displayName = `cypress-${clusterID}`;
  const { username } = getAuthConfig();

  it('successfully registers a new cluster and redirects to its details page', () => {
    ClusterListPage.registerCluster().should('be.visible').click();
    ClusterListPage.isRegisterClusterUrl();
    ClusterListPage.isRegisterClusterScreen();
    RegisterClusterPage.clusterIDInput().type(clusterID).blur();
    RegisterClusterPage.displayNameInput().type(displayName).blur();
    RegisterClusterPage.submitButton().click();
    ClusterDetailsPage.isClusterDetailsPage(displayName);
  });

  it('successfully navigates to OCM Roles And Access', () => {
    OCMRolesAndAccessPage.accessControlTabButton().click();
    OCMRolesAndAccessPage.assertUrlIncludes('#accessControl');
    OCMRolesAndAccessPage.grantRoleButton().should('exist');
    OCMRolesAndAccessPage.OCMRolesAndAccessTable().should('exist');
  });

  it('successfully validate and grant the RBAC', () => {
    OCMRolesAndAccessPage.grantRoleButton().click({ force: true });
    OCMRolesAndAccessPage.grantRoleUserInput().should('exist');
    OCMRolesAndAccessPage.grantRoleUserInput().type(' ');
    OCMRolesAndAccessPage.userInputError().should('contain', 'Red Hat login cannot be empty.');
    OCMRolesAndAccessPage.grantRoleUserInput().type(v4());
    OCMRolesAndAccessPage.submitButton().click();
    OCMRolesAndAccessPage.userInputError().should(
      'contain.text',
      'The specified username does not exist',
    );
    OCMRolesAndAccessPage.grantRoleUserInput().clear();
    OCMRolesAndAccessPage.grantRoleUserInput().type(username).blur();
    OCMRolesAndAccessPage.submitButton().click();
    OCMRolesAndAccessPage.waitForGrantRoleModalToClear();
  });

  it('successfully displays the newly added user', () => {
    OCMRolesAndAccessPage.usernameCell().should('have.text', username);
  });

  it('successfully deletes the user', () => {
    OCMRolesAndAccessPage.OCMRolesAndAccessTableActionButton()
      .scrollIntoView()
      .click({ force: true });
    OCMRolesAndAccessPage.OCMRolesAndAccessTableDeleteButton().click({ force: true });
    OCMRolesAndAccessPage.usernameCell().should('not.exist');
  });

  it('Finally, archive the cluster created', () => {
    ClusterDetailsPage.actionsDropdownToggle().click();
    ClusterDetailsPage.archiveClusterDropdownItem().click();
    ClusterDetailsPage.archiveClusterDialogConfirm().click();
    ClusterDetailsPage.waitForClusterDetailsLoad();
    ClusterDetailsPage.unarchiveClusterButton().should('exist');
  });
});
