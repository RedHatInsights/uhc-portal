import { expect, Locator, Page } from '@playwright/test';

import {
  clearQuotaCostMock as clearQuotaCostRouteMock,
  mockQuotaCostWithBillingContract as mockQuotaCostRouteWithBillingContract,
} from '../support/quota-mock-helper';
import { BaseWizardPage } from './base-wizard-page';

/**
 * Create ROSA Wizard page object for Playwright tests.
 * ROSA-specific wizard logic only; shared version/channel helpers live on BaseWizardPage.
 */
export class CreateRosaWizardPage extends BaseWizardPage {
  constructor(page: Page) {
    super(page);
  }

  // Button selectors
  rosaCreateClusterButton(): Locator {
    return this.page.getByTestId('rosa-create-cluster-button');
  }

  /** Alias kept for existing ROSA specs; same as shared wizardNextButton(). */
  rosaNextButton(): Locator {
    return this.wizardNextButton();
  }

  /** Alias kept for existing ROSA specs; same as shared wizardBackButton(). */
  rosaBackButton(): Locator {
    return this.wizardBackButton();
  }

  /** Alias kept for existing ROSA specs; same as shared wizardCancelButton(). */
  rosaCancelButton(): Locator {
    return this.wizardCancelButton();
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

  refreshAWSBillingAccountButton(): Locator {
    return this.page.getByTestId('refresh-aws-accounts').nth(1);
  }

  billingContractConfirmationDialog(): Locator {
    return this.page.getByRole('dialog', {
      name: 'Continue without a contracted billing account?',
    });
  }

  continueWithBillingSelectionButton(): Locator {
    return this.billingContractConfirmationDialog().getByRole('button', {
      name: 'Continue with selection',
    });
  }

  goBackFromBillingConfirmationButton(): Locator {
    return this.billingContractConfirmationDialog().getByRole('button', { name: 'Go back' });
  }

  contractEnabledForBillingAccountButton(): Locator {
    return this.page.getByRole('button', { name: 'Contract enabled for this billing account' });
  }

  billingContractWarningTitle(): Locator {
    return this.page.getByText('No contract on selected billing account');
  }

  // Input fields
  /** Locator API for ROSA specs; delegates to shared clusterNameField(). */
  clusterNameInput(): Locator {
    return this.clusterNameField();
  }

  // Machine pool selectors
  computeNodeCountSelect(): Locator {
    return this.page.locator('select[name="nodes_compute"]');
  }

  useIMDSv2Radio(): Locator {
    return this.page.getByTestId('imds-required');
  }

  rootDiskSizeInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Worker root disk size' });
  }

  // Node label selectors
  editNodeLabelLink(): Locator {
    return this.page.getByRole('button', { name: 'Add node labels' });
  }

  addAdditionalLabelLink(): Locator {
    return this.page.getByRole('button', { name: 'Add additional label' });
  }

