import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetails from '../../pageobjects/ClusterDetails.page';

const clusterProfiles = require('../../fixtures/osd/OsdCcsClusterProperties');
const ClusterName = clusterProfiles['Clusters'][0]['ClusterName'];

describe(
  'OSD Cluster - Delete protection feature validation - OCP-73758',
  { tags: ['day2', 'osd', 'smoke'] },
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
    });

    it('Validates the deletion protection feature workflow on OSD', () => {
      ClusterDetails.deleteProtectionStatus().then(($el) => {
        if ($el.text().includes('Enabled')) {
          cy.log('Delete protection is initially Enabled. Disabling it to start fresh.');
          ClusterDetails.disableDeletionProtection();
          ClusterDetails.deleteProtectionStatus().should('contain.text', 'Disabled');
        }
      });

      ClusterDetails.deleteProtectionStatus().should('contain.text', 'Disabled');
      ClusterDetails.verifyDeleteOptionIsEnabled(true);

      ClusterDetails.enableDeletionProtection();

      ClusterDetails.deleteProtectionStatus().should('contain.text', 'Enabled');
      ClusterDetails.verifyDeleteOptionIsEnabled(false);

      ClusterDetails.disableDeletionProtection();

      ClusterDetails.deleteProtectionStatus().should('contain.text', 'Disabled');
      ClusterDetails.verifyDeleteOptionIsEnabled(true);
    });
  },
);
