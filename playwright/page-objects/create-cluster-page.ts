import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Create Cluster page object for Playwright tests
 */
export class CreateClusterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isCreateClusterPage(): Promise<void> {
    await this.assertUrlIncludes('openshift/create');
  }

  async isCreateClusterPageHeaderVisible(): Promise<void> {
    await expect(this.page.locator('h1')).toContainText('Select an OpenShift cluster type to create', { timeout: 30000 });
  }
}
