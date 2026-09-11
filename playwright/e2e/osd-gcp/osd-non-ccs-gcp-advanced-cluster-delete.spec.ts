import { test } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const clusterDetails = require('../../fixtures/osd-gcp/osd-non-ccs-gcp-advanced-cluster-creation.spec.json');
const clusterProperties = clusterDetails['osd-nonccs-gcp-advanced'].day1Profile;

const userSuffix = getUsernameSuffix();
const clusterName = process.env.CLUSTER_NAME ||
  `${clusterProperties.ClusterName}-${userSuffix}`;

test.describe.serial(
  'OSD non-CCS GCP multi-zone cluster delete',
  { tag: ['@day3', '@osd', '@gcp', '@nonccs', '@public', '@delete', '@multizone', '@advanced'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
    });

    test(`Open cluster ${clusterName}`, async ({ clusterListPage, clusterDetailsPage }) => {
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await clusterDetailsPage.isClusterDetailsPage(clusterName);
    });

    test(`Delete the cluster ${clusterName}`, async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.deleteClusterByName(clusterName);
    });
  },
);
