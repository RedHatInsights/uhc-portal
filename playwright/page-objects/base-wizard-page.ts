import { Locator, expect } from '@playwright/test';

import { BasePage } from './base-page';

/**
 * Shared wizard page object for OSD and ROSA create-cluster flows.
 * common wizard actions that are identical across products. Product-specific logic stays in:
 *   - CreateRosaWizardPage (ROSA-specific)
 *   - CreateOSDWizardPage (OSD-specific)
 * Hierarchy:
 *   BasePage → BaseWizardPage → CreateOSDWizardPage | CreateRosaWizardPage
 */
export abstract class BaseWizardPage extends BasePage {

  wizardNextButton(): Locator {
    return this.page.getByTestId('wizard-next-button');
  }

  wizardBackButton(): Locator {
    return this.page.getByTestId('wizard-back-button');
  }

  wizardCancelButton(): Locator {
    return this.page.getByTestId('wizard-cancel-button');
  }

  async waitAndClick(buttonLocator: Locator, timeout: number = 60000): Promise<void> {
    await buttonLocator.waitFor({ state: 'visible', timeout });
    await buttonLocator.click();
  }

  async closePopoverDialogs(): Promise<void> {
    const closeButtons = this.page.getByRole('button', { name: 'Close' });
    const count = await closeButtons.count();

    for (let i = 0; i < count; i++) {
      const button = closeButtons.nth(i);
      try {
        if (await button.isVisible()) {
          await button.click();
        }
      } catch {
        // Continue if a close button is not clickable
      }
    }
  }

