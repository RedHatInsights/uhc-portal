import { expect, test } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const day1Profile = require('../../fixtures/osd-gcp/osd-ondemand-gcp-wif-public-advanced-cluster-creation.spec.json');

const QE_INFRA_GCP = JSON.parse(process.env.QE_INFRA_GCP || '{}');
const FIREWALL_RULES_NAME =
  QE_INFRA_GCP['FIREWALL_RULES_NAME'] || process.env.QE_GCP_FIREWALL_RULES_NAME || '';

/**
 * Day-2 Networking tab validation for a ready OSD GCP WIF cluster that was created with
 * BYO firewall rules against QE_INFRA_GCP.VPC_NAME (ROSAENG-72666).
 *
 * Pair with osd-ondemand-gcp-wif-public-advanced-cluster-creation after the cluster is
 * ready. Prefer CLUSTER_NAME for a known ready cluster.
 */
test.describe.serial(
  'OSD On-Demand GCP WIF public advanced firewall rules - Networking tab validation',
  {
    tag: [
      '@day2',
      '@osd',
      '@gcp',
      '@wif',
      '@ondemand',
      '@public',
      '@firewall',
      '@networking',
      '@advanced',
    ],
  },
  () => {
    const clusterName =
      process.env.CLUSTER_NAME || `${day1Profile.ClusterName}-${getUsernameSuffix()}`;

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      if (!FIREWALL_RULES_NAME?.trim()) {
        throw new Error(
          'FIREWALL_RULES_NAME must be set via QE_INFRA_GCP.FIREWALL_RULES_NAME or QE_GCP_FIREWALL_RULES_NAME',
        );
      }
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test('navigates to cluster and opens the Networking tab', async ({
      clusterListPage,
      clusterDetailsPage,
      networkingPage,
    }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName, 'startsWith');
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await clusterDetailsPage.isClusterDetailsPage(clusterName);
      await networkingPage.navigateToNetworkingTab();
    });

    test('verifies Firewall rules are shown under VPC details when set', async ({
      networkingPage,
    }) => {
      await expect(networkingPage.vpcDetailsCardTitle()).toBeVisible();
      await networkingPage.expectFirewallRulesValue(FIREWALL_RULES_NAME);
    });
  },
);
