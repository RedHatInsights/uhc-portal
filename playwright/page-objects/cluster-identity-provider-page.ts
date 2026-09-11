import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from './base-page';

export class ClusterIdentityProviderPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isIdentityProvidersPage(): Promise<void> {
    await expect(this.page).toHaveURL(/#accessControl/);
    await expect(this.identityProvidersHeading()).toBeVisible();
    await expect(this.addIdentityProviderDropdown()).toBeVisible({ timeout: 30000 });
  }

  // ==================== Navigation ====================

  accessControlTab(): Locator {
    // Cluster details uses a tab; edit-IDP page uses a breadcrumb link
    return this.page
      .getByRole('tab', { name: 'Access control' })
      .or(this.page.getByRole('link', { name: 'Access control' }));
  }

  identityProvidersTab(): Locator {
    return this.page.getByRole('tab', { name: 'Identity providers' });
  }

  async goToAccessControlTab(): Promise<void> {
    await this.accessControlTab().click();
    await expect(this.page).toHaveURL(/#accessControl/);
  }

  async goToIdentityProvidersTab(): Promise<void> {
    await this.identityProvidersTab().click();
    await expect(this.addIdentityProviderDropdown()).toBeVisible({ timeout: 30000 });
  }

  identityProvidersHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Identity providers' });
  }

  learnMoreLink(): Locator {
    return this.page.getByRole('link', { name: /Learn more/ });
  }

  // ==================== Add IDP dropdown ====================

  addIdentityProviderDropdown(): Locator {
    return this.page.getByRole('button', { name: 'Add identity provider' });
  }

  addIdpDropdownItem(idpType: string): Locator {
    return this.page.getByRole('menuitem', { name: idpType, exact: true });
  }

  htpasswdOption(): Locator {
    return this.addIdpDropdownItem('htpasswd');
  }

  async openAddIdpDropdown(): Promise<void> {
    const dropdown = this.addIdentityProviderDropdown();
    await dropdown.waitFor({ state: 'visible' });
    await dropdown.click();
    // Webkit occasionally fails to register the first click on PF6 MenuToggle
    if ((await dropdown.getAttribute('aria-expanded')) !== 'true') {
      await dropdown.click();
    }
    await expect(dropdown).toHaveAttribute('aria-expanded', 'true');
  }

  async selectIdpType(
    idpType: 'GitHub' | 'Google' | 'OpenID' | 'LDAP' | 'GitLab' | 'htpasswd',
  ): Promise<void> {
    await this.openAddIdpDropdown();
    const item = this.addIdpDropdownItem(idpType);
    await item.waitFor({ state: 'attached' });
    await item.click();
  }

  async openHtpasswdForm(): Promise<void> {
    await this.selectIdpType('htpasswd');
  }

  // ==================== Add IDP Form (htpasswd) ====================

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

  // ==================== GitHub / generic IDP form ====================

  nameInput(): Locator {
    return this.page.getByRole('textbox', { name: /^name$/i });
  }

  clientIdInput(): Locator {
    return this.page.getByLabel('Client ID');
  }

  clientSecretInput(): Locator {
    return this.page.getByLabel('Client secret');
  }

  mappingMethodValue(): Locator {
    return this.page.getByRole('button', { name: 'Options menu' });
  }

  hostnameInput(): Locator {
    return this.page.getByLabel('Hostname');
  }

  caFileUpload(): Locator {
    return this.page.getByTestId('ca-upload-input-file');
  }

  caFileTextarea(): Locator {
    return this.page.getByRole('textbox', { name: /CA file/i });
  }

  useOrganizationsRadio(): Locator {
    return this.page.getByRole('radio', { name: /Use organizations/i });
  }

  useTeamsRadio(): Locator {
    return this.page.getByRole('radio', { name: /Use teams/i });
  }

  organizationsInput(): Locator {
    return this.page.getByPlaceholder('e.g. org').first();
  }

  teamsInput(): Locator {
    return this.page.getByPlaceholder('e.g. org/team').first();
  }