  /**
   * Click Next, then dismiss any info popovers that reappear and retry Next
   * until none remain (version/channel helper dialogs on Cluster details).
   */
  async closePopoverAndNavigateNext(): Promise<void> {
    const maxAttempts = 10;
    await this.wizardNextButton().click();
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const closeButtons = this.page.getByRole('button', { name: 'Close' });
      const count = await closeButtons.count();
      if (count === 0) {
        return;
      }
      await this.closePopoverDialogs();
      await this.wizardNextButton().click();
    }
  }

  // ── Version (FuzzySelect) ─────────────────────────────────────────────────

  /** FuzzySelect MenuToggle for cluster version (`aria-label="Options menu"`). */
  versionDropdownToggle(): Locator {
    return this.page.getByRole('button', { name: 'Options menu' });
  }

  versionLoadingIndicator(): Locator {
    return this.page.getByLabel('Loading...');
  }

  /** Version options live in the FuzzySelect listbox, not native `<select>` options. */
  versionDropdownOption(version: string): Locator {
    return this.page
      .getByRole('listbox', { name: 'Select options list' })
      .getByRole('option', { name: version, exact: true });
  }

  /** Version dropdown option labels like "4.16.0 (fast)". */
  versionOptionsByChannel(channel: string): Locator {
    return this.page.getByRole('option', {
      name: new RegExp(`\\(${this.escapeRegExp(channel)}\\)`),
    });
  }

  versionFieldLabel(): Locator {
    return this.page.getByText('Version', { exact: true }).first();
  }

  /**
   * Product-specific: navigate back to Cluster details if needed.
   * Implemented by CreateOSDWizardPage / CreateRosaWizardPage.
   */
  abstract ensureClusterDetailsScreen(): Promise<void>;

  async waitForInstallableVersionsLoaded(): Promise<void> {
    await this.ensureClusterDetailsScreen();
    await this.versionDropdownToggle().waitFor({ state: 'visible', timeout: 90000 });
    const loading = this.versionLoadingIndicator();
    if (await loading.isVisible().catch(() => false)) {
      await loading.waitFor({ state: 'hidden', timeout: 120000 });
    }
  }

  async selectVersion(version: string): Promise<void> {
    if (version !== '') {
      await this.waitForInstallableVersionsLoaded();
      await this.versionDropdownToggle().click();
      await this.versionDropdownOption(version).click();
    }
  }

  // ── Channel (FormSelect / Y-stream) ───────────────────────────────────────

  /** Channel FormSelect (`getByRole` preferred over `getByLabel`). */
  channelSelect(): Locator {
    return this.page.getByRole('combobox', { name: 'Channel' });
  }

  /** Channel combobox options like "fast-4.16". */
  channelSelectOptionsByPrefix(prefix: string): Locator {
    return this.channelSelect().getByRole('option', {
      name: new RegExp(`^${this.escapeRegExp(prefix)}-`),
    });
  }

  channelGroupSelect(): Locator {
    return this.page.getByRole('combobox', { name: 'Channel group' });
  }

  channelFieldLabel(): Locator {
    return this.page.getByText('Channel', { exact: true });
  }

  async selectChannel(channel: string): Promise<void> {
    await this.channelSelect().waitFor({ state: 'visible', timeout: 90000 });
    await this.channelSelect().selectOption(channel);
  }

  /** Visible `<option>` values on the Channel select (excludes empty placeholder). */
  async channelSelectOptionValues(): Promise<string[]> {
    const select = this.channelSelect();
    await select.waitFor({ state: 'visible', timeout: 90000 });
    return select
      .getByRole('option')
      .evaluateAll((opts) =>
        opts.map((o) => (o as HTMLOptionElement).value.trim()).filter((value) => value.length > 0),
      );
  }

  channelSelectPlaceholder(): Locator {
    return this.channelSelect().getByRole('option', { name: 'Select a channel' });
  }

  channelSelectEmptyMessage(): Locator {
    return this.channelSelect().getByRole('option', {
      name: 'No channels available for the selected version',
    });
  }

  channelInfoIcon(): Locator {
    return this.page.getByRole('button', { name: 'Update channels information' });
  }

  channelPopover(): Locator {
    return this.page.getByRole('dialog', { name: 'help' }).filter({ hasText: /Channels provide/i });
  }

  channelPopoverLearnMoreLink(): Locator {
    return this.channelPopover().getByRole('link', { name: 'Learn more' });
  }

  async followChannelPopoverLearnMoreLink(docUrlFragment: string): Promise<void> {
    const learnMore = this.channelPopoverLearnMoreLink();
    await expect(learnMore).toHaveAttribute('href', new RegExp(docUrlFragment));

    const popupPromise = this.page.waitForEvent('popup', { timeout: 60000 });
    await learnMore.click();
    const docPage = await popupPromise;
    await docPage.waitForLoadState('domcontentloaded');
    await expect(docPage).toHaveURL(new RegExp(docUrlFragment));
    await docPage.close();
  }

  reviewChannelValue(): Locator {
    return this.page.getByTestId('Channel').locator('motion.div, div');
  }

  reviewVersionValue(): Locator {
    return this.page.getByTestId('Version').locator('motion.div, div');
  }

  async assertVersionFieldAppearsBeforeChannelField(): Promise<void> {
    const versionBox = await this.versionFieldLabel().boundingBox();
    const channelBox = await this.channelFieldLabel().boundingBox();
    expect(versionBox).not.toBeNull();
    expect(channelBox).not.toBeNull();
    expect(versionBox!.y).toBeLessThan(channelBox!.y);
  }

  async assertYStreamChannelUiWithoutChannelGroup(): Promise<void> {
    await expect(this.channelGroupSelect()).not.toBeVisible();
    await expect(this.channelSelect()).toBeVisible();
  }

  async assertChannelSelectPlaceholderIsEmpty(placeholderLabel: string): Promise<void> {
    const placeholder = this.channelSelectPlaceholder();
    await expect(placeholder).toHaveAttribute('value', '');
    await expect(placeholder).toHaveText(placeholderLabel);
  }

  async assertChannelOptionValuesMatchAvailableChannelsPattern(): Promise<void> {
    const optionValues = await this.channelSelectOptionValues();
    expect(optionValues.length).toBeGreaterThan(0);
    for (const value of optionValues) {
      expect(value).toMatch(/^(stable|fast|candidate|eus)-\d+\.\d+$/);
    }
  }

  /** Clears channel selection on Cluster details. */
  async resetClusterDetailsSelections(): Promise<void> {
    await this.ensureClusterDetailsScreen();

    const channelSelect = this.channelSelect();
    if (await channelSelect.isEnabled()) {
      await channelSelect.selectOption('');
      await expect(channelSelect).toHaveValue('');
    }
  }

  // Shared AWS VPC / subnet / security group controls (OSD + ROSA). FuzzySelect
  // toggles use aria-label "Options menu", so match by visible button text.
  vpcSelectButton(): Locator {
    return this.page.getByRole('button').filter({ hasText: 'Select a VPC' });
  }

  vpcFilterInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Filter by VPC ID / name' });
  }

  subnetFilterInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Filter by subnet ID / name' });
  }

  additionalSecurityGroupsLink(): Locator {
    return this.page.getByRole('button', { name: 'Additional security groups' });
  }

  applySameSecurityGroupsToAllNodeTypes(): Locator {
    return this.page.getByRole('checkbox', {
      name: /Apply the same security groups to all node types/i,
    });
  }

  securityGroupsButton(): Locator {
    return this.page.getByRole('button').filter({ hasText: 'Select security groups' });
  }

  async selectSubnetAvailabilityZone(zone: string): Promise<void> {
    await this.page
      .getByRole('button')
      .filter({ hasText: 'Select availability zone' })
      .first()
      .click();
    const zoneOption = this.page.getByRole('option').filter({ hasText: zone });
    await expect(zoneOption).toBeEnabled({ timeout: 30000 });
    await zoneOption.click();
  }
  createCustomDomainPrefixCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Create custom domain prefix' });
  }

  domainPrefixInput(): Locator {
    // RichInputField/TextInputGroupMain accessible name is "Type to filter", not the FormGroup label.
    return this.page.locator('input[name="domain_prefix"]');
  }

  // ── Machine pool (shared locators) ────────────────────────────────────────

  computeNodeTypeButton(): Locator {
    return this.page.getByRole('button', { name: 'Machine type select toggle' });
  }

  computeNodeTypeSearchInput(): Locator {
    return this.page.getByLabel('Machine type select search field');
  }

  computeNodeCountInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Compute nodes' });
  }

  computeNodeCountIncrementButton(): Locator {
    return this.page.getByRole('button', { name: 'Increment compute nodes' });
  }

  computeNodeCountDecrementButton(): Locator {
    return this.page.getByRole('button', { name: 'Decrement compute nodes' });
  }

  enableAutoscalingCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Enable autoscaling' });
  }

  /** Alias for ROSA specs that use camelCase "AutoScaling". */
  enableAutoScalingCheckbox(): Locator {
    return this.enableAutoscalingCheckbox();
  }

  async enableAutoScaling(): Promise<void> {
    await this.enableAutoscalingCheckbox().check();
  }

  useBothIMDSv1AndIMDSv2Radio(): Locator {
    return this.page.getByTestId('imds-optional');
  }

  // ── CIDR ──────────────────────────────────────────────────────────────────

  cidrDefaultValuesCheckBox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Use default values' });
  }

  machineCIDRInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Machine CIDR' });
  }

  serviceCIDRInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Service CIDR' });
  }

  podCIDRInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Pod CIDR' });
  }

  hostPrefixInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Host prefix' });
  }

  async useCIDRDefaultValues(value: boolean = true): Promise<void> {
    if (value) {
      await this.cidrDefaultValuesCheckBox().check();
    } else {
      await this.cidrDefaultValuesCheckBox().uncheck();
    }
  }

  async isCIDRScreen(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'CIDR ranges', exact: true })).toBeVisible({
      timeout: 30000,
    });
  }

  // ── Post-create ───────────────────────────────────────────────────────────

  /** After Create cluster, wait for redirect to the cluster installation page. */
  async waitForClusterCreationAndOverview(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /Installing cluster/ })).toBeVisible({
      timeout: 120000,
    });
  }

  // ── Cluster autoscaling modal ─────────────────────────────────────────────

  editClusterAutoscalingSettingsButton(): Locator {
    return this.page.getByTestId('set-cluster-autoscaling-btn');
  }

  clusterAutoscalingLogVerbosityInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'log-verbosity' });
  }

  clusterAutoscalingMaxNodeProvisionTimeInput(): Locator {
    return this.page.getByRole('textbox', { name: 'max-node-provision-time' });
  }

  clusterAutoscalingBalancingIgnoredLabelsInput(): Locator {
    return this.page.getByRole('textbox', { name: 'balancing-ignored-labels' });
  }

  clusterAutoscalingCoresTotalMinInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'cores-total-min' });
  }

  clusterAutoscalingCoresTotalMaxInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'cores-total-max' });
  }

  clusterAutoscalingMemoryTotalMinInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'memory-total-min' });
  }

  clusterAutoscalingMemoryTotalMaxInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'memory-total-max' });
  }

  clusterAutoscalingMaxNodesTotalInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'max-nodes-total' });
  }

  clusterAutoscalingGPUsInput(): Locator {
    return this.page.getByRole('textbox', { name: 'GPUs' });
  }

  clusterAutoscalingScaleDownUtilizationThresholdInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'scale-down-utilization-threshold' });
  }

  clusterAutoscalingScaleDownUnneededTimeInput(): Locator {
    return this.page.getByRole('textbox', { name: 'scale-down-unneeded-time' });
  }

  clusterAutoscalingScaleDownDelayAfterAddInput(): Locator {
    return this.page.getByRole('textbox', { name: 'scale-down-delay-after-add' });
  }

  clusterAutoscalingScaleDownDelayAfterDeleteInput(): Locator {
    return this.page.getByRole('textbox', { name: 'scale-down-delay-after-delete' });
  }

  clusterAutoscalingScaleDownDelayAfterFailureInput(): Locator {
    return this.page.getByRole('textbox', { name: 'scale-down-delay-after-failure' });
  }

  clusterAutoscalingRevertAllToDefaultsButton(): Locator {
    return this.page.getByRole('button', { name: 'Revert all to defaults' });
  }

  clusterAutoscalingCloseButton(): Locator {
    return this.page.getByRole('button', { name: 'Close' });
  }

  // ── Cluster details (shared) ──────────────────────────────────────────────

  /**
   * Shared cluster-name field locator. Prefer this over product-specific APIs.
   * OSD specs still use a string getter `clusterNameInput` for legacy `page.locator(...)`.
   */
  clusterNameField(): Locator {
    // RichInputField/TextInputGroupMain accessible name is "Type to filter", not the FormGroup label.
    return this.page.locator('input[name="name"]');
  }

  regionSelect(): Locator {
    return this.page.getByRole('combobox', { name: 'Region' });
  }

  async isClusterDetailsScreen(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Cluster details' })).toBeVisible({
      timeout: 90000,
    });
    await expect(this.versionDropdownToggle()).toBeVisible({ timeout: 90000 });
  }

  async setClusterName(clusterName: string): Promise<void> {
    const input = this.clusterNameField();
    await input.scrollIntoViewIfNeeded();
    await input.clear();
    await input.fill(clusterName);
    await input.blur();
  }

  async setDomainPrefix(domainPrefix: string): Promise<void> {
    const input = this.domainPrefixInput();
    await input.scrollIntoViewIfNeeded();
    await input.clear();
    await input.fill(domainPrefix);
    await input.blur();
  }

  async selectRegion(region: string): Promise<void> {
    const regionValue = region.split(',')[0].trim();
    await this.regionSelect().selectOption(regionValue);
  }

  // ── Availability zone ─────────────────────────────────────────────────────

  multiZoneAvilabilityRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Multi-zone' });
  }

  singleZoneAvailabilityRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Single zone' });
  }

  /** Alias for the historical misspelling used by OSD specs. */
  singleZoneAvilabilityRadio(): Locator {
    return this.singleZoneAvailabilityRadio();
  }

  async selectAvailabilityZone(availability: string): Promise<void> {
    const value = availability.toLowerCase();
    if (value.includes('single')) {
      await this.singleZoneAvailabilityRadio().check();
    } else if (value.includes('multiple') || value.includes('multi')) {
      await this.multiZoneAvilabilityRadio().check();
    } else {
      await this.singleZoneAvailabilityRadio().check();
    }
  }

  // ── Machine pool actions ──────────────────────────────────────────────────

  async selectComputeNodeType(computeNodeType: string): Promise<void> {
    await this.computeNodeTypeButton().click();
    await this.computeNodeTypeSearchInput().waitFor({ state: 'visible', timeout: 30000 });
    await this.computeNodeTypeSearchInput().clear();
    await this.computeNodeTypeSearchInput().fill(computeNodeType);
    await this.page.getByRole('button', { name: computeNodeType }).click();
    await expect(this.computeNodeTypeButton()).toContainText(computeNodeType, { timeout: 30000 });
  }

  async selectComputeNodeCount(count: string | number): Promise<void> {
    const input = this.computeNodeCountInput();
    await input.clear();
    await input.fill(String(count));
    await input.blur();
  }

  minimumNodeInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Minimum nodes' });
  }

  maximumNodeInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Maximum nodes' });
  }

  minimumNodeCountInput(): Locator {
    return this.minimumNodeInput();
  }

  maximumNodeCountInput(): Locator {
    return this.maximumNodeInput();
  }

  minimumNodeCountPlusButton(): Locator {
    return this.page.getByRole('button', { name: 'Minimum nodes plus' });
  }

  minimumNodeCountMinusButton(): Locator {
    return this.page.getByRole('button', { name: 'Minimum nodes minus' });
  }

  maximumNodeCountPlusButton(): Locator {
    return this.page.getByRole('button', { name: 'Maximum nodes plus' });
  }

  maximumNodeCountMinusButton(): Locator {
    return this.page.getByRole('button', { name: 'Maximum nodes minus' });
  }

  async setMinimumNodeCount(count: string): Promise<void> {
    await this.minimumNodeInput().clear();
    await this.minimumNodeInput().fill(count);
    await this.minimumNodeInput().blur();
  }

  async setMaximumNodeCount(count: string): Promise<void> {
    await this.maximumNodeInput().clear();
    await this.maximumNodeInput().fill(count);
    await this.maximumNodeInput().blur();
  }

  // ── Networking / privacy ──────────────────────────────────────────────────

  clusterPrivacyPublicRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Public', exact: true });
  }

  clusterPrivacyPrivateRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Private', exact: true });
  }

  async selectClusterPrivacy(privacy: string): Promise<void> {
    if (privacy.toLowerCase().includes('private')) {
      await this.clusterPrivacyPrivateRadio().check();
    } else {
      await this.clusterPrivacyPublicRadio().check();
    }
  }

  applicationIngressDefaultSettingsRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Default settings' });
  }

  applicationIngressCustomSettingsRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Custom settings' });
  }

  applicationIngressRouterSelectorsInput(): Locator {
    return this.page.locator('input[name="defaultRouterSelectors"]');
  }

  applicationIngressExcludedNamespacesInput(): Locator {
    return this.page.locator('input[name="defaultRouterExcludedNamespacesFlag"]');
  }

  // ── Update strategy ───────────────────────────────────────────────────────

  individualUpdateRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Individual updates' });
  }

  recurringUpdateRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Recurring updates' });
  }

  updateStrategyIndividualRadio(): Locator {
    return this.individualUpdateRadio();
  }

  updateStrategyRecurringRadio(): Locator {
    return this.recurringUpdateRadio();
  }

  async selectUpdateStratergy(strategy: string): Promise<void> {
    if (strategy.toLowerCase().includes('individual')) {
      await this.individualUpdateRadio().check();
    } else {
      await this.recurringUpdateRadio().check();
    }
  }

  gracePeriodSelect(): Locator {
    return this.page.getByTestId('grace-period-select');
  }

  async selectGracePeriod(period: string): Promise<void> {
    await this.gracePeriodSelect().click();
    // PF Select may expose options as role=option (ROSA) or role=button (OSD)
    const option = this.page.getByRole('option', { name: period });
    const menuButton = this.page.getByRole('button', { name: period });
    await option.or(menuButton).first().click();
  }

  async selectNodeDraining(nodeDrain: string): Promise<void> {
    await this.selectGracePeriod(nodeDrain);
  }

  async isUpdatesScreen(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Cluster update strategy' })).toBeVisible({
      timeout: 30000,
    });
  }

  async isClusterUpdatesScreen(): Promise<void> {
    await this.isUpdatesScreen();
  }

  // ── Encryption ────────────────────────────────────────────────────────────

  advancedEncryptionLink(): Locator {
    return this.page.getByRole('button', { name: 'Advanced Encryption' });
  }

  enableFIPSCryptographyCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Enable FIPS cryptography' });
  }

  enableAdditionalEtcdEncryptionCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Enable additional etcd' });
  }

  useCustomKMSKeyRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Use custom KMS keys' });
  }

  useDefaultKMSKeyRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Use default KMS Keys' });
  }
}
