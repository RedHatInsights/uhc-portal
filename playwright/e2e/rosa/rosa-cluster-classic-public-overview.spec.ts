import { test, expect } from '../../fixtures/pages';
import { CLUSTER_LIST_FULL_PATH } from '../../support/playwright-constants';

const clusterDetails = require('../../fixtures/rosa/rosa-cluster-classic-public-creation-advanced.spec.json');
const clusterProperties = clusterDetails['rosa-classic-public-advanced'];
const clusterNamePrefix = clusterProperties.ClusterNamePrefix;
const region = process.env.QE_AWS_REGION || clusterProperties.Region.split(',')[0];
const awsAccountID = process.env.QE_AWS_ID || '';

test.describe.serial(
  'ROSA classic cluster properties - Public',
  { tag: ['@day2', '@rosa', '@rosa-classic', '@public', '@multizone', '@singlezone'] },
  () => {
    test(`Open ${clusterNamePrefix} cluster`, async ({ navigateTo, clusterListPage }) => {
      await navigateTo(CLUSTER_LIST_FULL_PATH);
      await clusterListPage.waitForDataReady();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterNamePrefix);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterNamePrefix, 'startsWith');
    });

    test(`Cluster details - Overview tab for ${clusterNamePrefix}`, async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.isClusterDetailsPage(clusterNamePrefix);
      await clusterDetailsPage.overviewTab().click();
      await expect(clusterDetailsPage.clusterTypeLabelValue()).toContainText(
        clusterProperties.Type,
      );
      await expect(clusterDetailsPage.clusterControlPlaneTypeLabelValue()).toContainText(
        clusterProperties.ControlPlaneType,
      );
      if (clusterProperties.DomainPrefix) {
        await expect(clusterDetailsPage.clusterDomainPrefixLabelValue()).toContainText(
          clusterProperties.DomainPrefix,
        );
      }
      await expect(clusterDetailsPage.clusterAvailabilityLabelValue()).toContainText(
        clusterProperties.Availability,
      );
      await expect(clusterDetailsPage.clusterRegionLabelValue()).toContainText(region);
      await expect(
        clusterDetailsPage.clusterInfrastructureAWSaccountLabelValue(),
      ).toContainText(awsAccountID);
      await expect(clusterDetailsPage.clusterAdditionalEncryptionStatus()).toContainText(
        clusterProperties.AdditionalEncryption,
      );
      await expect(clusterDetailsPage.clusterFipsCryptographyStatus()).toContainText(
        clusterProperties.FIPSCryptography,
        { ignoreCase: true },
      );
      await expect(clusterDetailsPage.clusterIMDSValue()).toContainText(
        clusterProperties.InstanceMetadataService,
      );
      await expect(clusterDetailsPage.clusterAutoScalingStatus()).toContainText(
        clusterProperties.ClusterAutoscaling,
      );
      await expect(clusterDetailsPage.clusterMachineCIDRLabelValue()).toContainText(
        clusterProperties.MachineCIDR,
      );
      await expect(clusterDetailsPage.clusterServiceCIDRLabelValue()).toContainText(
        clusterProperties.ServiceCIDR,
      );
      await expect(clusterDetailsPage.clusterPodCIDRLabelValue()).toContainText(
        clusterProperties.PodCIDR,
      );
      await expect(clusterDetailsPage.clusterHostPrefixLabelValue()).toContainText(
        clusterProperties.HostPrefix.replace('/', ''),
      );
    });
  },
);
