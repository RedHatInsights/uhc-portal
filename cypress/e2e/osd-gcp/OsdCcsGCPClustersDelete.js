import 'cypress-each';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import ClusterListPage from '../../pageobjects/ClusterList.page';
import { CLUSTER_LIST_PATH } from '../../support/routePaths';
const clusterDetails = require('../../fixtures/osd-gcp/OsdCcsGCPClusterCreate.json');
const clusterProfiles = [
  'osd-ccs-gcp-public-singlezone-serviceaccount',
  'osd-ccs-gcp-public-multizone-serviceaccount',
  'osd-ccs-gcp-private-multizone-serviceaccount',
  'osd-ccs-gcp-public-multizone-wif',
  'osd-ccs-gcp-private-multizone-wif',
];
describe('OSD CCS GCP - delete clusters', { tags: ['day3', 'osd', 'ccs', 'gcp', 'public'] }, () => {
  it.each(clusterProfiles)('Delete the  %s cluster profile', (clusterProfile) => {
    let clusterName = clusterDetails[clusterProfile]['day1-profile'].ClusterName;
    cy.visit(CLUSTER_LIST_PATH);
    ClusterListPage.waitForDataReady();
    ClusterListPage.filterTxtField().should('be.visible').click();
    ClusterListPage.filterTxtField().clear().type(clusterName);
    ClusterListPage.waitForDataReady();
    ClusterListPage.openClusterDefinition(clusterName);

    ClusterDetailsPage.isClusterDetailsPage(clusterName);
    ClusterDetailsPage.actionsDropdownToggle().click();
    ClusterDetailsPage.deleteClusterDropdownItem().click();
    ClusterDetailsPage.deleteClusterNameInput().clear().type(clusterName);
    ClusterDetailsPage.deleteClusterConfirm().click();
    ClusterDetailsPage.waitForDeleteClusterActionComplete();
  });
});
