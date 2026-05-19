import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from './base-page';

export class ClusterIdentityProviderPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isIdentityProvidersPage(): Promise<void> {
    await expect(this.page).toHaveURL(/#accessControl/);
    await expect(this.addIdentityProviderDropdown()).toBeVisible({ timeout: 30000 });
  }

  // ==================== Navigation ====================

  accessControlTab(): Locator {
    return this.page.getByRole('link', { name: 'Access control' });
  }

  identityProvidersTab(): Locator {
    return this.page.getByRole('tab', { name: 'Identity providers' });
  }

  async goToAccessControlTab(): Promise<void> {
    await this.accessControlTab().click();
    await expect(this.addIdentityProviderDropdown()).toBeVisible({ timeout: 30000 });
  }

  async goToIdentityProvidersTab(): Promise<void> {
    await this.identityProvidersTab().click();
    await expect(this.addIdentityProviderDropdown()).toBeVisible({ timeout: 30000 });
  }

  // ==================== Add IDP Form ====================

  addIdentityProviderDropdown(): Locator {
    return this.page.getByRole('button', { name: 'Add identity provider' });
  }

  htpasswdOption(): Locator {
    return this.page.getByRole('menuitem', { name: 'htpasswd' });
  }

  uploadHtpasswdRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Upload an htpasswd file' });
  }

  htpasswdFileInput(): Locator {
    return this.page.locator('input[type="file"]');
  }

  browseButton(): Locator {
    return this.page.getByRole('button', { name: 'Browse' });
  }

  clearFileButton(): Locator {
    return this.page.getByRole('button', { name: 'Clear' });
  }

  htpasswdNameInput(): Locator {
    return this.page.locator('input[id="name"]');
  }

  htpasswdUsernameInput(): Locator {
    return this.page.locator('input[id="users.0.username"]');
  }

  passwordInput(): Locator {
    return this.page.locator('input[id="users.0.password"]');
  }

  confirmPasswordInput(): Locator {
    return this.page.locator('input[id="users.0.password-confirm"]');
  }

  suggestedPasswordOption(): Locator {
    return this.page.getByText('Use suggested password:');
  }

  addUserButton(): Locator {
    return this.page.getByRole('button', { name: 'Add user' });
  }

  removeFirstUserButton(): Locator {
    return this.page.getByTestId('remove-users').first();
  }

  cancelLink(): Locator {
    return this.page.getByRole('link', { name: 'Cancel' });
  }

  idpFormSubmitButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  // ==================== Identity Providers Table ====================

  identityProvidersTable(): Locator {
    return this.page.getByRole('grid', { name: /identity providers/i });
  }

  identityProviderRow(name: string): Locator {
    return this.identityProvidersTable().getByRole('row').filter({ hasText: name });
  }

  identityProviderExpandToggle(idpName: string): Locator {
    return this.identityProviderRow(idpName).getByRole('button', { name: 'Details' });
  }

  kebabToggleInRow(idpName: string): Locator {
    return this.identityProviderRow(idpName).getByRole('button', { name: 'Kebab toggle' });
  }

  editMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Edit' });
  }

  deleteMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Delete' });
  }

  confirmDeleteButton(): Locator {
    return this.page.getByTestId('btn-primary');
  }

  // ==================== Edit IDP - Upload htpasswd File Modal ====================

  uploadHtpasswdFileToolbarButton(): Locator {
    return this.page.getByRole('button', { name: 'Upload htpasswd file' });
  }

  uploadFileModal(): Locator {
    return this.page.getByRole('dialog', { name: /upload/i });
  }

  uploadFileModalInput(): Locator {
    return this.uploadFileModal().locator('input[type="file"]');
  }

  uploadFileModalBrowseButton(): Locator {
    return this.uploadFileModal().getByRole('button', { name: 'Browse' });
  }

  uploadFileModalClearButton(): Locator {
    return this.uploadFileModal().getByRole('button', { name: 'Clear' });
  }

  uploadFileModalSubmitButton(): Locator {
    return this.uploadFileModal().getByRole('button', { name: 'Upload' });
  }

  uploadFileModalCancelButton(): Locator {
    return this.uploadFileModal().getByRole('button', { name: 'Cancel' });
  }

  uploadModalErrorAlert(): Locator {
    return this.uploadFileModal().getByTestId('alert-error');
  }

  async openUploadFileModal(): Promise<void> {
    await this.uploadHtpasswdFileToolbarButton().click();
    await expect(this.uploadFileModal()).toBeVisible();
  }

  async uploadFileInModal(filePath: string): Promise<void> {
    await this.uploadFileModalInput().setInputFiles(filePath);
  }

  async waitForUploadFileModalToClose(): Promise<void> {
    await expect(this.uploadFileModal()).toBeHidden({ timeout: 30000 });
  }

  // ==================== Edit IDP Modal ====================

  editIdpPageTitle(): Locator {
    return this.page.getByRole('heading', { name: /Edit identity provider:/ });
  }

  addUserModalSubmitButton(): Locator {
    return this.page
      .getByRole('dialog', { name: 'Add user' })
      .getByRole('button', { name: 'Add user' });
  }

  editModalUsersTableRows(): Locator {
    return this.page
      .getByRole('grid')
      .getByRole('rowgroup')
      .getByRole('row')
      .filter({ has: this.page.getByRole('gridcell') });
  }

  filterByUsernameInput(): Locator {
    return this.page.locator('input[aria-label="Filter by username"]');
  }

  clearAllFiltersButton(): Locator {
    return this.page.getByRole('button', { name: 'Clear all filters' });
  }

  // ==================== Pagination ====================

  itemPerPage(): Locator {
    return this.page.locator('#options-menu-bottom-toggle').last();
  }

  async clickPerPageItem(count: string): Promise<void> {
    await this.page.locator(`li[data-action="per-page-${count}"]`).click();
  }

  // ==================== Actions ====================

  async openHtpasswdForm(): Promise<void> {
    await this.addIdentityProviderDropdown().click();
    await this.htpasswdOption().click();
  }

  async selectUploadMode(): Promise<void> {
    await this.uploadHtpasswdRadio().click();
    await expect(this.htpasswdFileInput()).toBeAttached();
  }

  async uploadHtpasswdFile(filePath: string): Promise<void> {
    await this.htpasswdFileInput().setInputFiles(filePath);
  }

  async fillSuggestedPassword(): Promise<void> {
    await this.passwordInput().click();
    await this.suggestedPasswordOption().click();
  }

  async fillSuggestedConfirmPassword(): Promise<void> {
    await this.confirmPasswordInput().click();
  }

  async cancelIdpForm(): Promise<void> {
    const cancelHref = await this.cancelLink().getAttribute('href');
    await this.page.goto(cancelHref!);
    await this.goToIdentityProvidersTab();
  }

  async editHtpasswdIDP(idpName: string): Promise<void> {
    await this.kebabToggleInRow(idpName).click();
    await this.editMenuItem().click();
  }

  async deleteHtpasswdIDP(idpName: string): Promise<void> {
    await this.kebabToggleInRow(idpName).click();
    await this.deleteMenuItem().click();
    await this.confirmDeleteButton().click();
  }

  async scrollToBottom(): Promise<void> {
    await this.page.getByTestId('appDrawerContent').evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
  }

  // ==================== Wait helpers ====================

  async waitForIdpToAppearInTable(idpName: string): Promise<void> {
    await expect(this.identityProviderRow(idpName)).toBeVisible({ timeout: 90000 });
  }

  async waitForAddUserDialogToClose(): Promise<void> {
    await expect(this.page.getByRole('dialog', { name: 'Add user' })).toBeHidden({
      timeout: 30000,
    });
  }

  async waitForDeleteIdpDialogToClose(): Promise<void> {
    await expect(this.page.getByRole('dialog', { name: 'Remove identity provider' })).toBeHidden({
      timeout: 15000,
    });
  }
}
