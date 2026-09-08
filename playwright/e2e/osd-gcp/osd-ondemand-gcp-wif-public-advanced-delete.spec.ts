import { test } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const day1Profile = require('../../fixtures/osd-gcp/osd-ondemand-gcp-wif-public-advanced-cluster-creation.spec.json');

/**
 * Day-3 cleanup: delete the OSD On-Demand GCP WIF public advanced cluster
 * created by osd-ondemand-gcp-wif-public-advanced-cluster-creation.spec.ts.
 */
const clusterName =
  process.env.CLUSTER_NAME || `${day1Profile.ClusterName}-${getUsernameSuffix()}`;

test.describe.serial(
  'OSD On-Demand GCP WIF public advanced cluster delete',
  { tag: ['@day3', '@osd', '@gcp', '@wif', '@ondemand', '@public', '@delete'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test(`Open cluster matching ${clusterName}`, async ({
      clusterListPage,
      clusterDetailsPage,
    }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await clusterDetailsPage.isClusterDetailsPage(clusterName);
    });

    test(`Delete the cluster matching ${clusterName}`, async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.deleteClusterByName(clusterName);
    });
  },
);
