import { test, expect } from '../../fixtures/pages';

test.describe.serial(
  'Check cluster access requests section presence and actions (OCP-80154)',
  { tag: ['@ci', '@smoke'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo('clusters/list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test('Cluster access requests header and help icon', async ({
      clusterListPage,
      clusterRequestsPage,
    }) => {
      await clusterListPage.viewClusterRequests().click();
      await clusterRequestsPage.isClusterRequestsUrl();
      await expect(clusterRequestsPage.clusterAccessRequestsHeading()).toBeVisible();
    });

    test('Cluster access requests table headers and data validation', async ({
      navigateTo,
      clusterRequestsPage,
    }) => {
      await navigateTo('clusters/requests');
      await clusterRequestsPage.waitForPageReady();

      // Table should be visible
      await expect(clusterRequestsPage.accessRequestsTable()).toBeVisible();

      // Verify all expected headers
      const headers = ['Cluster Name', 'Status', 'Request ID', 'Created at', 'Actions'];
      for (const header of headers) {
        await expect(clusterRequestsPage.accessRequestsTableHeader(header)).toBeVisible();
      }

      // Verify Open button in first row if data exists
      const rows = clusterRequestsPage.accessRequestsTableRows();
      if ((await rows.count()) > 0) {
        await expect(clusterRequestsPage.accessRequestsOpenButton()).toBeVisible();
      }
    });

    test('Cluster access request link navigation', async ({
      navigateTo,
      page,
      clusterRequestsPage,
    }) => {
      await navigateTo('clusters/requests');
      await clusterRequestsPage.waitForPageReady();

      // Skip test if no data rows exist
      const rows = clusterRequestsPage.accessRequestsTableRows();
      test.skip((await rows.count()) === 0, 'No cluster access requests data available');

      const firstLink = clusterRequestsPage.accessRequestsFirstLink();
      await expect(firstLink).toBeVisible();

      const href = await firstLink.getAttribute('href');
      await firstLink.click();
      await expect(page).toHaveURL(new RegExp(href || ''));
      await page.goBack();
      await clusterRequestsPage.isClusterRequestsUrl();
    });

    test('Cluster access request Open button action', async ({
      navigateTo,
      page,
      clusterRequestsPage,
    }) => {
      await navigateTo('clusters/requests');
      await clusterRequestsPage.waitForPageReady();

      // Skip test if no data rows exist
      const rows = clusterRequestsPage.accessRequestsTableRows();
      test.skip((await rows.count()) === 0, 'No cluster access requests data available');

      const openButton = clusterRequestsPage.accessRequestsOpenButton();
      await expect(openButton).toBeVisible();
      await openButton.click();

      // Wait for modal to appear, then close it
      await expect(clusterRequestsPage.dialogModal()).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(clusterRequestsPage.dialogModal()).not.toBeVisible();

      await clusterRequestsPage.isClusterRequestsUrl();
    });

    test('Cluster access requests pagination exists', async ({ navigateTo, clusterRequestsPage }) => {
      await navigateTo('clusters/requests');
      await clusterRequestsPage.waitForPageReady();
      expect(await clusterRequestsPage.paginationContainer().count()).toBeGreaterThan(0);
    });
  },
);
