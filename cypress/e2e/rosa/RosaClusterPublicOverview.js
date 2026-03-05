import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetails from '../../pageobjects/ClusterDetails.page';

const clusterDetails = require('../../fixtures/rosa/RosaClusterClassicCreatePublic.json');
const clusterProfiles = ['rosa-classic-public', 'rosa-classic-public-advanced'];
const awsAccountID = Cypress.env('QE_AWS_ID');

describe(
  'ROSA  classic Cluster properties -  Public',
  { tags: ['rosa', 'day2', 'public', 'multizone', 'classic', 'singlezone'] },
  () => {
    beforeEach(() => {
      if (Cypress.currentTest.title.match(/Open.*cluster/g)) {
        cy.visit('/cluster-list');
        ClusterListPage.waitForDataReady();
      }
    });
    // Iterate via all the available public cluster profiles.
    clusterProfiles.forEach((clusterProfile) => {
      let clusterProperties = clusterDetails[clusterProfile]['day1-profile'];
      let clusterName = clusterProperties.ClusterName;

      it(`Open ${clusterName} cluster`, () => {
        ClusterListPage.filterTxtField().should('be.visible').click();
        ClusterListPage.filterTxtField().clear().type(clusterName);
        ClusterListPage.waitForDataReady();
        ClusterListPage.openClusterDefinition(clusterName);
      });

      it('Cluster details : Overview tab', () => {
        cy.get('h1.cl-details-page-title', { timeout: 20000 }).should(
          'have.text',
          clusterProperties.ClusterName,
        );
        ClusterDetails.isClusterDetailsPage(clusterProperties.ClusterName);
        ClusterDetails.overviewTab().click();
        ClusterDetails.clusterTypeLabelValue().contains(clusterProperties.Type);
        if (clusterProperties.hasOwnProperty('DomainPrefix')) {
          ClusterDetails.clusterDomainPrefixLabelValue().contains(clusterProperties.DomainPrefix);
        }
        ClusterDetails.clusterAvailabilityLabelValue().contains(clusterProperties.Availability);
        ClusterDetails.clusterRegionLabelValue().contains(clusterProperties.Region.split(',')[0]);
        ClusterDetails.clusterInfrastructureAWSaccountLabelValue().contains(awsAccountID);
        ClusterDetails.clusterAdditionalEncryptionStatus().contains(
          clusterProperties.AdditionalEncryption,
        );
        ClusterDetails.clusterIMDSValue().contains(clusterProperties.InstanceMetadataService);
        ClusterDetails.clusterAutoScalingStatus().contains(clusterProperties.ClusterAutoscaling);
        ClusterDetails.clusterMachineCIDRLabelValue().contains(clusterProperties.MachineCIDR);
        ClusterDetails.clusterServiceCIDRLabelValue().contains(clusterProperties.ServiceCIDR);
        ClusterDetails.clusterPodCIDRLabelValue().contains(clusterProperties.PodCIDR);
        ClusterDetails.clusterHostPrefixLabelValue().contains(
          clusterProperties.HostPrefix.replace('/', ''),
        );
      });

      // it('Cluster details : Machine pools tab', () => {
      //   ClusterDetails.machinePoolsTab().click();
      //   ClusterDetails.getMachinePoolName(1).contains(clusterProperties.MachinePools[0].Name);
      //   ClusterDetails.getMachinePoolInstanceType(1).contains(
      //     clusterProperties.MachinePools[0].InstanceType,
      //   );
      //   ClusterDetails.getMachinePoolAvailabilityZones(1).contains(
      //     clusterProperties.MachinePools[0].AvailabilityZones,
      //   );
      //   ClusterDetails.getMachinePoolNodeCount(1).contains(
      //     clusterProperties.MachinePools[0].NodeCount,
      //   );
      //   ClusterDetails.getMachinePoolNodeAutoscaling(1).contains(
      //     clusterProperties.MachinePools[0].Autoscaling,
      //   );
      // });
    });
  },
);
