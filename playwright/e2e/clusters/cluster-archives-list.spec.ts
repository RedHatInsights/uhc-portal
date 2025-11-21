import { test, expect } from '../../fixtures/pages';

test.describe.serial('OCM Cluster archives page', { tag: ['@ci', '@smoke'] }, () => {
  test.describe('Check all cluster archives page items presence and its actions (OCP-25329)', () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      // Navigate to cluster list and wait for data to load
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });
    test('Cluster archives page : ui options & its actions', async ({ clusterListPage }) => {
      await clusterListPage.viewClusterArchives().click();
      await clusterListPage.isClusterArchivesUrl();
      await clusterListPage.isClusterArchivesScreen();
      await clusterListPage.clickClusterListTableHeader('Name');
      await clusterListPage.clickClusterListTableHeader('Type');
      await clusterListPage.clickClusterListTableHeader('Status');
      await clusterListPage.clickClusterListTableHeader('Provider (Location)');
      await clusterListPage.scrollClusterListPageTo('bottom');
      await clusterListPage.itemPerPage().click();
      await clusterListPage.clickPerPageItem('20');
      await clusterListPage.itemPerPage().click();
      await clusterListPage.clickPerPageItem('50');
      await clusterListPage.itemPerPage().click();
      await clusterListPage.clickPerPageItem('100');
      await clusterListPage.itemPerPage().click();
      await clusterListPage.clickPerPageItem('10');
    });

    test('Cluster archives page : navigations', async ({ clusterListPage }) => {
      await clusterListPage.showActiveClusters().click();
      await clusterListPage.isClusterListScreen();
      await clusterListPage.viewClusterArchives().click();
    });

    test('Cluster archives page : filter options', async ({ clusterListPage }) => {
      await expect(clusterListPage.filterTxtField()).toBeVisible();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.clickClusterTypeFilters();
      await clusterListPage.clickClusterTypes('OCP');
      await clusterListPage.filterTxtField().click();
      await clusterListPage.clusterListRefresh();
      await clusterListPage.waitForArchiveDataReady();

      // Only OCP cluster should be in filter rule display
      await clusterListPage.checkFilteredClusterTypes('OCP', true);
      await clusterListPage.checkFilteredClusterTypes('OSD', false);
      await clusterListPage.checkFilteredClusterTypes('ROSA', false);

      // Only OCP clusters should be in cluster list - first page
      await clusterListPage.checkFilteredClustersFromClusterList('OCP', true);
      await clusterListPage.scrollClusterListPageTo('bottom');
      await clusterListPage.goToLastPage();

      // Only OCP clusters should be in cluster list - last page
      await clusterListPage.checkFilteredClustersFromClusterList('OCP', true);
      await clusterListPage.scrollClusterListPageTo('top');
      await clusterListPage.waitForArchiveDataReady();
      await clusterListPage.clickClusterTypeFilters();
      await clusterListPage.clickClusterTypes('OSD');
      await clusterListPage.clickClusterTypes('ROSA');
      await clusterListPage.clickClusterTypes('ARO');
      await clusterListPage.clickClusterTypes('OCP');
      await clusterListPage.clickClusterTypeFilters();
      await clusterListPage.clearFilters();

      await clusterListPage.filterTxtField().scrollIntoViewIfNeeded();
      await expect(clusterListPage.filterTxtField()).toBeVisible();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill('smoke cluster');
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.waitForArchiveDataReady();
    });

    test('Cluster archives page : view only cluster options & its actions', async ({
      clusterListPage,
    }) => {
      await clusterListPage.viewOnlyMyCluster().click();
      await clusterListPage.viewOnlyMyClusterHelp().click();
      await expect(clusterListPage.tooltipviewOnlyMyCluster()).toContainText(
        'Show only the clusters you previously archived, or all archived clusters in your organization.',
      );
      await clusterListPage.clusterListRefresh();
    });
  });
});
