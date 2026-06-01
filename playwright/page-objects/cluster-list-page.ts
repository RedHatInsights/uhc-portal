import { expect, Locator, Page } from '@playwright/test';


import { CLUSTER_LIST_FULL_PATH } from '../support/playwright-constants';


import { BasePage } from './base-page';


/**
* Cluster List page object for Playwright tests
*/
export class ClusterListPage extends BasePage {
 constructor(page: Page) {
   super(page);
 }


 async isClusterListUrl(): Promise<void> {
   await this.assertUrlIncludes(CLUSTER_LIST_FULL_PATH);
 }


 filterTxtField(): Locator {
   return this.page.getByTestId('filterInputClusterList');
 }


 viewOnlyMyCluster(): Locator {
   return this.page.getByText('View only my clusters');
 }


 viewOnlyMyClusterHelp(): Locator {
   return this.page.locator('label[for="view-only-my-clusters"]').locator('button').first();
 }


 tooltipviewOnlyMyCluster(): Locator {
   return this.page.locator('div[class*="popover__body"]');
 }


 async closePopover(): Promise<void> {
   await this.page.locator('button[aria-label="Close"]').click();
 }


 viewClusterArchives(): Locator {
   return this.page.locator('a').filter({ hasText: 'View cluster archives' });
 }


 viewClusterRequests(): Locator {
   return this.page
     .getByRole('tab', { name: 'Cluster Request' })
     .or(this.page.getByRole('link', { name: /cluster requests/i }));
 }


 assistedInstallerClusters(): Locator {
   return this.page.locator('a').filter({ hasText: 'Assisted Installer clusters' });
 }


 registerCluster(): Locator {
   return this.page.getByTestId('register-cluster-item');
 }


 createClusterButton(): Locator {
   return this.page.getByTestId('create_cluster_btn');
 }


 pageHeading(): Locator {
   return this.page.getByRole('heading', { name: 'Clusters', level: 1 });
 }


 clusterListTab(): Locator {
   return this.page.getByRole('tab', { name: 'Cluster List' });
 }


 clusterTypeFilterButton(): Locator {
   return this.page.getByRole('button', { name: /Cluster type/i });
 }


 clusterRows(): Locator {
   return this.page.locator('tbody tr');
 }


 clusterNameLinks(): Locator {
   return this.page.locator('td[data-label="Name"] a');
 }


 typeCells(): Locator {
   return this.page.locator('td[data-label="Type"] span');
 }


 providerCells(): Locator {
   return this.page.locator('td[data-label="Provider (Region)"]');
 }


 paginationContainer(): Locator {
   return this.page.locator('[class*="pagination"]');
 }


 paginationText(): Locator {
   return this.page.locator('span').filter({ hasText: /\d+\s*[-–]\s*\d+\s*of\s*\d+/ });
 }


 prevPageButton(): Locator {
   return this.page.getByRole('button', { name: 'Go to previous page' });
 }


 nextPageButton(): Locator {
   return this.page.getByRole('button', { name: 'Go to next page' });
 }


 refreshButton(): Locator {
   return this.page.getByRole('button', { name: 'Refresh' });
 }


 kebabMenus(): Locator {
   return this.page.locator('td').locator('button[aria-label="Kebab toggle"]');
 }


 clusterTypeFilterOption(type: string): Locator {
   return this.page.getByTestId(`cluster-type-${type}`);
 }


 viewOnlyMyClusterToggle(): Locator {
   return this.page.locator('input[id="view-only-my-clusters"]');
 }


 tableHeader(header: string): Locator {
   return this.page.getByRole('columnheader', { name: header });
 }


 tableCell(label: string): Locator {
   return this.page.locator(`td[data-label="${label}"]`);
 }


 async waitForDataReady(): Promise<void> {
   await this.page.locator('div[data-ready="true"]').waitFor({ timeout: 120000 });
 }


 async isClusterListScreen(): Promise<void> {
   // Wait for cluster list page to be ready by checking URL and key elements
   // Use multiple indicators to handle different UI states (new tabbed view vs legacy)
   const clusterListIndicator = this.page
     .getByRole('heading', { name: /Clusters/i })
     .or(this.page.getByRole('tab', { name: 'Cluster List' }))
     .or(this.page.locator('h4:has-text("Let\'s create your first cluster")'))
     .or(this.page.getByText('Cluster List').first());


   await clusterListIndicator.first().waitFor({ state: 'visible', timeout: 30000 });
 }


 async isRegisterClusterUrl(): Promise<void> {
   await this.assertUrlIncludes('/openshift/register');
 }


