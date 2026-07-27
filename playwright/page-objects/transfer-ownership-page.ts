import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Transfer Ownership page object for Playwright tests
 * Handles cluster transfer ownership interactions from access control tab,
 * actions dropdown, overview tab, and cluster list kebab menu.
 */
export class TransferOwnershipPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isTransferOwnershipPage(): Promise<void> {
    await expect(this.transferOwnershipTab()).toBeVisible({ timeout: 30000 });
  }

  transferOwnershipTab(): Locator {
    return this.page.getByRole('tab', { name: 'Transfer ownership' });
  }

  initiateTransferButton(): Locator {
    return this.page.getByRole('button', { name: 'Initiate transfer' });
  }

  transferOwnershipUsernameInput(): Locator {
    return this.page.getByRole('dialog').getByRole('textbox', { name: 'Username' });
  }

  transferOwnershipAccountIDInput(): Locator {
    return this.page.getByRole('dialog').getByRole('textbox', { name: 'Account ID' });
  }

  transferOwnershipOrganizationIDInput(): Locator {
    return this.page.getByRole('dialog').getByRole('textbox', { name: 'Organization ID' });
  }

  initiateTransferButtonFromModel(): Locator {
    return this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Initiate transfer' });
  }

  cancelTransferButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel transfer' });
  }

  cancelTransferButtonFromModel(): Locator {
    return this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Cancel transfer' });
  }

  cancelButtonFromModel(): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: 'Cancel' });
  }

  async cancelExistingTransferIfPending(): Promise<void> {
    const cancelButton = this.cancelTransferButton();
    const isPending = await cancelButton
      .waitFor({ state: 'visible', timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    if (!isPending) {
      return;
    }
    await cancelButton.click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 30000 });
    await this.cancelTransferButtonFromModel().click();
    await expect(cancelButton).not.toBeVisible({ timeout: 30000 });
    await this.closeAlert();
    await this.page.reload();
    await this.transferOwnershipTab().click();
  }

  async isTransferClusterSection(title: string, description: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
    await expect(this.page.getByText(description)).toBeVisible();
  }

  async isTransferOwnershipDialogHeader(title: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: title }),
    ).toBeVisible({ timeout: 30000 });
  }

  async isTransferOwnershipProgressDialogHeader(title: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: title }),
    ).toBeVisible({ timeout: 30000 });
  }

  async isTransferOwnershipProgressDialogDetails(
    _dateOfRequest: string,
    currentOwner: string,
    transferRecipient: string,
    status: string,
  ): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toContainText(currentOwner);
    await expect(dialog).toContainText(transferRecipient);
    await expect(dialog).toContainText(status, { ignoreCase: true });
  }

  async isTransferPendingHeaders(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: /transfer pending/i }),
    ).toBeVisible({ timeout: 30000 });
  }

  async isTransferDetailsSection(
    _dateOfRequest: string,
    currentOwner: string,
    transferRecipient: string,
    status: string,
  ): Promise<void> {
    const detailsSection = this.page
      .getByRole('heading', { name: 'Transfer details' })
      .locator('..');
    await expect(detailsSection).toContainText(currentOwner);
    await expect(detailsSection).toContainText(transferRecipient);
    await expect(detailsSection).toContainText(status);
  }

  async isCancelTransferModel(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: /Cancel/i }),
    ).toBeVisible({ timeout: 30000 });
  }

  async isTransferFieldValidationShown(errorMessage: string): Promise<void> {
    await expect(this.page.getByText(errorMessage)).toBeVisible({ timeout: 10000 });
  }

  async fillTransferOwnershipForm(
    username: string,
    accountID: string,
    organizationID: string,
  ): Promise<void> {
    await this.transferOwnershipUsernameInput().fill(username);
    await this.transferOwnershipAccountIDInput().fill(accountID);
    await this.transferOwnershipOrganizationIDInput().fill(organizationID);
  }

  async submitTransferAndWaitForAlert(): Promise<void> {
    await this.initiateTransferButtonFromModel().click();
    await expect(
      this.page.getByRole('heading', { name: /Success alert/i }),
    ).toBeVisible({ timeout: 30000 });
  }

  async closeAlert(): Promise<void> {
    const alertCloseButton = this.page
      .getByRole('alert')
      .first()
      .getByRole('button', { name: 'Close' });
    const isAlertVisible = await alertCloseButton
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (isAlertVisible) {
      await alertCloseButton.click();
    }
  }

  async cancelTransferAndWaitForAlert(): Promise<void> {
    await this.cancelTransferButtonFromModel().click();
    await expect(
      this.page.getByRole('heading', { name: /Success alert/i }),
    ).toBeVisible({ timeout: 30000 });
  }
}
