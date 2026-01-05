import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export interface QuotaItem {
  allowed: number;
  consumed: number;
  quota_id: string;
  related_resources: Array<{
    resource_type: string;
    resource_name: string;
    billing_model: string;
    product: string;
    availability_zone_type: string;
    byoc: string;
    cloud_provider: string;
    cost: number;
  }>;
}

export interface QuotaRowExpectations {
  resourceName?: string;
  availability?: string;
  planType?: string;
  clusterType?: string;
  usage?: string;
}

export class SubscriptionsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Navigation elements
  subscriptionLeftNavigationMenu(): Locator {
    return this.page.getByRole('button', { name: 'Subscriptions' });
  }

  annualSubscriptionLeftNavigationMenu(): Locator {
    return this.page
      .getByLabel('Subscriptions')
      .getByRole('link', { name: 'Annual Subscriptions' });
  }

  planTypeHelpButton(): Locator {
    return this.page.locator('th').filter({ hasText: 'Plan type' }).locator('button');
  }

  enableMarketplaceLink(): Locator {
    return this.page.locator('a').filter({ hasText: 'Enable in Marketplace' });
  }

  learnMoreLink(): Locator {
    return this.page.locator('a').filter({ hasText: 'Learn more' });
  }

  dedicatedOnDemandLink(): Locator {
    return this.page.locator('a').filter({ hasText: 'Dedicated (On-Demand Limits)' });
  }

  // Page content verifications

  async expandSubscriptionLeftNavigationMenu(): Promise<void> {
    const isExpanded =
      (await this.subscriptionLeftNavigationMenu().getAttribute('aria-expanded')) === 'true';
    if (!isExpanded) {
      await this.subscriptionLeftNavigationMenu().click();
    }
  }

  async isDedicatedAnnualPage(): Promise<void> {
    await expect(
      this.page.locator('h1').filter({ hasText: 'Annual Subscriptions (Managed)' }),
    ).toBeVisible({ timeout: 20000 });
  }

  async isDedicatedSectionHeader(): Promise<void> {
    await expect(
      this.page.locator('div').filter({ hasText: /^Annual Subscriptions$/ }),
    ).toBeVisible();
  }

  async isContainEmbeddedLink(text: string, link: string): Promise<void> {
    const linkElement = this.page.locator(`a[href="${link}"]`);
    await expect(linkElement).toContainText(text);
  }

  async isDedicatedOnDemandSectionHeader(): Promise<void> {
    await expect(
      this.page.locator('div').filter({ hasText: /^OpenShift Dedicated$/ }),
    ).toBeVisible();
  }

  async isSubscriptionTableHeader(): Promise<void> {
    await expect(this.page.locator('div').filter({ hasText: /^Quota$/ })).toBeVisible();
  }

  async isDedicatedOnDemandPage(): Promise<void> {
    await expect(
      this.page.locator('h1').filter({ hasText: 'Dedicated (On-Demand Limits)' }),
    ).toBeVisible({ timeout: 20000 });
  }

  async checkQuotaTableColumns(columnName: string): Promise<void> {
    await expect(this.page.locator('th').filter({ hasText: columnName })).toBeVisible();
  }

  async validateAllQuotaTableColumns(): Promise<void> {
    const columns = [
      'Resource type',
      'Resource name',
      'Availability',
      'Plan type',
      'Cluster type',
      'Used',
      'Capacity',
    ];

    for (const column of columns) {
      await this.checkQuotaTableColumns(column);
    }
  }

  getQuotaTableRow(item: QuotaItem): Locator {
    const resourceType = item.related_resources[0].resource_type;
    return this.page.locator('td').filter({ hasText: new RegExp(`^${resourceType}$`) });
  }

  async validateQuotaTableRow(
    item: QuotaItem,
    expectedValues: QuotaRowExpectations,
  ): Promise<void> {
    const row = this.getQuotaTableRow(item);
    const rowElement = row.locator('..');
    const cells = rowElement.locator('td');

    if (expectedValues.resourceName) {
      await expect(cells.nth(1)).toContainText(expectedValues.resourceName);
    }
    if (expectedValues.availability) {
      await expect(cells.nth(2)).toContainText(expectedValues.availability);
    }
    if (expectedValues.planType) {
      await expect(cells.nth(3)).toContainText(expectedValues.planType);
    }
    if (expectedValues.clusterType) {
      await expect(cells.nth(4)).toContainText(expectedValues.clusterType);
    }
    if (expectedValues.usage) {
      await expect(cells.nth(5)).toContainText(expectedValues.usage);
    }
  }

  async validatePlanTypeHelpPopover(): Promise<void> {
    await this.planTypeHelpButton().click();
    await expect(
      this.page.getByText('Standard: Cluster infrastructure costs paid by Red Hat'),
    ).toBeVisible();
    await expect(
      this.page.getByText('CCS: Cluster infrastructure costs paid by the customer'),
    ).toBeVisible();
    await this.planTypeHelpButton().click(); // Close popover
  }

  // Mock API methods
  async patchCustomQuotaDefinition(
    data: { items: QuotaItem[] } | Record<string, never> = { items: [] },
  ): Promise<void> {
    await this.page.route('**/quota_cost**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    });
  }

  // Additional helper methods for table cell validation
  async validateTableCellContent(
    row: Locator,
    content: string,
    position: number = 0,
  ): Promise<void> {
    const cells = row.locator('..').locator('td');
    await expect(cells.nth(position)).toContainText(content);
  }

  getNextSiblingCell(currentCell: Locator): Locator {
    return currentCell.locator('..').locator('td').nth(1);
  }

  // Wait for data to load
  async waitForDataReady(): Promise<void> {
    // Wait for any loading states to complete
    await this.page.waitForLoadState('networkidle');
  }
}