  createButton(): Locator {
    return this.page.getByRole('button', { name: 'Add', exact: true });
  }

  confirmButton(): Locator {
    return this.page.getByRole('button', { name: 'Save' });
  }

  requiredFieldError(): Locator {
    return this.page.getByText(/Field is required|is required/i);
  }

  duplicateNameError(): Locator {
    return this.page.getByText(/is already taken/i);
  }

  async uploadCaFile(content: string): Promise<void> {
    await this.caFileUpload().setInputFiles({
      name: 'ca.crt',
      mimeType: 'application/x-pem-file',
      buffer: Buffer.from(content),
    });
  }

  async submitCreateAndVerify(): Promise<void> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.request().method() === 'POST' &&
          resp.url().includes('/identity_providers') &&
          resp.status() === 201,
        { timeout: 30000 },
      ),
      this.createButton().click(),
    ]);
    expect(response.status()).toBe(201);
  }

  async submitEditAndVerify(): Promise<void> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.request().method() === 'PATCH' &&
          resp.url().includes('/identity_providers/') &&
          resp.status() === 200,
        { timeout: 30000 },
      ),
      this.confirmButton().click(),
    ]);
    expect(response.status()).toBe(200);
    await expect(this.editIdpPageTitle()).toBeHidden({ timeout: 30000 });
  }

  async cancelFormAndReturnToIdpTab(): Promise<void> {
    await this.cancelLink().click();
    await this.goToIdentityProvidersTab();
  }

  // ==================== Identity Providers Table ====================

  identityProvidersTable(): Locator {
    return this.page.getByRole('grid', { name: /identity providers/i });
  }

  identityProviderRow(name: string): Locator {
    return this.identityProvidersTable().getByRole('row').filter({ hasText: name });
  }

  idpRow(idpName: string): Locator {
    return this.identityProviderRow(idpName);
  }

  identityProviderExpandToggle(idpName: string): Locator {
    return this.identityProviderRow(idpName).getByRole('button', { name: 'Details' });
  }

  kebabToggleInRow(idpName: string): Locator {
    return this.identityProviderRow(idpName).getByRole('button', { name: 'Kebab toggle' });
  }

  copyCallbackUrlButton(idpName: string): Locator {
    return this.identityProviderRow(idpName).getByRole('button', { name: /Copy URL to clipboard/i });
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

  async hasConfiguredIdps(): Promise<boolean> {
    await this.goToAccessControlTab();
    await this.goToIdentityProvidersTab();
    try {
      await this.identityProvidersTable().waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async verifyIdpExists(idpName: string, idpType: string): Promise<void> {
    await expect(this.identityProviderRow(idpName)).toBeVisible({ timeout: 30000 });
    await expect(this.identityProviderRow(idpName)).toContainText(idpType);
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

  // ==================== Edit IDP page ====================

  editIdpPageTitle(): Locator {
    return this.page.getByRole('heading', { name: /Edit identity provider:/ });
  }

  editIdpHeading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: /Edit identity provider/i });
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

  async clickEditIdp(idpName: string): Promise<void> {
    await this.kebabToggleInRow(idpName).click();
    await Promise.all([this.page.waitForURL(/\/edit-idp\//), this.editMenuItem().click()]);
  }

  async deleteHtpasswdIDP(idpName: string): Promise<void> {
    await this.kebabToggleInRow(idpName).click();
    await this.deleteMenuItem().click();
    await this.confirmDeleteButton().click();
  }

  async deleteIdp(idpName: string): Promise<void> {
    await this.kebabToggleInRow(idpName).click();
    await this.deleteMenuItem().click();

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.request().method() === 'DELETE' && resp.url().includes('/identity_providers/'),
        { timeout: 30000 },
      ),
      this.confirmDeleteButton().click(),
    ]);
    expect(response.status()).toBe(204);

    await expect(this.identityProviderRow(idpName)).toBeHidden({ timeout: 30000 });
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
