import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Downloads page object for Playwright tests
 */
export class DownloadsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async filterByCategory(category: string): Promise<void> {
    await this.page.getByTestId('downloads-category-dropdown').selectOption(category);
  }

  async clickExpandAll(): Promise<void> {
    const expandButton = this.page.getByText('Expand all');
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }
  }

  async clickCollapseAll(): Promise<void> {
    const collapseButton = this.page.getByText('Collapse all');
    if (await collapseButton.isVisible()) {
      await collapseButton.click();
    }
  }

  async isDownloadsPage(): Promise<void> {
    await expect(this.page.locator('h1').filter({ hasText: 'Downloads' })).toBeVisible();
  }

  pullSecretSection(): Locator {
    return this.page.getByTestId('expandable-row-pull-secret');
  }

  tokenSection(): Locator {
    return this.page.getByTestId('downloads-section-TOKENS');
  }

  downloadPullSecretButton(): Locator {
    return this.pullSecretSection().locator('button').filter({ hasText: 'Download' });
  }

  copyPullSecretButton(): Locator {
    return this.pullSecretSection().locator('button').filter({ hasText: 'Copy' });
  }

  async isVisibleRowContaining(substring: string): Promise<void> {
    await expect(this.page.getByText(substring)).toBeVisible();
  }

  async isHiddenRowContaining(substring: string): Promise<void> {
    await expect(this.page.getByText(substring)).not.toBeVisible();
  }

  async rowDoesNotExist(rowDataTestId: string): Promise<void> {
    await expect(this.page.getByTestId(rowDataTestId)).not.toBeVisible();
  }

  async clickExpandableRow(substring: string): Promise<void> {
    // Find the expand button by looking for buttons with expand-toggle
    await this.page.locator('button[id*="expand-toggle"]').first().click();
  }

  async allDropdownOptions(dropdownDataTestId: string, testValues: string[]): Promise<void> {
    const dropdown = this.page.getByTestId(dropdownDataTestId);
    const options = await dropdown.locator('option').allTextContents();
    expect(options).toEqual(testValues);
  }

  async enabledDropdownOptions(dropdownDataTestId: string, testValues: string[]): Promise<void> {
    const dropdown = this.page.getByTestId(dropdownDataTestId);
    const options = await dropdown.locator('option:not([disabled])').allTextContents();
    expect(options).toEqual(testValues);
  }
}
