import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Downloads page object for Playwright tests
 */
export class DownloadsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isDownloadsPage(timeout: number = 60000): Promise<void> {
    await expect(this.page).toHaveURL(/\/downloads/, { timeout });
    await expect(this.page.locator('h1')).toContainText('Downloads', { timeout });
  }

  async isHiddenRowContaining(text: string): Promise<void> {
    const row = this.page.locator('.pf-v6-c-expandable-section__content').filter({ hasText: text });
    await expect(row).toBeHidden();
  }

  async isVisibleRowContaining(text: string): Promise<void> {
    const row = this.page.locator('.pf-v6-c-expandable-section__content').filter({ hasText: text });
    await expect(row).toBeVisible();
  }

  async clickExpandableRow(identifier: string): Promise<void> {
    await this.page.locator(`[data-testid*="${identifier}"] button`).first().click();
  }

  async filterByCategory(category: string): Promise<void> {
    await this.page.selectOption('select[data-testid="category-filter"]', category);
  }

  async clickExpandAll(): Promise<void> {
    await this.page.locator('button').filter({ hasText: 'Expand all' }).click();
  }

  async clickCollapseAll(): Promise<void> {
    await this.page.locator('button').filter({ hasText: 'Collapse all' }).click();
  }

  async enabledDropdownOptions(testId: string, expectedOptions: string[]): Promise<void> {
    const dropdown = this.page.getByTestId(testId);
    const options = await dropdown.locator('option:not([disabled])').allTextContents();
    expect(options.filter(opt => opt.trim())).toEqual(expect.arrayContaining(expectedOptions));
  }

  async allDropdownOptions(testId: string, expectedOptions: string[]): Promise<void> {
    const dropdown = this.page.getByTestId(testId);
    const options = await dropdown.locator('option').allTextContents();
    expect(options.filter(opt => opt.trim())).toEqual(expect.arrayContaining(expectedOptions));
  }

  async rowDoesNotExist(testId: string): Promise<void> {
    await expect(this.page.getByTestId(testId)).not.toBeVisible();
  }

  tokenSection(): Locator {
    return this.page.locator('[data-testid="tokens-section"]');
  }

  pullSecretSection(): Locator {
    return this.page.locator('[data-testid="pull-secret-section"]');
  }

  copyPullSecretButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Copy pull secret' });
  }

  downloadPullSecretButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Download pull secret' });
  }
}
