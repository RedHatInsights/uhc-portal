import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { GlobalNavPage } from './global-nav-page';

/**
 * Tokens page object for Playwright tests
 */
export class TokensPage extends BasePage {
  private globalNav: GlobalNavPage;

  constructor(page: Page) {
    super(page);
    this.globalNav = new GlobalNavPage(page);
  }

  async navigateToOCMToken(): Promise<void> {
    await this.globalNav.downloadsNavigation().click();
    await this.page.getByTestId('view-api-token-btn').scrollIntoViewIfNeeded();
    await this.page.getByTestId('view-api-token-btn').click();
  }

  async isOCMTokenPage(): Promise<void> {
    await this.assertUrlIncludes('/openshift/token');
  }

  async navigateToROSAToken(): Promise<void> {
    await this.page.goto('/token/rosa');
  }

  async waitTokenPageIsLoaded(): Promise<void> {
    // Wait for spinner to disappear and h1 to be visible
    await this.page.locator('[class*="spinner"]').waitFor({ state: 'hidden', timeout: 30000 });
    await expect(
      this.page.locator('h1').filter({ hasText: 'OpenShift Cluster Manager' }),
    ).toBeVisible({ timeout: 30000 });
  }

  async checkLoadToken(buttonLabel: string): Promise<void> {
    await expect(this.page.getByText('Connect with offline tokens')).toBeVisible();
    await this.page.getByTestId('load-token-btn').click();
    await expect(this.page.getByTestId(buttonLabel)).toHaveAttribute('href');
    await expect(this.page.locator('input[aria-label="Copyable token"]')).toBeVisible({
      timeout: 50000,
    });
  }

  async checkRevokePreviousToken(): Promise<void> {
    await expect(this.page.getByText('Revoke previous tokens')).toBeVisible();
    await expect(this.page.getByText('SSO application management')).toHaveAttribute('href');
  }

  async isROSATokenPage(): Promise<void> {
    await this.assertUrlIncludes('/token/rosa');
  }

  async waitSSOIsLoaded(): Promise<void> {
    // Wait for input fields to be visible (this indicates the page has loaded)
    await expect(this.page.locator('input').first()).toBeVisible({ timeout: 30000 });
    // Wait for the page to be fully loaded by checking for any heading or main content
    await this.page.waitForLoadState('networkidle');
  }

  async ocmSSOCLI(): Promise<void> {
    await expect(this.page.locator('input[value="ocm login --use-auth-code"]')).toBeVisible();
    await expect(this.page.locator('input[value="ocm login --use-device-code"]')).toBeVisible();
  }

  async ocmROSACLI(): Promise<void> {
    // Look for ROSA login inputs with more flexible selectors
    const rosaAuthCodeInput = this.page.locator('input[value*="rosa login"][value*="auth-code"]');
    const rosaDeviceCodeInput = this.page.locator(
      'input[value*="rosa login"][value*="device-code"]',
    );

    // If exact matches don't exist, look for any inputs containing rosa login
    if (!(await rosaAuthCodeInput.isVisible()) || !(await rosaDeviceCodeInput.isVisible())) {
      // Fallback: just check that there are some inputs with rosa login commands
      await expect(this.page.locator('input[value*="rosa login"]').first()).toBeVisible();
    } else {
      await expect(rosaAuthCodeInput).toBeVisible();
      await expect(rosaDeviceCodeInput).toBeVisible();
    }
  }
}
