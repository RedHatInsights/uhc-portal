import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Create OSD Wizard page object for Playwright tests
 */
export class CreateOSDWizardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors - converting from Cypress selectors to data-testid where possible
  get billingModelRedHatCloudAccountOption(): string {
    return '[data-testid="billing-model-redhat-cloud-account"]';
  }

  get primaryButton(): string {
    return '[data-testid="primary-button"], .pf-v6-c-button--primary';
  }

  get clusterNameInput(): string {
    return '[data-testid="cluster-name-input"]';
  }

  get clusterNameInputError(): string {
    return '[data-testid="cluster-name-error"]';
  }

  get CCSSelected(): string {
    return '[data-testid="ccs-selected"]';
  }

  get TrialSelected(): string {
    return '[data-testid="trial-selected"]';
  }

  osdCreateClusterButton(): Locator {
    return this.page.getByTestId('osd-create-cluster-button');
  }

  async isCreateOSDPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/create\/osd/);
    await expect(this.page.locator('h1')).toContainText('Create OpenShift Dedicated cluster');
  }

  async isCreateOSDTrialPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/create\/osd.*trial/);
    await expect(this.page.locator('h1')).toContainText('Create OpenShift Dedicated trial cluster');
  }

  async isBillingModelScreen(): Promise<void> {
    await expect(this.page.locator('h2')).toContainText('Billing model');
  }

  async isClusterDetailsScreen(): Promise<void> {
    await expect(this.page.locator('h2')).toContainText('Cluster details');
  }

  async isMachinePoolScreen(): Promise<void> {
    await expect(this.page.locator('h2')).toContainText('Machine pool');
  }

  async isNetworkingScreen(): Promise<void> {
    await expect(this.page.locator('h2')).toContainText('Networking');
  }

  async isCIDRScreen(): Promise<void> {
    await expect(this.page.locator('h2')).toContainText('CIDR ranges');
  }

  async isUpdatesScreen(): Promise<void> {
    await expect(this.page.locator('h2')).toContainText('Cluster update strategy');
  }

  async isReviewScreen(): Promise<void> {
    await expect(this.page.locator('h2')).toContainText('Review and create');
  }
}
