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

  // Machine pool selectors
  computeNodeTypeButton(): Locator {
    return this.page.locator('button[aria-label="Machine type select toggle"]');
  }

  computeNodeTypeSearchInput(): Locator {
    return this.page.locator('input[aria-label="Machine type select search field"]');
  }

  computeNodeCountSelect(): Locator {
    return this.page.locator('select[name="nodes_compute"]');
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
    await expect(this.page.locator('h3:has-text("CIDR ranges")')).toBeVisible({ timeout: 30000 });
  }

  async isClusterUpdatesScreen(): Promise<void> {
    await expect(this.page.locator('h3:has-text("Cluster update strategy")')).toBeVisible({
      timeout: 30000,
    });
  }

  async isReviewScreen(): Promise<void> {
    await expect(this.page.locator('h2:has-text("Review your dedicated cluster")')).toBeVisible({
      timeout: 30000,
    });
  }

  get CCSSelected(): string {
    return '[data-testid="ccs-selected"], [class*="radio"]:checked + [class*="radio__label"]:has-text("CCS")';
  }

  get TrialSelected(): string {
    return '[data-testid="trial-selected"], [class*="radio"]:checked + [class*="radio__label"]:has-text("Trial")';
  }

  // Billing model screen elements
  subscriptionTypeAnnualFixedCapacityRadio(): Locator {
    return this.page.locator('input[name="billing_model"][value="standard"]');
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
    return this.page.locator('button[id="workloadIdentityFederation"]');
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
    await this.page.locator('select[name="nodes_compute"]').selectOption(nodeCount.toString());
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
        .check({ force: true });
    } else {
      await this.clusterPrivacyPublicRadio().check({ force: true });
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

  // CIDR screen
  cidrDefaultValuesCheckBox(): Locator {
    return this.page.locator('input[id="cidr_default_values_enabled"]');
  }

  machineCIDRInput(): Locator {
    return this.page.locator('input[id="network_machine_cidr"]');
  }

  serviceCIDRInput(): Locator {
    return this.page.locator('input[id="network_service_cidr"]');
  }

  podCIDRInput(): Locator {
    return this.page.locator('input[id="network_pod_cidr"]');
  }

  hostPrefixInput(): Locator {
    return this.page.locator('input[id="network_host_prefix"]');
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
    return this.page.getByTestId('Private-service-connect').locator('div');
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
}
