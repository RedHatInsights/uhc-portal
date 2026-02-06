import { v4 } from 'uuid';

import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import ClusterListPage from '../../pageobjects/ClusterList.page';
import RegisterClusterPage from '../../pageobjects/RegisterCluster.page';
import { CLUSTER_LIST_PATH } from '../../support/routePaths';

describe('Register cluster flow', { tags: ['ci', 'smoke'] }, () => {
  const clusterID = v4();
  const displayName = `cypress-${clusterID}`;

  before(() => {
    cy.visit(CLUSTER_LIST_PATH);
    ClusterListPage.waitForDataReady();
    ClusterListPage.isClusterListScreen();
  });

  it('navigate to register cluster', () => {
    ClusterListPage.registerCluster().should('be.visible').click();
    ClusterListPage.isRegisterClusterUrl();
    ClusterListPage.isRegisterClusterScreen();
  });

  it('shows an error when cluster ID is not valid', () => {
    RegisterClusterPage.clusterIDInput().type('not really a uuid').blur();
    RegisterClusterPage.clusterIDError().should('be.visible');
    RegisterClusterPage.clusterIDError().should(
      'include.text',
      "Cluster ID 'not really a uuid' is not a valid UUID.",
    );
    RegisterClusterPage.clusterIDInput().clear();
    RegisterClusterPage.clusterIDError().should('be.visible');
    RegisterClusterPage.clusterIDError().should('include.text', 'Cluster ID is required.');
  });

  it('shows error when display name is not valid', () => {
    RegisterClusterPage.displayNameInput().type('a'.repeat(70)).blur();
    RegisterClusterPage.displayNameError().should('be.visible');
    RegisterClusterPage.displayNameError().should(
      'include.text',
      'Cluster display name may not exceed 63 characters.',
    );
  });

  it('shows error when URL is not valid', () => {
    RegisterClusterPage.clusterURLInput().type('asdf').blur();
    RegisterClusterPage.clusterURLError().should('be.visible');
    RegisterClusterPage.clusterURLError().should(
      'include.text',
      'The URL should include the scheme prefix (http://, https://)',
    );
    RegisterClusterPage.clusterURLInput().clear();
    RegisterClusterPage.clusterURLInput().type('https://uwu').blur();
    RegisterClusterPage.clusterURLError().should('be.visible');
    RegisterClusterPage.clusterURLError().should('include.text', 'Invalid URL');
  });

  it('redirects to cluster list when clicking cancel', () => {
    RegisterClusterPage.cancelButton().click();
    ClusterListPage.isClusterListScreen();
  });

  it('creates a new cluster and redirects to its details page', () => {
    ClusterListPage.registerCluster().click();
    ClusterListPage.isRegisterClusterUrl();
    RegisterClusterPage.clusterIDInput().type(clusterID).blur();
    RegisterClusterPage.clusterIDError().should('not.exist');
    RegisterClusterPage.displayNameInput().type(displayName).blur();
    RegisterClusterPage.displayNameError().should('not.exist');
    RegisterClusterPage.submitButton().click();
    ClusterDetailsPage.isClusterDetailsPage(displayName);
  });

  it('successfully changes the console URL for the cluster', () => {
    const url = 'http://example.com';
    ClusterDetailsPage.addConsoleURLButton().click();
    ClusterDetailsPage.waitForEditUrlModalToLoad();
    ClusterDetailsPage.editConsoleURLDialogInput().type(url);
    ClusterDetailsPage.editConsoleURLDialogConfirm().click();
    ClusterDetailsPage.waitForEditUrlModalToClear();
    ClusterDetailsPage.waitForClusterDetailsLoad();
    ClusterDetailsPage.openConsoleLink()
      .should('have.attr', 'href', url)
      .find('button')
      .should('include.text', 'Open console');
  });

  it('successfully changes display name', () => {
    ClusterDetailsPage.actionsDropdownToggle().click();
    ClusterDetailsPage.editDisplayNameDropdownItem().click();
    ClusterDetailsPage.waitForEditDisplayNamelModalToLoad();
    ClusterDetailsPage.editDisplayNameInput().clear();
    ClusterDetailsPage.editDisplayNameInput().type(`${displayName}-test`).blur();
    ClusterDetailsPage.editDisplaynameConfirm().click();
    ClusterDetailsPage.waitForEditDisplayNameModalToClear();
    ClusterDetailsPage.waitForClusterDetailsLoad();
    ClusterDetailsPage.waitForDisplayNameChange(displayName);
    ClusterDetailsPage.clusterNameTitle().should('include.text', `${displayName}-test`);
  });

  it('successfully edit Subscription settings', () => {
    ClusterDetailsPage.editSubscriptionSettingsLink().scrollIntoView().click({ force: true });
    ClusterDetailsPage.serviceLevelAgreementPremiumRadio().click();
    ClusterDetailsPage.clusterUsageProductionRadio().click();
    ClusterDetailsPage.subscriptionUnitsSocketsRadio().click();
    ClusterDetailsPage.numberOfSocketsInput().type('{selectAll}').type('2');
    ClusterDetailsPage.saveSubscriptionButton().click();
    ClusterDetailsPage.waitForClusterDetailsLoad();
    ClusterDetailsPage.subscriptionTypeValue().contains('Fixed capacity subscription from Red Hat');
    ClusterDetailsPage.serviceLevelAgreementValue().contains('Premium');
    ClusterDetailsPage.clusterUsageValue().contains('Production');
    ClusterDetailsPage.subscriptionUnitsValue().contains('Sockets');
    ClusterDetailsPage.coresOrSocketsValue().contains('2 sockets');
    ClusterDetailsPage.supportTypeValue().contains('Red Hat support (L1-L3)');
  });

  it('successfully archives the newly created cluster', () => {
    ClusterDetailsPage.actionsDropdownToggle().click();
    ClusterDetailsPage.archiveClusterDropdownItem().click();
    ClusterDetailsPage.waitForArchiveClusterModalToLoad();
    ClusterDetailsPage.archiveClusterDialogConfirm().click();
    ClusterDetailsPage.successNotification().should('exist');
    ClusterDetailsPage.waitForClusterDetailsLoad();
    ClusterDetailsPage.unarchiveClusterButton().should('exist');
  });

  it('successfully unarchives the archived cluster', () => {
    ClusterDetailsPage.unarchiveClusterButton().click();
    ClusterDetailsPage.waitForUnarchiveClusterModalToLoad();
    ClusterDetailsPage.unarchiveClusterDialogConfirm().click();
    ClusterDetailsPage.successNotification().should('exist');
    ClusterDetailsPage.waitForClusterDetailsLoad();
  });

  it('Finally, archive the cluster created', () => {
    ClusterDetailsPage.actionsDropdownToggle().click();
    ClusterDetailsPage.archiveClusterDropdownItem().click();
    ClusterDetailsPage.waitForArchiveClusterModalToLoad();
    ClusterDetailsPage.archiveClusterDialogConfirm().click();
    ClusterDetailsPage.successNotification().should('exist');
    ClusterDetailsPage.waitForClusterDetailsLoad();
    ClusterDetailsPage.unarchiveClusterButton().should('exist');
  });
});
