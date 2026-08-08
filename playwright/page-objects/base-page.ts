import * as fs from 'fs';
import * as path from 'path';

import { expect, Locator, Page } from '@playwright/test';

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

  /** Escapes regex metacharacters when building RegExp patterns from arbitrary strings. */
  protected escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  /**
   * Returns a Locator for the given text
   */
  getByText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
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

  /**
   * Reads the live Unleash/authorization state for a feature gate.
   * Uses in-page fetch so the call shares the browser origin/cookies with the app
   * (page.request can 404 against the CI proxy while the app's call succeeds).
   * Unknown features (404) are treated as disabled — same as useFeatureGate
   * defaulting to false when the query has no successful data.
   * Other non-2xx responses still throw so auth/API breakage is not silent.
   */
  async isFeatureGateEnabled(featureId: string): Promise<boolean> {
    return this.page.evaluate(async (feature) => {
      const response = await fetch('/api/authorizations/v1/self_feature_review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature }),
        credentials: 'same-origin',
      });
      if (response.status === 404) {
        return false;
      }
      if (!response.ok) {
        throw new Error(
          `self_feature_review failed for "${feature}": ${response.status} ${response.statusText}`,
        );
      }
      const body = (await response.json()) as { enabled?: boolean };
      return Boolean(body?.enabled);
    }, featureId);
  }

  async waitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'load',
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  /**
   * Presses a key on the keyboard
   * @param key - The key to press (e.g., 'Escape', 'Enter', etc.)
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
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

  async isTextContainsInPage(text: string, present: boolean = true): Promise<void> {
    const locator = this.page.locator('body').filter({ hasText: text });
    if (present) {
      await expect(locator).toBeVisible();
    } else {
      await expect(locator).not.toBeVisible();
    }
  }
}
