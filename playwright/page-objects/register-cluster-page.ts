import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Register Cluster page object for Playwright tests
 */
export class RegisterClusterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isRegisterClusterUrl(): Promise<void> {
    await this.assertUrlIncludes('/openshift/register');
  }

  async isRegisterClusterScreen(): Promise<void> {
    await expect(this.page.locator('h1')).toContainText('Register disconnected cluster');
  }

  clusterIDInput(): Locator {
    return this.page.locator('input[name="cluster_id"]');
  }

  displayNameInput(): Locator {
    return this.page.locator('input[name="display_name"]');
  }

  clusterURLInput(): Locator {
    return this.page.locator('input[name="web_console_url"]');
  }

  clusterIDError(): Locator {
    return this.page.locator('.pf-v6-c-helper-text__item-text');
  }

  displayNameError(): Locator {
    return this.page.locator('div[id="display_name-helper"]');
  }

  clusterURLError(): Locator {
    return this.page.locator('div[id="web_console_url-helper"]');
  }

  cancelButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  submitButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }
}
