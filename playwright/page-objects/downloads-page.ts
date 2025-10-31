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

  getToggleButton(toolName: string): Locator {
    const row = this.page.getByRole('row', { name: new RegExp(toolName, 'i') });
    return row.getByRole('button', { name: 'Details' });
  }

  async clickToggleButton(toolName: string): Promise<void> {
    await this.getToggleButton(toolName).click();
  }

  async isRowExpanded(toolName: string): Promise<boolean> {
    const toggle = this.getToggleButton(toolName);
    const expanded = await toggle.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  async clickCollapseAll(): Promise<void> {
    const collapseButton = this.page.getByText('Collapse all');
    if (await collapseButton.isVisible()) {
      await collapseButton.click();
    }
  }

  async isDownloadsPage(): Promise<void> {
    // Wait for the header with timeout
    await expect(this.page.locator('h1').filter({ hasText: 'Downloads' })).toBeVisible({
      timeout: 50000,
    });
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
