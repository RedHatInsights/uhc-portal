import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { CustomCommands } from '../support/custom-commands';

/**
 * Page object for Cluster Cloud Tab page functionality
 */
export class CreateClusterPage extends BasePage {
  private customCommands: CustomCommands;

  constructor(page: Page) {
    super(page);
    this.customCommands = new CustomCommands(page);
  }

  // Locators for managed services section
  get managedServicesTable(): Locator {
    return this.page.getByTestId('managed-service-table');
  }

  // Locators for run it yourself section
  get runItYourselfSection(): Locator {
    return this.page.getByTestId('run-it-yourself');
  }

  // Specific button locators
  get createOSDTrialButton(): Locator {
    return this.page.getByTestId('osd-create-trial-cluster');
  }

  get createOSDButton(): Locator {
    return this.page.getByTestId('osd-create-cluster-button');
  }

  get createRosaButton(): Locator {
    return this.page.getByTestId('rosa-create-cluster-button');
  }

  get rosaClusterWithWebLink(): Locator {
    return this.page.locator('a').filter({ hasText: 'With web interface' });
  }

  // Breadcrumb locators
  get breadcrumbs(): Locator {
    return this.page.getByRole('navigation', { name: 'Breadcrumb' });
  }

  get breadcrumbClusterList(): Locator {
    return this.breadcrumbs.getByRole('link', { name: 'Cluster List' });
  }

  get breadcrumbClusterType(): Locator {
    return this.breadcrumbs.getByText('Cluster Type');
  }

  // Methods
  async isCloudTabPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/openshift\/create\/cloud/, { timeout: 40000 });
    await expect(this.page).toHaveTitle(
      'Create an OpenShift cluster | Red Hat OpenShift Cluster Manager',
      { timeout: 40000 },
    );
  }

  async checkBreadcrumbs(): Promise<void> {
    await expect(this.breadcrumbClusterList).toBeVisible();
    await expect(this.breadcrumbClusterType).toBeVisible();
  }

  async isCreateClusterPage(): Promise<void> {
    await this.assertUrlIncludes('openshift/create');
  }

  async isCreateClusterPageHeaderVisible(): Promise<void> {
    await expect(this.page.locator('h1')).toContainText(
      'Select an OpenShift cluster type to create',
      { timeout: 30000 },
    );
  }

  escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Managed services helper methods
  async checkManagedServiceLink(title: string, expectedUrl: string): Promise<void> {
    const escapedTitle = this.escapeRegExp(title);
    const link = this.managedServicesTable
      .locator('a')
      .filter({ hasText: new RegExp(`^${escapedTitle} \\(new window or tab\\)$`, 'i') });
    await expect(link).toBeVisible({ timeout: 30000 });
    await expect(link).toHaveAttribute('href', expectedUrl);
    await expect(link).toHaveAttribute('target', '_blank');
  }

  async checkManagedServiceButton(buttonText: string, expectedUrl: string): Promise<void> {
    const button = this.managedServicesTable.locator('a').filter({ hasText: buttonText });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('href', expectedUrl);
  }

  async clickCreateOSDTrialButton(): Promise<void> {
    await this.createOSDTrialButton.click();
  }

  async clickCreateOSDButton(): Promise<void> {
    await this.createOSDButton.click();
  }

  async clickCreateRosaButton(): Promise<void> {
    await this.createRosaButton.click();
  }

  async clickRosaClusterWithWeb(): Promise<void> {
    await expect(this.rosaClusterWithWebLink).toBeVisible();
    await this.rosaClusterWithWebLink.click();
  }

  async clickBackButton(): Promise<void> {
    await this.page.goBack();
  }

  async expandToggle(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    await expect(element).toBeVisible();
    await element.click();
  }

  async isTextVisible(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async isCreateOSDTrialPage(): Promise<void> {
    await expect(this.page).toHaveURL(/openshift\/create\/osdtrial\?trial=osd/);
  }

  async isCreateOSDPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/openshift\/create\/osd/);
  }

  async isCreateRosaPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/openshift\/create\/rosa\/wizard/);
  }

  async isQuotaPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/openshift\/quota/);
  }

  async clickQuotaLink(): Promise<void> {
    const link = this.page.locator('a').filter({ hasText: 'View your annual subscriptions quota' });
    await expect(link).toBeVisible();
    await link.click();
  }

  // Run it yourself helper methods
  async checkRunItYourselfLink(title: string, expectedUrl: string): Promise<void> {
    const link = this.runItYourselfSection.locator('a').filter({ hasText: title });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', expectedUrl);
    await this.customCommands.assertUrlReturns200(expectedUrl);
  }
}
