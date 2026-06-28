import { expect, Locator } from '@playwright/test';

import { BasePage } from './base-page';

export class IdentityProvidersPage extends BasePage {
  async isIdentityProvidersPage(): Promise<void> {
    await expect(this.page).toHaveURL(/#accessControl/);
    await expect(this.identityProvidersHeading()).toBeVisible();
  }

  accessControlTab(): Locator {
    return this.page.getByRole('tab', { name: 'Access control' });
  }

  identityProvidersTab(): Locator {
    return this.page.getByRole('tab', { name: 'Identity providers' });
  }

  async goToAccessControlTab(): Promise<void> {
    await this.accessControlTab().click();
    await expect(this.accessControlTab()).toHaveAttribute('aria-selected', 'true');
  }

  async goToIdentityProvidersTab(): Promise<void> {
    await this.identityProvidersTab().click();
    await expect(this.identityProvidersTab()).toHaveAttribute('aria-selected', 'true');
  }

  identityProvidersHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Identity providers' });
  }

  learnMoreLink(): Locator {
    return this.page.getByRole('link', { name: /Learn more/ });
  }

  addIdentityProviderDropdown(): Locator {
    return this.page.getByRole('button', { name: 'Add identity provider' });
  }

  addIdpDropdownItem(idpType: string): Locator {
    return this.page.getByRole('menuitem', { name: idpType, exact: true });
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

  idpTable(): Locator {
    return this.page.getByRole('table', { name: 'Identity Providers' });
  }

  idpRow(idpName: string): Locator {
    return this.page.getByRole('row').filter({ hasText: idpName });
  }

  idpKebabButton(idpName: string): Locator {
    return this.idpRow(idpName).getByRole('button', { name: 'Kebab toggle' });
  }

  copyCallbackUrlButton(idpName: string): Locator {
    return this.idpRow(idpName).getByRole('button', { name: /Copy URL to clipboard/i });
  }

  editMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Edit' });
  }

  deleteMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Delete' });
  }

  async openIdpActionsMenu(idpName: string): Promise<void> {
    await this.idpKebabButton(idpName).click();
  }

  async clickEditIdp(idpName: string): Promise<void> {
    await this.openIdpActionsMenu(idpName);
    await Promise.all([
      this.page.waitForURL(/\/edit-idp\//),
      this.editMenuItem().click(),
    ]);
  }

  async clickDeleteIdp(idpName: string): Promise<void> {
    await this.openIdpActionsMenu(idpName);
    await this.deleteMenuItem().click();
  }

  editIdpHeading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: /Edit identity provider/i });
  }

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

  cancelLink(): Locator {
    return this.page.getByRole('link', { name: 'Cancel' });
  }

  async cancelFormAndReturnToIdpTab(): Promise<void> {
    await this.cancelLink().click();
    await this.goToIdentityProvidersTab();
  }

  deleteConfirmButton(): Locator {
    return this.page.getByTestId('btn-primary');
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
    await expect(this.editIdpHeading()).toBeHidden({ timeout: 30000 });
  }

  async deleteIdp(idpName: string): Promise<void> {
    await this.clickDeleteIdp(idpName);

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.request().method() === 'DELETE' && resp.url().includes('/identity_providers/'),
        { timeout: 30000 },
      ),
      this.deleteConfirmButton().click(),
    ]);
    expect(response.status()).toBe(204);

    await expect(this.idpRow(idpName)).toBeHidden({ timeout: 30000 });
  }

  async verifyIdpExists(idpName: string, idpType: string): Promise<void> {
    await expect(this.idpRow(idpName)).toBeVisible({ timeout: 30000 });
    await expect(this.idpRow(idpName)).toContainText(idpType);
  }
}
