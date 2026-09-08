import { test } from '../../fixtures/pages';
import { CLUSTER_LIST_FULL_PATH } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/osd-aws/osd-ccs-aws-public-advanced-creation.spec.json');
const clusterNamePrefix =
  process.env.CLUSTER_NAME ||
  clusterProfiles['osdccs-aws-public-advanced']['day1-profile'].ClusterNamePrefix ||
  '';

test.describe.serial(
  `OSD AWS CCS Cluster - delete public cluster ${clusterNamePrefix}`,
  { tag: ['@day3', '@advanced', '@osd', '@aws', '@public'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      test.skip(
        !clusterNamePrefix,
        'Set CLUSTER_NAME to the day-1 advanced CCS cluster name (random suffix).',
      );
      await navigateTo(CLUSTER_LIST_FULL_PATH);
      await clusterListPage.waitForDataReady();
    });

    test(`Open cluster ${clusterNamePrefix}`, async ({ clusterListPage, clusterDetailsPage }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterNamePrefix);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterNamePrefix, 'startsWith');
      await clusterDetailsPage.waitForClusterDetailsLoad();
    });

    test(`Delete the cluster ${clusterNamePrefix}`, async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.isClusterDetailsPage(clusterNamePrefix);
      await clusterDetailsPage.deleteClusterByName(clusterNamePrefix);
    });
  },
);
