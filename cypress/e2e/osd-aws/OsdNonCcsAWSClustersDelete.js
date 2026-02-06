import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import ClusterListPage from '../../pageobjects/ClusterList.page';
import { CLUSTER_LIST_PATH } from '../../support/routePaths';
const clusterDetails = require('../../fixtures/osd-aws/OsdNonCcsAWSClusterCreate.json');
const clusterProfiles = ['osd-nonccs-aws-public', 'osd-nonccs-aws-private'];

describe(
  'OSD nonccs AWS - delete clusters',
  { tags: ['day3', 'osd', 'nonccs', 'aws', 'private', 'public'] },
  () => {
    beforeEach(() => {
      if (Cypress.currentTest.title.match(/Open.*cluster/g)) {
        cy.visit(CLUSTER_LIST_PATH);
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
