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

  viewClusterArchives(): Locator {
    return this.page.locator('a').filter({ hasText: 'View cluster archives' });
  }

  viewClusterRequests(): Locator {
    return this.page.locator('a').filter({ hasText: 'View cluster requests' });
  }

  viewClusterRequestsButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'View cluster requests' });
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

  async waitForDataReady(): Promise<void> {
    await this.page.locator('div[data-ready="true"]').waitFor({ timeout: 120000 });
  }

  async isClusterListScreen(): Promise<void> {
    await expect(this.page.locator('h1, h4')).toContainText(
      /Cluster List|Let's create your first cluster/,
    );
  }

  async isRegisterClusterUrl(): Promise<void> {
    await this.assertUrlIncludes('/openshift/register');
  }

  async isRegisterClusterScreen(): Promise<void> {
    await expect(this.page.locator('h1')).toContainText('Register disconnected cluster');
  }

  async isClusterArchivesScreen(): Promise<void> {
    await expect(this.page.locator('h1')).toContainText('Cluster Archives');
  }

  async isClusterArchivesUrl(): Promise<void> {
    await this.assertUrlIncludes('/openshift/archived');
  }

  async clusterListRefresh(): Promise<void> {
    await this.page.locator('button[aria-label="Refresh"]').click();
  }

  async clickClusterTypeFilters(): Promise<void> {
    await this.page.locator('button').filter({ hasText: 'Cluster type' }).click();
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
    return this.page.locator('a').filter({ hasText: 'Show active clusters' });
  }

  itemPerPage(): Locator {
    return this.page.locator('#options-menu-bottom-toggle').last();
  }

  async clickPerPageItem(count: string): Promise<void> {
    await this.page.locator(`li[data-action="per-page-${count}"]`).click();
  }

  async clickClusterListTableHeader(header: string): Promise<void> {
    await this.page.locator('th').filter({ hasText: header }).click();
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
    const btn = this.page.locator('button[aria-label="Go to last page"]').last();
    if (await btn.isEnabled()) {
      await btn.click();
    }
  }

  async clearFilters(): Promise<void> {
    await this.page.locator('button').filter({ hasText: 'Clear filters' }).click();
  }

  async openClusterDefinition(clusterName: string): Promise<void> {
    const clusterLink = this.page.getByRole('link', { name: clusterName, exact: true });
    await expect(clusterLink).toBeVisible({ timeout: 30000 });
    await clusterLink.click();
    await expect(this.page).toHaveURL(new RegExp('/openshift/details/'));
  }
}
