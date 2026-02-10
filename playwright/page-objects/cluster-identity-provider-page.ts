import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Cluster Identity Provider page object for Playwright tests
 */
export class ClusterIdentityProviderPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  selectAddIdentityProviderDropdown(): Locator {
    // return this.page.locator('button[id="add-identity-provider"]');
    return this.page.getByRole('button', { name: 'Add identity provider' });
  }

  htpasswdButton(): Locator {
    return this.page.getByRole('menuitem', { name: 'htpasswd' });
  }

  async clickHtpasswdButton(): Promise<void> {
    await this.htpasswdButton().click();
  }

  inputHtpasswdName(): Locator {
    return this.page.locator('#name');
  }

  inputHtpasswdUserNameField(index: number = 0): Locator {
    return this.page.locator(`input[id="users.${index}.username"]`);
  }

  inputPasswordField(index: number = 0): Locator {
    return this.page.locator(`input[id="users.${index}.password"]`);
  }

  inputConfirmPasswordField(index: number = 0): Locator {
    return this.page.locator(`input[id="users.${index}.password-confirm"]`);
  }

  filterByUsernameField(): Locator {
    return this.page.locator('input[aria-label="Filter by username"]');
  }

  addUserButton(): Locator {
    return this.page.locator('button[label="Add user"]');
  }

  editModalAddUserButton(): Locator {
    return this.page.getByRole('button', { name: 'Add user' });
  }

  addUserModalButton(): Locator {
    return this.page.locator('button[type="submit"]').filter({ hasText: 'Add user' });
  }

  submitButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  cancelButton(): Locator {
    return this.page.getByRole('link', { name: 'Cancel' });
  }

  accessControlTabLink(): Locator {
    return this.page.getByRole('link', { name: 'Access control' });
  }

  removeUserButton(): Locator {
    return this.page.getByRole('button', { name: 'Remove' }).first();
  }

  clearAllFiltersButton(): Locator {
    return this.page.getByRole('button', { name: 'Clear all filters' });
  }

  identityProviderTable(): Locator {
    return this.page.getByRole('grid', { name: 'Identity Providers' });
  }

  editIdentityProviderTableRows(): Locator {
    return this.page.getByRole('rowgroup').getByRole('row');
  }

  async isTextContainsInPage(text: string, present: boolean = true): Promise<void> {
    if (present) {
      await expect(this.page.getByText(text).first()).toBeVisible({ timeout: 10000 });
    } else {
      await expect(this.page.getByText(text)).not.toBeVisible({ timeout: 10000 });
    }
  }

  async isEditIdpPageTitle(): Promise<void> {
    await expect(this.page.locator('h1')).toContainText(/Edit identity provider: */);
  }

  async inputHtpasswdPasswordWithSuggestion(index: number = 0): Promise<string> {
    await this.inputPasswordField(index).click();
    // Use menuitem role - more specific than getByText
    await this.page.getByRole('menuitem', { name: /Use suggested password:/ }).click();
    // Return the generated password so it can be used for confirmation
    const password = await this.inputPasswordField(index).inputValue();
    return password;
  }

  async inputHtpasswdConfirmPasswordField(password?: string, index: number = 0): Promise<void> {
    if (password) {
      await this.inputConfirmPasswordField(index).fill(password);
    } else {
      // If no password provided, get it from the password field
      const passwordValue = await this.inputPasswordField(index).inputValue();
      await this.inputConfirmPasswordField(index).fill(passwordValue);
    }
  }

  async clickAddButton(): Promise<void> {
    await this.submitButton().click();
  }

  async clickAddUserModalButton(): Promise<void> {
    await this.addUserModalButton().click();
  }

  async clickClearAllFiltersLink(): Promise<void> {
    await this.clearAllFiltersButton().click();
  }

  async checkIdentityProviderColumnNames(property: string): Promise<void> {
    const rows = this.identityProviderTable().locator('tr');
    await expect(rows.filter({ hasText: property }).first()).toBeVisible({ timeout: 20000 });
  }

  async verifyHTPasswdTableRowCounts(expectedCount: number): Promise<void> {
    await expect(this.editIdentityProviderTableRows()).toHaveCount(expectedCount);
  }

  async collapseIdpDefinitions(idpName: string): Promise<void> {
    const row = this.identityProviderTable().locator('tr').filter({ hasText: idpName });
    await row.waitFor({ state: 'visible', timeout: 20000 });
    await row.getByRole('button', { name: 'Details' }).click();
  }

  async editHtpasswdIDPToggle(htpasswdName: string): Promise<void> {
    const row = this.identityProviderTable().locator('tr').filter({ hasText: htpasswdName });
    await row.waitFor({ state: 'visible', timeout: 20000 });
    await row.getByRole('button', { name: 'Kebab toggle' }).click();
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();
  }

  async deleteHtpasswdIDP(htpasswdName: string): Promise<void> {
    const row = this.identityProviderTable().locator('tr').filter({ hasText: htpasswdName });
    await row.getByRole('button', { name: 'Kebab toggle' }).click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
    await this.page.getByTestId('btn-primary').click();
  }

  async waitForAddUserModalToLoad(): Promise<void> {
    await this.page.getByLabel('Add user').waitFor({ state: 'detached', timeout: 15000 });
  }

  async waitForDeleteClusterActionComplete(): Promise<void> {
    await this.page
      .getByLabel('Remove identity provider')
      .waitFor({ state: 'detached', timeout: 15000 });
  }

  async waitForAddButtonSpinnerToComplete(): Promise<void> {
    await this.submitButton().waitFor({ state: 'visible', timeout: 10000 });
  }
}
