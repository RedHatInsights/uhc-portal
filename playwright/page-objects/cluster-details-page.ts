import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import type { ClusterListPage } from './cluster-list-page';

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

  deleteClusterDialog(): Locator {
    return this.page.locator('[data-testid="delete-cluster-dialog"]');
  }

  async openDeleteClusterDialog(clusterName: string): Promise<void> {
    if (await this.deleteClusterDialog().isVisible()) {
      return;
    }

    await this.actionsDropdownToggle().click();
    await this.deleteClusterDropdownItem().click();
    await this.deleteClusterNameInput().fill(clusterName);
  }

  async waitForInstallerScreenToLoad(): Promise<void> {
    await expect(this.clusterNameTitle()).toBeVisible({ timeout: 100000 });
    await expect(this.clusterInstallationHeader()).toBeVisible({ timeout: 30000 });
  }

  async waitForDeleteClusterActionComplete(): Promise<void> {
    await this.deleteClusterDialog().waitFor({ state: 'detached', timeout: 100000 });
  }

  /**
   * Deletes the cluster via Actions → Delete cluster, with optional cooldown and 429 retry.
   * Use cooldown after suites that issue many clusters-mgmt mutations (e.g. day-2 channel tests).
   */
  async deleteClusterByName(
    clusterName: string,
    options: { cooldownMs?: number; maxAttempts?: number } = {},
  ): Promise<void> {
    const { cooldownMs = 0, maxAttempts = 3 } = options;

    if (cooldownMs > 0) {
      await this.page.waitForTimeout(cooldownMs);
    }

    await this.openDeleteClusterDialog(clusterName);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const responsePromise = this.page.waitForResponse(
        (response) =>
          response.request().method() === 'DELETE' &&
          /\/api\/clusters_mgmt\/v1\/clusters\/[^/?#]+/.test(response.url()),
        { timeout: 120000 },
      );
      await this.deleteClusterConfirm().click();

      const response = await responsePromise;
      if (response.status() === 429 && attempt < maxAttempts) {
        await this.page.waitForTimeout(5000 * attempt);
        continue;
      }

      if (!response.ok()) {
        const responseBody = await response.text().catch(() => '');
        throw new Error(
          `Delete cluster failed: ${response.status()} ${response.statusText()} (${response.url()})${responseBody ? ` — ${responseBody}` : ''}`,
        );
      }

      await this.waitForDeleteClusterActionComplete();
      return;
    }
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

  controlPlaneLogForwardingDescription(): Locator {
    return this.page.getByTestId('controlPlaneLogForwardingDescription');
  }

  controlPlaneLogForwardingViewDetailsLink(): Locator {
    return this.page.getByRole('link', { name: 'View details' });
  }

  // Installation screen elements
  clusterInstallationHeader(): Locator {
    return this.page.locator('h2, h3').filter({ hasText: 'Installing cluster' });
  }

  clusterInstallationExpectedText(): Locator {
    return this.page.getByText('Cluster creation usually takes 30 to 60 minutes to complete');
  }

  clusterInstallationExpectedTextRosaHcp(): Locator {
    return this.page.getByText('Cluster creation usually takes 10 minutes to complete');
  }

  async expectRosaHcpClusterInstallationInProgress(clusterName: string): Promise<void> {
    await this.waitForInstallerScreenToLoad();
    await expect(this.clusterNameTitle()).toContainText(clusterName);
    await expect(this.clusterInstallationHeader()).toBeVisible();
    await expect(this.downloadOcCliLink()).toBeVisible();
    await expect(this.clusterInstallationExpectedTextRosaHcp()).toBeVisible();
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

  // Tab navigation
  overviewTab(): Locator {
    return this.page.getByRole('tab', { name: 'Overview' });
  }

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

  // ── Autonode (Red Hat build of Karpenter) ────────────────────────────────

  autoNodeStatus(): Locator {
    return this.page.getByTestId('autoNodeStatus');
  }

  editAutoNodeButton(): Locator {
    return this.page.getByRole('button', { name: 'Edit Autonode settings' });
  }

  autoNodeIamRoleArnText(): Locator {
    return this.page.getByText('Autonode IAM role ARN:', { exact: false });
  }

  autoNodeKarpenterCountContainer(): Locator {
    return this.page.getByTestId('autoNodeKarpenterCountContainer');
  }

  autoNodeKarpenterCount(): Locator {
    return this.page.getByTestId('autoNodeKarpenterCount');
  }

  autoNodeKarpenterTooltipButton(): Locator {
    return this.page.getByRole('button', {
      name: 'More information about Autonode Karpenter nodes',
    });
  }

  autoNodeStatusAlert(): Locator {
    return this.page.getByRole('alert').filter({ hasText: 'Autonode status' });
  }

  editAutoNodeModal(): Locator {
    return this.page.getByRole('dialog').filter({
      has: this.page.getByRole('heading', { name: 'Edit Autonode settings', level: 1 }),
    });
  }

  editAutoNodeModalHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Edit Autonode settings', level: 1 });
  }

  enableAutoNodeSwitch(): Locator {
    return this.page.getByRole('switch', { name: 'Enable Autonode' });
  }

  autoNodeIamRoleArnInput(): Locator {
    return this.editAutoNodeModal().getByRole('textbox');
  }

  saveAutoNodeButton(): Locator {
    return this.editAutoNodeModal().getByRole('button', { name: 'Save' });
  }

  cancelAutoNodeButton(): Locator {
    return this.editAutoNodeModal().getByRole('button', { name: 'Cancel' });
  }

  async isAutoNodeSectionVisible(): Promise<void> {
    await expect(this.autoNodeStatus()).toBeVisible({ timeout: 30000 });
  }

  async checkAutoNodeSwitch(): Promise<void> {
    await this.enableAutoNodeSwitch().check({ force: true });
  }

  async uncheckAutoNodeSwitch(): Promise<void> {
    await this.enableAutoNodeSwitch().uncheck({ force: true });
  }

  async openEditAutoNodeModal(): Promise<void> {
    await this.editAutoNodeButton().click();
    await expect(this.editAutoNodeModalHeading()).toBeVisible({ timeout: 30000 });
  }

  async closeEditAutoNodeModal(): Promise<void> {
    await this.cancelAutoNodeButton().click();
    await expect(this.editAutoNodeModalHeading()).toBeHidden({ timeout: 30000 });
  }

  async enableAutoNodeWithArn(iamRoleArn: string): Promise<void> {
    await this.checkAutoNodeSwitch();
    await this.autoNodeIamRoleArnInput().fill(iamRoleArn);
    await this.saveAutoNodeButton().click();
    await expect(this.editAutoNodeModalHeading()).toBeHidden({ timeout: 30000 });
  }

  // Delete protection – Overview tab
  deleteProtectionTerm(): Locator {
    return this.page.getByRole('term').filter({ hasText: 'Delete Protection' });
  }

  deleteProtectionEnableButton(): Locator {
    return this.page.getByRole('button', { name: 'Enable delete protection' });
  }

  deleteProtectionDisableButton(): Locator {
    return this.page.getByRole('button', { name: 'Disable delete protection' });
  }

  deleteProtectionModalDialog(): Locator {
    return this.page.getByTestId('delete-protection-dialog');
  }

  deleteProtectionModalHeading(action: 'Enable' | 'Disable'): Locator {
    return this.page.getByRole('heading', {
      name: `${action} deletion protection`,
    });
  }

  deleteProtectionModalPrimaryButton(): Locator {
    return this.deleteProtectionModalDialog().getByTestId('btn-primary');
  }

  deleteProtectionModalCancelButton(): Locator {
    return this.deleteProtectionModalDialog().getByRole('button', { name: 'Cancel' });
  }

  async openEnableDeleteProtectionModal(): Promise<void> {
    await this.deleteProtectionEnableButton().click();
    await expect(this.deleteProtectionModalHeading('Enable')).toBeVisible({ timeout: 10000 });
  }

  async openDisableDeleteProtectionModal(): Promise<void> {
    await this.deleteProtectionDisableButton().click();
    await expect(this.deleteProtectionModalHeading('Disable')).toBeVisible({ timeout: 10000 });
  }

  async cancelDeleteProtectionModal(): Promise<void> {
    await this.deleteProtectionModalCancelButton().click();
    await expect(this.deleteProtectionModalDialog()).toBeHidden({ timeout: 10000 });
  }

  async enableDeleteProtection(): Promise<void> {
    await this.deleteProtectionEnableButton().click();
    await expect(this.deleteProtectionModalHeading('Enable')).toBeVisible({ timeout: 10000 });
    await this.deleteProtectionModalPrimaryButton().click();
    await expect(this.deleteProtectionModalDialog()).toBeHidden({ timeout: 30000 });
  }

  async disableDeleteProtection(): Promise<void> {
    await this.deleteProtectionDisableButton().click();
    await expect(this.deleteProtectionModalHeading('Disable')).toBeVisible({ timeout: 10000 });
    await this.deleteProtectionModalPrimaryButton().click();
    await expect(this.deleteProtectionModalDialog()).toBeHidden({ timeout: 30000 });
  }

  deleteProtectionDropdownTooltip(): Locator {
    return this.page.getByTestId('delete-protection-tooltip');
  }

  async openActionsDropdown(): Promise<void> {
    await this.actionsDropdownToggle().click();
    await expect(this.deleteClusterDropdownItem()).toBeVisible({ timeout: 5000 });
  }

  async closeActionsDropdown(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.deleteClusterDropdownItem()).toBeHidden({ timeout: 5000 });
  }

  // ── Day 2 Log Forwarding (Settings tab) ──────────────────────────────────

  logForwardingSectionHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Control plane log forwarding', level: 2 });
  }

  logForwardingEmptyState(): Locator {
    return this.page.getByText('No log forwarding configured.');
  }

  addConfigurationButton(): Locator {
    return this.page.getByRole('button', { name: 'Add configuration' });
  }

  async hoverAddConfigurationButton(): Promise<Locator> {
    await this.addConfigurationButton().hover({ force: true });
    return this.page.getByRole('tooltip');
  }

  addConfigurationMenuItem(destination: 'Amazon S3' | 'CloudWatch'): Locator {
    return this.page.getByRole('menuitem', { name: destination });
  }

  logForwardingCardTitle(title: 'Amazon S3' | 'CloudWatch'): Locator {
    return this.page.getByRole('heading', { name: title, level: 3 });
  }

  logForwardingCardKebab(title: 'Amazon S3' | 'CloudWatch'): Locator {
    return this.page.getByRole('button', { name: `${title} configuration actions` });
  }

  editConfigurationMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Edit configuration' });
  }

  deleteConfigurationMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Delete configuration' });
  }

  logForwardingModalHeading(action: 'Add' | 'Edit' | 'Delete', destination: string): Locator {
    return this.page.getByText(`${action} ${destination} configuration`);
  }

  logForwardingBucketNameInput(): Locator {
    return this.page.getByRole('textbox', { name: /Bucket name/i });
  }

  logForwardingBucketPrefixInput(): Locator {
    return this.page.getByRole('textbox', { name: /Bucket prefix/i });
  }

  logForwardingLogGroupNameInput(): Locator {
    return this.page.getByRole('textbox', { name: /Log group name/i });
  }

  logForwardingRoleArnInput(): Locator {
    return this.page.getByRole('textbox', { name: /Role ARN/i });
  }

  logForwardingPrerequisiteCheckbox(): Locator {
    return this.page.getByLabel(
      "I've read and completed all the prerequisites and am ready to continue.",
    );
  }

  logForwardingSubmitButton(): Locator {
    return this.page.getByTestId('log-forwarding-submit-btn');
  }

  logForwardingModalCancelButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  deleteLogForwardingConfirmButton(): Locator {
    return this.page.getByRole('button', { name: 'Delete configuration' });
  }

  logForwardingDeleteDescription(): Locator {
    return this.page.getByRole('dialog').getByRole('paragraph');
  }

  logForwardingSelectedGroupsHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Selected groups and applications' });
  }

  logForwardingGroupCategory(category: string): Locator {
    return this.page.getByRole('list', { name: category });
  }

  logForwardingGroupLabel(category: string, label: string): Locator {
    return this.logForwardingGroupCategory(category)
      .getByRole('listitem')
      .filter({ hasText: label });
  }

  logForwardingPropertyValue(cardTitle: string, label: string, value: string): Locator {
    return this.page
      .getByRole('group', { name: `${cardTitle} ${label}` })
      .getByText(value, { exact: true });
  }

  async isLogForwardingSectionVisible(): Promise<void> {
    await expect(this.logForwardingSectionHeading()).toBeVisible({ timeout: 30000 });
  }

  async navigateToOverviewTab(): Promise<void> {
    await this.overviewTab().click();
    await expect(this.clusterNameTitle()).toBeVisible({ timeout: 30000 });
  }

  async navigateToSettingsTab(): Promise<void> {
    await this.settingsTab().click();
    await expect(this.page.getByText('Update strategy')).toBeVisible({ timeout: 30000 });
  }

  async scrollToLogForwardingSection(): Promise<void> {
    await this.logForwardingSectionHeading().scrollIntoViewIfNeeded();
    await expect(this.logForwardingSectionHeading()).toBeVisible({ timeout: 30000 });
  }

  async openAddConfigurationMenu(destination: 'Amazon S3' | 'CloudWatch'): Promise<void> {
    await this.addConfigurationButton().click();
    await this.addConfigurationMenuItem(destination).click();
  }

  async fillS3Configuration(bucketName: string, bucketPrefix: string): Promise<void> {
    await this.logForwardingBucketNameInput().fill(bucketName);
    await this.logForwardingBucketPrefixInput().fill(bucketPrefix);
  }

  async fillCloudWatchConfiguration(logGroupName: string, roleArn: string): Promise<void> {
    await this.logForwardingLogGroupNameInput().clear();
    await this.logForwardingLogGroupNameInput().fill(logGroupName);
    await this.logForwardingRoleArnInput().fill(roleArn);
  }

  async deleteLogForwardingIfExists(destination: 'Amazon S3' | 'CloudWatch'): Promise<void> {
    const card = this.logForwardingCardTitle(destination);
    try {
      await card.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      return;
    }
    await this.openCardKebabAction(destination, 'Delete configuration');
    await this.confirmDeleteLogForwarding();
    await expect(card).toBeHidden({ timeout: 30000 });
  }

  async selectLogForwardingGroup(groupName: string): Promise<void> {
    const tree = this.page.getByRole('tree', { name: 'Select groups and applications' });
    await tree.waitFor({ state: 'visible', timeout: 30000 });
    const item = tree.getByRole('treeitem', { name: groupName });
    const checkbox = item.getByRole('checkbox');
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }

  async selectAllLogForwardingGroups(): Promise<void> {
    const tree = this.page.getByRole('tree', { name: 'Select groups and applications' });
    await tree.getByRole('checkbox').first().waitFor({ state: 'visible', timeout: 30000 });

    const checkboxes = tree.getByRole('checkbox');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      const cb = checkboxes.nth(i);
      if (!(await cb.isChecked())) {
        await cb.check();
      }
    }
  }

  async submitLogForwardingModal(): Promise<void> {
    await this.logForwardingSubmitButton().click();
    await expect(this.logForwardingSubmitButton()).toBeHidden({ timeout: 30000 });
  }

  async openCardKebabAction(
    cardTitle: 'Amazon S3' | 'CloudWatch',
    action: 'Edit configuration' | 'Delete configuration',
  ): Promise<void> {
    await this.logForwardingCardKebab(cardTitle).click();
    if (action === 'Edit configuration') {
      await this.editConfigurationMenuItem().click();
    } else {
      await this.deleteConfigurationMenuItem().click();
    }
  }

  async confirmDeleteLogForwarding(): Promise<void> {
    await this.deleteLogForwardingConfirmButton().click();
    await expect(this.deleteLogForwardingConfirmButton()).toBeHidden({ timeout: 30000 });
  }

  /** Cluster details tab label is "Settings"; panel aria-label is "Upgrade settings". */
  upgradeSettingsTab(): Locator {
    return this.settingsTab();
  }

  upgradeSettingsPanel(): Locator {
    return this.page.getByRole('tabpanel', { name: 'Upgrade settings' });
  }

  async openOverviewTab(): Promise<void> {
    await this.overviewTab().click();
    await this.waitForClusterDetailsLoad();
  }

  async openUpgradeSettingsTab(): Promise<void> {
    await this.settingsTab().click();
    await this.upgradeSettingsPanel().waitFor({ state: 'visible', timeout: 30000 });
    await this.waitForClusterDetailsLoad();
  }

  upgradeSettingsSaveButton(): Locator {
    return this.upgradeSettingsPanel().getByRole('button', { name: 'Save' });
  }

  async saveUpgradeSettingsIfNeeded(): Promise<void> {
    const saveButton = this.upgradeSettingsSaveButton();
    await saveButton.scrollIntoViewIfNeeded();

    if ((await saveButton.getAttribute('aria-disabled')) === 'true') {
      return;
    }

    const isUpgradePolicyMutationResponse = (url: string, method: string): boolean =>
      /control_plane\/upgrade_policies|upgrade_policies|upgrade.*polic/i.test(url) &&
      !url.includes('dryRun=true') &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    const waitForSaveResponse = () =>
      this.page.waitForResponse(
        (response) => isUpgradePolicyMutationResponse(response.url(), response.request().method()),
        { timeout: 120000 },
      );

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const saveResponsePromise = waitForSaveResponse();
      await saveButton.click();

      const response = await saveResponsePromise;
      if (response.status() === 429 && attempt < maxAttempts) {
        await this.page.waitForTimeout(5000 * attempt);
        continue;
      }

      if (!response.ok()) {
        const responseBody = await response.text().catch(() => '');
        throw new Error(
          `Upgrade settings save failed: ${response.status()} ${response.statusText()} (${response.url()})${responseBody ? ` — ${responseBody}` : ''}`,
        );
      }

      await expect(saveButton).toHaveAttribute('aria-disabled', 'true', { timeout: 120000 });
      return;
    }
  }

  async expectChannelSettingsEditDisabled(): Promise<void> {
    await expect(this.channelSettingsHeading()).toBeVisible({ timeout: 60000 });

    const editButton = this.channelSettingsEditButton();
    await editButton.scrollIntoViewIfNeeded();
    await expect(editButton).toBeVisible();
    await expect(editButton).toBeDisabled();
  }

  async ensureUpdateStrategy(updateStrategy: string): Promise<void> {
    await this.openUpgradeSettingsTab();
    const panel = this.upgradeSettingsPanel();

    if (updateStrategy === 'Recurring updates') {
      const recurringRadio = panel.getByTestId('upgrade_policy-automatic');
      if (!(await recurringRadio.isChecked())) {
        await recurringRadio.check();
      }
      await expect(recurringRadio).toBeChecked();
      await this.saveUpgradeSettingsIfNeeded();
      await this.expectChannelSettingsEditDisabled();
      return;
    }

    if (updateStrategy === 'Individual updates') {
      const individualRadio = panel.getByTestId('upgrade_policy-manual');
      const recurringRadio = panel.getByTestId('upgrade_policy-automatic');

      if (await recurringRadio.isChecked()) {
        await individualRadio.check();
        await expect(individualRadio).toBeChecked();
        await this.saveUpgradeSettingsIfNeeded();
      } else if (!(await individualRadio.isChecked())) {
        await individualRadio.check();
        await this.saveUpgradeSettingsIfNeeded();
      }

      await expect(this.channelSettingsEditButton()).not.toHaveAttribute('aria-disabled', 'true', {
        timeout: 120000,
      });
    }
  }

  channelLoadingIndicator(): Locator {
    return this.page.getByLabel('Loading channel');
  }

  async waitForOverviewChannelReady(): Promise<void> {
    await this.openOverviewTab();
    await this.waitForClusterDetailsLoad();
    await expect(this.channelLoadingIndicator()).not.toBeVisible({ timeout: 120000 });
    await expect(this.overviewChannelValue()).toBeVisible({ timeout: 60000 });
  }

  /** Switches to Individual updates and waits until Overview channel edit is enabled. */
  async ensureIndividualUpdatesForChannelEdit(): Promise<void> {
    await this.waitForOverviewChannelReady();
    const editButton = this.channelEditButton();
    await editButton.scrollIntoViewIfNeeded();

    if ((await editButton.getAttribute('aria-disabled')) !== 'true') {
      return;
    }

    await this.ensureUpdateStrategy('Individual updates');
    await this.waitForOverviewChannelReady();
    await expect(editButton).not.toHaveAttribute('aria-disabled', 'true', {
      timeout: 120000,
    });
  }

  /** Details card on the Overview tab (left column). */
  overviewDetailsCard(): Locator {
    return this.page.locator('.ocm-c-overview-details__card');
  }

  overviewChannelTerm(): Locator {
    return this.overviewDetailsCard()
      .getByRole('term')
      .filter({ has: this.page.getByText('Channel', { exact: true }) });
  }

  /** Channel row in Overview Details (parent of term + definition). */
  overviewChannelRow(): Locator {
    return this.overviewChannelTerm().locator('..');
  }

  overviewChannelValue(): Locator {
    return this.overviewChannelRow()
      .getByRole('definition')
      .filter({ hasText: /stable-|fast-|eus-|candidate-|N\/A/ });
  }

  channelGroupOverviewLabel(): Locator {
    return this.overviewDetailsCard().getByText('Channel group', { exact: true });
  }

  /** Pencil edit control on Overview → Details Channel row. */
  overviewChannelEditButton(): Locator {
    return this.overviewChannelRow().getByRole('button', { name: 'Edit channel' });
  }

  /** "Channel settings" card title in the Settings tab sidebar (Y-stream). */
  channelSettingsHeading(): Locator {
    return this.upgradeSettingsPanel().getByText('Channel settings', { exact: true });
  }

  /**
   * Pencil in Channel settings sidebar (`data-testid="channelModal"`, `aria-label="Edit channel"`).
   * Scoped to #upgradeSettingsContent so it does not match Overview Channel edit.
   * Disabled state is aria-disabled="true" with class pf-m-aria-disabled (not native disabled).
   */
  channelSettingsEditButton(): Locator {
    return this.upgradeSettingsPanel().getByTestId('channelModal');
  }

  /** Opens Settings and asserts the Channel settings card and edit pencil are visible. */
  async expectChannelSettingsSectionWithPencil(): Promise<void> {
    await this.openUpgradeSettingsTab();
    await expect(this.channelSettingsHeading()).toBeVisible({ timeout: 60000 });

    const editPencil = this.channelSettingsEditButton();
    await editPencil.scrollIntoViewIfNeeded();
    await expect(editPencil).toBeVisible();
  }

  /** Asserts the Channel settings pencil is visible and editable (ready cluster, no scheduled policy). */
  async expectChannelSettingsEditEditable(): Promise<void> {
    await expect(this.channelSettingsHeading()).toBeVisible({ timeout: 60000 });

    const editButton = this.channelSettingsEditButton();
    await editButton.scrollIntoViewIfNeeded();
    await expect(editButton).toBeVisible();
    await expect(editButton).toBeEnabled();
    await expect(this.channelEditScheduledPolicyTooltip()).not.toBeVisible();
  }

  channelEditButton(): Locator {
    return this.overviewChannelEditButton();
  }

  channelOverviewHintButton(): Locator {
    return this.overviewChannelTerm().getByRole('button', { name: 'More information' });
  }

  channelOverviewPopover(): Locator {
    return this.page
      .getByRole('dialog', { name: 'help' })
      .filter({ hasText: /Channels provide recommended/i });
  }

  channelOverviewLearnMoreLink(): Locator {
    return this.channelOverviewPopover().getByRole('link', { name: 'Learn more' });
  }

  editChannelModal(): Locator {
    return this.page.getByRole('dialog', { name: 'Edit channel' });
  }

  editChannelModalChannelSelect(): Locator {
    return this.editChannelModal().getByLabel('Channel select input');
  }

  editChannelModalSaveButton(): Locator {
    return this.editChannelModal().getByRole('button', { name: 'Save' });
  }

  editChannelModalCancelButton(): Locator {
    return this.editChannelModal().getByRole('link', { name: 'Cancel' });
  }

  editChannelModalCloseButton(): Locator {
    return this.editChannelModal().getByRole('button', { name: 'Close' });
  }

  editChannelModalErrorAlert(): Locator {
    return this.editChannelModal().getByRole('alert');
  }

  channelEditScheduledPolicyTooltip(): Locator {
    return this.page.getByText(
      'Channel editing is not available while an upgrade policy is scheduled.',
    );
  }

  async openEditChannelModal(
    editButton: Locator = this.overviewChannelEditButton(),
  ): Promise<void> {
    await editButton.scrollIntoViewIfNeeded();
    // PatternFly EditButton uses aria-disabled (recurring policy, schedules loading, or cluster not ready).
    await expect(editButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 60000 });
    await editButton.click();
    await expect(this.editChannelModal()).toBeVisible({ timeout: 30000 });
  }

  async selectEditChannelModalOption(channel: string): Promise<void> {
    const select = this.editChannelModalChannelSelect();
    await this.expectEditChannelModalHasOption(channel);
    await select.selectOption(channel);
  }

  async expectEditChannelModalHasOption(channel: string): Promise<void> {
    await expect(
      this.editChannelModalChannelSelect().getByRole('option', { name: channel, exact: true }),
    ).toHaveCount(1);
  }

  async navigateToClusterByName(
    clusterListPage: ClusterListPage,
    clusterName: string,
  ): Promise<void> {
    await clusterListPage.isClusterListScreen();
    await clusterListPage.filterTxtField().fill(clusterName);
    await clusterListPage.waitForDataReady();
    await clusterListPage.openClusterDefinition(clusterName);
    await this.waitForClusterDetailsLoad();
  }

  // ── Alerts and Recommendations ──────────────────────────────────────────

  alertsAndRecommendationsToggle(): Locator {
    return this.page.getByRole('button', { name: /Alerts and recommendations/i });
  }

  async expandAlertsAndRecommendations(): Promise<void> {
    const toggle = this.alertsAndRecommendationsToggle();
    const isExpanded = await toggle.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await toggle.click();
    }
  }

  // ── Identity Provider Hint Alert ────────────────────────────────────────

  idpHintAlert(): Locator {
    return this.page.getByText('Create an identity provider to access cluster');
  }

  idpHintDescription(): Locator {
    return this.page.getByText(
      'Identity providers determine how you can log into the cluster',
    );
  }

  createIdentityProviderButton(): Locator {
    return this.page.getByRole('button', { name: 'Create identity provider' });
  }

  // ── Recommended Operators Alert ────────────────────────────────────────

  recommendedOperatorsAlert(): Locator {
    return this.page.getByText(
      /Optimize your cluster with operators|Your cluster is being created|Action is required/,
    );
  }

  recommendedOperatorsExpandToggle(): Locator {
    return this.page.getByRole('button', { name: /recommended operators/i });
  }

  recommendedOperatorsAlertCloseButton(): Locator {
    return this.page.getByRole('button', {
      name: /Close Info alert.*(?:Optimize your cluster|Your cluster is being created|Action is required)/i,
    });
  }

  productCard(productName: string): Locator {
    return this.page
      .getByTestId('product-overview-card')
      .filter({ hasText: productName });
  }

  productCardLearnMoreButton(productName: string): Locator {
    return this.productCard(productName).getByRole('button', { name: 'Learn more' });
  }

  allProductCards(): Locator {
    return this.page.getByTestId('product-overview-card');
  }

  drawerCloseButton(): Locator {
    return this.page.getByTestId('drawer-close-button');
  }

  drawerProductHeading(productName: string): Locator {
    return this.page.getByRole('heading', { name: productName, level: 2 });
  }

  async expandRecommendedOperators(): Promise<void> {
    const toggle = this.recommendedOperatorsExpandToggle();
    const isExpanded = await toggle.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await toggle.click();
    }
    await expect(this.page.getByTestId('product-overview-card').first()).toBeVisible({
      timeout: 10000,
    });
  }

  async collapseRecommendedOperators(): Promise<void> {
    const toggle = this.recommendedOperatorsExpandToggle();
    const isExpanded = await toggle.getAttribute('aria-expanded');
    if (isExpanded === 'true') {
      await toggle.click();
    }
    await expect(this.page.getByTestId('product-overview-card').first()).toBeHidden({
      timeout: 10000,
    });
  }

  async openProductDrawer(productName: string): Promise<void> {
    await this.productCardLearnMoreButton(productName).click();
    await expect(this.drawerCloseButton()).toBeVisible({ timeout: 10000 });
  }

  async closeDrawer(): Promise<void> {
    await this.drawerCloseButton().click();
    await expect(this.drawerCloseButton()).toBeHidden({ timeout: 10000 });
  }

  async dismissRecommendedOperatorsAlert(): Promise<void> {
    await this.recommendedOperatorsAlertCloseButton().click();
    await expect(this.recommendedOperatorsAlert()).toBeHidden({ timeout: 10000 });
  }
}
