import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

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

  getQuotaTableRow(items: any): Locator {
    const resourceType = items.related_resources[0].resource_type;
    return this.page.locator('td').filter({ hasText: new RegExp(`^${resourceType}$`) });
  }

  // Mock API methods
  async patchCustomQuotaDefinition(data: any[] = []): Promise<void> {
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
