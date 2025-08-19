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

  OCMRolesAndAccessTable(): Locator {
    return this.page.locator('table[aria-label="OCM Roles and Access"]');
  }

  grantRoleUserInput(): Locator {
    return this.page.locator('input[type="text"]:not([aria-label="Date picker"])').last();
  }

  userInputError(): Locator {
    return this.page.locator(
      '.pf-v6-c-helper-text__item-text, .pf-v6-c-form__helper-text, [class*="error"]',
    );
  }

  submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  async waitForGrantRoleModalToClear(): Promise<void> {
    await this.page
      .locator('[role="dialog"], .pf-v6-c-modal-box')
      .waitFor({ state: 'hidden', timeout: 10000 });
  }

  usernameCell(): Locator {
    return this.page
      .locator('td[data-label="Username"], td:has-text("Username") + td, tbody tr td')
      .first();
  }

  OCMRolesAndAccessTableActionButton(): Locator {
    return this.page
      .locator('button[aria-label*="Actions"], .pf-v6-c-dropdown__toggle, [data-testid*="action"]')
      .first();
  }

  OCMRolesAndAccessTableDeleteButton(): Locator {
    return this.page.getByRole('menuitem', { name: 'Delete' });
  }
}
