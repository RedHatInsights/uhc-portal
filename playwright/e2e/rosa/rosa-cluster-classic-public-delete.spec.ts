import { test } from '../../fixtures/pages';
import { CLUSTER_LIST_FULL_PATH } from '../../support/playwright-constants';

const clusterDetails = require('../../fixtures/rosa/rosa-cluster-classic-public-creation-advanced.spec.json');
const clusterNamePrefix = clusterDetails['rosa-classic-public-advanced'].ClusterNamePrefix;

test.describe.serial(
  'ROSA classic cluster - Delete public advanced cluster',
  { tag: ['@day2', '@rosa', '@rosa-classic', '@delete', '@public', '@multizone'] },
  () => {
    let clusterName: string;

    test(`Open cluster matching ${clusterNamePrefix}`, async ({ navigateTo, clusterListPage }) => {
      await navigateTo(CLUSTER_LIST_FULL_PATH);
      await clusterListPage.waitForDataReady();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterNamePrefix);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterNamePrefix, 'startsWith');
    });

    test(`Delete the cluster matching ${clusterNamePrefix}`, async ({
      clusterDetailsPage,
    }) => {
      clusterName = await clusterDetailsPage.clusterNameTitle().innerText();
      await clusterDetailsPage.actionsDropdownToggle().click();
      await clusterDetailsPage.deleteClusterDropdownItem().click();
      await clusterDetailsPage.deleteClusterNameInput().clear();
      await clusterDetailsPage.deleteClusterNameInput().fill(clusterName);
      await clusterDetailsPage.deleteClusterConfirm().click();
      await clusterDetailsPage.waitForDeleteClusterActionComplete();
    });
  },
);
