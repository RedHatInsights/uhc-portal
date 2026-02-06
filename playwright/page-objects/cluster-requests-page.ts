import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Cluster Requests page object for Playwright tests
 */
export class ClusterRequestsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async mockEmptyClusterTransfers(): Promise<void> {
    await this.page.route('**/cluster_transfers*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      });
    });
  }

  async mockEmptySubscriptions(): Promise<void> {
    const emptySubscriptions = {
      items: [],
      kind: 'SubscriptionList',
      page: 1,
      size: 0,
      total: 0,
    };
    await this.page.route('**/subscriptions*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptySubscriptions),
      });
    });
  }

  async isClusterRequestsUrl(): Promise<void> {
    // Support both old (/openshift/cluster-request) and new (/openshift/clusters/requests) URL patterns
    await expect(this.page).toHaveURL(/\/openshift\/(clusters\/requests)/);
  }

  async waitForPageReady(): Promise<void> {
    // Wait for the cluster access requests heading to be visible instead of using networkidle
    await this.clusterAccessRequestsHeading().waitFor({ state: 'visible', timeout: 30000 });
  }

  async isClusterRequestsScreen(): Promise<void> {
    // The page now shows "Clusters" heading with "Cluster Request" tab selected
    await expect(this.page.locator('h1:has-text("Clusters")')).toBeVisible({
      timeout: 30000,
    });
  }

  async isClusterTranferRequestHeaderPage(
    headerName: string = 'Cluster transfer ownership request',
  ): Promise<void> {
    await expect(this.page.getByText(headerName)).toBeVisible();
  }

  async clusterTransferRequestHelpButton(): Promise<void> {
    await this.page
      .getByText('Cluster transfer ownership request')
      .locator('xpath=following::button[1]')
      .click();
  }

  async isClusterTranferRequestContentPage(content: string): Promise<void> {
    await expect(this.page.getByText(content)).toBeVisible();
  }

  clusterRequestsRefreshButton(): Locator {
    return this.page.locator('button[aria-label="Refresh"]');
  }

  accessRequestsTable(): Locator {
    return this.page.locator('table').filter({ has: this.page.locator('th:has-text("Cluster Name")') });
  }

  accessRequestsTableHeader(header: string): Locator {
    return this.accessRequestsTable().locator('th').filter({ hasText: header });
  }

  accessRequestsTableRows(): Locator {
    return this.accessRequestsTable().locator('tbody tr');
  }

  accessRequestsFirstLink(): Locator {
    return this.accessRequestsTable().locator('tbody tr td:first-child a').first();
  }

  accessRequestsOpenButton(): Locator {
    return this.accessRequestsTableRows().first().getByRole('button', { name: 'Open' });
  }

  clusterAccessRequestsHeading(): Locator {
    return this.page.getByText('Cluster access requests').first();
  }

  paginationContainer(): Locator {
    return this.page.locator('[class*="pagination"]');
  }

  dialogModal(): Locator {
    return this.page.locator('[role="dialog"]');
  }

  cancelTransferButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel Transfer' });
  }

  clusterTransferTable(): Locator {
    return this.page.locator('table[aria-label="Cluster transfer ownership"]');
  }

  tableHeader(header: string): Locator {
    return this.clusterTransferTable().locator('th').filter({ hasText: header });
  }

  clusterRow(name: string): Locator {
    return this.page
      .locator('td[data-label="Name"]')
      .filter({ hasText: name })
      .locator('xpath=ancestor::tr');
  }

  noTransfersFoundMessage(): Locator {
    return this.page.getByText('No cluster transfers found');
  }

  noActiveTransfersMessage(): Locator {
    return this.page.getByText(
      'There are no clusters for your user that are actively being transferred',
    );
  }

  async checkClusterRequestsTableHeaders(header: string): Promise<void> {
    await expect(this.tableHeader(header)).toBeVisible();
  }

  async checkClusterRequestsRowByClusterName(
    name: string,
    status: string,
    type: string,
    currentOwner: string,
    transferRecipient: string,
    finalStatus: string = '',
  ): Promise<void> {
    const row = this.clusterRow(name);

    await expect(row.locator('td[data-label="Status"]')).toContainText(status);
    await expect(row.locator('td[data-label="Type"]')).toContainText(type);
    await expect(row.locator('td[data-label="Current Owner"]')).toContainText(currentOwner);
    await expect(row.locator('td[data-label="Transfer Recipient"]')).toContainText(
      transferRecipient,
    );

    if (finalStatus) {
      await expect(row.locator('td').last()).toContainText(finalStatus);
    }
  }

  async cancelClusterRequestsByClusterName(name: string): Promise<void> {
    const row = this.clusterRow(name);
    await row.getByRole('button', { name: 'Cancel' }).click();

    await expect(this.page.locator('h1')).toContainText('Cancel cluster transfer');
    await expect(
      this.page.getByText(
        `This action cannot be undone. It will cancel the impending transfer for cluster ${name}`,
      ),
    ).toBeVisible();

    await this.cancelTransferButton().click();
  }
}