  // VPC installation selector
  installIntoExistingVpcCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Install into an existing VPC' });
  }

  usePrivateLinkCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Use a PrivateLink' });
  }

  // ROSA-specific; shared security group locators live on BaseWizardPage.
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

  // VPC and subnet selectors (shared vpcSelectButton / vpcFilterInput / subnetFilterInput on BaseWizardPage)
  publicSubnetButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Select public subnet' });
  }

  clusterPrivacyPublicSubnetButton(): Locator {
    return this.page.locator('button[id="cluster_privacy_public_subnet_id"]');
  }

  // Screen validation methods
  async isCreateRosaPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/openshift\/create\/rosa\/wizard/);
  }

  async isControlPlaneTypeScreen(): Promise<void> {
    // Wait for h2 with specific text to load and be visible
    await this.page.getByRole('heading', { name: 'Welcome to Red Hat OpenShift Service on AWS (ROSA)' })
      .waitFor({ timeout: 90000, state: 'visible' });

    // Wait for h3 with specific text to load and be visible
    await this.page.getByRole('heading', {
      name: 'Select the ROSA architecture based on your control plane requirements',
      })
      .waitFor({ timeout: 90000, state: 'visible' });
  }

  async isAccountsAndRolesScreen(): Promise<void> {
    await this.page
      .locator('h3', { hasText: 'AWS infrastructure account' })
      .waitFor({ timeout: 90000, state: 'visible' });
  }

  async isClusterMachinepoolsScreen(hosted: boolean = false): Promise<void> {
    const machinePoolHeaderText = hosted ? 'Machine pools' : 'Default machine pool';
    await expect(
      this.page.getByRole('heading', { name: new RegExp(`^${machinePoolHeaderText}$`) }),
    ).toBeVisible({ timeout: 30000 });
  }

  async waitForNetworkingConfigurationScreen(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Networking configuration' })).toBeVisible({
      timeout: 60000,
    });
    await expect(this.clusterPrivacyPublicRadio()).toBeVisible({ timeout: 30000 });
  }

  async navigateNextFromMachinePools(): Promise<void> {
    await expect(this.rosaNextButton()).toBeEnabled({ timeout: 30000 });
    await this.rosaNextButton().click();
    await this.waitForNetworkingConfigurationScreen();
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

  async mockQuotaCostWithBillingContract(
    contractedAccountId: string,
    billingAccountIds: string[] = [],
  ): Promise<void> {
    await mockQuotaCostRouteWithBillingContract(
      this.page,
      contractedAccountId,
      billingAccountIds,
    );
  }

  async clearQuotaCostMock(): Promise<void> {
    await clearQuotaCostRouteMock(this.page);
  }

  async refreshAWSBillingAccounts(): Promise<void> {
    const quotaCostResponse = this.page.waitForResponse(
      (response) => response.url().includes('quota_cost') && response.ok(),
    );
    await this.refreshAWSBillingAccountButton().click();
    await quotaCostResponse;
    await expect(this.refreshAWSBillingAccountButton()).toBeEnabled({ timeout: 60000 });
  }

  async expectBillingContractConfirmationDialog(visible = true): Promise<void> {
    if (visible) {
      await expect(this.billingContractConfirmationDialog()).toBeVisible({ timeout: 15000 });
    } else {
      await expect(this.billingContractConfirmationDialog()).toBeHidden({ timeout: 15000 });
    }
  }

  async expectBillingContractConfirmationShowsAccount(accountId: string): Promise<void> {
    await this.expectBillingContractConfirmationDialog(true);
    await expect(
      this.billingContractConfirmationDialog().getByText(
        `The selected account ${accountId} does not have any`,
      ),
    ).toBeVisible();
  }

  async expectContractEnabledForBillingAccount(visible = true): Promise<void> {
    if (visible) {
      await expect(this.contractEnabledForBillingAccountButton()).toBeVisible({ timeout: 15000 });
    } else {
      await expect(this.contractEnabledForBillingAccountButton()).toBeHidden({ timeout: 15000 });
    }
  }

  /**
   * Inline warning shown when the selected billing account has no contract while
   * another linked account does.
   */
  async expectBillingContractWarning(visible = true, accountId?: string): Promise<void> {
    if (visible) {
      await expect(this.billingContractWarningTitle()).toBeVisible({ timeout: 15000 });
      if (accountId) {
        await expect(
          this.page.getByText(`The selected account ${accountId} does not have any`),
        ).toBeVisible();
      }
    } else {
      await expect(this.billingContractWarningTitle()).toBeHidden({ timeout: 15000 });
    }
  }

  async confirmBillingContractSelection(accountId?: string): Promise<void> {
    if (accountId) {
      await this.expectBillingContractConfirmationShowsAccount(accountId);
    } else {
      await this.expectBillingContractConfirmationDialog(true);
    }
    await this.continueWithBillingSelectionButton().click();
    await this.expectBillingContractConfirmationDialog(false);
  }

  async dismissBillingContractConfirmation(): Promise<void> {
    await this.expectBillingContractConfirmationDialog(true);
    await this.goBackFromBillingConfirmationButton().click();
    await this.expectBillingContractConfirmationDialog(false);
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

  controlPlaneType(): Locator {
    return this.page.getByTestId('Control-plane');
  }

  /**
   * Waits for the Review screen to be fully loaded and ready for interaction.
   * This is a special case for the Review screen where we need to wait for the spinners to disappear.
   * This waits for:
   * 1. The review screen title to be visible
   * 2. All loading spinners to disappear (getUserRole and getOCMRole API calls)
   */
  async waitForReviewScreenReady(): Promise<void> {
    // Wait for the review screen title to be visible
    await expect(this.page.getByRole('heading', { name: 'Review your ROSA cluster' })).toBeVisible({
      timeout: 30000,
    });
    // Wait for all spinners to disappear using role-based selector (PatternFly Spinner has role="progressbar")
    await this.page
      .getByRole('progressbar')
      .first()
      .waitFor({ state: 'detached', timeout: 60000 })
      .catch(() => {
        // Spinner may have already disappeared or never appeared
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
    await this.page.locator(`text=${  vpcName}`).scrollIntoViewIfNeeded();
    await this.page.locator(`text=${  vpcName}`).click();
  }

  machinePoolVpcRegionPrompt(region: string): Locator {
    return this.page.getByText(
      `Select a VPC to install your machine pools into your selected region: ${region}`,
    );
  }

  async ensureClusterDetailsScreen(): Promise<void> {
    const detailsHeading = this.page.locator('h3:has-text("Cluster details")');

    if (await detailsHeading.isVisible().catch(() => false)) {
      await this.isClusterDetailsScreen();
      return;
    }

    const machinePoolHeading = this.page.getByRole('heading', { name: /^Machine pools$/ });
    if (await machinePoolHeading.isVisible().catch(() => false)) {
      await this.rosaBackButton().click();
      await this.isClusterDetailsScreen();
      return;
    }

    await this.isClusterDetailsScreen();
  }

  async navigateWizardBackToClusterDetails(): Promise<void> {
    const reviewHeading = this.page.getByRole('heading', { name: 'Review your ROSA cluster' });
    if (await reviewHeading.isVisible().catch(() => false)) {
      await this.rosaBackButton().click();
    }

    await this.isUpdatesScreen();
    await this.rosaBackButton().click();
    await this.rosaBackButton().click();
    await this.rosaBackButton().click();
    await this.rosaBackButton().click();
    await this.isClusterMachinepoolsScreen(true);
    await this.rosaBackButton().click();
    await this.isClusterDetailsScreen();
  }

  async completeRosaHostedMachinePoolStep(
    vpcName: string,
    privateSubnetName: string,
    instanceType: string,
    nodeCount: string | number,
  ): Promise<void> {
    await this.isClusterMachinepoolsScreen(true);
    await this.waitForVPCList();
    await this.selectVPC(vpcName);
    await this.selectMachinePoolPrivateSubnet(privateSubnetName, 1);
    await this.selectComputeNodeType(instanceType);
    await this.selectComputeNodeCount(String(nodeCount));
    await this.navigateNextFromMachinePools();
  }

  async advanceRosaHostedWizardToReview(
    oidcConfigId: string,
    publicSubnetName?: string,
  ): Promise<void> {
    await expect(this.clusterPrivacyPublicRadio()).toBeVisible({ timeout: 30000 });
    if (publicSubnetName) {
      await this.selectClusterPrivacyPublicSubnet(publicSubnetName);
    }
    await this.rosaNextButton().click();
    await expect(this.page.locator('h3:has-text("CIDR ranges")')).toBeVisible({ timeout: 30000 });
    await this.rosaNextButton().click();
    await this.selectOidcConfigId(oidcConfigId);
    await this.rosaNextButton().click();
    await this.isUpdatesScreen();
    await this.rosaNextButton().click();
    await this.waitForReviewScreenReady();
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
    const subnetButton = this.page.locator(`button[id="machinePoolsSubnets[${mpIndex}].privateSubnetId"]`);
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
    if (
      await this.clusterPrivacyPublicSubnetButton()
        .isVisible()
        .catch(() => false)
    ) {
      await this.selectClusterPrivacyPublicSubnet(publicSubnetNameOrId);
      return;
    }

    const machinePoolPublicSubnet = this.page.locator('button[id="machinePoolsSubnets[0].publicSubnetId"]');
    if (await machinePoolPublicSubnet.isVisible().catch(() => false)) {
      await machinePoolPublicSubnet.click();
    } else {
      await this.publicSubnetButton().click();
    }
    await this.subnetFilterInput().waitFor({ state: 'visible', timeout: 50000 });
    await this.subnetFilterInput().clear();
    await this.subnetFilterInput().fill(publicSubnetNameOrId);
    await this.page
      .locator('li')
      .filter({ hasText: publicSubnetNameOrId })
      .scrollIntoViewIfNeeded();
    await this.page.locator('li').filter({ hasText: publicSubnetNameOrId }).click();
  }

  /** Public subnet on the Networking > Cluster privacy step (ROSA HCP). */
  async selectClusterPrivacyPublicSubnet(publicSubnetNameOrId: string): Promise<void> {
    await this.waitForNetworkingConfigurationScreen();
    await expect(this.clusterPrivacyPublicRadio()).toBeChecked();
    const publicSubnetToggle = this.clusterPrivacyPublicSubnetButton();
    await expect(publicSubnetToggle).toBeVisible({ timeout: 30000 });
    await publicSubnetToggle.scrollIntoViewIfNeeded();
    await publicSubnetToggle.click();
    await this.subnetFilterInput().waitFor({ state: 'visible', timeout: 50000 });
    await this.subnetFilterInput().clear();
    await this.subnetFilterInput().fill(publicSubnetNameOrId);
    await this.page
      .locator('li')
      .filter({ hasText: publicSubnetNameOrId })
      .scrollIntoViewIfNeeded();
    await this.page.locator('li').filter({ hasText: publicSubnetNameOrId }).click();
  }

  async disabledAutoScaling(): Promise<void> {
    await this.enableAutoScalingCheckbox().uncheck();
  }

  async selectOidcConfigId(configID: string): Promise<void> {
    await this.page.locator('button').filter({ hasText: 'Select a config id' }).click();
    await this.page.locator('input[placeholder="Filter by config ID"]').clear();
    await this.page.locator('input[placeholder="Filter by config ID"]').fill(configID);
    await this.page.getByRole('option', { name: configID }).click();
  }

  async isClusterPropertyMatchesValue(property: string, value: string): Promise<void> {
    const term = this.page.getByRole('term').filter({ hasText: property });
    const definition = term.locator('..').getByRole('definition');
    await expect(definition).toContainText(value);
  }

  // Additional selectors for validation tests
  customerManageKeyARNInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Key ARN' });
  }

  enableEncyptEtcdWithCustomKMSKeyCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Encrypt etcd with a custom' });
  }

  encryptEtcdKeyARNInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Key ARN' });
  }

  fipsRequiredHelperText(): Locator {
    return this.page.getByText('Required when FIPS cryptography is enabled');
  }

  addMachinePoolLink(): Locator {
    return this.page.getByRole('button', { name: 'Add machine pool' });
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

  operatorRolesCommandField(): Locator {
    return this.page.getByRole('textbox', { name: 'Copyable ROSA create operator-roles' });
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
    const mpIndex = index - 1;
    await this.page.getByTestId(`remove-machine-pool-${mpIndex}`).click();
  }

  async enableConfigureClusterWideProxy(): Promise<void> {
    await this.enableConfigureClusterWideProxyCheckbox().check();
  }

  async selectRoleProviderMode(mode: string): Promise<void> {
    if (mode.toLowerCase() === 'auto') {
      await this.createModeAutoRadio().check();
    } else {
      await this.createModeManualRadio().check();
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
  async selectPrivateSubnet(index: number, subnetName: string): Promise<void> {
    const privateSubnetButton = this.page.locator(`[id="machinePoolsSubnets[${index}].privateSubnetId"]`);
    await privateSubnetButton.click();
    await this.subnetFilterInput().clear();
    await this.subnetFilterInput().fill(subnetName);
    await this.page.locator('li').filter({ hasText: subnetName }).click();
  }

  async selectPublicSubnet(index: number, subnetName: string): Promise<void> {
    const publicSubnetButton = this.page.locator(`[id="machinePoolsSubnets[${index}].publicSubnetId"]`);
    await publicSubnetButton.click();
    await this.subnetFilterInput().clear();
    await this.subnetFilterInput().fill(subnetName);
    await this.page.locator('li').filter({ hasText: subnetName }).click();
  }

  // Validation methods for subnet selections
  async isSubnetAvailabilityZoneSelected(zone: string): Promise<void> {
    const zoneButton = this.page
      .getByRole('button', { name: 'Options menu' })
      .filter({ hasText: zone })
      .first();
    await expect(zoneButton).toBeVisible();
  }

  async isPrivateSubnetSelected(index: number, subnetName: string): Promise<void> {
    const privateSubnetButton = this.page.locator(`[id="machinePoolsSubnets[${index}].privateSubnetId"]`);
    await expect(privateSubnetButton).toContainText(subnetName);
  }

  async isPubliceSubnetSelected(index: number, subnetName: string): Promise<void> {
    const publicSubnetButton = this.page.locator(`[id="machinePoolsSubnets[${index}].publicSubnetId"]`);
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

  // Log forwarding screen selectors
  logForwardingHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Control plane log forwarding' });
  }

  amazonS3EnableCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Enable Amazon S3' });
  }

  cloudWatchEnableCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Enable CloudWatch' });
  }

  amazonS3Heading(): Locator {
    return this.page.getByRole('heading', { name: 'Amazon S3' });
  }

  cloudWatchHeading(): Locator {
    return this.page.getByRole('heading', { name: 'CloudWatch' });
  }

  async isLogForwardingScreen(): Promise<void> {
    await expect(this.logForwardingHeading()).toBeVisible({ timeout: 30000 });
  }

  // Log forwarding review section selectors
  logForwardingReviewSection(): Locator {
    return this.page.getByRole('region', { name: 'Control plane log forwarding' });
  }

  logForwardingReviewS3Heading(): Locator {
    return this.logForwardingReviewSection().getByRole('heading', { name: 'Amazon S3' });
  }

  logForwardingReviewCloudWatchHeading(): Locator {
    return this.logForwardingReviewSection().getByRole('heading', { name: 'CloudWatch' });
  }

  logForwardingS3BucketNameInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Bucket name' });
  }

  logForwardingS3BucketPrefixInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Bucket prefix' });
  }

  logForwardingCloudWatchLogGroupNameInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Log group name' });
  }

  logForwardingCloudWatchRoleArnInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Role ARN' });
  }

  logForwardingCloudWatchPrerequisiteCheckbox(): Locator {
    return this.page.getByRole('checkbox', {
      name: "I've read and completed all the prerequisites",
    });
  }

  /**
   * Selects a group by name in the log forwarding available groups/applications tree.
   * S3 tree is at index 0, CloudWatch tree is at index 1.
   */
  async selectLogForwardingGroup(groupName: string, section: 'S3' | 'CloudWatch'): Promise<void> {
    const treeIndex = section === 'S3' ? 0 : 1;
    await this.page
      .getByRole('tree', { name: 'Select groups and applications' })
      .nth(treeIndex)
      .getByRole('checkbox', { name: `Select ${groupName}` })
      .check();
  }

  /**
   * Selects all available groups in a log forwarding tree section.
   * Waits for the tree to load, then checks every unchecked checkbox.
   */
  async selectAllLogForwardingGroups(section: 'S3' | 'CloudWatch'): Promise<void> {
    const treeIndex = section === 'S3' ? 0 : 1;
    const tree = this.page
      .getByRole('tree', { name: 'Select groups and applications' })
      .nth(treeIndex);

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

  // Additional validation method for compute node range
  computeNodeRangeValue(): Locator {
    return this.page.getByTestId('Compute-node-range').locator('div');
  }

  computeNodeRangeLabelValue(): Locator {
    return this.page.getByTestId('Compute-node-range');
  }

  noProxyDomainsLabelValue(): Locator {
    return this.page.getByTestId('No-Proxy-domains');
  }

  machinePoolLabelValue(): Locator {
    return this.page.getByTestId('Machine-pools');
  }

  operatorRoleCommandInput(): Locator {
    return this.page.getByLabel('Copyable ROSA create operator-roles');
  }

  /**
   * Returns the description (value) cell of a specific log forwarding property in the review
   * screen. Scopes to the data-testid set on each DescriptionListGroup in
   * LogForwardingReviewDetails, then returns the <dd> (definition) within it.
   *
   * Testid format: review-lf-{provider}-{label}
   *   provider: 's3' | 'cw'
   *   label:    'configuration' | 'bucket-name' | 'bucket-prefix' |
   *             'log-group-name' | 'role-arn' | 'selected-groups'
   *
   * Example:
   *   logForwardingReviewPropertyValue('s3', 'configuration')  → "Enabled" / "Disabled"
   *   logForwardingReviewPropertyValue('cw', 'role-arn')        → the ARN string
   */
  logForwardingReviewPropertyValue(
    provider: 's3' | 'cw',
    label:
      | 'configuration'
      | 'bucket-name'
      | 'bucket-prefix'
      | 'log-group-name'
      | 'role-arn'
      | 'selected-groups',
  ): Locator {
    return this.page.getByTestId(`review-lf-${provider}-${label}`).getByRole('definition');
  }
}
