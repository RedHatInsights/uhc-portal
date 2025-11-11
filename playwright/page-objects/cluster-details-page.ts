import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Cluster Details page object for Playwright tests
 */
export class ClusterDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isClusterDetailsPage(displayName: string): Promise<void> {
    await expect(this.page.locator('.cl-details-page-title')).toContainText(displayName, {
      timeout: 30000,
    });
  }

  addConsoleURLButton(): Locator {
    return this.page.getByRole('button', { name: 'Add console URL' });
  }

  openConsoleButton(): Locator {
    return this.page.getByTestId('console-url-link').locator('button').first();
  }

  editConsoleURLDialogInput(): Locator {
    return this.page.locator('input[id="edit-console-url-input"]');
  }

  editConsoleURLDialogConfirm(): Locator {
    return this.page
      .locator('div[aria-label="Add console URL"]')
      .locator('footer')
      .locator('button')
      .filter({ hasText: 'Add URL' });
  }

  openConsoleLink(): Locator {
    return this.page.getByTestId('console-url-link');
  }

  actionsDropdownToggle(): Locator {
    return this.page.getByTestId('cluster-actions-dropdown');
  }

  editDisplayNameDropdownItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Edit display name' });
  }

  editDisplayNameInput(): Locator {
    return this.page.locator('input[id="edit-display-name-input"]');
  }

  editDisplaynameConfirm(): Locator {
    return this.page
      .locator('div[aria-label="Edit display name"]')
      .locator('footer')
      .locator('button')
      .first();
  }

  archiveClusterDropdownItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Archive cluster' });
  }

  archiveClusterDialogConfirm(): Locator {
    return this.page
      .locator('div[aria-label="Archive cluster"]')
      .locator('footer')
      .locator('button')
      .first();
  }

  archivedClusterSuccessNotification(): Locator {
    return this.page.getByRole('heading', {
      name: /Success alert: Cluster .* has been archived$/,
    });
  }

  unarchivedClusterSuccessNotification(): Locator {
    return this.page.getByRole('heading', {
      name: /Success alert: Cluster .* has been unarchived$/,
    });
  }
  unarchiveClusterButton(): Locator {
    return this.page.locator('[id="cl-details-btns"]').getByRole('button', { name: 'Unarchive' });
  }

  unarchiveClusterDialogConfirm(): Locator {
    return this.page.getByRole('button', { name: 'Unarchive cluster' });
  }

  clusterNameTitle(): Locator {
    return this.page.locator('h1.cl-details-page-title');
  }

  editSubscriptionSettingsLink(): Locator {
    // return this.page.locator('#cl-details-top button:has-text("Edit subscription settings")');
    return this.page.getByRole('button', { name: 'Edit subscription settings' });
  }

  serviceLevelAgreementPremiumRadio(): Locator {
    return this.page.locator('input[value="Premium"]');
  }

  clusterUsageProductionRadio(): Locator {
    return this.page.locator('input[value="Production"]');
  }

  subscriptionUnitsSocketsRadio(): Locator {
    return this.page.locator('input[value="Sockets"]');
  }

  numberOfSocketsInput(): Locator {
    return this.page.locator('input[name="socket_total"]');
  }

  saveSubscriptionButton(): Locator {
    return this.page.getByTestId('btn-primary');
  }

  subscriptionTypeValue(): Locator {
    return this.page.getByTestId('subscription-type');
  }

  serviceLevelAgreementValue(): Locator {
    return this.page.getByTestId('service-level-agreement');
  }

  clusterUsageValue(): Locator {
    return this.page.getByTestId('cluster-usage');
  }

  subscriptionUnitsValue(): Locator {
    return this.page.getByTestId('subscription-units');
  }

  coresOrSocketsValue(): Locator {
    return this.page.getByTestId('cores-or-sockets');
  }

  supportTypeValue(): Locator {
    return this.page.getByTestId('support-type');
  }

  async waitForEditUrlModalToLoad(): Promise<void> {
    await this.page
      .getByTestId('edit-console-url-dialog')
      .waitFor({ state: 'visible', timeout: 30000 });
    await this.page
      .locator('input[id="edit-console-url-input"]')
      .waitFor({ state: 'visible', timeout: 30000 });
  }

  async waitForEditUrlModalToClear(): Promise<void> {
    await this.page
      .getByTestId('edit-console-url-dialog')
      .waitFor({ state: 'detached', timeout: 30000 });
  }

  async waitForEditDisplayNameModalToLoad(): Promise<void> {
    await this.page
      .getByTestId('edit-displayname-modal')
      .waitFor({ state: 'visible', timeout: 30000 });
    await this.page
      .locator('input[id="edit-display-name-input"]')
      .waitFor({ state: 'visible', timeout: 30000 });
  }

  async waitForEditDisplayNameModalToClear(): Promise<void> {
    await this.page
      .getByTestId('edit-displayname-modal')
      .waitFor({ state: 'detached', timeout: 30000 });
  }

  async waitForDisplayNameChange(originalDisplayName: string): Promise<void> {
    await expect(this.page.locator('h1.cl-details-page-title')).not.toHaveText(
      originalDisplayName,
      { timeout: 30000 },
    );
  }

  async waitForArchiveClusterModalToLoad(): Promise<void> {
    await this.page
      .getByTestId('archive-cluster-dialog')
      .waitFor({ state: 'visible', timeout: 30000 });
    await expect(this.page.getByRole('button', { name: 'Archive cluster' })).toBeVisible({
      timeout: 30000,
    });
  }

  async waitForUnarchiveClusterModalToLoad(): Promise<void> {
    await this.page
      .locator('[aria-label="Unarchive cluster"]')
      .waitFor({ state: 'visible', timeout: 30000 });
    await expect(this.page.getByRole('button', { name: 'Unarchive cluster' })).toBeVisible();
  }

  async waitForClusterDetailsLoad(): Promise<void> {
    await this.page
      .locator('div.ins-c-spinner.cluster-details-spinner')
      .waitFor({ state: 'detached', timeout: 30000 });
  }

  // ROSA cluster installation methods
  deleteClusterDropdownItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Delete cluster' });
  }

  deleteClusterNameInput(): Locator {
    return this.page.locator('input[aria-label="cluster name"]');
  }

  deleteClusterConfirm(): Locator {
    return this.page
      .locator('div[aria-label="Delete cluster"]')
      .locator('footer')
      .locator('button')
      .first();
  }

  async waitForInstallerScreenToLoad(): Promise<void> {
    await this.page.waitForSelector('li.pf-v6-c-wizard__nav-item', {
      state: 'detached',
      timeout: 30000,
    });
    await this.page.waitForSelector('div.cluster-loading-container', {
      state: 'detached',
      timeout: 100000,
    });
  }

  async waitForDeleteClusterActionComplete(): Promise<void> {
    await this.page.waitForSelector('[data-testid="delete-cluster-dialog"] div.ins-c-spinner', {
      state: 'detached',
      timeout: 100000,
    });
  }

  async checkInstallationStepStatus(step: string, status: string = ''): Promise<void> {
    const installStep = this.page
      .locator('div.pf-v6-c-progress-stepper__step-title')
      .filter({ hasText: step });

    await expect(installStep).toBeVisible({ timeout: 80000 });

    if (status !== '' && status === 'Completed') {
      await expect(installStep.locator('..').locator('..').locator('li')).toHaveClass(
        /pf-m-success/,
      );
    }
  }

  async clusterDetailsPageRefresh(): Promise<void> {
    await this.page.reload();
    await this.waitForClusterDetailsLoad();
  }

  // Cluster property getters
  clusterTypeLabelValue(): Locator {
    return this.page.getByTestId('clusterType');
  }

  clusterDomainPrefixLabelValue(): Locator {
    return this.page.getByTestId('domainPrefix');
  }

  clusterControlPlaneTypeLabelValue(): Locator {
    return this.page.getByTestId('controlPlaneType');
  }

  clusterRegionLabelValue(): Locator {
    return this.page.getByTestId('region');
  }

  clusterAvailabilityLabelValue(): Locator {
    return this.page.getByTestId('availability');
  }

  clusterInfrastructureAWSaccountLabelValue(): Locator {
    return this.page.getByTestId('infrastructureAWSAccount');
  }

  clusterBillingMarketplaceAccountLabelValue(): Locator {
    return this.page.getByTestId('billingMarketplaceAccountLink');
  }

  clusterMachineCIDRLabelValue(): Locator {
    return this.page.getByTestId('machineCIDR');
  }

  clusterServiceCIDRLabelValue(): Locator {
    return this.page.getByTestId('serviceCIDR');
  }

  clusterPodCIDRLabelValue(): Locator {
    return this.page.getByTestId('podCIDR');
  }

  clusterHostPrefixLabelValue(): Locator {
    return this.page.getByTestId('hostPrefix');
  }

  // Additional cluster property getters for advanced settings
  clusterFipsCryptographyStatus(): Locator {
    return this.page.getByTestId('fipsCryptographyStatus');
  }

  clusterIMDSValue(): Locator {
    return this.page.getByTestId('instanceMetadataService');
  }

  clusterAutoScalingStatus(): Locator {
    return this.page.getByTestId('clusterAutoscalingStatus');
  }

  clusterAdditionalEncryptionStatus(): Locator {
    return this.page.getByTestId('etcEncryptionStatus');
  }

  // Installation screen elements
  clusterInstallationHeader(): Locator {
    return this.page.locator('h2, h3').filter({ hasText: 'Installing cluster' });
  }

  clusterInstallationExpectedText(): Locator {
    return this.page.getByText('Cluster creation usually takes 30 to 60 minutes to complete');
  }

  downloadOcCliLink(): Locator {
    return this.page.getByRole('link', { name: 'Download OC CLI' });
  }

  // Additional cluster property getters for review screen
  clusterSubscriptionBillingModelValue(): Locator {
    return this.page.getByTestId('subscription-billing-model');
  }

  clusterInfrastructureBillingModelValue(): Locator {
    return this.page.getByTestId('infrastructure-billing-model');
  }

  clusterSecureBootSupportForShieldedVMsValue(): Locator {
    return this.page.getByTestId('secureBootSupportForShieldedVMs');
  }

  clusterAuthenticationTypeLabelValue(): Locator {
    return this.page.getByTestId('authenticationType');
  }

  clusterWifConfigurationValue(): Locator {
    return this.page.getByTestId('wifConfiguration');
  }

  // Settings tab functionality
  settingsTab(): Locator {
    return this.page.getByRole('tab', { name: 'Settings' });
  }

  enableUserWorkloadMonitoringCheckbox(): Locator {
    return this.page.locator('input[id="enable_user_workload_monitoring"]');
  }

  individualUpdatesRadioButton(): Locator {
    return this.page.getByTestId('upgrade_policy-manual');
  }

  recurringUpdatesRadioButton(): Locator {
    return this.page.getByTestId('upgrade_policy-automatic');
  }

  // Additional cluster property getters for persistent storage
  clusterPersistentStorageLabelValue(): Locator {
    return this.page.getByTestId('persistent-storage');
  }
}
