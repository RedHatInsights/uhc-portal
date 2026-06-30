import { test } from '../../fixtures/pages';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const clusterProfile = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-private-advanced-creation.spec.json');
const clusterNamePrefix =
  process.env.CLUSTER_NAME ||
  clusterProfile['rosa-hosted-private-advanced']['day1-profile'].ClusterName;

test.describe.serial(
  'ROSA hosted cluster - Delete private cluster',
  { tag: ['@day3', '@rosa', '@rosa-hosted', '@hcp', '@delete', '@private', '@multizone'] },
  () => {
    let clusterName: string;

    test(`Open cluster matching ${clusterNamePrefix}`, async ({ navigateTo, clusterListPage, clusterDetailsPage }) => {
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterNamePrefix);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterNamePrefix);
      clusterName = await clusterDetailsPage.clusterNameTitle().innerText();
    });

    test(`Delete the cluster matching ${clusterNamePrefix}`, async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.actionsDropdownToggle().click();
      await clusterDetailsPage.deleteClusterDropdownItem().click();
      await clusterDetailsPage.deleteClusterNameInput().clear();
      await clusterDetailsPage.deleteClusterNameInput().fill(clusterName);
      await clusterDetailsPage.deleteClusterConfirm().click();
      await clusterDetailsPage.waitForDeleteClusterActionComplete();
    });
  },
);
