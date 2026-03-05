import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';

const clusterDetails = require('../../fixtures/osd-aws/OsdNonCcsAWSClusterCreate.json');
const clusterProfiles = ['osd-nonccs-aws-public', 'osd-nonccs-aws-private'];

describe(
  'OSD nonCCS AWS clusters Overview properties',
  { tags: ['day2', 'osd', 'public', 'private', 'aws', 'nonccs', 'overview'] },
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
      let clusterPropertiesAdvanced = clusterDetails[clusterProfile]['day2-profile'];

      let clusterName = clusterProperties.ClusterName;

      it(`Open ${clusterName} cluster`, () => {
        ClusterListPage.filterTxtField().should('be.visible').click();
        ClusterListPage.filterTxtField().clear().type(clusterName);
        ClusterListPage.waitForDataReady();
        ClusterListPage.openClusterDefinition(clusterName);
      });

      it(`Checks on overview tab : ${clusterName} cluster`, () => {
        ClusterDetailsPage.waitForInstallerScreenToLoad();
        ClusterDetailsPage.clusterNameTitle().contains(clusterName);
        ClusterDetailsPage.clusterTypeLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.Type);
        ClusterDetailsPage.clusterDomainPrefixLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.DomainPrefix);
        ClusterDetailsPage.clusterRegionLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.Region.split(',')[0]);
        ClusterDetailsPage.clusterAvailabilityLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.Availability);
        ClusterDetailsPage.clusterPersistentStorageLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.PersistentStorage);

        ClusterDetailsPage.clusterLoadBalancersValue()
          .scrollIntoView()
          .contains(clusterProperties.LoadBalancers > 0 ? clusterProperties.LoadBalancers : 'N/A');
        ClusterDetailsPage.clusterSubscriptionBillingModelValue().contains(
          clusterProperties.SubscriptionBillingModel,
        );
        ClusterDetailsPage.clusterInfrastructureBillingModelValue().contains(
          clusterProperties.InfrastructureType,
        );
        if (clusterProperties.MachinePools.Autoscaling.includes('Enabled')) {
          cy.contains(`Min: ${3 * parseInt(clusterProperties.MachinePools.MinimumNodeCount)}`);
          cy.contains(`Max: ${3 * parseInt(clusterProperties.MachinePools.MaximumNodeCount)}`);
        } else {
          ClusterDetailsPage.clusterComputeNodeCountValue()
            .scrollIntoView()
            .contains(
              `${clusterProperties.MachinePools.NodeCount}/${clusterProperties.MachinePools.NodeCount}`,
            );
        }
        ClusterDetailsPage.clusterAutoScalingStatus().contains(
          clusterPropertiesAdvanced.Overview.ClusterAutoScaling,
        );
        ClusterDetailsPage.clusterIMDSValue().contains(
          clusterPropertiesAdvanced.Overview.InstanceMetadataService,
        );

        ClusterDetailsPage.clusterMachineCIDRLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.MachineCIDR);
        ClusterDetailsPage.clusterServiceCIDRLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.ServiceCIDR);
        ClusterDetailsPage.clusterPodCIDRLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.PodCIDR);
        ClusterDetailsPage.clusterHostPrefixLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.HostPrefix.replace('/', ''));

        ClusterDetailsPage.clusterTotalMemoryValue().should('be.exist');
        ClusterDetailsPage.clusterTotalvCPUValue().should('be.exist');
      });
    });
  },
);
