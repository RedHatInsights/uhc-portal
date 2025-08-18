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
    return this.page.locator('input[name="worker_volume_size_gib"]');
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
    return this.page.locator('input[id="cidr_default_values_toggle"]');
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

  // Update strategy selectors
  individualUpdateRadio(): Locator {
    return this.page.getByTestId('upgrade_policy-manual');
  }

  recurringUpdateRadio(): Locator {
    return this.page.getByTestId('upgrade_policy-automatic');
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

  async isControlPlaneTypeScreen(): Promise<void> {
    // Wait for h2 with specific text to load and be visible
    await this.page.locator('h2', { hasText: 'Welcome to Red Hat OpenShift Service on AWS (ROSA)' })
      .waitFor({ timeout: 90000, state: 'visible' });
    
    // Wait for h3 with specific text to load and be visible
    await this.page.locator('h3', { hasText: 'Select the ROSA architecture based on your control plane requirements' })
      .waitFor({ timeout: 90000, state: 'visible' });
  }

  async isAccountsAndRolesScreen(): Promise<void> {
    await this.page.locator('h3', { hasText: 'AWS infrastructure account' }).waitFor({ timeout: 90000, state: 'visible' });
  }

  async isClusterDetailsScreen(): Promise<void> {
    await expect(this.page.locator('h3')).toContainText('Cluster details');
    // Wait for cluster version dropdown to be visible to avoid flaky behavior
    await this.page.locator('button[id="version-selector"]').waitFor({ state: 'visible', timeout: 40000 });
  }

  async isClusterMachinepoolsScreen(hosted: boolean = false): Promise<void> {
    const machinePoolHeaderText = hosted ? 'Machine pools' : 'Default machine pool';
    await expect(this.page.locator('h3')).toContainText(machinePoolHeaderText);
  }

  async isAssociateAccountsDrawer(): Promise<void> {
    await expect(this.page.locator('h2:has-text("How to associate a new AWS account")')).toBeVisible({ timeout: 30000 });
    await expect(this.page.locator('text=continue to step')).toBeVisible({ timeout: 30000 });
    
  }

  // Action methods
  async selectHostedControlPlaneType(): Promise<void> {
    await this.selectHostedControlPlaneTypeOption().click({ force: true });
    await expect(this.selectHostedControlPlaneTypeOption()).toHaveAttribute('aria-selected', 'true');
  }

  async selectAWSInfrastructureAccount(accountID: string): Promise<void> {
    await this.page.locator('button[id="associated_aws_id"]').click();
    await this.page.locator('input[placeholder*="Filter by account ID"]').waitFor({ state: 'visible', timeout: 50000 });
    await this.page.locator('input[placeholder*="Filter by account ID"]').clear();
    await this.page.locator('input[placeholder*="Filter by account ID"]').fill(accountID);
    await this.page.locator('li').filter({ hasText: accountID }).click();
  }

  async selectAWSBillingAccount(accountID: string): Promise<void> {
    await this.page.locator('#billing_account_id').click();
    await this.page.locator('input[placeholder*="Filter by account ID"]').waitFor({ state: 'visible', timeout: 50000 });
    await this.page.locator('input[placeholder*="Filter by account ID"]').clear();
    await this.page.locator('input[placeholder*="Filter by account ID"]').fill(accountID);
    await this.page.locator('li').filter({ hasText: accountID }).click();
  }

  async waitForARNList(): Promise<void> {
    await this.page.locator('span.pf-v6-c-button__progress').waitFor({ state: 'detached', timeout: 80000 });
    await this.page.getByTestId('spinner-loading-arn-text').waitFor({ state: 'detached', timeout: 80000 });
  }

  async selectInstallerRole(roleName: string): Promise<void> {
    const installerButton = this.page.locator('button').filter({ hasText: /Installer-Role$/ });
    const buttonText = await installerButton.textContent();
    
    if (buttonText?.includes(roleName)) {
      console.log(`Installer ARN ${roleName} already selected from the list.`);
    } else {
      await installerButton.click();
      await this.page.locator('div[id="installer_role_arn"]')
        .locator('button')
        .filter({ hasText: roleName })
        .scrollIntoViewIfNeeded();
      await this.page.locator('div[id="installer_role_arn"]')
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
    await this.page.locator('span.pf-v6-c-button__progress').waitFor({ state: 'detached', timeout: 100000 });
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

  async selectMachinePoolPrivateSubnet(privateSubnetNameOrId: string, machinePoolIndex: number = 1): Promise<void> {
    const mpIndex = machinePoolIndex - 1;
    await this.page.locator(`button[id="machinePoolsSubnets[${mpIndex}].privateSubnetId"]`).click();
    await this.subnetFilterInput().waitFor({ state: 'visible', timeout: 50000 });
    await this.subnetFilterInput().clear();
    await this.subnetFilterInput().fill(privateSubnetNameOrId);
    await this.page.locator('li').filter({ hasText: privateSubnetNameOrId }).scrollIntoViewIfNeeded();
    await this.page.locator('li').filter({ hasText: privateSubnetNameOrId }).click();
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
    await this.page.locator('div').filter({ hasText: computeNodeType }).click();
  }

  async enableAutoScaling(): Promise<void> {
    await this.enableAutoScalingCheckbox().check();
  }

  async disabledAutoScaling(): Promise<void> {
    await this.enableAutoScalingCheckbox().uncheck();
  }

  async selectComputeNodeCount(count: string): Promise<void> {
    await this.computeNodeCountSelect().selectOption(count);
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
    await this.page.locator('text=' + configID).scrollIntoViewIfNeeded();
    await this.page.locator('text=' + configID).click();
  }

  async isClusterPropertyMatchesValue(property: string, value: string): Promise<void> {
    await expect(
      this.page.locator('span.pf-v6-c-description-list__text')
        .filter({ hasText: property })
        .locator('..')
        .locator('~ *')
        .locator('div')
    ).toContainText(value);
  }
}
