import { expect, Locator } from '@playwright/test';

import { BasePage } from './base-page';

export class AwsInfrastructureAccessPage extends BasePage {
  async isAwsInfrastructureAccessPage(): Promise<void> {
    await expect(this.awsInfrastructureAccessTab()).toHaveAttribute('aria-selected', 'true');
    await expect(this.sectionHeading()).toBeVisible();
    await expect(this.grantRoleButton()).toBeVisible();
  }

  accessControlTab(): Locator {
    return this.page.getByRole('tab', { name: 'Access control' });
  }

  awsInfrastructureAccessTab(): Locator {
    return this.page.getByRole('tab', { name: 'AWS infrastructure access' });
  }

  identityProvidersTab(): Locator {
    return this.page.getByRole('tab', { name: 'Identity providers' });
  }

  clusterRolesAndAccessTab(): Locator {
    return this.page.getByRole('tab', { name: 'Cluster Roles and Access' });
  }

  ocmRolesAndAccessTab(): Locator {
    return this.page.getByRole('tab', { name: 'OCM Roles and Access' });
  }

  awsInfrastructureAccessPanel(): Locator {
    return this.page.getByRole('tabpanel', { name: 'AWS infrastructure access' });
  }

  sectionCard(): Locator {
    return this.awsInfrastructureAccessPanel();
  }

  sectionHeading(): Locator {
    return this.awsInfrastructureAccessPanel().getByRole('heading', {
      name: 'AWS infrastructure access',
      level: 3,
    });
  }

  awsLoginLink(): Locator {
    return this.awsInfrastructureAccessPanel().getByRole('link', {
      name: /Log in to your aws account/i,
    });
  }

  grantRoleButton(): Locator {
    return this.awsInfrastructureAccessPanel().getByRole('button', { name: 'Grant role' });
  }

  grantsTable(): Locator {
    return this.page.getByRole('grid', { name: 'Grants' });
  }

  grantModal(): Locator {
    return this.page.getByRole('dialog', { name: 'Grant AWS infrastructure role' });
  }

  grantModalHeading(): Locator {
    return this.grantModal().getByRole('heading', { name: 'Grant AWS infrastructure role' });
  }

  iamArnInput(): Locator {
    return this.grantModal().getByRole('textbox', { name: 'AWS IAM ARN' });
  }

  grantRoleSubmitButton(): Locator {
    return this.grantModal().getByRole('button', { name: 'Grant role' });
  }

  cancelButton(): Locator {
    return this.grantModal().getByRole('button', { name: 'Cancel' });
  }

  roleRadio(roleName: string): Locator {
    return this.grantModal().getByRole('radio', { name: roleName });
  }

  grantRow(userArn: string, roleName?: string): Locator {
    const row = this.grantsTable().getByRole('row').filter({ hasText: userArn });
    return roleName ? row.filter({ hasText: roleName }) : row;
  }

  grantFailureNotification(userArn: string): Locator {
    return this.page.getByText('Role creation failed for').filter({ hasText: userArn });
  }

  grantSuccessNotification(userArn: string, roleName: string): Locator {
    return this.page
      .getByText('role successfully created for')
      .filter({ hasText: userArn })
      .filter({ hasText: roleName });
  }

  copyUrlButton(userArn: string, roleName?: string): Locator {
    return this.grantRow(userArn, roleName).getByRole('button', { name: 'Copy URL to clipboard' });
  }

  async goToAccessControlTab(): Promise<void> {
    await this.accessControlTab().click();
    await expect(this.accessControlTab()).toHaveAttribute('aria-selected', 'true');
  }

  async goToAwsInfrastructureAccessTab(): Promise<void> {
    await this.awsInfrastructureAccessTab().click();
    await expect(this.awsInfrastructureAccessTab()).toHaveAttribute('aria-selected', 'true');
    await expect(this.grantRoleButton()).toBeVisible();
  }

  async openGrantRoleModal(): Promise<void> {
    await this.goToAwsInfrastructureAccessTab();
    await this.grantRoleButton().click();
    await expect(this.grantModalHeading()).toBeVisible();
  }

  async grantInfrastructureAccessRole(userArn: string, roleName?: string): Promise<void> {
    await this.openGrantRoleModal();
    await this.iamArnInput().fill(userArn);

    if (roleName) {
      await this.roleRadio(roleName).click();
    }

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.request().method() === 'POST' &&
          resp.url().includes('/aws_infrastructure_access_role_grants'),
        { timeout: 30000 },
      ),
      this.grantRoleSubmitButton().click(),
    ]);
    expect(response.ok()).toBeTruthy();

    await expect(this.grantModalHeading()).toBeHidden({ timeout: 30000 });
  }

  async waitForGrantInTable(userArn: string): Promise<void> {
    await expect(this.grantRow(userArn)).toBeVisible({ timeout: 120000 });
  }

  async waitForGrantStatus(userArn: string, status: string): Promise<void> {
    await this.waitForGrantInTable(userArn);
    await expect(this.grantRow(userArn)).toContainText(status, { timeout: 120000 });
  }

  async waitForGrantFailure(userArn: string, roleName?: string): Promise<void> {
    await Promise.all([
      expect(this.grantFailureNotification(userArn)).toBeVisible({ timeout: 120000 }),
      expect(this.grantRow(userArn, roleName)).toContainText('Failed', { timeout: 120000 }),
    ]);
  }

  async waitForGrantSuccess(userArn: string, roleName: string): Promise<void> {
    await Promise.all([
      expect(this.grantSuccessNotification(userArn, roleName)).toBeVisible({ timeout: 120000 }),
      expect(this.grantRow(userArn, roleName)).toContainText('Ready', { timeout: 120000 }),
    ]);
  }

  async deleteGrant(userArn: string, roleName?: string): Promise<void> {
    await this.goToAwsInfrastructureAccessTab();
    await this.grantRow(userArn, roleName).getByRole('button', { name: 'Kebab toggle' }).click();

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.request().method() === 'DELETE' &&
          resp.url().includes('/aws_infrastructure_access_role_grants/'),
        { timeout: 30000 },
      ),
      this.page.getByRole('menuitem', { name: 'Delete' }).click(),
    ]);
    expect(response.status()).toBe(204);

    await expect(this.grantRow(userArn, roleName)).toBeHidden({ timeout: 120000 });
  }

  async deleteGrantIfExists(userArn: string, roleName?: string): Promise<void> {
    await this.goToAwsInfrastructureAccessTab();
    const row = this.grantRow(userArn, roleName);

    try {
      await expect(row).toBeVisible({ timeout: 15000 });
    } catch {
      return;
    }

    await row.getByRole('button', { name: 'Kebab toggle' }).click();

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.request().method() === 'DELETE' &&
          resp.url().includes('/aws_infrastructure_access_role_grants/'),
        { timeout: 30000 },
      ),
      this.page.getByRole('menuitem', { name: 'Delete' }).click(),
    ]);
    expect(response.status()).toBe(204);

    await expect(row).toBeHidden({ timeout: 120000 });
  }
}