 async isRegisterClusterScreen(): Promise<void> {
   await expect(
     this.page.getByRole('heading', { name: /Register disconnected cluster/i }),
   ).toBeVisible();
 }


 async isClusterArchivesScreen(): Promise<void> {
   await expect(this.page.getByRole('heading', { name: /Cluster Archives/i })).toBeVisible();
 }


 async isClusterArchivesUrl(): Promise<void> {
   await this.assertUrlIncludes('/openshift/archived');
 }


 async clusterListRefresh(): Promise<void> {
   await this.refreshButton().click();
 }


 async clickClusterTypeFilters(): Promise<void> {
   await this.clusterTypeFilterButton().click();
 }


 async clickClusterTypes(type: string): Promise<void> {
   await this.page.getByTestId(`cluster-type-${type}`).click();
 }


 async isCreateClusterBtnVisible(): Promise<void> {
   await expect(this.createClusterButton()).toBeVisible();
 }


 async checkForDetailsInAnchor(): Promise<void> {
   await this.waitForDataReady();
   const anchors = this.page.locator('tr td[data-label="Name"] a');
   const count = await anchors.count();
   expect(count).toBeGreaterThan(0);
   for (let i = 0; i < count; i++) {
     const href = await anchors.nth(i).getAttribute('href');
     expect(href).toContain('/openshift/details/');
   }
 }


 async checkIfFirstAnchorNavigatesToCorrectRoute(): Promise<void> {
   const anchor = this.page.locator('tr').locator('td[data-label="Name"] a').first();
   const href = await anchor.getAttribute('href');
   await anchor.click();
   await expect(this.page).toHaveURL(new RegExp('/openshift/details/'));
   if (href) {
     await expect(this.page).toHaveURL(new RegExp(href));
   }
 }


 showActiveClusters(): Locator {
   // Try "Cluster List" tab first (new UI), fallback to link (old UI on archives page)
   const tab = this.page.getByRole('tab', { name: 'Cluster List' });
   const link = this.page.locator('a').filter({ hasText: 'Show active clusters' });
   return tab.or(link);
 }


 itemPerPage(): Locator {
   return this.page.locator('#options-menu-bottom-toggle').last();
 }


 async clickPerPageItem(count: string): Promise<void> {
   await this.page.locator(`li[data-action="per-page-${count}"]`).click();
 }


 async clickClusterListTableHeader(header: string): Promise<void> {
   await this.tableHeader(header).click();
 }


 async scrollClusterListPageTo(direction: 'top' | 'bottom'): Promise<void> {
   await this.page.getByTestId('appDrawerContent').evaluate((element, dir) => {
     if (dir === 'bottom') {
       element.scrollTop = element.scrollHeight;
     } else {
       element.scrollTop = 0;
     }
   }, direction);
 }


 async waitForArchiveDataReady(): Promise<void> {
   await this.page
     .getByRole('progressbar', { name: 'Loading cluster list data' })
     .waitFor({ state: 'detached', timeout: 30000 });
 }


 async checkFilteredClusterTypes(type: string, isContains: boolean): Promise<void> {
   const elements = this.page.getByTestId('cluster-type-filter-chip');
   const count = await elements.count();


   for (let i = 0; i < count; i++) {
     const text = await elements.nth(i).textContent();
     if (isContains) {
       expect(text).toBe(type);
     } else {
       expect(text).not.toBe(type);
     }
   }
 }


 async checkFilteredClustersFromClusterList(type: string, isContains: boolean): Promise<void> {
   const elements = this.page.locator('td[data-label="Type"] span');
   const count = await elements.count();


   for (let i = 0; i < count; i++) {
     const text = await elements.nth(i).textContent();
     if (isContains) {
       expect(text).toBe(type);
     } else {
       expect(text).not.toBe(type);
     }
   }
 }


 async goToLastPage(): Promise<void> {
   const btn = this.page.getByRole('button', { name: 'Go to last page' }).last();
   if (await btn.isEnabled()) {
     await btn.click();
   }
 }


 async clearFilters(): Promise<void> {
   await this.page.getByRole('button', { name: 'Clear filters' }).click();
 }


 async openClusterDefinition(clusterName: string): Promise<void> {
   const clusterLink = this.page.getByRole('link', { name: clusterName, exact: true });
   await expect(clusterLink).toBeVisible({ timeout: 30000 });
   await clusterLink.click();
   await expect(this.page).toHaveURL(new RegExp('/openshift/details/'));
 }
}
