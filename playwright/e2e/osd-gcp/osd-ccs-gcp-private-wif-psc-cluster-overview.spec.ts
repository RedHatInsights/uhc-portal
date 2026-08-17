import { test, expect } from '../../fixtures/pages';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const clusterProperties = require('../../fixtures/osd-gcp/osd-ccs-gcp-private-wif-psc-cluster-creation-advanced.spec.json');
const clusterNamePrefix = process.env.CLUSTER_NAME || clusterProperties.ClusterName;

const QE_GCP_WIF_CONFIG = process.env.QE_GCP_WIF_CONFIG || '';
const region =
  JSON.parse(process.env.QE_INFRA_GCP || '{}')?.PSC_INFRA?.REGION ||
  clusterProperties.Region.split(',')[0];

test.describe.serial(
  'OSD GCP CCS WIF private PSC cluster overview tests',
  {
    tag: ['@advanced', '@day2', '@osd', '@ccs', '@gcp', '@private', '@wif', '@psc', '@multizone'],
  },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
    });

    test(`Open OSD - ${clusterProperties.CloudProvider} Workload Identity Federation PrivateServiceConnect cluster`, async ({
      clusterListPage,
    }) => {
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterNamePrefix);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterNamePrefix, 'startsWith');
    });

    test(`Checks on overview tab : ${clusterNamePrefix} cluster`, async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await clusterDetailsPage.isClusterDetailsPage(clusterNamePrefix);
      await clusterDetailsPage.openOverviewTab();
      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterNamePrefix);
      await expect(clusterDetailsPage.clusterTypeLabelValue()).toContainText(
        clusterProperties.Type,
      );
      await expect(clusterDetailsPage.clusterInfrastructureGCPAccountLabelValue()).toBeVisible();
      await expect(clusterDetailsPage.clusterRegionLabelValue()).toContainText(region);
      await expect(clusterDetailsPage.clusterAvailabilityLabelValue()).toContainText(
        clusterProperties.Availability,
      );
      await expect(clusterDetailsPage.clusterFipsCryptographyStatus()).toContainText(
        'FIPS Cryptography enabled',
      );
      await expect(clusterDetailsPage.clusterAutoScalingStatus()).toContainText(
        clusterProperties.ClusterAutoscaling,
      );
      await expect(clusterDetailsPage.clusterSecureBootSupportForShieldedVMsValue()).toContainText(
        clusterProperties.SecureBootSupportForShieldedVMs,
      );
      await expect(clusterDetailsPage.clusterSubscriptionBillingModelValue()).toContainText(
        clusterProperties.SubscriptionBillingModel,
      );
      await expect(clusterDetailsPage.clusterInfrastructureBillingModelValue()).toContainText(
        clusterProperties.InfrastructureType,
      );
      await expect(clusterDetailsPage.clusterAuthenticationTypeLabelValue()).toContainText(
        'Workload Identity Federation',
      );
      await expect(clusterDetailsPage.clusterWifConfigurationValue()).toContainText(
        QE_GCP_WIF_CONFIG,
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
  },
);
