import { test, expect } from '../../fixtures/pages';

test.describe.serial(
  'Check all cluster lists page items presence and its actions (OCP-21339)',
  { tag: ['@smoke', '@ci'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      // Navigate to cluster list and wait for data to load
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });
    test('Cluster list page : filters & its actions', async ({
      page,
      clusterListPage,
      createClusterPage,
    }) => {
      // Check if this is an empty state (no clusters) or has clusters
      const emptyStateHeading = page
        .locator('h4')
        .filter({ hasText: "Let's create your first cluster" });
      const isEmptyState = await emptyStateHeading.isVisible();

      if (isEmptyState) {
        // Empty state - check for register cluster, archives, and assisted installer links
        await expect(clusterListPage.registerCluster()).toBeVisible();
        await expect(clusterListPage.viewClusterArchives()).toBeVisible();
        await expect(clusterListPage.assistedInstallerClusters()).toBeVisible();
      } else {
        // Has clusters - test filtering functionality
        await expect(clusterListPage.filterTxtField()).toBeVisible();
        await clusterListPage.filterTxtField().click();
        await clusterListPage.filterTxtField().clear();
        await clusterListPage.filterTxtField().fill('smoke cluster');
        await clusterListPage.filterTxtField().clear();
        await clusterListPage.waitForDataReady();

        // Test cluster type filters
        await clusterListPage.clickClusterTypeFilters();
        await clusterListPage.clickClusterTypes('OCP');
        await clusterListPage.clickClusterTypes('OSD');
        await clusterListPage.clickClusterTypes('ROSA');
        await clusterListPage.clickClusterTypes('ARO');
        await clusterListPage.clickClusterTypes('RHOIC');
        await clusterListPage.clickClusterTypes('OCP');
        await clusterListPage.clickClusterTypes('OSD');
        await clusterListPage.clickClusterTypes('ROSA');
        await clusterListPage.clickClusterTypes('ARO');
        await clusterListPage.clickClusterTypes('RHOIC');
        await clusterListPage.clickClusterTypeFilters();

        // Test create cluster button
        await clusterListPage.isCreateClusterBtnVisible();
        await clusterListPage.createClusterButton().click();
        await createClusterPage.isCreateClusterPageHeaderVisible();
        await page.goBack();
      }
    });

    test('Cluster list page : extra options & its actions', async ({ page, clusterListPage }) => {
      await clusterListPage.viewClusterArchives().click();
      await clusterListPage.isClusterArchivesUrl();
      await clusterListPage.isClusterArchivesScreen();
      await page.goBack();
    });

    test('Cluster list page : view only cluster options & its actions', async ({
      clusterListPage,
    }) => {
      await clusterListPage.viewOnlyMyCluster().click();
      await clusterListPage.viewOnlyMyClusterHelp().click();
      await expect(clusterListPage.tooltipviewOnlyMyCluster()).toContainText(
        'Show only the clusters you previously created, or all clusters in your organization.',
      );
      await clusterListPage.clusterListRefresh();
    });

    test('Cluster list page : Register cluster & its actions', async ({
      page,
      clusterListPage,
    }) => {
      await expect(clusterListPage.registerCluster()).toBeVisible();
      await clusterListPage.registerCluster().click();
      await clusterListPage.isRegisterClusterUrl();
      await clusterListPage.isRegisterClusterScreen();
      await page.goBack();
    });

    // WARNING! This test mimics the catchpoint test.  Please see comments above.
    test('[Catchpoint] Cluster list should contain at least on anchor with "/openshift/details/"', async ({
      clusterListPage,
    }) => {
      await clusterListPage.viewOnlyMyCluster().click();
      await clusterListPage.checkForDetailsInAnchor();
    });

    test('Cluster list page: first anchor should navigate to details page', async ({
      clusterListPage,
    }) => {
      await clusterListPage.checkIfFirstAnchorNavigatesToCorrectRoute();
    });
  },
);
