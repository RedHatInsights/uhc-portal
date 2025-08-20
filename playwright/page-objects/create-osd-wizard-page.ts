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
    return this.page.getByTestId('osd-create-cluster-button');
  }

  async isCreateOSDPage(): Promise<void> {
    await this.assertUrlIncludes('/openshift/create/osd');
  }

  async isCreateOSDTrialPage(): Promise<void> {
    await this.assertUrlIncludes('/openshift/create/osd/trial');
  }

  async isBillingModelScreen(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Welcome to Red Hat OpenShift Dedicated' }),
    ).toBeVisible();
  }

  get billingModelRedHatCloudAccountOption(): string {
    return 'input[id="form-radiobutton-byoc-false-field"]';
  }

  get primaryButton(): string {
    return '[data-testid="wizard-next-button"], button:has-text("Next")';
  }

  async isClusterDetailsScreen(): Promise<void> {
    await expect(this.page.getByText('Cluster details')).toBeVisible();
  }

  get clusterNameInput(): string {
    return 'input[name="name"], input[placeholder*="cluster name"]';
  }

  get clusterNameInputError(): string {
    return 'ul#rich-input-popover-name li.pf-v6-c-helper-text__item.pf-m-error';
  }

  async isMachinePoolScreen(): Promise<void> {
    await expect(this.page.getByText('Machine pool')).toBeVisible();
  }

  async isNetworkingScreen(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Networking configuration' }),
    ).toBeVisible();
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
    return '[data-testid="ccs-selected"], [class*="radio"]:checked + [class*="radio__label"]:has-text("CCS")';
  }

  get TrialSelected(): string {
    return '[data-testid="trial-selected"], [class*="radio"]:checked + [class*="radio__label"]:has-text("Trial")';
  }
}
