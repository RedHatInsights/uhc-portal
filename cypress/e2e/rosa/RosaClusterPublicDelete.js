import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';

const clusterDetails = require('../../fixtures/rosa/RosaClusterClassicCreatePublic.json');
const clusterProfiles = ['rosa-classic-public', 'rosa-classic-public-advanced'];

describe(
  'ROSA classic Cluster - Delete Public clusters',
  { tags: ['day3', 'rosa', 'delete', 'public', 'singlezone', 'classic', 'multizone'] },
  () => {
    beforeEach(() => {
      if (Cypress.currentTest.title.match(/Open.*cluster/g)) {
        cy.visit('/cluster-list');
        ClusterListPage.waitForDataReady();
      }
    });

    clusterProfiles.forEach((clusterProfile) => {
      let clusterName = clusterDetails[clusterProfile]['day1-profile'].ClusterName;
      it(`Open a cluster ${clusterName}`, () => {
        ClusterListPage.filterTxtField().should('be.visible').click();
        ClusterListPage.filterTxtField().clear().type(clusterName);
        ClusterListPage.waitForDataReady();
        ClusterListPage.openClusterDefinition(clusterName);
      });

      it(`Delete the cluster ${clusterName}`, () => {
        ClusterDetailsPage.isClusterDetailsPage(clusterName);
        ClusterDetailsPage.actionsDropdownToggle().click();
        ClusterDetailsPage.deleteClusterDropdownItem().click();
        ClusterDetailsPage.deleteClusterNameInput().clear().type(clusterName);
        ClusterDetailsPage.deleteClusterConfirm().click();
        ClusterDetailsPage.waitForDeleteClusterActionComplete();
      });
    });
  },
);
