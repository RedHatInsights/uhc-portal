import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Cluster Requests page object for Playwright tests
 */
export class ClusterRequestsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isClusterRequestsUrl(): Promise<void> {
    await this.assertUrlIncludes('/openshift/cluster-request');
  }

  async isClusterRequestsScreen(): Promise<void> {
    await expect(this.page.locator('h1:has-text("Cluster Requests")')).toBeVisible({
      timeout: 30000,
    });
  }

  async isClusterTranferRequestHeaderPage(
    headerName: string = 'Transfer Ownership Request',
  ): Promise<void> {
    await expect(this.page.locator(`h2:has-text("${headerName}")`)).toBeVisible();
  }

  async isClusterTranferRequestContentPage(content: string): Promise<void> {
    await expect(this.page.getByText(content)).toBeVisible();
  }

  clusterRequestsRefreshButton(): Locator {
    return this.page.locator('button[aria-label="Refresh"]');
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
      .locator('xpath=..//..');
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
