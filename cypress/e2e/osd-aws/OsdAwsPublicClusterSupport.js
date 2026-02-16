import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import ClusterSupportPage from '../../pageobjects/ClusterSupportTab.page';
import { CLUSTER_LIST_PATH } from '../../support/routePaths';
const clusterDetails = require('../../fixtures/osd-aws/OsdAwsCcsCreatePublicCluster.json');
const clusterName = clusterDetails['osdccs-aws-public']['day1-profile']['ClusterName'];

describe(
  'OSD AWS public cluster - Support actions',
  { tags: ['day2', 'osd', 'aws', 'public'] },
  () => {
    before(() => {
      cy.visit(CLUSTER_LIST_PATH);
      ClusterListPage.waitForDataReady();
    });

    it(`Open ${clusterName} cluster`, () => {
      ClusterListPage.filterTxtField().should('be.visible').click();
      ClusterListPage.filterTxtField().clear().type(clusterName);
      ClusterListPage.waitForDataReady();
      ClusterListPage.openClusterDefinition(clusterName);
      ClusterDetailsPage.waitForInstallerScreenToLoad();
      ClusterDetailsPage.clusterNameTitle().contains(clusterName);
    });

    it(`Support tab validation for the cluster ${clusterName}`, () => {
      ClusterDetailsPage.supportTab().click();
      ClusterSupportPage.isNotificationContactVisible();
      ClusterSupportPage.getAddNotificationContactButton().click();
      ClusterSupportPage.isNotificationContactModalVisible();
      ClusterSupportPage.getCancelButton().click();
      ClusterSupportPage.getOpenSupportCaseButton().should('be.visible');
      ClusterSupportPage.checkSupportCaseTableHeaders();
    });

    it(`Add notification contact for the cluster ${clusterName}`, () => {
      ClusterSupportPage.getAddNotificationContactButton().click();
      ClusterSupportPage.getUsernameInput().type('ocmui-orgadmin');
      ClusterSupportPage.getAddContactButton().click();
      ClusterSupportPage.isSuccessNotificationVisible();
      ClusterSupportPage.checkNotificationContactTableHeaders();
      ClusterSupportPage.checkNotificationContacts('ocmui-orgadmin', 'ocmui', 'admin');
      ClusterSupportPage.deleteNotificationContactByUsername('ocmui-orgadmin');
      ClusterSupportPage.isDeleteNotificationVisible();
    });

    it(`Add notification contact validation for the cluster ${clusterName}`, () => {
      ClusterSupportPage.getAddNotificationContactButton().click();
      ClusterSupportPage.getUsernameInput().type('admin$test');
      ClusterSupportPage.isTextContainsInPage('Username includes illegal symbols');
      ClusterSupportPage.getUsernameInput().clear().type('admintest');
      ClusterSupportPage.getAddContactButton().click();
      ClusterSupportPage.isTextContainsInPage('Could not find any account identified by admintest');
      ClusterSupportPage.getCancelButton().click();
    });
  },
);
