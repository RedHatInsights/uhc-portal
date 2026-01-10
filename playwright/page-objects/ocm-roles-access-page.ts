import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * OCM Roles and Access page object for Playwright tests
 */
export class OCMRolesAndAccessPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  accessControlTabButton(): Locator {
    return this.page.getByRole('tab', { name: 'Access control' });
  }

  async assertUrlIncludes(fragment: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(fragment));
  }

  grantRoleButton(): Locator {
    return this.page.getByRole('button', { name: 'Grant role' });
  }

  ocmRolesAndAccessTable(): Locator {
    return this.page.locator('table[aria-label="OCM Roles and Access"]');
  }

  ocmRoleAndAccessDialog(): Locator {
    return this.page.locator('#ocm-roles-access-dialog');
  }

  grantRoleUserInput(): Locator {
    return this.page.locator('input[type="text"]:not([aria-label="Date picker"])').last();
  }

  submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Grant role' });
  }

  async waitForGrantRoleModalToClear(): Promise<void> {
    await this.page.locator('#ocm-roles-access-dialog').waitFor({
      state: 'detached',
      timeout: 30000,
    });
  }

  usernameCell(): Locator {
    return this.page
      .locator('td[data-label="Username"], td:has-text("Username") + td, tbody tr td')
      .first();
  }

  ocmRolesAndAccessTableActionButton(): Locator {
    return this.page.getByRole('button', { name: 'Kebab toggle' });
  }

  ocmRolesAndAccessTableDeleteButton(): Locator {
    return this.page.getByRole('menuitem', { name: 'Delete' });
  }

  deleteRoleConfirm(): Locator {
    return this.page
      .locator('div[aria-label="Are you sure you want to delete this role?"]')
      .locator('footer')
      .locator('button')
      .first();
  }
}
