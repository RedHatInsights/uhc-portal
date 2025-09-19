import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async assertUrlIncludes(path: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForSelector(selector: string, options?: { timeout?: number }): Promise<Locator> {
    return this.page.locator(selector).first();
  }

  async getByTestId(selector: string): Promise<Locator> {
    return this.page.getByTestId(selector);
  }

  async click(selector: string | Locator): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.locator(selector).click();
    } else {
      await selector.click();
    }
  }

  async fill(selector: string | Locator, text: string): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.locator(selector).fill(text);
    } else {
      await selector.fill(text);
    }
  }

  async getText(selector: string | Locator): Promise<string> {
    if (typeof selector === 'string') {
      return (await this.page.locator(selector).textContent()) || '';
    } else {
      return (await selector.textContent()) || '';
    }
  }

  async isVisible(selector: string | Locator): Promise<boolean> {
    if (typeof selector === 'string') {
      return await this.page.locator(selector).isVisible();
    } else {
      return await selector.isVisible();
    }
  }

  async waitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'load',
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }
}
