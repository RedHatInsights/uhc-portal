import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Create ROSA Wizard page object for Playwright tests
 */
export class CreateROSAWizardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isCreateRosaPage(): Promise<void> {
    await this.assertUrlIncludes('/openshift/create/rosa');
  }

  async isControlPlaneTypeScreen(): Promise<void> {
    await expect(this.page.getByText('Control plane type')).toBeVisible();
  }

  async selectStandaloneControlPlaneTypeOption(): Promise<void> {
    await this.page
      .locator('input[value="standalone"], input[type="radio"]:has-text("Standalone")')
      .click();
  }

  get primaryButton(): string {
    return 'button[type="submit"], [class*="button"][class*="primary"], button:has-text("Next")';
  }

  async isAccountsAndRolesScreen(): Promise<void> {
    await expect(this.page.getByText('Accounts and roles')).toBeVisible();
  }

  get associatedAccountsDropdown(): string {
    return '[data-testid="associated-accounts-dropdown"], select[name*="account"]';
  }

  get accountIdMenuItem(): string {
    return 'option[value], [class*="menu__item"]';
  }

  async showsNoAssociatedAccounts(): Promise<void> {
    await expect(this.page.getByText('No associated accounts')).toBeVisible();
  }

  async showsNoARNsDetectedAlert(): Promise<void> {
    await expect(this.page.getByText('No ARNs detected')).toBeVisible();
  }

  get ARNFieldRequiredMsg(): string {
    return '[class*="helper-text"]:has-text("required"), [class*="error"]:has-text("required")';
  }

  async showsNoUserRoleAlert(): Promise<void> {
    await expect(this.page.getByText('User role could not be detected')).toBeVisible();
  }

  async showsNoOcmRoleAlert(): Promise<void> {
    await expect(this.page.getByText('OCM role')).toBeVisible();
  }

  async isClusterDetailsScreen(): Promise<void> {
    await expect(this.page.getByText('Cluster details')).toBeVisible();
  }

  get versionsDropdown(): string {
    return '[data-testid="versions-dropdown"], select[name*="version"]';
  }

  async isSelectedVersion(version: string): Promise<void> {
    await expect(this.page.locator(`option[selected]:has-text("${version}")`)).toBeVisible();
  }
}
