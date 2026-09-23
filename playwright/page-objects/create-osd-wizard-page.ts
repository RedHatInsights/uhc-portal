import { expect,Locator, Page } from '@playwright/test';

import { BaseWizardPage } from './base-wizard-page';

/**
 * Create OSD Wizard page object for Playwright tests.
 * OSD-specific wizard logic only; shared version/channel helpers live on BaseWizardPage.
 */
export class CreateOSDWizardPage extends BaseWizardPage {
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

  async isOnlyWifAuthenticationTypeScreen(): Promise<void> {
    await expect(
      this.page.getByText('Authentication type: Workload Identity Federation'),
    ).toBeVisible();
    await expect(this.workloadIdentityFederationButton()).not.toBeVisible();
    await expect(this.serviceAccountButton()).not.toBeVisible();
  }

  async isWIFRecommendationAlertPresent(): Promise<void> {
    await expect(
      this.page.locator('h4').filter({
        hasText: 'Red Hat and Google Cloud recommend using WIF as the authentication type',
      }),
    ).toBeVisible();
  }

  async isPrerequisitesHintPresent(
    hint: { Header: string; Description: string; LinkName: string },
    linkHref: string,
  ): Promise<void> {
    await expect(this.page.locator('strong').filter({ hasText: hint.Header })).toBeVisible();
    await expect(this.page.getByText(hint.Description)).toBeVisible();
    await expect(this.page.getByRole('link', { name: hint.LinkName })).toHaveAttribute(
      'href',
      linkHref,
    );
  }

  /** OSD cloud-provider steps can take longer than the shared wizard default. */
  async waitAndClick(buttonLocator: Locator, timeout: number = 160000): Promise<void> {
    await super.waitAndClick(buttonLocator, timeout);
  }

  get billingModelRedHatCloudAccountOption(): string {
    return 'input[id="form-radiobutton-byoc-false-field"]';
  }

  get primaryButton(): string {
    return '[data-testid="wizard-next-button"], button:has-text("Next")';
  }

  clusterSettingsDetailsWizardStep(): Locator {
    return this.page.locator('button[id="cluster-settings-details"]');
  }

  /**
   * Cloud provider Next triggers async CCS credential verification before advancing to Details.
   * @see CloudProviderStepFooter
   */
  async waitForAwsCcsCredentialVerification(): Promise<void> {
    const validating = this.page.getByText('Validating...');
    const credentialError = this.page.getByRole('alert').filter({
      hasText: /wasn't able to verify your credentials/i,
    });

    const sawValidating = await validating
      .waitFor({ state: 'visible', timeout: 20_000 })
      .then(() => true)
      .catch(() => false);

    if (sawValidating) {
      await validating.waitFor({ state: 'hidden', timeout: 120_000 });
    }

    if (await credentialError.isVisible()) {
      throw new Error(
        'AWS CCS credential verification failed (staging rejected the keys). Check QE_AWS_ID, QE_AWS_ACCESS_KEY_ID, and QE_AWS_ACCESS_KEY_SECRET in playwright.env.json.',
      );
    }
  }

  /** AWS CCS: fill BYOC credentials, acknowledge prerequisites, and advance to Cluster details. */
  async completeAwsCloudProviderStep(
    awsAccountId: string,
    awsAccessKeyId: string,
    awsSecretAccessKey: string,
  ): Promise<void> {
    await this.isCloudProviderSelectionScreen();
    await this.selectCloudProvider('AWS');

    await this.awsAccountIDInput().fill(awsAccountId);
    await this.awsAccountIDInput().blur();
    await this.awsAccessKeyInput().fill(awsAccessKeyId);
    await this.awsAccessKeyInput().blur();
    await this.awsSecretKeyInput().fill(awsSecretAccessKey);
    await this.awsSecretKeyInput().blur();

    await this.acknowlegePrerequisitesCheckbox().check();
    await expect(this.wizardNextButton()).toBeEnabled();
    await this.wizardNextButton().click();

    await this.waitForAwsCcsCredentialVerification();

    await this.ensureClusterDetailsScreen();
  }

