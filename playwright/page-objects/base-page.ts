import { Page, Locator, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Base page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * DRY helper to resolve string selector or Locator to a Locator instance
   */
  private getLocator(selector: string | Locator): Locator {
    return typeof selector === 'string' ? this.page.locator(selector) : selector;
  }

  async assertUrlIncludes(path: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForSelector(selector: string, options?: { timeout?: number }): Promise<Locator> {
    const locator = this.page.locator(selector).first();
    await locator.waitFor({ timeout: options?.timeout });
    return locator;
  }

  /**
   * Returns a Locator for the given test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  async click(selector: string | Locator): Promise<void> {
    await this.getLocator(selector).click();
  }

  async fill(selector: string | Locator, text: string): Promise<void> {
    await this.getLocator(selector).fill(text);
  }

  async getText(selector: string | Locator): Promise<string> {
    return (await this.getLocator(selector).textContent()) ?? '';
  }

  async isVisible(selector: string | Locator): Promise<boolean> {
    return this.getLocator(selector).isVisible();
  }

  async waitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'load',
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  /**
   * Captures a screenshot with proper error handling and consistent naming
   * @param name - Base name for the screenshot file (without extension)
   * @param options - Additional screenshot options
   * @returns Promise<string> - The path where the screenshot was saved
   */
  async captureScreenshot(
    name: string,
    options: {
      fullPage?: boolean;
      clip?: { x: number; y: number; width: number; height: number };
    } = {},
  ): Promise<string> {
    try {
      // Sanitize the name parameter to prevent path traversal
      const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${sanitizedName}-${timestamp}.png`;
      const screenshotDir = 'playwright-artifacts/results';
      const screenshotPath = path.join(screenshotDir, filename);

      // Ensure the screenshot directory exists
      if (!fs.existsSync(screenshotDir)) {
        try {
          fs.mkdirSync(screenshotDir, { recursive: true });
        } catch (err: any) {
          // Ignore error if directory already exists due to race condition
          if (err.code !== 'EEXIST') {
            throw err;
          }
        }
      }

      await this.page.screenshot({
        path: screenshotPath,
        fullPage: options.fullPage ?? true,
        clip: options.clip,
      });

      console.log(`📸 Screenshot saved to: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      console.error('❌ Failed to capture screenshot:', error);
      throw error;
    }
  }

  /**
   * Captures a screenshot on error with additional debug information
   * @param error - The error that occurred
   * @param context - Additional context about what was happening
   * @returns Promise<string> - The path where the screenshot was saved
   */
  async captureErrorScreenshot(error: Error, context: string = 'error'): Promise<string> {
    try {
      const screenshotPath = await this.captureScreenshot(`${context}-failure`);

      // Capture additional debug information
      const currentUrl = this.page.url();
      const pageTitle = await this.page.title().catch(() => 'Unknown');

      console.log(`🔍 Debug info - URL: ${currentUrl}, Title: ${pageTitle}`);
      console.log(`❌ Error: ${error.message}`);

      return screenshotPath;
    } catch (screenshotError) {
      console.error('❌ Failed to capture error screenshot:', screenshotError);
      throw error; // Re-throw original error, not screenshot error
    }
  }
}
