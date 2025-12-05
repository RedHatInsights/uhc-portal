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

  osdTrialCreateClusterButton(): Locator {
    return this.page.getByTestId('osd-create-trial-cluster');
  }

  async isCreateOSDPage(): Promise<void> {
    await this.assertUrlIncludes('/openshift/create/osd');
  }

  async isCreateOSDTrialPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/openshift\/create\/osdtrial/);
  }

  async isBillingModelScreen(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Welcome to Red Hat OpenShift Dedicated' }),
    ).toBeVisible({ timeout: 60000 });
  }

  async isCuratedBillingModelEnabledAndSelected(): Promise<void> {
    await expect(this.subscriptionTypeOnDemandFlexibleRadio()).toBeChecked();
    await expect(this.infrastructureTypeClusterCloudSubscriptionRadio()).toBeChecked();
    await expect(this.infrastructureTypeRedHatCloudAccountRadio()).not.toBeVisible();
    await expect(this.subscriptionTypeAnnualFixedCapacityRadio()).not.toBeVisible();
    await expect(this.subscriptionTypeFreeTrialRadio()).not.toBeVisible();
  }

  async isOnlyGCPCloudProviderSelectionScreen(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Google Cloud account details' }),
    ).toBeVisible({
      timeout: 30000,
    });
    await expect(
      this.page.getByRole('heading', { name: 'Select a cloud provider' }),
    ).not.toBeVisible();
  }

  async isWIFRecommendationAlertPresent(): Promise<void> {
    await expect(
      this.page
        .locator('h4')
        .filter({ hasText: 'Red Hat recommends using WIF as the authentication type' }),
    ).toBeVisible();
  }

  async isPrerequisitesHintPresent(): Promise<void> {
    await expect(
      this.page.locator('strong').filter({ hasText: 'Have you prepared your Google account?' }),
    ).toBeVisible();
    await expect(
      this.page.getByText(
        "To prepare your account, accept the Google Cloud Terms and Agreements. If you've already accepted the terms, you can continue to complete OSD prerequisites.",
      ),
    ).toBeVisible();
    await expect(
      this.page.getByRole('link', { name: 'Review Google terms and agreements' }),
    ).toHaveAttribute(
      'href',
      'https://console.cloud.google.com/marketplace/agreements/redhat-marketplace/red-hat-openshift-dedicated',
    );
  }

  async waitAndClick(buttonLocator: Locator, timeout: number = 160000): Promise<void> {
    await buttonLocator.waitFor({ state: 'visible', timeout });
    await buttonLocator.click();
  }
  // Machine pool selectors
  computeNodeTypeButton(): Locator {
    return this.page.locator('button[aria-label="Machine type select toggle"]');
  }

  computeNodeTypeSearchInput(): Locator {
    return this.page.locator('input[aria-label="Machine type select search field"]');
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

  get billingModelRedHatCloudAccountOption(): string {
    return 'input[id="form-radiobutton-byoc-false-field"]';
  }

  get primaryButton(): string {
    return '[data-testid="wizard-next-button"], button:has-text("Next")';
  }

  async isClusterDetailsScreen(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Cluster details' })).toBeVisible({
      timeout: 30000,
    });
    // Wait for cluster version dropdown to be visible to avoid flaky behavior
    await this.page
      .getByRole('button', { name: 'Options menu' })
      .waitFor({ state: 'visible', timeout: 90000 });
  }

  get clusterNameInput(): string {
    return 'input[name="name"], input[placeholder*="cluster name"]';
  }

  get clusterNameInputError(): string {
    return 'ul#rich-input-popover-name li[class*="m-error"]';
  }

  async expectClusterNameErrorMessage(errorText: string): Promise<void> {
    await expect(
      this.page.locator(this.clusterNameInputError).filter({ hasText: errorText }),
    ).toBeVisible();
  }

  async isMachinePoolScreen(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: /Machine pools|Default machine pool/ }),
    ).toBeVisible();
  }

  async isNetworkingScreen(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Networking configuration' }),
    ).toBeVisible();
  }

  async isCIDRScreen(): Promise<void> {
    await expect(this.page.locator('h3:has-text("CIDR ranges")')).toBeVisible({ timeout: 30000 });
  }

  async isClusterUpdatesScreen(): Promise<void> {
    await expect(this.page.locator('h3:has-text("Cluster update strategy")')).toBeVisible({
      timeout: 30000,
    });
  }

  async isTrailDefinitionScreen(): Promise<void> {
    await expect(this.page.getByRole('radio', { name: 'Free trial (upgradeable)' })).toBeChecked();
    await expect(
      this.page.getByRole('radio', { name: 'Customer cloud subscription' }),
    ).toBeChecked();
  }

  async isReviewScreen(): Promise<void> {
    await expect(this.page.locator('h2:has-text("Review your dedicated cluster")')).toBeVisible({
      timeout: 30000,
    });
  }

  // Billing model screen elements
  subscriptionTypeAnnualFixedCapacityRadio(): Locator {
    return this.page.locator('input[name="billing_model"][value="standard"]');
  }

  subscriptionTypeFreeTrialRadio(): Locator {
    return this.page.locator('input[name="billing_model"][value="standard-trial"]');
  }

  infrastructureTypeClusterCloudSubscriptionRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-byoc-true-field"]');
  }

  // Cloud provider selection screen
  async isCloudProviderSelectionScreen(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Select a cloud provider' })).toBeVisible();
  }

  async selectCloudProvider(cloudProvider: string): Promise<void> {
    if (cloudProvider.toLowerCase().includes('aws')) {
      await this.page.getByTestId('aws-provider-card').click();
    } else {
      await this.page.getByTestId('gcp-provider-card').click();
    }
  }

  // GCP authentication
  workloadIdentityFederationButton(): Locator {
    return this.page.getByRole('button', { name: 'Workload Identity Federation' });
  }

  serviceAccountButton(): Locator {
    return this.page.getByRole('button', { name: 'Service Account' });
  }

  async uploadGCPServiceAccountJSON(jsonContent: string): Promise<void> {
    await this.page.locator('textarea[aria-label="File upload"]').clear();
    await this.page.locator('textarea[aria-label="File upload"]').fill(jsonContent);
  }

  async selectWorkloadIdentityConfiguration(wifConfig: string): Promise<void> {
    await this.page.locator('button[id="gcp_wif_config"]').click();
    await this.page.locator('input[placeholder="Filter by name / ID"]').clear();
    await this.page.locator('input[placeholder="Filter by name / ID"]').fill(wifConfig);
    await this.page.getByText(wifConfig).scrollIntoViewIfNeeded();
    await this.page.getByText(wifConfig).click();
  }

  // AWS credentials
  awsAccountIDInput(): Locator {
    return this.page.locator('input[id="account_id"]');
  }

  awsAccessKeyInput(): Locator {
    return this.page.locator('input[id="access_key_id"]');
  }

  awsSecretKeyInput(): Locator {
    return this.page.locator('input[id="secret_access_key"]');
  }

  acknowlegePrerequisitesCheckbox(): Locator {
    return this.page.locator('input[id="acknowledge_prerequisites"]');
  }

  // Cluster details screen
  createCustomDomainPrefixCheckbox(): Locator {
    return this.page.locator('input[id="has_domain_prefix"]');
  }

  domainPrefixInput(): Locator {
    return this.page.locator('input[name="domain_prefix"]');
  }

  async setClusterName(clusterName: string): Promise<void> {
    await this.page.locator(this.clusterNameInput).scrollIntoViewIfNeeded();
    await this.page.locator(this.clusterNameInput).clear();
    await this.page.locator(this.clusterNameInput).fill(clusterName);
  }

  async setDomainPrefix(domainPrefix: string): Promise<void> {
    await this.domainPrefixInput().scrollIntoViewIfNeeded();
    await this.domainPrefixInput().clear();
    await this.domainPrefixInput().fill(domainPrefix);
  }

  async closePopoverDialogs(): Promise<void> {
    const closeButtons = this.page.locator('button[aria-label="Close"]');
    const count = await closeButtons.count();
    if (count > 0) {
      const visibleCloseButton = closeButtons.first();
      if (await visibleCloseButton.isVisible()) {
        await visibleCloseButton.click();
      }
    }
  }

  singleZoneAvilabilityRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-multi_az-false-field"]');
  }

  multiZoneAvilabilityRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-multi_az-true-field"]');
  }

  async selectRegion(region: string): Promise<void> {
    const regionValue = region.split(',')[0]; // Take first part before comma
    await this.page.locator('select[name="region"]').selectOption(regionValue);
  }

  enableSecureBootSupportForSchieldedVMsCheckbox(): Locator {
    return this.page.locator('input[id="secure_boot"]');
  }

  async enableSecureBootSupportForSchieldedVMs(enable: boolean): Promise<void> {
    if (enable) {
      await this.enableSecureBootSupportForSchieldedVMsCheckbox().check();
    } else {
      await this.enableSecureBootSupportForSchieldedVMsCheckbox().uncheck();
    }
  }

  enableUserWorkloadMonitoringCheckbox(): Locator {
    return this.page.locator('input[id="enable_user_workload_monitoring"]');
  }

  // Machine pool screen
  async selectComputeNodeType(computeNodeType: string): Promise<void> {
    await this.computeNodeTypeButton().click();
    await this.computeNodeTypeSearchInput().clear();
    await this.computeNodeTypeSearchInput().fill(computeNodeType);
    await this.page.getByRole('button', { name: computeNodeType }).click();
  }

  async selectComputeNodeCount(nodeCount: number): Promise<void> {
    await this.page.getByRole('spinbutton', { name: 'Compute nodes' }).fill(nodeCount.toString());
  }

  enableAutoscalingCheckbox(): Locator {
    return this.page.locator('input[id="autoscalingEnabled"]');
  }

  useBothIMDSv1AndIMDSv2Radio(): Locator {
    return this.page.getByTestId('imds-optional');
  }

  // Networking screen
  clusterPrivacyPublicRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-cluster_privacy-external-field"]');
  }

  applicationIngressDefaultSettingsRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-applicationIngress-default-field"]');
  }

  async selectClusterPrivacy(privacy: string): Promise<void> {
    if (privacy.toLowerCase().includes('private')) {
      await this.page
        .locator('input[id="form-radiobutton-cluster_privacy-internal-field"]')
        .check();
    } else {
      await this.clusterPrivacyPublicRadio().check();
    }
  }

  installIntoExistingVpcCheckBox(): Locator {
    return this.page.locator('input[id="install_to_vpc"]');
  }

  usePrivateServiceConnectCheckBox(): Locator {
    return this.page.locator('input[id="private_service_connect"]');
  }

  // VPC subnet screen
  async isVPCSubnetScreen(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Virtual Private Cloud (VPC) subnet settings' }),
    ).toBeVisible();
  }

  async selectGcpVPC(vpcName: string): Promise<void> {
    await this.page.locator('select[aria-label="Existing VPC name"]').selectOption(vpcName);
  }

  async selectControlPlaneSubnetName(subnetName: string): Promise<void> {
    await this.page
      .locator('select[aria-label="Control plane subnet name"]')
      .selectOption(subnetName);
  }

  async selectComputeSubnetName(subnetName: string): Promise<void> {
    await this.page.locator('select[aria-label="Compute subnet name"]').selectOption(subnetName);
  }

  async selectPrivateServiceConnectSubnetName(pscName: string): Promise<void> {
    await this.page
      .locator('select[aria-label="Private Service Connect subnet name"]')
      .selectOption(pscName);
  }

  wizardNextButton(): Locator {
    return this.page.getByTestId('wizard-next-button');
  }

  // CIDR selectors
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

  // Updates screen
  updateStrategyIndividualRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-upgrade_policy-manual-field"]');
  }

  async selectNodeDraining(nodeDrain: string): Promise<void> {
    await this.page.getByTestId('grace-period-select').click();
    await this.page.getByRole('button', { name: nodeDrain }).click();
  }

  // Review screen
  subscriptionTypeValue(): Locator {
    return this.page.getByTestId('Subscription-type').locator('div');
  }

  infrastructureTypeValue(): Locator {
    return this.page.getByTestId('Infrastructure-type').locator('div');
  }

  cloudProviderValue(): Locator {
    return this.page.getByTestId('Cloud-provider').locator('div');
  }

  authenticationTypeValue(): Locator {
    return this.page.getByTestId('Authentication-type').locator('div');
  }

  wifConfigurationValue(): Locator {
    return this.page.getByTestId('WIF-configuration').locator('div');
  }

  clusterDomainPrefixLabelValue(): Locator {
    return this.page.getByTestId('Domain-prefix');
  }

  clusterNameValue(): Locator {
    return this.page.getByTestId('Cluster-name').locator('div');
  }

  regionValue(): Locator {
    return this.page.getByTestId('Region').locator('div');
  }

  availabilityValue(): Locator {
    return this.page.getByTestId('Availability').locator('div');
  }

  securebootSupportForShieldedVMsValue(): Locator {
    return this.page.getByTestId('Secure-Boot-support-for-Shielded-VMs').locator('div');
  }

  userWorkloadMonitoringValue(): Locator {
    return this.page.getByTestId('User-workload-monitoring').locator('div');
  }

  encryptVolumesWithCustomerkeysValue(): Locator {
    return this.page.getByTestId('Encrypt-volumes-with-customer-keys').locator('div');
  }

  additionalEtcdEncryptionValue(): Locator {
    return this.page.getByTestId('Additional-etcd-encryption').locator('div');
  }

  fipsCryptographyValue(): Locator {
    return this.page.getByTestId('FIPS-cryptography').locator('div');
  }

  nodeInstanceTypeValue(): Locator {
    return this.page.getByTestId('Node-instance-type').locator('div');
  }

  autoscalingValue(): Locator {
    return this.page.getByTestId('Autoscaling').locator('div');
  }

  computeNodeCountValue(): Locator {
    return this.page.getByTestId('Compute-node-count').locator('div');
  }

  clusterPrivacyValue(): Locator {
    return this.page.getByTestId('Cluster-privacy').locator('div');
  }

  installIntoExistingVpcValue(): Locator {
    return this.page.getByTestId('Install-into-existing-VPC').locator('div');
  }

  privateServiceConnectValue(): Locator {
    return this.page.getByLabel('Networking').getByTestId('Private-service-connect').locator('div');
  }

  applicationIngressValue(): Locator {
    return this.page.getByTestId('Application-ingress').locator('div');
  }

  machineCIDRValue(): Locator {
    return this.page.getByTestId('Machine-CIDR').locator('div');
  }

  serviceCIDRValue(): Locator {
    return this.page.getByTestId('Service-CIDR').locator('div');
  }

  podCIDRValue(): Locator {
    return this.page.getByTestId('Pod-CIDR').locator('div');
  }

  hostPrefixValue(): Locator {
    return this.page.getByTestId('Host-prefix').locator('div');
  }

  updateStratergyValue(): Locator {
    return this.page.getByTestId('Update-strategy').locator('div');
  }

  nodeDrainingValue(): Locator {
    return this.page.getByTestId('Node-draining').locator('div');
  }

  createClusterButton(): Locator {
    return this.page.getByRole('button', { name: 'Create cluster' });
  }

  // Cluster privacy private radio
  clusterPrivacyPrivateRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-cluster_privacy-internal-field"]');
  }

  // Persistent storage selection
  async selectPersistentStorage(storage: string): Promise<void> {
    // This would be a dropdown or input field for persistent storage
    // The exact selector would depend on the UI implementation
    await this.page
      .locator('select[name="persistent_storage"], input[name="persistent_storage"]')
      .selectOption(storage);
  }

  // Load balancers selection
  async selectLoadBalancers(loadBalancers: string): Promise<void> {
    // This would be a dropdown or input field for load balancers
    // The exact selector would depend on the UI implementation
    await this.page
      .locator('select[name="load_balancers"], input[name="load_balancers"]')
      .selectOption(loadBalancers);
  }

  // Persistent storage value in review screen
  persistentStorageValue(): Locator {
    return this.page.getByTestId('Persistent-storage').locator('div');
  }

  // Update strategy recurring radio
  updateStrategyRecurringRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-upgrade_policy-automatic-field"]');
  }

  // Additional billing model options
  subscriptionTypeOnDemandFlexibleRadio(): Locator {
    return this.page.locator('input[name="billing_model"][value="marketplace-gcp"]');
  }

  infrastructureTypeRedHatCloudAccountRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-byoc-false-field"]');
  }

  // Marketplace selection
  async selectSubscriptionType(subscriptionType: string): Promise<void> {
    if (subscriptionType.toLowerCase().includes('on-demand')) {
      await this.subscriptionTypeOnDemandFlexibleRadio().check();
    } else if (subscriptionType.toLowerCase().includes('annual')) {
      await this.subscriptionTypeAnnualFixedCapacityRadio().check();
    } else if (subscriptionType.toLowerCase().includes('trial')) {
      await this.subscriptionTypeFreeTrialRadio().check();
    }
  }

  async selectInfrastructureType(infrastructureType: string): Promise<void> {
    if (infrastructureType.toLowerCase().includes('customer cloud')) {
      await this.infrastructureTypeClusterCloudSubscriptionRadio().check();
    } else {
      await this.infrastructureTypeRedHatCloudAccountRadio().check();
    }
  }

  // Cluster version selection
  async selectVersion(version: string): Promise<void> {
    if (version !== '') {
      await this.page.locator('button[id="version-selector"]').click();
      await this.page.getByRole('option', { name: version }).click();
    }
  }

  async selectAvailabilityZone(az: string): Promise<void> {
    if (az.toLowerCase().includes('single')) {
      await this.singleZoneAvilabilityRadio().check();
    } else {
      await this.page.locator('input[id="form-radiobutton-multi_az-true-field"]').check();
    }
  }

  // Advanced encryption settings
  advancedEncryptionLink(): Locator {
    return this.page.getByText('Advanced Encryption');
  }

  enableAdditionalEtcdEncryptionCheckbox(): Locator {
    return this.page.locator('input[id="etcd_encryption"]');
  }

  enableFIPSCryptographyCheckbox(): Locator {
    return this.page.locator('input[id="fips"]');
  }

  async enableAdditionalEtcdEncryption(
    enable: boolean,
    fipsCryptography: boolean = false,
  ): Promise<void> {
    await this.advancedEncryptionLink().click();

    if (enable) {
      await this.enableAdditionalEtcdEncryptionCheckbox().check();
      if (fipsCryptography) {
        await this.enableFIPSCryptographyCheckbox().check();
      }
    } else {
      await this.enableFIPSCryptographyCheckbox().uncheck();
    }
  }

  // Node labels
  addNodeLabelLink(): Locator {
    return this.page.getByText('Add node labels');
  }

  async addNodeLabelKeyAndValue(key: string, value: string = '', index: number = 0): Promise<void> {
    await this.page.locator(`input[id="node_labels.${index}.key"]`).scrollIntoViewIfNeeded();
    await this.page.locator(`input[id="node_labels.${index}.key"]`).clear();
    await this.page.locator(`input[id="node_labels.${index}.key"]`).fill(key);
    await this.page.locator(`input[id="node_labels.${index}.key"]`).blur();

    await this.page.locator(`input[id="node_labels.${index}.value"]`).scrollIntoViewIfNeeded();
    await this.page.locator(`input[id="node_labels.${index}.value"]`).clear();
    await this.page.locator(`input[id="node_labels.${index}.value"]`).fill(value);
    await this.page.locator(`input[id="node_labels.${index}.value"]`).blur();
  }

  // CIDR range helpers
  async useCIDRDefaultValues(value: boolean = true): Promise<void> {
    if (value) {
      await this.cidrDefaultValuesCheckBox().check();
    } else {
      await this.cidrDefaultValuesCheckBox().uncheck();
    }
  }

  // Updates screen validation
  async isUpdatesScreen(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Cluster update strategy' })).toBeVisible();
  }

  // Review screen node labels value
  nodeLabelsValue(labelText: string): Locator {
    return this.page.getByTestId('Node-labels').getByText(labelText);
  }

  // Helper method to hide cluster name validation popup
  clusterDetailsTree(): Locator {
    return this.page.locator('button[id="cluster-settings-details"]').getByText('Details');
  }

  async hideClusterNameValidation(): Promise<void> {
    // Validation popup on cluster name field creates flaky situation on below version field.
    // To remove the validation popup a click action in cluster left tree is required.
    await this.clusterDetailsTree().click();
  }

  // Additional validation-specific methods
  gcpWIFCommandInput(): Locator {
    return this.page.getByTestId('gcp-wif-command').locator('input');
  }

  useCustomKMSKeyRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-customer_managed_key-true-field"]');
  }

  useDefaultKMSKeyRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-customer_managed_key-false-field"]');
  }

  keyArnInput(): Locator {
    return this.page.locator('span input[id="kms_key_arn"]');
  }

  // Machine pool validation methods
  minimumNodeInput(): Locator {
    return this.page.locator('input[aria-label="Minimum nodes"]');
  }

  maximumNodeInput(): Locator {
    return this.page.locator('input[aria-label="Maximum nodes"]');
  }

  minimumNodeCountMinusButton(): Locator {
    return this.page.locator('button[aria-label="Minimum nodes minus"]');
  }

  minimumNodeCountPlusButton(): Locator {
    return this.page.locator('button[aria-label="Minimum nodes plus"]');
  }

  maximumNodeCountMinusButton(): Locator {
    return this.page.locator('button[aria-label="Maximum nodes minus"]');
  }

  maximumNodeCountPlusButton(): Locator {
    return this.page.locator('button[aria-label="Maximum nodes plus"]');
  }

  editClusterAutoscalingSettingsButton(): Locator {
    return this.page.getByTestId('set-cluster-autoscaling-btn');
  }

  // Cluster autoscaling selectors
  clusterAutoscalingLogVerbosityInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.log_verbosity"]');
  }

  clusterAutoscalingMaxNodeProvisionTimeInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.max_node_provision_time"]');
  }

  clusterAutoscalingBalancingIgnoredLabelsInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.balancing_ignored_labels"]');
  }

  clusterAutoscalingCoresTotalMinInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.resource_limits.cores.min"]');
  }

  clusterAutoscalingCoresTotalMaxInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.resource_limits.cores.max"]');
  }

  clusterAutoscalingMemoryTotalMinInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.resource_limits.memory.min"]');
  }

  clusterAutoscalingMemoryTotalMaxInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.resource_limits.memory.max"]');
  }

  clusterAutoscalingMaxNodesTotalInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.resource_limits.max_nodes_total"]');
  }

  clusterAutoscalingGPUsInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.resource_limits.gpus"]');
  }

  clusterAutoscalingScaleDownUtilizationThresholdInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.scale_down.utilization_threshold"]');
  }

  clusterAutoscalingScaleDownUnneededTimeInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.scale_down.unneeded_time"]');
  }

  clusterAutoscalingScaleDownDelayAfterAddInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.scale_down.delay_after_add"]');
  }

  clusterAutoscalingScaleDownDelayAfterDeleteInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.scale_down.delay_after_delete"]');
  }

  clusterAutoscalingScaleDownDelayAfterFailureInput(): Locator {
    return this.page.locator('input[id="cluster_autoscaling.scale_down.delay_after_failure"]');
  }

  clusterAutoscalingRevertAllToDefaultsButton(): Locator {
    return this.page.getByRole('button', { name: 'Revert all to defaults' });
  }

  clusterAutoscalingCloseButton(): Locator {
    return this.page.getByRole('button', { name: 'Close' });
  }

  // Networking validation selectors
  applicationIngressCustomSettingsRadio(): Locator {
    return this.page.locator('input[id="form-radiobutton-applicationIngress-custom-field"]');
  }

  applicationIngressRouterSelectorsInput(): Locator {
    return this.page.locator('input[name="defaultRouterSelectors"]');
  }

  applicationIngressExcludedNamespacesInput(): Locator {
    return this.page.locator('input[name="defaultRouterExcludedNamespacesFlag"]');
  }

  // Navigation buttons (if not already present)
  wizardBackButton(): Locator {
    return this.page.getByTestId('wizard-back-button');
  }

  // Validation helper methods
  async enableAutoScaling(): Promise<void> {
    await this.enableAutoscalingCheckbox().check();
  }

  async selectAutoScaling(autoScale: string): Promise<void> {
    if (autoScale.toLowerCase() === 'disabled') {
      await this.enableAutoscalingCheckbox().uncheck();
    } else {
      await this.enableAutoscalingCheckbox().check();
    }
  }

  async setMinimumNodeCount(nodeCount: string): Promise<void> {
    await this.minimumNodeInput().click();
    await this.minimumNodeInput().press('Control+a');
    await this.minimumNodeInput().fill(nodeCount);
  }

  async setMaximumNodeCount(nodeCount: string): Promise<void> {
    await this.maximumNodeInput().click();
    await this.maximumNodeInput().press('Control+a');
    await this.maximumNodeInput().fill(nodeCount);
  }

  async isTextContainsInPage(text: string, present: boolean = true): Promise<void> {
    const locator = this.page.locator('body').filter({ hasText: text });
    if (present) {
      await expect(locator).toBeVisible();
    } else {
      await expect(locator).not.toBeVisible();
    }
  }
}
