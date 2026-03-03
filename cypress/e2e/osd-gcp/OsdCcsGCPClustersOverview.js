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

describe(
  'OSD CCS GCP - Overview tab properties',
  { tags: ['day2', 'osd', 'ccs', 'gcp', 'overview'] },
  () => {
    describe.each(clusterProfiles)(
      'OSD CCS GCP - Overview tab properties for the profile :  %s',
      (clusterProfile) => {
        let clusterProperties = clusterDetails[clusterProfile]['day1-profile'];
        let clusterName = clusterDetails[clusterProfile]['day1-profile'].ClusterName;

        before(() => {
          cy.visit(CLUSTER_LIST_PATH);
          ClusterListPage.waitForDataReady();
        });

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
          ClusterDetailsPage.clusterRegionLabelValue().contains(
            clusterProperties.Region.split(',')[0],
          );
          ClusterDetailsPage.clusterAvailabilityLabelValue().contains(
            clusterProperties.Availability,
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
      },
    );
  },
);
