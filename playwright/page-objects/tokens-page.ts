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
    await this.page.locator('.pf-v6-c-spinner').waitFor({ state: 'hidden', timeout: 30000 });
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
    // Wait for input and h2 to be visible
    await expect(this.page.locator('input').first()).toBeVisible({ timeout: 30000 });
    // Try different possible headings for SSO login
    const ssoHeading = this.page
      .locator('h2')
      .filter({ hasText: /SSO Login|Login|Authentication/ });
    await expect(ssoHeading.first()).toBeVisible({ timeout: 30000 });
  }

  async ocmSSOCLI(): Promise<void> {
    await expect(this.page.locator('input[value="ocm login --use-auth-code"]')).toBeVisible();
    await expect(this.page.locator('input[value="ocm login --use-device-code"]')).toBeVisible();
  }

  async ocmROSACLI(): Promise<void> {
    await expect(this.page.locator('input[value="rosa login --use-auth-code"]')).toBeVisible();
    await expect(this.page.locator('input[value="rosa login --use-device-code"]')).toBeVisible();
  }
}
