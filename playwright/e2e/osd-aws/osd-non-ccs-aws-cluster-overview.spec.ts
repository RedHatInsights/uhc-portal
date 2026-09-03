import { test, expect } from '../../fixtures/pages';
import { CLUSTER_LIST_FULL_PATH } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/osd-aws/osd-non-ccs-aws-cluster-creation-advanced.spec.json');
const clusterProperties = clusterProfiles['osd-nonccs-aws-public-advanced']['day1-profile'];
const cidrRanges = clusterProperties.networking.CIDRRanges;
const clusterName = process.env.CLUSTER_NAME || clusterProperties.ClusterName || '';

test.describe.serial(
  'OSD nonCCS AWS cluster Overview properties',
  { tag: ['@advanced', '@day2', '@osd', '@aws', '@non-ccs', '@public'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      test.skip(
        !clusterName,
        'Set CLUSTER_NAME to the day-1 advanced non-CCS cluster name (random suffix).',
      );
      await navigateTo(CLUSTER_LIST_FULL_PATH);
      await clusterListPage.waitForDataReady();
    });

    test(`Open ${clusterName} cluster`, async ({ clusterListPage, clusterDetailsPage }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName, 'startsWith');
      await clusterDetailsPage.waitForClusterDetailsLoad();
    });

    test(`Cluster details - Overview tab for ${clusterName}`, async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.isClusterDetailsPage(clusterName);
      await clusterDetailsPage.overviewTab().click();
      await expect(clusterDetailsPage.clusterTypeLabelValue()).toContainText(
        clusterProperties.Type,
      );
      await expect(clusterDetailsPage.clusterRegionLabelValue()).toContainText(
        clusterProperties.Region.split(',')[0],
      );
      await expect(clusterDetailsPage.clusterAvailabilityLabelValue()).toContainText(
        clusterProperties.Availability,
      );
      await expect(clusterDetailsPage.clusterPersistentStorageLabelValue()).toContainText(
        clusterProperties.PersistentStorage,
      );

      const expectedLoadBalancers =
        Number(clusterProperties.LoadBalancers) > 0 ? clusterProperties.LoadBalancers : 'N/A';
      await expect(clusterDetailsPage.clusterLoadBalancersValue()).toContainText(
        expectedLoadBalancers,
      );
      await expect(clusterDetailsPage.clusterSubscriptionBillingModelValue()).toContainText(
        clusterProperties.SubscriptionBillingModel,
      );
      await expect(clusterDetailsPage.clusterInfrastructureBillingModelValue()).toContainText(
        clusterProperties.InfrastructureType,
      );

      const machinePool = clusterProperties.MachinePools[0];
      if (String(machinePool.Autoscaling).includes('Enabled')) {
        await clusterDetailsPage.isTextContainsInPage(
          `Min: ${3 * parseInt(String(machinePool.MinimumNodeCount), 10)}`,
        );
        await clusterDetailsPage.isTextContainsInPage(
          `Max: ${3 * parseInt(String(machinePool.MaximumNodeCount), 10)}`,
        );
      } else {
        await expect(clusterDetailsPage.clusterComputeNodeCountValue()).toContainText(
          `${machinePool.NodeCount}/${machinePool.NodeCount}`,
        );
      }

      await expect(clusterDetailsPage.clusterAutoScalingStatus()).toContainText(
        clusterProperties.ClusterAutoscaling,
      );
      await expect(clusterDetailsPage.clusterMachineCIDRLabelValue()).toContainText(
        cidrRanges.MachineCIDR,
      );
      await expect(clusterDetailsPage.clusterServiceCIDRLabelValue()).toContainText(
        cidrRanges.ServiceCIDR,
      );
      await expect(clusterDetailsPage.clusterPodCIDRLabelValue()).toContainText(cidrRanges.PodCIDR);
      await expect(clusterDetailsPage.clusterHostPrefixLabelValue()).toContainText(
        cidrRanges.HostPrefix.replace('/', ''),
      );
      await expect(clusterDetailsPage.clusterTotalMemoryValue()).toBeVisible();
      await expect(clusterDetailsPage.clusterTotalvCPUValue()).toBeVisible();
    });
  },
);
