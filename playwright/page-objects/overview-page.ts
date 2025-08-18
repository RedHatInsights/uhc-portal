import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Overview page object for Playwright tests
 */
export class OverviewPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isOverviewPage(): Promise<void> {
    await expect(this.page.locator('text=Get started with OpenShift')).toBeVisible({ timeout: 60000 });
  }

  viewAllOpenshiftClusterTypesLink(): Locator {
    return this.page.locator('a').filter({ hasText: 'View all OpenShift cluster types' });
  }

  async waitForViewAllOpenshiftClusterTypesLink(): Promise<void> {
    await this.viewAllOpenshiftClusterTypesLink().waitFor({ state: 'visible', timeout: 90000 });
  }

  async assertToBeOverviewUrl(): Promise<void> {
    await this.assertUrlIncludes('/openshift/overview');
  }
}
