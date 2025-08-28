import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
const clusterDetails = require('../../fixtures/rosa-hosted/RosaHostedClusterCreatePrivate.json');
const clusterProfiles = ['rosa-hosted-private', 'rosa-hosted-private-advanced'];
const awsAccountID = Cypress.env('QE_AWS_ID');
const awsBillingAccountID = Cypress.env('QE_AWS_BILLING_ID');

describe(
  'Rosa hosted cluster (hypershift) -create private  cluster Overview properties',
  { tags: ['day2', 'hosted', 'rosa', 'private', 'hcp'] },
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

      it(`Checks on overview tab : ${clusterName} cluster`, () => {
        ClusterDetailsPage.waitForInstallerScreenToLoad();
        ClusterDetailsPage.clusterNameTitle().contains(clusterName);
        ClusterDetailsPage.clusterTypeLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.Type);
        ClusterDetailsPage.clusterDomainPrefixLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.DomainPrefix);
        ClusterDetailsPage.clusterControlPlaneTypeLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.ControlPlaneType);
        ClusterDetailsPage.clusterRegionLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.Region.split(',')[0]);
        ClusterDetailsPage.clusterAvailabilityLabelValue()
          .scrollIntoView()
          .contains(clusterProperties.Availability);
        ClusterDetailsPage.clusterInfrastructureAWSaccountLabelValue()
          .scrollIntoView()
          .contains(awsAccountID);
        ClusterDetailsPage.clusterBillingMarketplaceAccountLabelValue()
          .scrollIntoView()
          .contains(awsBillingAccountID);

        if (clusterProperties.MachinePools.Autoscaling.includes('Enabled')) {
          cy.contains(
            `Min: ${clusterProperties.MachinePools.MachinePoolCount * parseInt(clusterProperties.MachinePools.MiniNodeCount)}`,
          );
          cy.contains(
            `Max: ${clusterProperties.MachinePools.MachinePoolCount * parseInt(clusterProperties.MachinePools.MaxNodeCount)}`,
          );
        } else {
          ClusterDetailsPage.clusterComputeNodeCountValue()
            .scrollIntoView()
            .contains(
              clusterProperties.MachinePools.MachinePoolCount *
                parseInt(clusterProperties.MachinePools.NodeCount),
            );
        }

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
        cy.contains('Type:').next().contains(clusterProperties.OidcConfigType);
        cy.contains('ID:').next().contains(clusterProperties.OidcConfigId);
      });
    });
  },
);
