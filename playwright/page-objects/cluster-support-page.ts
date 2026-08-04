import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from './base-page';

export class ClusterSupportPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isClusterSupportPage(): Promise<void> {
    await expect(this.page).toHaveURL(/#support/);
    await expect(this.notificationContactsHeading()).toBeVisible({ timeout: 30000 });
  }

  supportTab(): Locator {
    return this.page.getByRole('tab', { name: 'Support' });
  }

  notificationContactsHeading(): Locator {
    return this.page.getByText('Notification contacts', { exact: true });
  }

  supportCasesHeading(): Locator {
    return this.page.getByText('Support cases', { exact: true });
  }

  addNotificationContactButton(): Locator {
    return this.page.getByRole('button', { name: 'Add notification contact' });
  }

  addContactButton(): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: 'Add contact' });
  }

  cancelButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  openSupportCaseButton(): Locator {
    return this.page.getByRole('button', { name: 'Open support case' });
  }

  usernameInput(): Locator {
    return this.page.getByLabel('user name');
  }

  notificationContactsTable(): Locator {
    return this.page.getByRole('grid', { name: 'Notification Contacts' });
  }

  supportCasesTable(): Locator {
    return this.page.getByTestId('support-cases-table');
  }

  addNotificationContactModalHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Add notification contact' });
  }

  notificationContactRow(username: string): Locator {
    return this.notificationContactsTable()
      .getByRole('row')
      .filter({ has: this.page.getByRole('gridcell', { name: username, exact: true }) });
  }

  addNotificationContactModalDescription(): Locator {
    return this.page.getByText(
      'Identify the user to be added as notification contact. These users will be contacted in the event of notifications about this cluster.',
    );
  }

  notificationContactAddedAlert(): Locator {
    return this.page.getByText('Notification contact added successfully');
  }

  notificationContactDeletedAlert(): Locator {
    return this.page.getByText('Notification contact deleted successfully');
  }

  inlineValidationError(message: string): Locator {
    return this.page.getByText(message);
  }

  async goToSupportTab(): Promise<void> {
    await this.supportTab().click();
    await expect(this.supportTab()).toHaveAttribute('aria-selected', 'true');
  }

  async openAddNotificationContactModal(): Promise<void> {
    await this.addNotificationContactButton().click();
    await expect(this.addNotificationContactModalHeading()).toBeVisible();
  }

  async addNotificationContact(username: string): Promise<void> {
    await this.openAddNotificationContactModal();
    await this.usernameInput().fill(username);
    await this.addContactButton().click();
    await expect(this.addNotificationContactModalHeading()).toBeHidden({ timeout: 30000 });
  }

  async deleteNotificationContactByUsername(username: string): Promise<void> {
    await this.notificationContactRow(username)
      .getByRole('button', { name: 'Kebab toggle' })
      .click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(this.notificationContactRow(username)).toHaveCount(0, { timeout: 30000 });
  }

  async checkSupportCaseTableHeaders(): Promise<void> {
    const expectedHeaders = [
      'Case ID',
      'Issue summary',
      'Owner',
      'Modified by',
      'Severity',
      'Status',
    ];
    for (const header of expectedHeaders) {
      await expect(
        this.supportCasesTable().getByRole('columnheader', { name: header }),
      ).toBeVisible();
    }
  }

  async checkNotificationContactTableHeaders(): Promise<void> {
    const expectedHeaders = ['Username', 'Email', 'First Name', 'Last Name'];
    for (const header of expectedHeaders) {
      await expect(
        this.notificationContactsTable().getByRole('columnheader', { name: header }),
      ).toBeVisible();
    }
  }

  async checkNotificationContacts(
    username: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    const row = this.notificationContactRow(username);
    await expect(row).toBeVisible();
    await expect(row.getByRole('gridcell', { name: firstName, exact: true })).toBeVisible();
    await expect(row.getByRole('gridcell', { name: lastName, exact: true })).toBeVisible();
  }
}
