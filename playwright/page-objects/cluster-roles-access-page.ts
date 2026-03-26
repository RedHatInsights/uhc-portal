import { expect, Locator } from '@playwright/test';

import { BasePage } from './base-page';

export class ClusterRolesAndAccessPage extends BasePage {
  async isClusterRolesAndAccessPage(): Promise<void> {
    await expect(this.page).toHaveURL(/#accessControl/);
    await expect(this.clusterAdminUsersHeading()).toBeVisible();
  }

  accessControlTab(): Locator {
    return this.page.getByRole('tab', { name: 'Access control' });
  }

  clusterRolesAndAccessTab(): Locator {
    return this.page.getByRole('tab', { name: 'Cluster Roles and Access' });
  }

  identityProvidersTab(): Locator {
    return this.page.getByRole('tab', { name: 'Identity providers' });
  }

  ocmRolesAndAccessTab(): Locator {
    return this.page.getByRole('tab', { name: 'OCM Roles and Access' });
  }

  clusterAdminUsersHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Cluster administrative users' });
  }

  learnMoreLink(): Locator {
    return this.page.getByRole('link', { name: /Learn more/ });
  }

  addUserButton(): Locator {
    return this.page.getByRole('button', { name: 'Add user' });
  }

  addClusterUserDialogHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Add cluster user' });
  }

  userIdInput(): Locator {
    return this.page.getByRole('textbox', { name: 'user id' });
  }

  dedicatedAdminsRadio(): Locator {
    return this.page.getByRole('radio', { name: /dedicated-admins/ });
  }

  clusterAdminsRadio(): Locator {
    return this.page.getByRole('radio', { name: /cluster-admins/ });
  }

  addUserSubmitButton(): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: 'Add user' });
  }

  cancelButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  closeDialogButton(): Locator {
    return this.page.getByRole('button', { name: 'Close' });
  }

  clusterUsersTable(): Locator {
    return this.page.getByRole('grid', { name: 'Users' });
  }

  userRow(userId: string): Locator {
    return this.clusterUsersTable().getByRole('row').filter({ hasText: userId });
  }

  userRowKebabButton(userId: string): Locator {
    return this.userRow(userId).getByRole('button', { name: 'Kebab toggle' });
  }

  deleteMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Delete' });
  }

  deleteConfirmButton(): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: 'Delete' });
  }

  async goToAccessControlTab(): Promise<void> {
    await this.accessControlTab().click();
    await expect(this.accessControlTab()).toHaveAttribute('aria-selected', 'true');
  }

  async goToClusterRolesAndAccessTab(): Promise<void> {
    await this.clusterRolesAndAccessTab().click();
    await expect(this.clusterRolesAndAccessTab()).toHaveAttribute('aria-selected', 'true');
  }

  async openAddUserDialog(): Promise<void> {
    await this.addUserButton().click();
    await expect(this.addClusterUserDialogHeading()).toBeVisible();
  }

  async addClusterUser(
    userId: string,
    group: 'dedicated-admins' | 'cluster-admins' = 'dedicated-admins',
  ): Promise<void> {
    await this.openAddUserDialog();
    await this.userIdInput().fill(userId);
    if (group === 'cluster-admins') {
      await this.clusterAdminsRadio().click();
    }
    await this.addUserSubmitButton().click();
    await expect(this.addClusterUserDialogHeading()).toBeHidden({ timeout: 30000 });
  }

  async deleteClusterUser(userId: string): Promise<void> {
    await this.userRowKebabButton(userId).click();
    await this.deleteMenuItem().click();

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.request().method() === 'DELETE' &&
          resp.url().includes('/groups/') &&
          resp.url().includes(`/users/${userId}`),
        { timeout: 30000 },
      ),
      this.deleteConfirmButton().click(),
    ]);
    expect(response.status()).toBe(204);

    await expect(this.userRow(userId)).toBeHidden({ timeout: 30000 });
  }
}
