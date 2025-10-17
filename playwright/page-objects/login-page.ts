import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { getAuthConfig } from '../support/auth-config';

export class LoginPage extends BasePage {
  private readonly inputUsername: Locator;
  private readonly inputPassword: Locator;
  private readonly nextBtn: Locator;
  private readonly submitBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.inputUsername = page.locator('#username-verification').first();
    this.inputPassword = page.locator('#password:visible');
    this.nextBtn = page.locator('button').filter({ hasText: 'Next' });
    this.submitBtn = page.locator('button[type="submit"]');
  }

  async clickNextBtn(): Promise<void> {
    await this.nextBtn.click({ force: true });
  }

  async clickSubmitBtn(): Promise<void> {
    await this.submitBtn.click({ force: true });
  }

  async isLoginPageUrl(): Promise<void> {
    await expect(this.page).toHaveURL(/auth\/realms\/redhat-external\/protocol\/openid-connect/);
  }

  async isPasswordScreen(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Log in to your Red Hat account' }),
    ).toBeVisible();
  }

  async login(): Promise<void> {
    // Handle uncaught exceptions
    this.page.on('pageerror', (error) => {
      console.error(`Playwright caught exception: ${error.message}`);
    });

    const { username, password } = getAuthConfig();
    console.log('🔑 Starting login process for user:', username);

    if ((process.env.GOV_CLOUD || '').toLowerCase() === 'true') {
      await this.loginFedRamp(username, password);
    } else {
      // Wait for potential redirect to login page
      // If not authenticated, the page will redirect to login
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.log('⚠️ Network not idle after timeout, proceeding with URL check');
      });

      console.log('🌐 Current URL:', this.page.url());

      // Check if we're on a login page or already authenticated
      if (
        this.page.url().includes('auth/realms/redhat-external') ||
        this.page.url().includes('login')
      ) {
        console.log('🔐 Login page detected, proceeding with authentication...');

        // Wait for username input to be visible
        try {
          await this.inputUsername.waitFor({ state: 'visible', timeout: 10000 });
          await this.inputUsername.fill(username, { force: true });
          console.log('✅ Username entered');
          await this.clickNextBtn();

          // Wait for password screen
          await this.page.waitForTimeout(2000);
          await this.inputPassword.waitFor({ state: 'visible', timeout: 60000 });
          await this.inputPassword.fill(password, { force: true });
          console.log('✅ Password entered');
          await this.clickSubmitBtn();
        } catch (error) {
          // Capture screenshot on login failure using the base page utility
          console.log('❌ Login failed, capturing screenshot...');
          await this.captureErrorScreenshot(error as Error, 'login');

          // Re-throw the error to maintain test failure
          throw error;
        }

        // Wait for authentication to complete
        // Accommodate both standard console URLs and prod.foo.redhat.com:1337
        const urlPattern = /(console\..*\.redhat\.com|prod\.foo\.redhat\.com:1337)/;
        await this.page.waitForURL(urlPattern, { timeout: 30000 });
        console.log('✅ Authentication completed, redirected to console');

        await this.closePendoIfShowing();
      } else if (
        (this.page.url().includes('console') && this.page.url().includes('redhat.com')) ||
        this.page.url().includes('prod.foo.redhat.com:1337')
      ) {
        console.log('✅ Already authenticated, on console page');
      } else {
        console.log('⚠️ Unexpected page, current URL:', this.page.url());
      }
    }
  }

  async loginFedRamp(username: string, password: string): Promise<void> {
    this.page.on('pageerror', (error) => {
      console.log(`Got application exception: ${error.message}`);
    });

    await this.page.locator('#username').fill(username);
    await this.page.locator('#kc-login').click();
    await this.page.locator('#password').fill(password);
    await this.page.locator('#kc-login').click();
  }

  async loginCommercial(username: string, password: string): Promise<void> {
    this.page.on('pageerror', (error) => {
      console.log(`Got application exception: ${error.message}`);
    });

    await this.page.goto('/');
    await expect(this.page.locator('#username-verification')).toBeVisible();
    await this.page.locator('#username-verification').fill(username);
    await expect(this.page.locator('#username-verification')).toHaveValue(username);
    await this.page.locator('#login-show-step2').click();
    await expect(this.page.locator('#password')).toBeVisible();
    await this.page.locator('#password').fill(password);
    await expect(this.page.locator('#password')).toHaveValue(password);
    await this.page.locator('#rh-password-verification-submit-button').click();
    await expect(this.page.locator('#rh-password-verification-submit-button')).not.toBeVisible();
  }

  async closePendoIfShowing(): Promise<void> {
    // This might not work, it takes time for Pendo to pop up.
    const closePendoGuideBtn = '._pendo-close-guide';
    try {
      await this.page.waitForSelector(closePendoGuideBtn, { timeout: 5000 });
      if (await this.page.locator(closePendoGuideBtn).isVisible()) {
        await this.page.locator(closePendoGuideBtn).click();
        await expect(this.page.locator(closePendoGuideBtn)).not.toBeVisible();
      }
    } catch (error) {
      // Only suppress expected errors (e.g., timeout), log others
      if (error instanceof Error && error.name === 'TimeoutError') {
        // Pendo guide not found or not visible, continue
      } else {
        console.error('Unexpected error when closing Pendo guide:', error);
      }
    }
  }
}
