import { test } from '../../fixtures/pages';
import { CLUSTER_LIST_FULL_PATH } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/osd-aws/osd-non-ccs-aws-cluster-creation-advanced.spec.json');
const clusterName =
  process.env.CLUSTER_NAME ||
  clusterProfiles['osd-nonccs-aws-public-advanced']['day1-profile'].ClusterName ||
  '';

test.describe.serial(
  `OSD Non CCS AWS Cluster - delete public advanced cluster ${clusterName}`,
  { tag: ['@day3', '@advanced', '@osd', '@aws', '@non-ccs', '@public'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      test.skip(
        !clusterName,
        'Set CLUSTER_NAME to the day-1 advanced non-CCS cluster name (random suffix).',
      );
      await navigateTo(CLUSTER_LIST_FULL_PATH);
      await clusterListPage.waitForDataReady();
    });

    test(`Open cluster ${clusterName}`, async ({ clusterListPage, clusterDetailsPage }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName, 'startsWith');
      await clusterDetailsPage.waitForClusterDetailsLoad();
    });

    test(`Delete the cluster ${clusterName}`, async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.isClusterDetailsPage(clusterName);
      await clusterDetailsPage.deleteClusterByName(clusterName);
    });
  },
);
