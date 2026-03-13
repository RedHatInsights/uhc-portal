import { test, expect } from '../../fixtures/pages';


/**
* Cluster List Page Validation Tests
*
* This test suite verifies all UI elements and functionality on the
* cluster list page at /openshift/clusters/list
*/
test.describe.serial(
 'Cluster List Page Content Validation',
 { tag: ['@smoke', '@ci'] },
 () => {
   test.beforeAll(async ({ navigateTo, clusterListPage }) => {
     // Navigate to cluster list and wait for data to load
     await navigateTo('clusters/list');
     await clusterListPage.waitForDataReady();
   });


   test('should display the page heading "Clusters"', async ({ clusterListPage }) => {
     const pageHeading = clusterListPage.pageHeading();
     await expect(pageHeading).toBeVisible();
     await expect(pageHeading).toHaveText('Clusters');
   });


   test('should display Cluster List and Cluster Request tabs', async ({ clusterListPage }) => {
     // Verify Cluster List tab
     const clusterListTab = clusterListPage.clusterListTab();
     await expect(clusterListTab).toBeVisible();
     await expect(clusterListTab).toHaveAttribute('aria-selected', 'true');


     // Verify Cluster Request tab
     const clusterRequestTab = clusterListPage.viewClusterRequests();
     await expect(clusterRequestTab).toBeVisible();
   });


   test('should display filter input field', async ({ clusterListPage }) => {
     const filterInput = clusterListPage.filterTxtField();
     await expect(filterInput).toBeVisible();
     await expect(filterInput).toHaveAttribute('placeholder', /Filter by name or ID/i);
   });


   test('should display Cluster type filter dropdown', async ({ clusterListPage }) => {
     const clusterTypeFilter = clusterListPage.clusterTypeFilterButton();
     await expect(clusterTypeFilter).toBeVisible();
   });


   test('should display Create cluster button', async ({ clusterListPage }) => {
     const createClusterBtn = clusterListPage.createClusterButton();
     await expect(createClusterBtn).toBeVisible();
     await expect(createClusterBtn).toHaveText('Create cluster');
   });


   test('should display Register cluster button', async ({ clusterListPage }) => {
     const registerClusterBtn = clusterListPage.registerCluster();
     await expect(registerClusterBtn).toBeVisible();
     await expect(registerClusterBtn).toHaveText('Register cluster');
   });


   test('should display View cluster archives link', async ({ clusterListPage }) => {
     const viewArchivesLink = clusterListPage.viewClusterArchives();
     await expect(viewArchivesLink).toBeVisible();
     await expect(viewArchivesLink).toHaveText('View cluster archives');
   });


   test('should display View only my clusters toggle with help icon', async ({
     clusterListPage,
   }) => {
     // Verify toggle text
     const toggleLabel = clusterListPage.viewOnlyMyCluster();
     await expect(toggleLabel).toBeVisible();


     // Verify help icon (question mark) is present
     const helpIcon = clusterListPage.viewOnlyMyClusterHelp();
     await expect(helpIcon).toBeVisible();
   });


   test('should display cluster table with correct headers', async ({ page }) => {
     // Verify all table column headers in exact order (catches missing, extra, or reordered headers)
     const expectedHeaders = [
       'Name',
       'Status',
       'Type',
       'Created',
       'Version',
       'Provider (Region)',
     ];


     const headerTexts = await page.locator('thead th').allTextContents();
     // Filter out utility columns like "cluster actions" (kebab menu column)
     const dataHeaders = headerTexts
       .map((h) => h.trim())
       .filter((h) => !h.toLowerCase().includes('actions'));
     expect(dataHeaders).toEqual(expectedHeaders);
   });


   test('should display cluster data in the table', async ({ clusterListPage }) => {
     const clusterRows = clusterListPage.clusterRows();


     // Verify table has at least one row (with auto-waiting)
     await expect(clusterRows.first()).toBeVisible();


     // Verify first cluster row has all expected data cells
     const firstRow = clusterRows.first();
     const expectedColumns = ['Name', 'Status', 'Type', 'Created', 'Version', 'Provider (Region)'];


     await Promise.all(
       expectedColumns.map((column) =>
         expect(firstRow.locator(`td[data-label="${column}"]`)).toBeVisible(),
       ),
     );
   });


   test('should display cluster names as clickable links', async ({ clusterListPage }) => {
     const clusterNameLinks = clusterListPage.clusterNameLinks();
     const count = await clusterNameLinks.count();
     expect(count).toBeGreaterThan(0);


     // Verify first cluster link has href to details page
     const firstLink = clusterNameLinks.first();
     await expect(firstLink).toBeVisible();
     const href = await firstLink.getAttribute('href');
     expect(href).toContain('/openshift/details/');
   });


   test('should display cluster types (ROSA, OSD, OCP, ARO)', async ({ clusterListPage }) => {
     const typeCells = clusterListPage.typeCells();
     const count = await typeCells.count();
     expect(count).toBeGreaterThan(0);


     // Verify type values are valid cluster types
     const validTypes = ['ROSA', 'OSD', 'OCP', 'ARO', 'RHOIC'];
     const firstTypeText = await typeCells.first().textContent();
     const hasValidType = validTypes.some((type) => firstTypeText?.includes(type));
     expect(hasValidType).toBe(true);
   });


   test('should display pagination controls', async ({ clusterListPage }) => {
     // Pagination may be hidden on smaller viewports (pf-m-hidden visible-on-lgplus)
     // Check for pagination elements that exist in the DOM
     const paginationContainer = clusterListPage.paginationContainer();
     const paginationCount = await paginationContainer.count();
     expect(paginationCount).toBeGreaterThan(0);


     // Look for visible pagination text or the bottom pagination which is usually visible
     const paginationText = clusterListPage.paginationText();
     const visiblePagination = (await paginationText.count()) > 0 && (await paginationText.first().isVisible());


     if (visiblePagination) {
       await expect(paginationText.first()).toBeVisible();
     } else {
       // If top pagination is hidden, check for items per page toggle at the bottom
       const itemsPerPageToggle = clusterListPage.itemPerPage();
       const toggleCount = await itemsPerPageToggle.count();
       const toggleVisible = toggleCount > 0 && (await itemsPerPageToggle.isVisible());
       expect(visiblePagination || toggleVisible || paginationCount > 0).toBe(true);
     }


     // Check for pagination navigation buttons (may be hidden on small screens)
     const prevButton = clusterListPage.prevPageButton();
     const nextButton = clusterListPage.nextPageButton();
     const prevCount = await prevButton.count();
     const nextCount = await nextButton.count();
     expect(prevCount).toBeGreaterThan(0);
     expect(nextCount).toBeGreaterThan(0);
   });


   test('should display refresh button', async ({ clusterListPage }) => {
     const refreshButton = clusterListPage.refreshButton();
     await expect(refreshButton).toBeVisible();
   });


   test('should display kebab menu (actions) for each cluster row', async ({ clusterListPage }) => {
     // Verify kebab menu exists for cluster rows
     const kebabMenus = clusterListPage.kebabMenus();
     const count = await kebabMenus.count();
     expect(count).toBeGreaterThan(0);
   });


   test('Cluster type filter should show filter options when clicked', async ({
     clusterListPage,
   }) => {
     await clusterListPage.clickClusterTypeFilters();


     // Verify filter options are displayed
     const filterOptions = ['OCP', 'OSD', 'ROSA', 'ARO', 'RHOIC'];
     for (const option of filterOptions) {
       const filterOption = clusterListPage.clusterTypeFilterOption(option);
       await expect(filterOption).toBeVisible();
     }


     // Close the filter dropdown
     await clusterListPage.clickClusterTypeFilters();
   });


   test('View only my clusters toggle should be functional', async ({ clusterListPage }) => {
     // Get the toggle switch
     const toggleSwitch = clusterListPage.viewOnlyMyClusterToggle();


     // Get initial state
     const initialState = await toggleSwitch.isChecked();


     // Click the toggle
     await clusterListPage.viewOnlyMyCluster().click();


     // Wait for data to reload
     await clusterListPage.waitForDataReady();


     // Verify toggle state changed
     const newState = await toggleSwitch.isChecked();
     expect(newState).toBe(!initialState);


     // Reset to original state
     if (newState !== initialState) {
       await clusterListPage.viewOnlyMyCluster().click();
       await clusterListPage.waitForDataReady();
     }
   });


   test('Cluster Request tab should be clickable and navigate to requests', async ({
     page,
     clusterListPage,
   }) => {
     // Click on Cluster Request tab
     const clusterRequestTab = clusterListPage.viewClusterRequests();
     await clusterRequestTab.click();


     // Verify tab is now selected
     await expect(clusterRequestTab).toHaveAttribute('aria-selected', 'true');


     // Verify URL changed to cluster requests
     await expect(page).toHaveURL(/\/openshift\/clusters\/requests/);


     // Navigate back to Cluster List
     const clusterListTab = clusterListPage.clusterListTab();
     await clusterListTab.click();
     await expect(clusterListTab).toHaveAttribute('aria-selected', 'true');
   });


   test('Filter input should filter clusters by name', async ({ clusterListPage }) => {
     // Get count of clusters before filtering
     const initialRows = clusterListPage.clusterRows();
     const initialCount = await initialRows.count();


     if (initialCount > 0) {
       // Get the first cluster name
       const firstClusterName = await clusterListPage.clusterNameLinks().first().textContent();


       if (firstClusterName) {
         // Filter by the cluster name
         await clusterListPage.filterTxtField().fill(firstClusterName);
         await clusterListPage.waitForDataReady();


         // Verify filtered results contain the cluster
         const filteredLinks = clusterListPage.clusterNameLinks();
         const filteredCount = await filteredLinks.count();
         expect(filteredCount).toBeGreaterThan(0);


         // Clear the filter
         await clusterListPage.filterTxtField().clear();
         await clusterListPage.waitForDataReady();
       }
     }
   });


   test('should display Provider (Region) information correctly', async ({ clusterListPage }) => {
     const providerCells = clusterListPage.providerCells();


     // Verify at least one provider cell exists (with auto-waiting)
     await expect(providerCells.first()).toBeVisible();


     // Verify provider cell has content (format: "Provider (region)" or just provider name)
     const firstProviderText = await providerCells.first().textContent();
     expect(firstProviderText?.trim()).toBeTruthy();
   });
 },
);