  /** GCP CCS (Service Account): upload credentials, acknowledge prerequisites, advance to Cluster details. */
  async completeGcpCcsServiceAccountCloudProviderStep(
    cloudProvider: string,
    serviceAccountJson: string,
  ): Promise<void> {
    await this.isCloudProviderSelectionScreen();
    await this.selectCloudProvider(cloudProvider);
    await this.serviceAccountButton().click();
    await this.uploadGCPServiceAccountJSON(serviceAccountJson);
    await this.acknowlegePrerequisitesCheckbox().check();
    await expect(this.wizardNextButton()).toBeEnabled();
    await this.wizardNextButton().click();

    await this.ensureClusterDetailsScreen();
  }

  /** GCP CCS (WIF): select provider, configure WIF, acknowledge prerequisites, advance to Cluster details. */
  async completeGcpCcsWifCloudProviderStep(
    cloudProvider: string,
    wifConfig: string,
  ): Promise<void> {
    await this.isCloudProviderSelectionScreen();
    await this.selectCloudProvider(cloudProvider);
    await this.workloadIdentityFederationButton().click();
    await this.selectWorkloadIdentityConfiguration(wifConfig);
    await this.acknowlegePrerequisitesCheckbox().check();
    await expect(this.wizardNextButton()).toBeEnabled();
    await this.wizardNextButton().click();

    await this.ensureClusterDetailsScreen();
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
    await expect(this.page.getByRole('heading', { name: 'Networking configuration' })).toBeVisible({
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
  clusterNameUniqueError(): Locator {
    return this.page
      .locator(this.clusterNameInputError)
      .filter({ hasText: 'Globally unique name in your organization' });
  }

  async waitForClusterNameAvailable(timeout = 120000): Promise<void> {
    await this.page.locator(this.clusterNameInput).blur();
    await expect(this.clusterNameUniqueError()).not.toBeVisible({ timeout });
  }

  async setClusterNameAndWaitForAvailability(clusterName: string): Promise<void> {
    await this.setClusterName(clusterName);
    await this.hideClusterNameValidation();
    await this.waitForClusterNameAvailable();
  }

  async advanceFromClusterDetailsToMachinePool(): Promise<void> {
    await this.waitForClusterNameAvailable();
    await expect(this.wizardNextButton()).toBeEnabled();
    await this.wizardNextButton().click();
    await this.isMachinePoolScreen();
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

  // Networking screen
  installIntoSharedVpcCheckBox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Install into Google Cloud Shared VPC' });
  }

  sharedHostProjectIdInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Host project ID' });
  }

  createDnsZoneToggle(): Locator {
    return this.page.getByRole('button', { name: 'Create DNS Zone' });
  }

  createDnsZoneCommand(): Locator {
    return this.page.getByLabel('Copyable create DNS zone command');
  }

  dnsZoneDropdown(): Locator {
    return this.page.getByRole('button', { name: 'Options menu' });
  }

  dnsZoneFilterInput(): Locator {
    return this.page.getByLabel('Filter by DNS zone name');
  }

  async selectDnsZone(dnsZone: string, partialMatch: boolean = false): Promise<void> {
    await this.dnsZoneDropdown().click();
    await this.dnsZoneFilterInput().clear();
    await this.dnsZoneFilterInput().fill(dnsZone);
    const escapedDnsZone = this.escapeRegExp(dnsZone);
    const options = partialMatch
      ? this.page.getByRole('option').filter({ hasText: new RegExp(`^${escapedDnsZone}`) })
      : this.page.getByRole('option', { name: dnsZone });
    await expect(options).toHaveCount(1);
    await options.first().click();
  }

  installIntoExistingVpcCheckBox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Install into an existing VPC' });
  }

  vpcSettingsWizardStep(): Locator {
    return this.page.getByRole('button', { name: 'VPC settings' });
  }

  async enableInstallIntoExistingVpc(): Promise<void> {
    await this.installIntoExistingVpcCheckBox().check();
    await expect(this.installIntoExistingVpcCheckBox()).toBeChecked();
    // Wizard only adds the VPC settings step to the nav after Formik install_to_vpc is true.
    await expect(this.vpcSettingsWizardStep()).toBeVisible({ timeout: 15000 });
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

  vpcNameInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Existing VPC name' });
  }

  controlPlaneSubnetInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Control plane subnet name' });
  }

  computeSubnetInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Compute subnet name' });
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

  privateServiceConnectSubnetInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Private Service Connect subnet name' });
  }

  async selectPrivateServiceConnectSubnetName(pscName: string): Promise<void> {
    await this.page
      .locator('select[aria-label="Private Service Connect subnet name"]')
      .selectOption(pscName);
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

  sharedHostProjectIdValue(): Locator {
    return this.page.getByTestId('Google-Cloud-shared-host-project-ID').locator('div');
  }

  dnsZoneValue(): Locator {
    return this.page.getByTestId('DNS-zone').locator('div');
  }

  vpcSubnetSettingsValue(): Locator {
    return this.page.getByTestId('VPC-subnet-settings');
  }

  applicationIngressValue(): Locator {
    return this.page.getByTestId('Application-ingress').locator('div');
  }

  computeNodeRangeValue(): Locator {
    return this.page.getByTestId('Compute-node-range').locator('div');
  }

  routeSelectorsValue(): Locator {
    return this.page.getByTestId('Route-selectors');
  }

  excludedNamespacesValue(): Locator {
    return this.page.getByTestId('Excluded-namespaces');
  }

  excludeNamespaceSelectorsValue(): Locator {
    return this.page.getByTestId('Exclude-namespace-selectors');
  }

  wildcardPolicyValue(): Locator {
    return this.page.getByTestId('Wildcard-policy').locator('div');
  }

  namespaceOwnershipValue(): Locator {
    return this.page.getByTestId('Namespace-ownership-policy').locator('div');
  }

  securityGroupsValue(): Locator {
    return this.page.getByTestId('Security-groups');
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

  async fillMinimumClusterDetailsFields(region: string): Promise<void> {
    await this.setClusterName(`ystream-ch-${Math.random().toString(36).substring(2, 10)}`);
    await this.closePopoverDialogs();
    await this.selectAvailabilityZone('Single Zone');
    await this.selectRegion(region);
  }

  /** Navigates to Cluster details without leaving the wizard (never Back from Details). */
  async ensureClusterDetailsScreen(): Promise<void> {
    const detailsHeading = this.page
      .locator('h3:has-text("Cluster details")')
      .or(this.page.getByRole('heading', { name: 'Cluster details' }));

    if (await detailsHeading.isVisible().catch(() => false)) {
      await this.isClusterDetailsScreen();
      return;
    }

    const machinePoolHeading = this.page.getByRole('heading', {
      name: /Machine pools|Default machine pool/,
    });
    if (await machinePoolHeading.isVisible().catch(() => false)) {
      await this.wizardBackButton().click();
      await this.isClusterDetailsScreen();
      return;
    }

    const detailsStep = this.page.getByRole('button', { name: 'Details', exact: true });
    if (await detailsStep.isVisible().catch(() => false)) {
      await detailsStep.click();
      await this.isClusterDetailsScreen();
      return;
    }

    const clusterDetailsWizardStep = this.clusterSettingsDetailsWizardStep();
    if (await clusterDetailsWizardStep.isVisible().catch(() => false)) {
      await clusterDetailsWizardStep.click();
      await this.isClusterDetailsScreen();
      return;
    }

    await this.isClusterDetailsScreen();
  }

  async navigateWizardBackToClusterDetails(): Promise<void> {
    await this.wizardBackButton().click();
    await this.isClusterUpdatesScreen();
    await this.wizardBackButton().click();
    await this.isCIDRScreen();
    await this.wizardBackButton().click();
    await this.isNetworkingScreen();
    await this.wizardBackButton().click();
    await this.isMachinePoolScreen();
    await this.wizardBackButton().click();
    await this.isClusterDetailsScreen();
  }

  async completeMachinePoolStep(instanceType: string, nodeCount: number): Promise<void> {
    await this.isMachinePoolScreen();
    await this.selectComputeNodeType(instanceType);
    await this.selectComputeNodeCount(nodeCount);
  }

  async advanceOsdWizardToReview(instanceType: string, nodeCount: number): Promise<void> {
    await this.completeMachinePoolStep(instanceType, nodeCount);
    await this.wizardNextButton().click();
    await this.isCIDRScreen();
    await this.wizardNextButton().click();
    await this.isClusterUpdatesScreen();
    await this.wizardNextButton().click();
    await this.isReviewScreen();
  }

  /** Waits for the OCM POST /clusters request issued when Create cluster is clicked. */
  waitForClusterCreatePostRequest() {
    return this.page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        /\/api\/clusters_mgmt\/v1\/clusters\/?(\?|$)/.test(request.url()) &&
        !request.url().includes('/clusters/'),
    );
  }

  parseClusterCreatePostBody(request: { postData(): string | null }): Record<string, unknown> {
    const raw = request.postData();
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
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

  keyArnInput(): Locator {
    return this.page.locator('span input[id="kms_key_arn"]');
  }

  // OSD-only application ingress selectors (shared ingress locators live on BaseWizardPage).
  applicationIngressExcludeNamespaceSelectorKeyInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Exclude namespace selector key' });
  }

  applicationIngressExcludeNamespaceSelectorValuesInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Exclude namespace selector values' });
  }

  applicationIngressNamespaceOwnershipPolicyRadio(): Locator {
    return this.page.getByRole('switch', { name: /^(Strict|Inter-namespace ownership allowed)$/ });
  }

  applicationIngressWildcardPolicyAllowedRadio(): Locator {
    return this.page.getByRole('switch', { name: /^(Allowed|Disallowed)$/ });
  }

  // Validation helper methods
  async selectAutoScaling(autoScale: string): Promise<void> {
    if (autoScale.toLowerCase() === 'disabled') {
      await this.enableAutoscalingCheckbox().uncheck();
    } else {
      await this.enableAutoscalingCheckbox().check();
    }
  }

  // AWS VPC / subnet / security group selectors (role-first; filter by text where FuzzySelect
  // hardcodes aria-label "Options menu"). Shared VPC/SG filter locators live on BaseWizardPage.
  privateSubnetSelectButtons(): Locator {
    return this.page.getByRole('button').filter({ hasText: 'Select private subnet' });
  }

  publicSubnetSelectButtons(): Locator {
    return this.page.getByRole('button').filter({ hasText: 'Select public subnet' });
  }

  applicationIngressWildcardPolicyDisallowedRadio(): Locator {
    return this.page.getByRole('switch', { name: 'Disallowed', exact: true });
  }

  async waitForVPCRefresh(): Promise<void> {
    await this.page.getByRole('progressbar', { name: 'Loading...' }).waitFor({
      state: 'detached',
      timeout: 80000,
    });
    await expect(this.page.getByTestId('refresh-vpcs')).toBeEnabled({ timeout: 80000 });
  }

  async selectVPC(vpcName: string): Promise<void> {
    await this.waitForVPCRefresh();
    await this.vpcSelectButton().click();
    await this.vpcFilterInput().waitFor({ state: 'visible', timeout: 50000 });
    await this.vpcFilterInput().clear();
    await this.vpcFilterInput().fill(vpcName);
    await this.page.getByRole('option').filter({ hasText: vpcName }).click();
    await expect(this.page.getByRole('button').filter({ hasText: vpcName })).toBeVisible({
      timeout: 30000,
    });
  }

  /** Selects the next unselected private subnet toggle (call zones in order 0..n). */
  async selectPrivateSubnet(_index: number, subnetName: string): Promise<void> {
    await this.privateSubnetSelectButtons().first().click();
    await this.subnetFilterInput().clear();
    await this.subnetFilterInput().fill(subnetName);
    await this.page
      .getByRole('option')
      .filter({ hasText: subnetName })
      .or(this.page.getByRole('listitem').filter({ hasText: subnetName }))
      .first()
      .click();
  }

  /** Selects the next unselected public subnet toggle (call zones in order 0..n). */
  async selectPublicSubnet(_index: number, subnetName: string): Promise<void> {
    await this.publicSubnetSelectButtons().first().click();
    await this.subnetFilterInput().clear();
    await this.subnetFilterInput().fill(subnetName);
    await this.page
      .getByRole('option')
      .filter({ hasText: subnetName })
      .or(this.page.getByRole('listitem').filter({ hasText: subnetName }))
      .first()
      .click();
  }

  async selectAdditionalSecurityGroups(securityGroup: string): Promise<void> {
    await this.securityGroupsButton().click();
    // PF Select with role="menu" exposes items as menuitem (name includes SG id description).
    await this.page.getByRole('menuitem').filter({ hasText: securityGroup }).click();
    await this.securityGroupsButton().click();
  }
}
