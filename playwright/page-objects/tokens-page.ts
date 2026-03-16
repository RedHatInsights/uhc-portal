import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Tokens page object for Playwright tests
 */
export class TokensPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isOCMTokenPage(): Promise<void> {
    await this.assertUrlIncludes('/openshift/token');
  }

  async isROSATokenPage(): Promise<void> {
    await this.assertUrlIncludes('/token/rosa');
  }

  async waitSSOIsLoaded(): Promise<void> {
    // If the app is still loading, there are several stages — blank page, then spinner, then OCM renders.
    // So the "no spinner" check is not very reliable; the "h2" check is the real deal.
    await expect(this.page.locator('input').first()).toBeVisible({ timeout: 30000 });
    await expect(this.page.locator('h2').filter({ hasText: 'SSO Login' })).toBeVisible({
      timeout: 30000,
    });
  }

  async ocmSSOCLI(): Promise<void> {
    await expect(this.page.locator('input[value="ocm login --use-auth-code"]')).toBeVisible();
    await expect(this.page.locator('input[value="ocm login --use-device-code"]')).toBeVisible();
  }

  async ocmROSACLI(): Promise<void> {
    await expect(this.page.locator('input[value="rosa login --use-auth-code"]')).toBeVisible();
    await expect(this.page.locator('input[value="rosa login --use-device-code"]')).toBeVisible();
  }

  viewApiTokenButton(): Locator {
    return this.page.getByRole('button', { name: 'View API token' });
  }
}
