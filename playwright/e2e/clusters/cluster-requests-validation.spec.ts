import { test, expect } from '../../fixtures/pages';


/**
* Cluster Access Requests Section Validation Tests
*
* This test suite validates the "Cluster access requests" section
* on the cluster requests page. For page-level validations (heading,
* URL, transfer ownership section), see cluster-requests.spec.ts
*/
test.describe.serial(
 'Cluster Access Requests Section Validation',
 { tag: ['@ci', '@smoke'] },
 () => {
   test.beforeAll(async ({ navigateTo, clusterRequestsPage }) => {
     await navigateTo('clusters/requests');
     await clusterRequestsPage.waitForPageReady();
   });


   test('should display cluster access requests heading', async ({ clusterRequestsPage }) => {
     await expect(clusterRequestsPage.clusterAccessRequestsHeading()).toBeVisible();
   });


   test('should display access requests table with correct headers', async ({
     clusterRequestsPage,
   }) => {
     await expect(clusterRequestsPage.accessRequestsTable()).toBeVisible();


     const headers = ['Cluster Name', 'Status', 'Request ID', 'Created at', 'Actions'];
     await Promise.all(
       headers.map((header) =>
         expect(clusterRequestsPage.accessRequestsTableHeader(header)).toBeVisible(),
       ),
     );
   });


   test('should display pagination controls', async ({ clusterRequestsPage }) => {
     expect(await clusterRequestsPage.paginationContainer().count()).toBeGreaterThan(0);
   });


   test('Open button should open and close modal dialog', async ({ page, clusterRequestsPage }) => {
     const rows = clusterRequestsPage.accessRequestsTableRows();
     test.skip((await rows.count()) === 0, 'No cluster access requests data available');


     await expect(clusterRequestsPage.accessRequestsOpenButton()).toBeVisible();
     await clusterRequestsPage.accessRequestsOpenButton().click();


     await expect(clusterRequestsPage.dialogModal()).toBeVisible();
     await page.keyboard.press('Escape');
     await expect(clusterRequestsPage.dialogModal()).not.toBeVisible();
   });


   test('cluster name link should navigate to cluster details', async ({
     navigateTo,
     page,
     clusterRequestsPage,
   }) => {
     const rows = clusterRequestsPage.accessRequestsTableRows();
     test.skip((await rows.count()) === 0, 'No cluster access requests data available');


     const firstLink = clusterRequestsPage.accessRequestsFirstLink();
     await expect(firstLink).toBeVisible();


     const href = await firstLink.getAttribute('href');
     await firstLink.click();
     await expect(page).toHaveURL(new RegExp(href || ''));


     // Navigate back for any subsequent tests
     await navigateTo('clusters/requests');
     await clusterRequestsPage.waitForPageReady();
   });
 },
);
