import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Cluster Support Tab page object for Playwright tests
 */
export class ClusterSupportPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Tab navigation
  supportTab(): Locator {
    return this.page.getByRole('tab', { name: 'Support' });
  }

  // Section visibility checks
  async isNotificationContactVisible(): Promise<void> {
    await expect(this.page.getByText('Notification contacts', { exact: true })).toBeVisible();
  }

  async isSupportCasesSectionVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Support cases' })).toBeVisible();
  }

  // Element getters - return Locator elements
  getAddNotificationContactButton(): Locator {
    return this.page.getByRole('button', { name: 'Add notification contact' });
  }

  getAddContactButton(): Locator {
    return this.page.getByRole('button', { name: 'Add contact' });
  }

  getCancelButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  getOpenSupportCaseButton(): Locator {
    return this.page.getByRole('button', { name: 'Open support case' });
  }

  getUsernameInput(): Locator {
    return this.page.getByRole('textbox', { name: 'user name' });
  }

  getDeleteButton(): Locator {
    return this.page.getByRole('button', { name: 'Delete' });
  }

  // Notification contacts table
  notificationContactsTable(): Locator {
    return this.page.getByRole('grid', { name: 'Notification Contacts' });
  }

  // Support cases table
  supportCasesTable(): Locator {
    return this.page.getByTestId('support-cases-table');
  }

  // Action methods
  async getNotificationContactCountByUsername(username: string): Promise<number> {
    const table = this.notificationContactsTable();
    const userRow = table.locator('tr').filter({ hasText: username });
    return await userRow.count();
  }

  async deleteNotificationContactByUsername(username: string): Promise<void> {
    const table = this.notificationContactsTable();
    const row = table.locator('tr').filter({ hasText: username });
    await row.getByRole('button', { name: 'Kebab toggle' }).click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
  }

  async isTextContainsInPage(text: string, present: boolean = true): Promise<void> {
    const textElement = this.page.getByText(text);
    if (present) {
      await expect(textElement.first()).toBeVisible();
    } else {
      await expect(textElement).toHaveCount(0);
    }
  }

  // Notification checks
  async isSuccessNotificationVisible(): Promise<void> {
    const notification = this.page.getByRole('heading', {
      name: /Notification contact added successfully/,
    });
    await expect(notification).toBeVisible();
    await notification.waitFor({ state: 'hidden' });
  }

  async isDeleteNotificationVisible(): Promise<void> {
    const notification = this.page.getByRole('heading', {
      name: /Notification contact deleted successfully/,
    });
    await expect(notification).toBeVisible();
    await notification.waitFor({ state: 'hidden' });
  }

  // Table verification methods
  async checkSupportCaseTableHeaders(): Promise<void> {
    const expectedHeaders = [
      'Case ID',
      'Issue summary',
      'Owner',
      'Modified by',
      'Severity',
      'Status',
    ];
    const table = this.supportCasesTable();

    for (const header of expectedHeaders) {
      await expect(table.locator('th').filter({ hasText: header })).toBeVisible();
    }
  }

  async checkNotificationContactTableHeaders(): Promise<void> {
    const expectedHeaders = ['Username', 'Email', 'First Name', 'Last Name'];
    const table = this.notificationContactsTable();

    for (const header of expectedHeaders) {
      await expect(table.locator('th').filter({ hasText: header })).toBeVisible();
    }
  }

  async checkNotificationContacts(
    username: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    const table = this.notificationContactsTable();
    await expect(table.getByText(username, { exact: true })).toBeVisible();
    await expect(table.getByText(firstName, { exact: true })).toBeVisible();
    await expect(table.getByText(lastName, { exact: true })).toBeVisible();
  }

  async isNotificationContactModalVisible(): Promise<void> {
    await expect(
      this.page.getByRole('dialog').getByRole('heading', { name: 'Add notification contact' }),
    ).toBeVisible();
    await expect(
      this.page.getByRole('dialog').getByText(
        'Identify the user to be added as notification contact. These users will be contacted in the event of notifications about this cluster.',
      ),
    ).toBeVisible();
  }

  // Wait helpers
  async waitForSupportTabToLoad(): Promise<void> {
    await expect(this.page.getByText('Notification contacts')).toBeVisible({ timeout: 30000 });
  }
}
