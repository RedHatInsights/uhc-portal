import { test, expect } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

/**
 * Day-2 overview for the multi-zone non-CCS GCP cluster from
 * osd-non-ccs-gcp-advanced-cluster-creation.spec.ts (or CLUSTER_NAME).
 */
const clusterDetails = require('../../fixtures/osd-gcp/osd-non-ccs-gcp-advanced-cluster-creation.spec.json');
const clusterProfile = clusterDetails['osd-nonccs-gcp-advanced'];
const clusterProperties = clusterProfile.day1Profile;
const scaleClusterProperties = clusterProfile.day2Profile.ScaleCluster;

const userSuffix = getUsernameSuffix();
const clusterName = process.env.CLUSTER_NAME ||
  `${clusterProperties.ClusterName}-${userSuffix}`;
const clusterDomainPrefix = `${clusterProperties.DomainPrefix}${userSuffix}`;

test.describe.serial(
  'OSD non-CCS GCP multi-zone cluster overview properties',
  { tag: ['@day2', '@osd', '@gcp', '@nonccs', '@public', '@overview', '@multizone', '@advanced'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
    });

    test(`Open ${clusterName} cluster`, async ({ clusterListPage, clusterDetailsPage }) => {
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterDetailsPage.waitForClusterDetailsLoad();
    });

    test(`Checks on overview tab: ${clusterName} cluster`, async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await clusterDetailsPage.isClusterDetailsPage(clusterName);
      await clusterDetailsPage.openOverviewTab();
      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
      await expect(clusterDetailsPage.clusterTypeLabelValue()).toContainText(clusterProperties.Type);
      await expect(clusterDetailsPage.clusterDomainPrefixLabelValue()).toContainText(
        clusterDomainPrefix,
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
      await expect(clusterDetailsPage.clusterTotalMemoryValue()).toBeVisible();
      await expect(clusterDetailsPage.clusterTotalvCPUValue()).toBeVisible();
    });

    test(`Update load balancers and persistent storage on ${clusterName}`, async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await clusterDetailsPage.updateLoadBalancersAndPersistentStorage(
        scaleClusterProperties.LoadBalancers,
        scaleClusterProperties.PersistentStorage,
      );
      await clusterDetailsPage.expectOverviewPersistentStorageAndLoadBalancers(
        scaleClusterProperties.PersistentStorage,
        scaleClusterProperties.LoadBalancers,
      );
    });

    test.afterAll(async ({ clusterDetailsPage }) => {
      try {
        await clusterDetailsPage.ensureLoadBalancersAndPersistentStorage(
          clusterProperties.LoadBalancers,
          clusterProperties.PersistentStorage,
        );
      } catch (error) {
        console.error(
          'afterAll: failed to restore Day-1 load balancers and persistent storage on Overview',
          error,
        );
        throw error;
      }
    });
  },
);
