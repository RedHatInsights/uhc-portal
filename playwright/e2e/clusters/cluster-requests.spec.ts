import { test, expect } from '../../fixtures/pages';
const transferOwnershipText =
  'Transfer cluster ownership so that another user in your organization or another organization can manage this cluster';
const externalTransferNote =
  'Cluster transfers from outside your organization will show numerous ‘Unknown’ fields, as access to external cluster data is restricted';

test.describe.serial(
  'Check cluster requests page items presence and its actions (OCP-80154)',
  { tag: ['@ci', '@smoke'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      // Navigate to cluster list and wait for data to load
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });
    test('Cluster requests links and page definitions', async ({
      clusterListPage,
      clusterRequestsPage,
    }) => {
      await clusterListPage.viewClusterRequests().click();
      await clusterRequestsPage.isClusterRequestsUrl();
      await clusterRequestsPage.isClusterRequestsScreen();
      await clusterRequestsPage.isClusterTranferRequestHeaderPage();
      await clusterRequestsPage.clusterTransferRequestHelpButton();
      await clusterRequestsPage.isClusterTranferRequestContentPage(transferOwnershipText);
      await clusterRequestsPage.isClusterTranferRequestContentPage(externalTransferNote);
    });

    test('Navigate to cluster requests page and verify table structure', async ({
      navigateTo,
      page,
      clusterRequestsPage,
    }) => {
      await navigateTo('cluster-request');
      await page.route('**/cluster_transfers?search*', async (route, request) => {
        // Let the request continue and capture the response
        const response = await route.fetch();
        const status = response.status();
        // Fulfill the original route
        await route.fulfill({ response });
        // Wait until the request finishes before checking the UI
        await page.waitForLoadState('networkidle');
        if (status === 204) {
          await expect(clusterRequestsPage.noTransfersFoundMessage()).toBeVisible();
          await expect(clusterRequestsPage.noActiveTransfersMessage()).toBeVisible();
        } else {
          // Verify all expected table headers are present
          await clusterRequestsPage.checkClusterRequestsTableHeaders('Name');
          await clusterRequestsPage.checkClusterRequestsTableHeaders('Status');
          await clusterRequestsPage.checkClusterRequestsTableHeaders('Type');
          await clusterRequestsPage.checkClusterRequestsTableHeaders('Version');
          await clusterRequestsPage.checkClusterRequestsTableHeaders('Current Owner');
          await clusterRequestsPage.checkClusterRequestsTableHeaders('Transfer Recipient');
        }
        await clusterRequestsPage.isClusterRequestsUrl();
        await clusterRequestsPage.isClusterRequestsScreen();
      });
    });

    test('Shows proper empty state when no cluster transfer requests exist', async ({
      navigateTo,
      page,
      clusterRequestsPage,
    }) => {
      await navigateTo('cluster-request');
      await clusterRequestsPage.mockEmptyClusterTransfers();
      await page.waitForLoadState('networkidle');
      // Verify empty state messages are displayed
      await expect(clusterRequestsPage.noTransfersFoundMessage()).toBeVisible();
      await expect(clusterRequestsPage.noActiveTransfersMessage()).toBeVisible();
    });

    test('Verifies cluster requests navigation from empty cluster list', async ({
      navigateTo,
      page,
      clusterListPage,
      clusterRequestsPage,
    }) => {
      await navigateTo('cluster-list');
      // Intercept and mock empty subscriptions response
      await clusterRequestsPage.mockEmptySubscriptions();

      const response = await page.waitForResponse('**/subscriptions*', { timeout: 20000 });
      expect(response.status()).toBe(200);
      // Wait for data to load and verify screen
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
      // Verify cluster requests button is visible and clickable
      await expect(clusterListPage.viewClusterRequestsButton()).toBeVisible();
      await clusterListPage.viewClusterRequestsButton().click();
      // Verify navigation to cluster requests page
      await clusterRequestsPage.isClusterRequestsUrl();
      await clusterRequestsPage.isClusterRequestsScreen();
    });
  },
);
