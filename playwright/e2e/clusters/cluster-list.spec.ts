import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ClusterListPage } from '../../page-objects/cluster-list-page';
import { CreateClusterPage } from '../../page-objects/create-cluster-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

// Shared context and page objects for the test suite
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterListPage: ClusterListPage;
let createClusterPage: CreateClusterPage;

test.describe.serial(
  'Check all cluster lists page items presence and its actions (OCP-21339)',
  { tag: ['@smoke'] },
  () => {
    /* WARNING! The "/cluster-list" route is used by catchpoint tests which determine
  website operation status on 'http:///status.redhat.com'.  If this route is changed, 
  then the related catchpoint tests must be updated. For more info. see: https://issues.redhat.com/browse/OCMUI-2398 */

    test.beforeAll(async ({ browser }) => {
      // Setup: auth + navigate to cluster list
      const setup = await setupTestSuite(browser, '/openshift/cluster-list');

      sharedContext = setup.context;
      sharedPage = setup.page;

      // Initialize page objects for this test suite
      clusterListPage = new ClusterListPage(sharedPage);
      createClusterPage = new CreateClusterPage(sharedPage);

      // Wait for cluster list data to load
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test.afterAll(async () => {
      await cleanupTestSuite(sharedContext);
    });

    test('Cluster list page : filters & its actions', async () => {
      // Check if this is an empty state (no clusters) or has clusters
      const emptyStateHeading = sharedPage
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
        await sharedPage.goBack();
      }
    });

    test('Cluster list page : extra options & its actions', async () => {
      await clusterListPage.viewClusterArchives().click();
      await clusterListPage.isClusterArchivesUrl();
      await clusterListPage.isClusterArchivesScreen();
      await sharedPage.goBack();
    });

    test('Cluster list page : view only cluster options & its actions', async () => {
      await clusterListPage.viewOnlyMyCluster().click({ force: true });
      await clusterListPage.viewOnlyMyClusterHelp().click();
      await expect(clusterListPage.tooltipviewOnlyMyCluster()).toContainText(
        'Show only the clusters you previously created, or all clusters in your organization.',
      );
      await clusterListPage.clusterListRefresh();
    });

    test('Cluster list page : Register cluster & its actions', async () => {
      await expect(clusterListPage.registerCluster()).toBeVisible();
      await clusterListPage.registerCluster().click();
      await clusterListPage.isRegisterClusterUrl();
      await clusterListPage.isRegisterClusterScreen();
      await sharedPage.goBack();
    });

    // WARNING! This test mimics the catchpoint test.  Please see comments above.
    test('[Catchpoint] Cluster list should contain at least on anchor with "/openshift/details/"', async () => {
      await clusterListPage.viewOnlyMyCluster().click({ force: true });
      await clusterListPage.checkForDetailsInAnchor();
    });

    test('Cluster list page: first anchor should navigate to details page', async () => {
      await clusterListPage.checkIfFirstAnchorNavigatesToCorrectRoute();
    });
  },
);
