import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ClusterListPage } from '../../page-objects/cluster-list-page';
import { ClusterRequestsPage } from '../../page-objects/cluster-requests-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterListPage: ClusterListPage;
let clusterRequestPage: ClusterRequestsPage;

test.describe.serial(
  'Check cluster requests page items presence and its actions (OCP-80154)',
  { tag: ['@ci', '@smoke'] },
  () => {
    test.beforeAll(async ({ browser }) => {
      // Setup: auth + navigate to cluster list
      const setup = await setupTestSuite(browser, 'cluster-list');

      sharedContext = setup.context;
      sharedPage = setup.page;

      // Initialize page objects for this test suite
      clusterListPage = new ClusterListPage(sharedPage);
      clusterRequestPage = new ClusterRequestsPage(sharedPage);

      // Wait for cluster list data to load
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test.afterAll(async () => {
      await cleanupTestSuite(sharedContext);
    });

    test('Cluster requests links and page definitions', async () => {
      await clusterListPage.viewClusterRequests().click();
      await clusterRequestPage.isClusterRequestsUrl();
      await clusterRequestPage.isClusterRequestsScreen();
      await clusterRequestPage.isClusterTranferRequestHeaderPage();
      await clusterRequestPage.isClusterTranferRequestContentPage(
        'Transfer cluster ownership so that another user in your organization or another organization can manage this cluster',
      );
      await clusterRequestPage.isClusterTranferRequestContentPage(
        'Cluster transfers from outside your organization will show numerous ‘Unknown’ fields, as access to external cluster data is restricted',
      );
    });

    test('Navigate to cluster requests page and verify table structure', async () => {
      await sharedPage.goto('cluster-request');
      await sharedPage.route('**/cluster_transfers?search*', async (route, request) => {
        // Let the request continue and capture the response
        const response = await route.fetch();
        const status = response.status();
        // Fulfill the original route
        await route.fulfill({ response });
        // Wait until the request finishes before checking the UI
        await sharedPage.waitForLoadState('networkidle');
        if (status === 204) {
          await expect(clusterRequestPage.noTransfersFoundMessage()).toBeVisible();
          await expect(clusterRequestPage.noActiveTransfersMessage()).toBeVisible();
        } else {
          // Verify all expected table headers are present
          await clusterRequestPage.checkClusterRequestsTableHeaders('Name');
          await clusterRequestPage.checkClusterRequestsTableHeaders('Status');
          await clusterRequestPage.checkClusterRequestsTableHeaders('Type');
          await clusterRequestPage.checkClusterRequestsTableHeaders('Version');
          await clusterRequestPage.checkClusterRequestsTableHeaders('Current Owner');
          await clusterRequestPage.checkClusterRequestsTableHeaders('Transfer Recipient');
        }
        await clusterRequestPage.isClusterRequestsUrl();
        await clusterRequestPage.isClusterRequestsScreen();
      });
    });

    test('Shows proper empty state when no cluster transfer requests exist', async () => {
      await sharedPage.goto('cluster-request');
      await sharedPage.route('**/cluster_transfers*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [] }),
        });
      });
      await sharedPage.waitForLoadState('networkidle');
      // Verify empty state messages are displayed
      await expect(clusterRequestPage.noTransfersFoundMessage()).toBeVisible();
      await expect(clusterRequestPage.noActiveTransfersMessage()).toBeVisible();
    });

    test('Verifies cluster requests navigation from empty cluster list', async () => {
      await sharedPage.goto('cluster-list');
      // Intercept and mock empty subscriptions response
      await sharedPage.route('**/subscriptions*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{"items":[],"kind":"SubscriptionList","page":1,"size":0,"total":0}',
        });
      });

      const response = await sharedPage.waitForResponse('**/subscriptions*', { timeout: 20000 });
      expect(response.status()).toBe(200);
      // Wait for data to load and verify screen
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
      // Verify cluster requests button is visible and clickable
      await expect(clusterListPage.viewClusterRequestsButton()).toBeVisible();
      await clusterListPage.viewClusterRequestsButton().click();
      // Verify navigation to cluster requests page
      await clusterRequestPage.isClusterRequestsUrl();
      await clusterRequestPage.isClusterRequestsScreen();
    });
  },
);
