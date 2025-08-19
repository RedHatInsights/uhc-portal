import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Create OSD Wizard page object for Playwright tests
 */
export class CreateOSDWizardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  osdCreateClusterButton(): Locator {
    return this.page.getByTestId('osd-create-cluster');
  }

  async isCreateOSDPage(): Promise<void> {
    await this.assertUrlIncludes('/openshift/create/osd');
  }

  async isCreateOSDTrialPage(): Promise<void> {
    await this.assertUrlIncludes('/openshift/create/osd/trial');
  }

  async isBillingModelScreen(): Promise<void> {
    await expect(this.page.getByText('Billing model')).toBeVisible();
  }

  get billingModelRedHatCloudAccountOption(): string {
    return '[data-testid="billing-model-red-hat"], input[value="red-hat-cloud-account"]';
  }

  get primaryButton(): string {
    return 'button[type="submit"], .pf-v6-c-button.pf-m-primary, button:has-text("Next")';
  }

  async isClusterDetailsScreen(): Promise<void> {
    await expect(this.page.getByText('Cluster details')).toBeVisible();
  }

  get clusterNameInput(): string {
    return 'input[name="name"], input[placeholder*="cluster name"]';
  }

  get clusterNameInputError(): string {
    return '.pf-v6-c-helper-text__item-text, [class*="error"], .pf-v6-c-form__helper-text';
  }

  async isMachinePoolScreen(): Promise<void> {
    await expect(this.page.getByText('Machine pool')).toBeVisible();
  }

  async isNetworkingScreen(): Promise<void> {
    await expect(this.page.getByText('Networking')).toBeVisible();
  }

  async isCIDRScreen(): Promise<void> {
    await expect(this.page.getByText('CIDR ranges')).toBeVisible();
  }

  async isUpdatesScreen(): Promise<void> {
    await expect(this.page.getByText('Updates')).toBeVisible();
  }

  async isReviewScreen(): Promise<void> {
    await expect(this.page.getByText('Review')).toBeVisible();
  }

  get CCSSelected(): string {
    return '[data-testid="ccs-selected"], .pf-v6-c-radio__input:checked + .pf-v6-c-radio__label:has-text("CCS")';
  }

  get TrialSelected(): string {
    return '[data-testid="trial-selected"], .pf-v6-c-radio__input:checked + .pf-v6-c-radio__label:has-text("Trial")';
  }
}
