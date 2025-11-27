import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Create ROSA Wizard page object for Playwright tests
 */
export class CreateRosaWizardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Button selectors
  rosaCreateClusterButton(): Locator {
    return this.page.getByTestId('rosa-create-cluster-button');
  }

  rosaNextButton(): Locator {
    return this.page.getByTestId('wizard-next-button');
  }

  rosaBackButton(): Locator {
    return this.page.getByTestId('wizard-back-button');
  }

  rosaCancelButton(): Locator {
    return this.page.getByTestId('wizard-cancel-button');
  }

  rosaClusterWithCLI(): Locator {
    return this.page.locator('a').filter({ hasText: 'With CLI' });
  }

  rosaClusterWithWeb(): Locator {
    return this.page.locator('a').filter({ hasText: 'With web interface' });
  }

  createClusterButton(): Locator {
    return this.page.getByTestId('wizard-next-button');
  }

  // Control plane type selectors
  selectHostedControlPlaneTypeOption(): Locator {
    return this.page.getByTestId('hosted-control-planes');
  }

  selectStandaloneControlPlaneTypeOption(): Locator {
    return this.page.getByTestId('standalone-control-planes');
  }

  // Account and role selectors
  howToAssociateNewAWSAccountButton(): Locator {
    return this.page.getByTestId('launch-associate-account-btn');
  }

  howToAssociateNewAWSAccountDrawerCloseButton(): Locator {
    return this.page.getByTestId('close-associate-account-btn');
  }

  howToAssociateNewAWSAccountDrawerXButton(): Locator {
    return this.page.getByRole('button', { name: 'Close drawer panel' });
  }

  // AWS Account Drawer Step Buttons
  rosaAssociateDrawerFirstStepButton(): Locator {
    return this.page.getByRole('button', { name: 'Step 1: OCM role' });
  }

  rosaAssociateDrawerSecondStepButton(): Locator {
    return this.page.getByRole('button', { name: 'Step 2: User role' });
  }

  rosaAssociateDrawerThirdStepButton(): Locator {
    return this.page.getByRole('button', { name: 'Step 3: Account roles' });
  }

  // OCM Role Fields and Tabs
  rosaListOcmField(): Locator {
    return this.page.getByRole('textbox', { name: 'Copyable ROSA rosa list ocm-' });
  }

  rosaCreateOcmTab(): Locator {
    return this.page.getByRole('button', { name: 'No, create new role' });
  }

  rosaLinkOcmTab(): Locator {
    return this.page.getByRole('button', { name: 'Yes, link existing role' });
  }

  rosaCreateOcmField(): Locator {
    return this.page
      .getByTestId('copy-rosa-create-ocm-role')
      .getByRole('textbox', { name: 'Copyable ROSA create ocm-role' });
  }

  rosaCreateOcmAdminField(): Locator {
    return this.page.getByRole('textbox', { name: 'Copyable ROSA create ocm-role --admin' });
  }

  rosaLinkOcmField(): Locator {
    return this.page.getByRole('textbox', { name: 'Copyable rosa link ocm-role <' });
  }

  rosaHelpMeDecideButton(): Locator {
    return this.page.getByRole('button', { name: 'Help me decide' });
  }

  // User Role Fields and Tabs
  rosaListUserField(): Locator {
    return this.page.getByRole('textbox', { name: 'Copyable ROSA rosa list user-' });
  }

  rosaCreateUserTab(): Locator {
    return this.page
      .getByTestId('copy-user-role-tab-no')
      .getByRole('button', { name: 'No, create new role' });
  }

  rosaLinkUserTab(): Locator {
    return this.page
      .getByTestId('copy-user-role-tab-yes')
      .getByRole('button', { name: 'Yes, link existing role' });
  }

  rosaCreateUserField(): Locator {
    return this.page.getByRole('textbox', { name: 'Copyable ROSA create user-role' });
  }

  rosaLinkUserField(): Locator {
    return this.page.getByRole('textbox', { name: 'Copyable ROSA link user-role' });
  }

  // Account Roles Field
  rosaCreateAccountRolesField(): Locator {
    return this.page.getByRole('textbox', { name: 'Copyable ROSA rosa create' });
  }

  refreshInfrastructureAWSAccountButton(): Locator {
    return this.page.getByTestId('refresh-aws-accounts').first();
  }

  // Input fields
  clusterNameInput(): Locator {
    return this.page.locator('input[name="name"]');
  }

  createCustomDomainPrefixCheckbox(): Locator {
    return this.page.locator('input[id="has_domain_prefix"]');
  }

  domainPrefixInput(): Locator {
    return this.page.locator('input[name="domain_prefix"]');
  }

  regionSelect(): Locator {
    return this.page.locator('select[name="region"]');
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

  enableAutoScalingCheckbox(): Locator {
    return this.page.locator('input[id="autoscalingEnabled"]');
  }

  useBothIMDSv1AndIMDSv2Radio(): Locator {
    return this.page.getByTestId('imds-optional');
  }

  useIMDSv2Radio(): Locator {
    return this.page.getByTestId('imds-required');
  }

  rootDiskSizeInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Worker root disk size' });
  }

  // Networking selectors
  clusterPrivacyPublicRadio(): Locator {
    return this.page.getByTestId('cluster_privacy-external');
  }

  clusterPrivacyPrivateRadio(): Locator {
    return this.page.getByTestId('cluster_privacy-internal');
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

  // Update strategy selectors
  individualUpdateRadio(): Locator {
    return this.page.getByTestId('upgrade_policy-manual');
  }

  recurringUpdateRadio(): Locator {
    return this.page.getByTestId('upgrade_policy-automatic');
  }

  // Availability zone selectors
  multiZoneAvilabilityRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Multi-zone' });
  }

  singleZoneAvailabilityRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Single zone' });
  }

  computeNodeCountInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Compute nodes' });
  }

  computeNodeCountDecrementButton(): Locator {
    return this.page.getByRole('button', { name: 'Decrement compute nodes' });
  }

  computeNodeCountIncrementButton(): Locator {
    return this.page.getByRole('button', { name: 'Increment compute nodes' });
  }
  // Node label selectors
  editNodeLabelLink(): Locator {
    return this.page.getByRole('button', { name: 'Add node labels' });
  }

  addAdditionalLabelLink(): Locator {
    return this.page.getByRole('button', { name: 'Add additional label' });
  }

  // FIPS encryption selectors
  enableFIPSCryptographyCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Enable FIPS cryptography' });
  }

  // VPC installation selector
  installIntoExistingVpcCheckbox(): Locator {
    return this.page.locator('#install_to_vpc');
  }

  // Grace period selector
  gracePeriodSelect(): Locator {
    return this.page.getByTestId('grace-period-select');
  }

  // Additional security groups selectors
  additionalSecurityGroupsLink(): Locator {
    return this.page.getByRole('button', { name: 'Additional security groups' });
  }

  applySameSecurityGroupsToAllNodeTypes(): Locator {
    return this.page.getByRole('checkbox', {
      name: 'Apply the same security groups to all node types',
    });
  }

  securityGroupsButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Select security groups' });
  }

  securityGroupsFilterInput(): Locator {
    return this.page.locator('input[placeholder="Filter by security group ID / name"]');
  }

  // Role provider mode selectors
  createModeAutoRadio(): Locator {
    return this.page.getByTestId('rosa_roles_provider_creation_mode-auto');
  }

  createModeManualRadio(): Locator {
    return this.page.getByTestId('rosa_roles_provider_creation_mode-manual');
  }

  // VPC and subnet selectors
  vpcSelectButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Select a VPC' });
  }

  vpcFilterInput(): Locator {
    return this.page.locator('input[placeholder="Filter by VPC ID / name"]');
  }

  publicSubnetButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Select public subnet' });
  }

  subnetFilterInput(): Locator {
    return this.page.locator('input[placeholder="Filter by subnet ID / name"]');
  }

  // Screen validation methods
  async isCreateRosaPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/openshift\/create\/rosa\/wizard/);
  }

  async waitAndClick(buttonLocator: Locator, timeout: number = 60000): Promise<void> {
    await buttonLocator.waitFor({ state: 'visible', timeout });
    await buttonLocator.click();
  }

  async isControlPlaneTypeScreen(): Promise<void> {
    // Wait for h2 with specific text to load and be visible
    await this.page
      .locator('h2', { hasText: 'Welcome to Red Hat OpenShift Service on AWS (ROSA)' })
      .waitFor({ timeout: 90000, state: 'visible' });

    // Wait for h3 with specific text to load and be visible
    await this.page
      .locator('h3', {
        hasText: 'Select the ROSA architecture based on your control plane requirements',
      })
      .waitFor({ timeout: 90000, state: 'visible' });
  }

  async isAccountsAndRolesScreen(): Promise<void> {
    await this.page
      .locator('h3', { hasText: 'AWS infrastructure account' })
      .waitFor({ timeout: 90000, state: 'visible' });
  }

  async isClusterDetailsScreen(): Promise<void> {
    await expect(this.page.locator('h3:has-text("Cluster details")')).toBeVisible({
      timeout: 30000,
    });

    // Wait for cluster version dropdown to be visible to avoid flaky behavior
    await this.page
      .locator('button[id="version-selector"]')
      .waitFor({ state: 'visible', timeout: 80000 });
  }

  async isClusterMachinepoolsScreen(hosted: boolean = false): Promise<void> {
    const machinePoolHeaderText = hosted ? 'Machine pools' : 'Default machine pool';
    await expect(
      this.page.locator('h3').filter({ hasText: new RegExp(`^${machinePoolHeaderText}$`) }),
    ).toBeVisible({ timeout: 30000 });
  }

  async isAssociateAccountsDrawer(): Promise<void> {
    await expect(
      this.page.locator('h2:has-text("How to associate a new AWS account")'),
    ).toBeVisible({ timeout: 30000 });
  }

  async isNotAssociateAccountsDrawer(): Promise<void> {
    await expect(
      this.page.locator('h2:has-text("How to associate a new AWS account")'),
    ).not.toBeVisible({ timeout: 5000 });
  }

  // Action methods
  async selectHostedControlPlaneType(): Promise<void> {
    await this.selectHostedControlPlaneTypeOption().click({ force: true });
  }

  async selectAWSInfrastructureAccount(accountID: string): Promise<void> {
    await this.page.locator('button[id="associated_aws_id"]').click();
    await this.page
      .locator('input[placeholder*="Filter by account ID"]')
      .waitFor({ state: 'visible', timeout: 50000 });
    await this.page.locator('input[placeholder*="Filter by account ID"]').clear();
    await this.page.locator('input[placeholder*="Filter by account ID"]').fill(accountID);
    await this.page.locator('li').filter({ hasText: accountID }).click();
  }

  async selectAWSBillingAccount(accountID: string): Promise<void> {
    await this.page.locator('#billing_account_id').click();
    await this.page
      .locator('input[placeholder*="Filter by account ID"]')
      .waitFor({ state: 'visible', timeout: 50000 });
    await this.page.locator('input[placeholder*="Filter by account ID"]').clear();
    await this.page.locator('input[placeholder*="Filter by account ID"]').fill(accountID);
    await this.page.locator('li').filter({ hasText: accountID }).click();
  }

  async waitForARNList(): Promise<void> {
    await this.page.getByRole('progressbar', { name: 'Loading...' }).waitFor({
      state: 'detached',
      timeout: 80000,
    });
    await this.page.waitForSelector('[data-testid="spinner-loading-arn-text"]', {
      state: 'detached',
      timeout: 80000,
    });
  }

  async selectInstallerRole(roleName: string): Promise<void> {
    const installerButton = this.page.locator('button').filter({ hasText: /Installer-Role$/ });
    const buttonText = await installerButton.textContent();

    if (buttonText?.includes(roleName)) {
      console.log(`Installer ARN ${roleName} already selected from the list.`);
    } else {
      await installerButton.click();
      await this.page
        .locator('div[id="installer_role_arn"]')
        .locator('button')
        .filter({ hasText: roleName })
        .scrollIntoViewIfNeeded();
      await this.page
        .locator('div[id="installer_role_arn"]')
        .locator('button')
        .filter({ hasText: roleName })
        .click({ force: true });
    }
  }

  async selectRegion(region: string): Promise<void> {
    await this.regionSelect().selectOption(region);
  }

  async setClusterName(clusterName: string): Promise<void> {
    await this.clusterNameInput().scrollIntoViewIfNeeded();
    await this.clusterNameInput().selectText();
    await this.clusterNameInput().fill(clusterName);
    await this.clusterNameInput().blur();
  }

  async setDomainPrefix(domainPrefix: string): Promise<void> {
    await this.domainPrefixInput().scrollIntoViewIfNeeded();
    await this.domainPrefixInput().selectText();
    await this.domainPrefixInput().fill(domainPrefix);
    await this.domainPrefixInput().blur();
  }

  async closePopoverDialogs(): Promise<void> {
    const closeButtons = this.page.locator('button[aria-label="Close"]');
    const count = await closeButtons.count();

    for (let i = 0; i < count; i++) {
      const button = closeButtons.nth(i);
      try {
        if (await button.isVisible()) {
          await button.click();
        }
      } catch (error) {
        // Continue if button is not clickable
        console.log(`Could not click close button ${i}:`, error);
      }
    }
  }

  async waitForVPCList(): Promise<void> {
    await this.page.getByRole('progressbar', { name: 'Loading...' }).waitFor({
      state: 'detached',
      timeout: 80000,
    });
    await expect(this.page.getByTestId('refresh-vpcs')).not.toBeDisabled({ timeout: 80000 });
  }

  async selectVPC(vpcName: string): Promise<void> {
    await this.vpcSelectButton().click();
    await this.vpcFilterInput().waitFor({ state: 'visible', timeout: 50000 });
    await this.vpcFilterInput().clear();
    await this.vpcFilterInput().fill(vpcName);
    await this.page.locator('text=' + vpcName).scrollIntoViewIfNeeded();
    await this.page.locator('text=' + vpcName).click();
  }

  async selectVersion(version: string): Promise<void> {
    if (version !== '') {
      await this.page.locator('button[id="version-selector"]').click();
      await this.page.getByRole('option', { name: version }).click();
    }
  }

  async selectMachinePoolPrivateSubnet(
    privateSubnetNameOrId: string,
    machinePoolIndex: number = 1,
    viewUsedSubnets = false,
  ): Promise<void> {
    const mpIndex = machinePoolIndex - 1;
    await this.page.locator(`button[id="machinePoolsSubnets[${mpIndex}].privateSubnetId"]`).click();
    if (viewUsedSubnets) {
      await this.page.getByRole('option', { name: 'View Used Subnets' }).click();
    }
    await this.subnetFilterInput().waitFor({ state: 'visible', timeout: 50000 });
    await this.subnetFilterInput().clear();
    await this.subnetFilterInput().fill(privateSubnetNameOrId);
    await this.page
      .locator('li')
      .filter({ hasText: privateSubnetNameOrId })
      .scrollIntoViewIfNeeded();
    await this.page.locator('li').filter({ hasText: privateSubnetNameOrId }).click();
  }

  async checkVieworHideUsedSubnetsPresence(
    usedSubnetNameOrId: string,
    machinePoolIndex: number = 1,
  ): Promise<void> {
    const mpIndex = machinePoolIndex - 1;
    const subnetButton = this.page.locator(
      `button[id="machinePoolsSubnets[${mpIndex}].privateSubnetId"]`,
    );
    await subnetButton.click();
    const viewUsedSubnetsButton = this.page.getByRole('option', { name: 'View Used Subnets' });
    await viewUsedSubnetsButton.scrollIntoViewIfNeeded();
    await expect(viewUsedSubnetsButton).toBeVisible();
    await viewUsedSubnetsButton.click();

    const usedSubnetItem = this.page.locator('li').filter({ hasText: usedSubnetNameOrId });
    await usedSubnetItem.scrollIntoViewIfNeeded();
    await expect(usedSubnetItem).toBeVisible();

    const hideUsedSubnetsButton = this.page.getByRole('option', { name: 'Hide Used Subnets' });
    await hideUsedSubnetsButton.scrollIntoViewIfNeeded();
    await expect(hideUsedSubnetsButton).toBeVisible();
    await hideUsedSubnetsButton.click();

    await expect(usedSubnetItem).not.toBeVisible();

    await viewUsedSubnetsButton.scrollIntoViewIfNeeded();
    await expect(viewUsedSubnetsButton).toBeVisible();

    await subnetButton.blur();
  }

  async selectMachinePoolPublicSubnet(publicSubnetNameOrId: string): Promise<void> {
    await this.publicSubnetButton().click();
    await this.subnetFilterInput().waitFor({ state: 'visible', timeout: 50000 });
    await this.subnetFilterInput().clear();
    await this.subnetFilterInput().fill(publicSubnetNameOrId);
    await this.page.locator('text=' + publicSubnetNameOrId).scrollIntoViewIfNeeded();
    await this.page.locator('text=' + publicSubnetNameOrId).click();
  }

  async selectComputeNodeType(computeNodeType: string): Promise<void> {
    await this.computeNodeTypeButton().click();
    await this.computeNodeTypeSearchInput().clear();
    await this.computeNodeTypeSearchInput().fill(computeNodeType);
    await this.page.getByRole('button', { name: computeNodeType }).click();
  }

  async enableAutoScaling(): Promise<void> {
    await this.enableAutoScalingCheckbox().check();
  }

  async disabledAutoScaling(): Promise<void> {
    await this.enableAutoScalingCheckbox().uncheck();
  }

  async selectComputeNodeCount(count: string): Promise<void> {
    await this.computeNodeCountInput().clear();
    await this.computeNodeCountInput().fill(count);
    await this.computeNodeCountInput().blur();
  }

  async selectClusterPrivacy(privacy: string): Promise<void> {
    if (privacy.toLowerCase() === 'private') {
      await this.clusterPrivacyPrivateRadio().check();
    } else {
      await this.clusterPrivacyPublicRadio().check();
    }
  }

  async useCIDRDefaultValues(value: boolean = true): Promise<void> {
    if (value) {
      await this.cidrDefaultValuesCheckBox().check();
    } else {
      await this.cidrDefaultValuesCheckBox().uncheck();
    }
  }

  async selectOidcConfigId(configID: string): Promise<void> {
    await this.page.locator('button').filter({ hasText: 'Select a config id' }).click();
    await this.page.locator('input[placeholder="Filter by config ID"]').clear();
    await this.page.locator('input[placeholder="Filter by config ID"]').fill(configID);
    await this.page.getByRole('option', { name: configID }).click();
  }

  async isClusterPropertyMatchesValue(property: string, value: string): Promise<void> {
    await expect(
      this.page
        .locator('span.pf-v6-c-description-list__text')
        .filter({ hasText: property })
        .locator('..')
        .locator('~ *')
        .locator('div'),
    ).toContainText(value);
  }

  // Additional selectors for validation tests
  advancedEncryptionLink(): Locator {
    return this.page.getByRole('button', { name: 'Advanced Encryption' });
  }

  useCustomKMSKeyRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Use custom KMS keys' });
  }

  useDefaultKMSKeyRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Use default KMS Keys' });
  }

  customerManageKeyARNInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Key ARN' });
  }

  enableAdditionalEtcdEncryptionCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Enable additional etcd' });
  }

  enableEncyptEtcdWithCustomKMSKeyCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Encrypt etcd with a custom' });
  }

  encryptEtcdKeyARNInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Key ARN' });
  }

  addMachinePoolLink(): Locator {
    return this.page.getByRole('button', { name: 'Add machine pool' });
  }

  minimumNodeCountInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Minimum nodes' });
  }

  maximumNodeCountInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Maximum nodes' });
  }

  minimumNodeInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Minimum nodes' });
  }

  maximumNodeInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Maximum nodes' });
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

  enableConfigureClusterWideProxyCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Configure a cluster-wide proxy' });
  }

  httpProxyInput(): Locator {
    return this.page.getByRole('textbox', { name: 'HTTP proxy URL' });
  }

  httpsProxyInput(): Locator {
    return this.page.getByRole('textbox', { name: 'HTTPS proxy URL' });
  }

  noProxyDomainsInput(): Locator {
    return this.page.getByRole('textbox', { name: 'No Proxy domains' });
  }

  backToNetworkingConfigurationLink(): Locator {
    return this.page.getByRole('button', { name: 'Back to the networking' });
  }

  customOperatorPrefixInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Operator roles prefix' });
  }

  // Screen validation methods for additional screens
  async isNetworkingScreen(): Promise<void> {
    await expect(this.page.locator('h3:has-text("Configuration")')).toBeVisible({ timeout: 30000 });
  }

  async isClusterWideProxyScreen(): Promise<void> {
    await expect(this.page.locator('h3:has-text("Cluster-wide proxy")')).toBeVisible({
      timeout: 30000,
    });
  }

  async isCIDRScreen(): Promise<void> {
    await expect(this.page.locator('h3:has-text("CIDR ranges")')).toBeVisible({ timeout: 30000 });
  }

  async isClusterRolesAndPoliciesScreen(): Promise<void> {
    await expect(this.page.locator('h3:has-text("Cluster roles and policies")')).toBeVisible({
      timeout: 30000,
    });
  }

  // Action methods for validation tests
  async inputCustomerManageKeyARN(arn: string): Promise<void> {
    await this.customerManageKeyARNInput().clear();
    await this.customerManageKeyARNInput().fill(arn);
    await this.customerManageKeyARNInput().blur();
  }

  async inputEncryptEtcdKeyARN(arn: string): Promise<void> {
    await this.encryptEtcdKeyARNInput().clear();
    await this.encryptEtcdKeyARNInput().fill(arn);
    await this.encryptEtcdKeyARNInput().blur();
  }

  async removeMachinePool(index: number): Promise<void> {
    let mpIndex = index - 1;
    await this.page.getByTestId(`remove-machine-pool-${mpIndex}`).click();
  }

  async setMinimumNodeCount(count: string): Promise<void> {
    await this.minimumNodeCountInput().clear();
    await this.minimumNodeCountInput().fill(count);
    await this.minimumNodeCountInput().blur();
  }

  async setMaximumNodeCount(count: string): Promise<void> {
    await this.maximumNodeCountInput().clear();
    await this.maximumNodeCountInput().fill(count);
    await this.maximumNodeCountInput().blur();
  }

  async enableConfigureClusterWideProxy(): Promise<void> {
    await this.enableConfigureClusterWideProxyCheckbox().check();
  }

  async isTextContainsInPage(text: string, present: boolean = true): Promise<void> {
    const locator = this.page.locator('body').filter({ hasText: text });
    if (present) {
      await expect(locator).toBeVisible();
    } else {
      await expect(locator).not.toBeVisible();
    }
  }

  async selectRoleProviderMode(mode: string): Promise<void> {
    if (mode.toLowerCase() === 'auto') {
      await this.createModeAutoRadio().check();
    } else {
      await this.createModeManualRadio().check();
    }
  }

  async selectUpdateStratergy(strategy: string): Promise<void> {
    if (strategy.toLowerCase().includes('individual')) {
      await this.individualUpdateRadio().check();
    } else {
      await this.recurringUpdateRadio().check();
    }
  }

  async selectAvailabilityZone(availability: string): Promise<void> {
    if (
      availability.toLowerCase().includes('multiple') ||
      availability.toLowerCase().includes('multi')
    ) {
      await this.multiZoneAvilabilityRadio().click();
    } else {
      await this.singleZoneAvailabilityRadio().click();
    }
  }

  async addNodeLabelKeyAndValue(key: string, value: string = '', index: number = 0): Promise<void> {
    const keyInputs = this.page.locator('input[aria-label="Key-value list key"]');
    const valueInputs = this.page.locator('input[aria-label="Key-value list value"]');

    // Get the specific key input at the given index
    const keyInput = keyInputs.nth(index);
    await keyInput.clear();
    await keyInput.fill(key);

    // Get the specific value input at the given index
    const valueInput = valueInputs.nth(index);
    await valueInput.clear();
    await valueInput.fill(value);
  }

  async isNodeLabelKeyAndValue(key: string, value: string, index: number): Promise<void> {
    const keyInputs = this.page.locator('input[aria-label="Key-value list key"]');
    const valueInputs = this.page.locator('input[aria-label="Key-value list value"]');

    // Get the specific key input at the given index
    const keyInput = keyInputs.nth(index);
    await expect(keyInput).toHaveValue(key);

    // Get the specific value input at the given index
    const valueInput = valueInputs.nth(index);
    await expect(valueInput).toHaveValue(value);
  }

  async enableInstallIntoExistingVpc(): Promise<void> {
    await this.installIntoExistingVpcCheckbox().check();
  }

  async selectGracePeriod(period: string): Promise<void> {
    await this.gracePeriodSelect().click();
    await this.page.getByRole('option', { name: period }).click();
  }

  async selectAdditionalSecurityGroups(securityGroup: string): Promise<void> {
    await this.securityGroupsButton().click();
    await this.page.locator('li').filter({ hasText: securityGroup }).click();
    await this.securityGroupsButton().click();
  }

  // VPC screen validation methods
  async isVPCSettingsScreen(): Promise<void> {
    await expect(
      this.page.locator('h3:has-text("Virtual Private Cloud (VPC) subnet settings")'),
    ).toBeVisible({ timeout: 30000 });
  }

  // VPC subnet selection methods for advanced networking
  async selectSubnetAvailabilityZone(zone: string): Promise<void> {
    await this.page
      .locator('button')
      .filter({ hasText: 'Select availability zone' })
      .first()
      .click();
    await this.page.getByRole('option', { name: zone }).click();
  }

  async selectPrivateSubnet(index: number, subnetName: string): Promise<void> {
    const privateSubnetButton = this.page.locator(
      `[id="machinePoolsSubnets[${index}].privateSubnetId"]`,
    );
    await privateSubnetButton.click();
    await this.subnetFilterInput().clear();
    await this.subnetFilterInput().fill(subnetName);
    await this.page.locator('li').filter({ hasText: subnetName }).click();
  }

  async selectPublicSubnet(index: number, subnetName: string): Promise<void> {
    const publicSubnetButton = this.page.locator(
      `[id="machinePoolsSubnets[${index}].publicSubnetId"]`,
    );
    await publicSubnetButton.click();
    await this.subnetFilterInput().clear();
    await this.subnetFilterInput().fill(subnetName);
    await this.page.locator('li').filter({ hasText: subnetName }).click();
  }

  // Validation methods for subnet selections
  async isSubnetAvailabilityZoneSelected(zone: string): Promise<void> {
    const zoneButton = this.page
      .locator('button[aria-label="Options menu"]')
      .filter({ hasText: zone })
      .first();
    await expect(zoneButton).toBeVisible();
  }

  async isPrivateSubnetSelected(index: number, subnetName: string): Promise<void> {
    const privateSubnetButton = this.page.locator(
      `[id="machinePoolsSubnets[${index}].privateSubnetId"]`,
    );
    await expect(privateSubnetButton).toContainText(subnetName);
  }

  async isPubliceSubnetSelected(index: number, subnetName: string): Promise<void> {
    const publicSubnetButton = this.page.locator(
      `[id="machinePoolsSubnets[${index}].publicSubnetId"]`,
    );
    await expect(publicSubnetButton).toContainText(subnetName);
  }

  // Additional methods for review step editing
  async clickEditStepOfSection(sectionName: string): Promise<void> {
    const editButton = this.page
      .locator('button')
      .filter({ hasText: 'Edit' })
      .locator('..')
      .locator('..')
      .filter({ hasText: sectionName })
      .locator('button')
      .filter({ hasText: 'Edit' });
    await editButton.click();
  }

  // Cluster autoscaling settings selectors
  editClusterAutoscalingSettingsButton(): Locator {
    return this.page.getByTestId('set-cluster-autoscaling-btn');
  }

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

  // Application ingress selectors for networking validations
  applicationIngressCustomSettingsRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Custom settings' });
  }

  applicationIngressRouterSelectorsInput(): Locator {
    return this.page.locator('#defaultRouterSelectors');
  }

  applicationIngressExcludedNamespacesInput(): Locator {
    return this.page.locator('#defaultRouterExcludedNamespacesFlag');
  }

  // Support role inputs for validation
  supportRoleInput(): Locator {
    return this.page.locator('input[name="support_role_arn"]');
  }

  workerRoleInput(): Locator {
    return this.page.locator('input[name="worker_role_arn"]');
  }

  controlPlaneRoleInput(): Locator {
    return this.page.locator('input[name="control_plane_role_arn"]');
  }

  // Additional validation method for compute node range
  computeNodeRangeValue(): Locator {
    return this.page.getByTestId('Compute-node-range');
  }
}
