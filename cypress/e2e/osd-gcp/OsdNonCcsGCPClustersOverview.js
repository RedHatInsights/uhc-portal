import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import { CLUSTER_LIST_PATH } from '../../support/routePaths';

const clusterDetails = require('../../fixtures/osd-gcp/OsdNonCcsGCPClusterCreate.json');
const clusterProfiles = ['osd-nonccs-gcp-multizone', 'osd-nonccs-gcp-singlezone'];

describe(
  'OSD nonCCS GCP clusters Overview properties',
  { tags: ['day2', 'osd', 'public', 'multizone', 'singlezone', 'gcp', 'nonccs', 'overview'] },
  () => {
    beforeEach(() => {
      if (Cypress.currentTest.title.match(/Open.*cluster/g)) {
        cy.visit(CLUSTER_LIST_PATH);
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
        ClusterDetailsPage.clusterTypeLabelValue().contains(clusterProperties.Type);
        ClusterDetailsPage.clusterDomainPrefixLabelValue().contains(clusterProperties.DomainPrefix);
        ClusterDetailsPage.clusterRegionLabelValue().contains(
          clusterProperties.Region.split(',')[0],
        );
        ClusterDetailsPage.clusterAvailabilityLabelValue().contains(clusterProperties.Availability);
        ClusterDetailsPage.clusterPersistentStorageLabelValue().contains(
          clusterProperties.PersistentStorage,
        );
        ClusterDetailsPage.clusterLoadBalancersLabelValue().contains(
          clusterProperties.LoadBalancers > 0 ? clusterProperties.LoadBalancers : 'N/A',
        );
        ClusterDetailsPage.clusterSubscriptionBillingModelValue().contains(
          clusterProperties.SubscriptionBillingModel,
        );
        ClusterDetailsPage.clusterInfrastructureBillingModelValue().contains(
          clusterProperties.InfrastructureType,
        );
        ClusterDetailsPage.clusterMachineCIDRLabelValue().contains(clusterProperties.MachineCIDR);
        ClusterDetailsPage.clusterServiceCIDRLabelValue().contains(clusterProperties.ServiceCIDR);
        ClusterDetailsPage.clusterPodCIDRLabelValue().contains(clusterProperties.PodCIDR);
        ClusterDetailsPage.clusterHostPrefixLabelValue().contains(
          clusterProperties.HostPrefix.replace('/', ''),
        );
        ClusterDetailsPage.clusterTotalMemoryValue().should('be.exist');
        ClusterDetailsPage.clusterTotalvCPUValue().should('be.exist');
      });
    });
  },
);
