import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ClusterDetailsPage } from '../../page-objects/cluster-details-page';
import { CreateRosaWizardPage } from '../../page-objects/create-rosa-wizard-page';
import { CreateClusterPage } from '../../page-objects/create-cluster-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

// Import cluster field validations JSON
const clusterFieldValidations = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-wizard-validation.spec.json');

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterDetailsPage: ClusterDetailsPage;
let createRosaWizardPage: CreateRosaWizardPage;
let createClusterPage: CreateClusterPage;

test.describe.serial(
  'Rosa hosted(Hypershift) cluster wizard validations',
  { tag: ['@smoke', '@wizard-validation'] },
  () => {
    // Environment variables and test data setup
    const region = clusterFieldValidations.Region.split(',')[0];
    const awsAccountID = process.env.QE_AWS_ID || '';
    const awsBillingAccountID = process.env.QE_AWS_BILLING_ID || '';
    let qeInfrastructure: any = {};

    try {
      qeInfrastructure = JSON.parse(process.env.QE_INFRA_REGIONS || '{}')[region]?.[0] || {};
    } catch (error) {
      console.warn('Failed to parse QE_INFRA_REGIONS environment variable:', error);
    }

    const rolePrefix = process.env.QE_ACCOUNT_ROLE_PREFIX || '';
    const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-HCP-ROSA-Installer-Role`;
    const clusterName = `smoke-cypress-rosa-hypershift-${Math.random().toString(36).substring(7)}`;

    test.beforeAll(async ({ browser }) => {
      // Setup: auth + navigate to overview
      const setup = await setupTestSuite(browser, 'create');

      sharedContext = setup.context;
      sharedPage = setup.page;

      // Initialize page objects for this test suite
      clusterDetailsPage = new ClusterDetailsPage(sharedPage);
      createRosaWizardPage = new CreateRosaWizardPage(sharedPage);
      createClusterPage = new CreateClusterPage(sharedPage);
      await createClusterPage.isCreateClusterPageHeaderVisible();
    });

    test.afterAll(async () => {
      await cleanupTestSuite(sharedContext);
    });

    test('Open Rosa cluster wizard', async () => {
      await createRosaWizardPage.waitAndClick(createRosaWizardPage.rosaCreateClusterButton());
      await createRosaWizardPage.rosaClusterWithWeb().click();
      await createRosaWizardPage.isCreateRosaPage();
      await expect(sharedPage.locator('.spinner-loading-text')).not.toBeVisible();
    });

    test('Step - Control plane - widget validations', async () => {
      await createRosaWizardPage.isControlPlaneTypeScreen();
      await expect(createRosaWizardPage.rosaNextButton()).not.toBeDisabled();
      await expect(createRosaWizardPage.rosaBackButton()).toBeDisabled();
      await expect(createRosaWizardPage.rosaCancelButton()).not.toBeDisabled();
      await createRosaWizardPage.selectHostedControlPlaneTypeOption().click();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Accounts and roles - widget validations', async () => {
      await createRosaWizardPage.isAccountsAndRolesScreen();
      await createRosaWizardPage.selectAWSInfrastructureAccount(awsAccountID);
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.selectAWSBillingAccount(awsBillingAccountID);
      await createRosaWizardPage.selectInstallerRole(installerARN);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Details - widget validations', async () => {
      await createRosaWizardPage.isClusterDetailsScreen();
      await createRosaWizardPage.selectRegion(clusterFieldValidations.Region);

      // Test invalid cluster names
      await createRosaWizardPage.setClusterName(
        clusterFieldValidations.ClusterSettings.Details.InvalidClusterNamesValues[0],
      );
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Details.InvalidClusterNamesErrors[0],
      );

      await createRosaWizardPage.setClusterName(
        clusterFieldValidations.ClusterSettings.Details.InvalidClusterNamesValues[1],
      );
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Details.InvalidClusterNamesErrors[1],
      );

      await createRosaWizardPage.setClusterName(
        clusterFieldValidations.ClusterSettings.Details.InvalidClusterNamesValues[2],
      );
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Details.InvalidClusterNamesErrors[2],
      );

      // Set valid cluster name
      await createRosaWizardPage.setClusterName(clusterName);
      await createRosaWizardPage.closePopoverDialogs();

      // Test domain prefix validations
      await createRosaWizardPage.createCustomDomainPrefixCheckbox().check();
      await createRosaWizardPage.setDomainPrefix(
        clusterFieldValidations.ClusterSettings.Details.InvalidDomainPrefixValues[0],
      );
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Details.InvalidDomainPrefixErrors[0],
      );

      await createRosaWizardPage.setDomainPrefix(
        clusterFieldValidations.ClusterSettings.Details.InvalidDomainPrefixValues[1],
      );
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Details.InvalidDomainPrefixErrors[1],
      );

      await createRosaWizardPage.setDomainPrefix(
        clusterFieldValidations.ClusterSettings.Details.InvalidDomainPrefixValues[2],
      );
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Details.InvalidDomainPrefixErrors[2],
      );

      await createRosaWizardPage.createCustomDomainPrefixCheckbox().uncheck();

      // Test encryption validations
      await createRosaWizardPage.advancedEncryptionLink().click();
      await createRosaWizardPage.useCustomKMSKeyRadio().check();
      await createRosaWizardPage.rosaNextButton().click({ force: true });
      await createRosaWizardPage.isTextContainsInPage('Field is required.');

      await createRosaWizardPage.inputCustomerManageKeyARN(
        clusterFieldValidations.ClusterSettings.Details.KeyARNs[0].WrongFormatValue,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Details.KeyARNs[0].WrongFormatError,
      );

      await createRosaWizardPage.inputCustomerManageKeyARN(
        clusterFieldValidations.ClusterSettings.Details.KeyARNs[1].WrongFormatWithWhitespace,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Details.KeyARNs[1].WrongFormatWithWhitespaceError,
      );

      await createRosaWizardPage.useDefaultKMSKeyRadio().check();
      await createRosaWizardPage.enableEncyptEtcdWithCustomKMSKeyCheckbox().check();
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage('Field is required.');

      await createRosaWizardPage.inputEncryptEtcdKeyARN(
        clusterFieldValidations.ClusterSettings.Details.KeyARNs[0].WrongFormatValue,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Details.KeyARNs[0].WrongFormatError,
      );

      await createRosaWizardPage.inputEncryptEtcdKeyARN(
        clusterFieldValidations.ClusterSettings.Details.KeyARNs[1].WrongFormatWithWhitespace,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Details.KeyARNs[1].WrongFormatWithWhitespaceError,
      );

      await createRosaWizardPage.enableEncyptEtcdWithCustomKMSKeyCheckbox().uncheck();
      await expect(createRosaWizardPage.rosaNextButton()).not.toBeDisabled();
      await expect(createRosaWizardPage.rosaBackButton()).not.toBeDisabled();
      await expect(createRosaWizardPage.rosaCancelButton()).not.toBeDisabled();
      await sharedPage.waitForTimeout(2000); // Small delay for UI stability
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Machine pools - widget validations', async () => {
      await createRosaWizardPage.isClusterMachinepoolsScreen(true);
      await expect(
        sharedPage.locator(
          `text=Select a VPC to install your machine pools into your selected region: ${region}`,
        ),
      ).toBeVisible();
      await createRosaWizardPage.waitForVPCList();
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isClusterMachinepoolsScreen(true);
      await createRosaWizardPage.selectVPC(qeInfrastructure.VPC_NAME);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.SubnetRequiredError,
      );

      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterFieldValidations.MachinePools[0].AvailabilityZones]
          .PRIVATE_SUBNET_NAME,
        1,
      );
      await createRosaWizardPage.addMachinePoolLink().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.SubnetRequiredError,
      );

      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterFieldValidations.MachinePools[0].AvailabilityZones]
          .PRIVATE_SUBNET_NAME,
        2,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.DuplicateSubnetsError,
      );

      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterFieldValidations.MachinePools[1].AvailabilityZones]
          .PRIVATE_SUBNET_NAME,
        2,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.DuplicateSubnetsError,
        false,
      );

      await createRosaWizardPage.removeMachinePool(2);
      await createRosaWizardPage.selectComputeNodeType(
        clusterFieldValidations.MachinePools[0].InstanceType,
      );
      await createRosaWizardPage.enableAutoScaling();

      // Test node count validations
      await createRosaWizardPage.setMinimumNodeCount('0');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone.LowerLimitError,
      );

      await createRosaWizardPage.setMinimumNodeCount('600');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone.UpperLimitError,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone
          .MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.setMinimumNodeCount('2');
      await createRosaWizardPage.setMaximumNodeCount('600');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone.UpperLimitError,
      );

      await createRosaWizardPage.setMaximumNodeCount('0');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone.LowerLimitError,
      );

      await createRosaWizardPage.setMaximumNodeCount('2');
      await createRosaWizardPage.minimumNodeCountPlusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone
          .MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.maximumNodeCountPlusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone
          .MinAndMaxLimitDependencyError,
        false,
      );

      await createRosaWizardPage.maximumNodeCountMinusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone
          .MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.minimumNodeCountMinusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone
          .MinAndMaxLimitDependencyError,
        false,
      );

      // Check for validation errors in machine pool node counts fields after subnet changes
      await createRosaWizardPage.addMachinePoolLink().click();
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterFieldValidations.MachinePools[1].AvailabilityZones]
          .PRIVATE_SUBNET_NAME,
        2,
      );
      await createRosaWizardPage.maximumNodeCountMinusButton().click();
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterFieldValidations.MachinePools[2].AvailabilityZones]
          .PRIVATE_SUBNET_NAME,
        2,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone
          .MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.minimumNodeCountMinusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone.LowerLimitError,
        false,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone
          .MinAndMaxLimitDependencyError,
        false,
      );

      // Check for minimum and maximum node counts when both fields set to minimum value
      await createRosaWizardPage.removeMachinePool(2);
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone
          .MinAndMaxLimitDependencyError,
        false,
      );
      await expect(createRosaWizardPage.minimumNodeInput()).toHaveValue('2');
      await expect(createRosaWizardPage.maximumNodeInput()).toHaveValue('2');

      // Check for minimum and maximum node count when both fields set to > minimum value
      await createRosaWizardPage.addMachinePoolLink().click();
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterFieldValidations.MachinePools[2].AvailabilityZones]
          .PRIVATE_SUBNET_NAME,
        2,
      );
      await createRosaWizardPage.setMinimumNodeCount('3');
      await createRosaWizardPage.removeMachinePool(2);
      await expect(createRosaWizardPage.minimumNodeInput()).toHaveValue('3');
      await expect(createRosaWizardPage.maximumNodeInput()).toHaveValue('2');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone
          .MinAndMaxLimitDependencyError,
      );

      // Check for validation errors when minimum node count > maximum node count
      await createRosaWizardPage.addMachinePoolLink().click();
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterFieldValidations.MachinePools[1].AvailabilityZones]
          .PRIVATE_SUBNET_NAME,
        2,
      );
      await createRosaWizardPage.addMachinePoolLink().click();
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterFieldValidations.MachinePools[2].AvailabilityZones]
          .PRIVATE_SUBNET_NAME,
        3,
      );
      await createRosaWizardPage.setMinimumNodeCount('3');
      await createRosaWizardPage.setMaximumNodeCount('1');
      await createRosaWizardPage.removeMachinePool(2);
      await createRosaWizardPage.removeMachinePool(2);
      await expect(createRosaWizardPage.minimumNodeInput()).toHaveValue('3');
      await expect(createRosaWizardPage.maximumNodeInput()).toHaveValue('2');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone.LowerLimitError,
        false,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MultiZone
          .MinAndMaxLimitDependencyError,
      );
      await createRosaWizardPage.setMinimumNodeCount('2');
      await createRosaWizardPage.setMinimumNodeCount('2');
    });

    test('Step - Machine pool - Root disk size - widget validations', async () => {
      await createRosaWizardPage.rootDiskSizeInput().selectText();
      await createRosaWizardPage.rootDiskSizeInput().fill('73');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.RootDiskSize.LimitError,
      );

      await createRosaWizardPage.rootDiskSizeInput().selectText();
      await createRosaWizardPage.rootDiskSizeInput().fill('16385');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.RootDiskSize.LimitError,
      );

      await createRosaWizardPage.rootDiskSizeInput().clear();
      await createRosaWizardPage.rootDiskSizeInput().pressSequentially('test');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.RootDiskSize.NonSupportedValue,
      );

      await createRosaWizardPage.rootDiskSizeInput().clear();
      await createRosaWizardPage.rootDiskSizeInput().selectText();
      await createRosaWizardPage.rootDiskSizeInput().fill('555');
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Networking - Configuration - widget validations', async () => {
      await createRosaWizardPage.isNetworkingScreen();
      await expect(createRosaWizardPage.clusterPrivacyPublicRadio()).toBeChecked();
      await expect(createRosaWizardPage.clusterPrivacyPrivateRadio()).not.toBeChecked();
      await createRosaWizardPage.selectClusterPrivacy('private');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.Configuration.Private.Warning,
      );
      await createRosaWizardPage.selectClusterPrivacy(clusterFieldValidations.ClusterPrivacy);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.SubnetRequiredError,
      );
      await createRosaWizardPage.selectMachinePoolPublicSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterFieldValidations.MachinePools[0].AvailabilityZones]
          .PUBLIC_SUBNET_NAME,
      );
      await createRosaWizardPage.enableConfigureClusterWideProxy();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Networking - Cluster-wide proxy - widget validations', async () => {
      await createRosaWizardPage.isClusterWideProxyScreen();
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.httpProxyInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.EmptyProxyError,
      );
      await createRosaWizardPage.rosaNextButton().scrollIntoViewIfNeeded();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.EmptyProxyValuesInformationText,
      );
      await createRosaWizardPage.backToNetworkingConfigurationLink().click();
      await createRosaWizardPage.rosaNextButton().click();

      await createRosaWizardPage
        .httpProxyInput()
        .fill(clusterFieldValidations.Networking.ClusterProxy.InvalidHttpProxyValue);
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.EmptyProxyError,
        false,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.InvalidHttpProxyError,
      );

      await createRosaWizardPage.httpProxyInput().clear();
      await createRosaWizardPage
        .httpProxyInput()
        .fill(clusterFieldValidations.Networking.ClusterProxy.InvalidHttpProxyUrlValue);
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.InvalidHttpProxyUrlError,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.InvalidHttpProxyError,
        false,
      );

      await createRosaWizardPage
        .httpProxyInput()
        .fill(clusterFieldValidations.Networking.ClusterProxy.ValidHttpProxyValue);
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.InvalidHttpProxyUrlError,
        false,
      );

      await createRosaWizardPage.httpsProxyInput().clear();
      await createRosaWizardPage
        .httpsProxyInput()
        .fill(clusterFieldValidations.Networking.ClusterProxy.InvalidHttpsProxyValue);
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.InvalidHttpsProxyError,
      );

      await createRosaWizardPage.httpsProxyInput().clear();
      await createRosaWizardPage
        .httpsProxyInput()
        .fill(clusterFieldValidations.Networking.ClusterProxy.InvalidHttpsProxyUrlValue);
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.InvalidHttpsProxyError,
        false,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.InvalidHttpsProxyUrlError,
      );

      await createRosaWizardPage.httpsProxyInput().clear();
      await createRosaWizardPage
        .httpsProxyInput()
        .fill(clusterFieldValidations.Networking.ClusterProxy.ValidHttpsProxyValue);
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.InvalidHttpsProxyUrlError,
        false,
      );

      await createRosaWizardPage
        .noProxyDomainsInput()
        .fill(clusterFieldValidations.Networking.ClusterProxy.InvalidNoProxyDomainValue);
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.InvalidNoProxyDomainError,
      );

      await createRosaWizardPage.noProxyDomainsInput().clear();
      await createRosaWizardPage
        .noProxyDomainsInput()
        .fill(clusterFieldValidations.Networking.ClusterProxy.ValidNoProxyDomainValue);
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.ClusterProxy.InvalidNoProxyDomainError,
        false,
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Networking - CIDR Ranges - widget validations', async () => {
      await createRosaWizardPage.isCIDRScreen();
      await createRosaWizardPage.useCIDRDefaultValues(false);

      await createRosaWizardPage.machineCIDRInput().clear();
      await createRosaWizardPage
        .machineCIDRInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.Common[0].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[0].Error,
      );

      await createRosaWizardPage.machineCIDRInput().clear();
      await createRosaWizardPage
        .machineCIDRInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.Common[1].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[1].Error,
      );

      await createRosaWizardPage.machineCIDRInput().clear();
      await createRosaWizardPage
        .machineCIDRInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.Common[2].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[2].Error,
      );

      await createRosaWizardPage.machineCIDRInput().clear();
      await createRosaWizardPage.machineCIDRInput().fill('10.0.0.0/16');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[2].Error,
        false,
      );

      await createRosaWizardPage.serviceCIDRInput().clear();
      await createRosaWizardPage
        .serviceCIDRInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.Common[0].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[0].Error,
      );

      await createRosaWizardPage.serviceCIDRInput().clear();
      await createRosaWizardPage
        .serviceCIDRInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.Common[1].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[1].Error,
      );

      await createRosaWizardPage.serviceCIDRInput().clear();
      await createRosaWizardPage
        .serviceCIDRInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.Common[2].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[2].Error,
      );

      await createRosaWizardPage.serviceCIDRInput().clear();
      await createRosaWizardPage.serviceCIDRInput().fill('172.30.0.0/16');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[2].Error,
        false,
      );

      await createRosaWizardPage.podCIDRInput().clear();
      await createRosaWizardPage
        .podCIDRInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.Common[0].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[0].Error,
      );

      await createRosaWizardPage.podCIDRInput().clear();
      await createRosaWizardPage
        .podCIDRInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.Common[1].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[1].Error,
      );

      await createRosaWizardPage.podCIDRInput().clear();
      await createRosaWizardPage
        .podCIDRInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.Common[2].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[2].Error,
      );

      await createRosaWizardPage.podCIDRInput().clear();
      await createRosaWizardPage.podCIDRInput().fill('10.128.0.0/14');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.Common[2].Error,
        false,
      );

      await createRosaWizardPage.hostPrefixInput().clear();
      await createRosaWizardPage.hostPrefixInput().blur();
      await createRosaWizardPage.isTextContainsInPage('Field is required');

      await createRosaWizardPage.hostPrefixInput().clear();
      await createRosaWizardPage
        .hostPrefixInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.HostPrefix[0].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.HostPrefix[0].Error,
      );

      await createRosaWizardPage.hostPrefixInput().clear();
      await createRosaWizardPage
        .hostPrefixInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.HostPrefix[1].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.HostPrefix[1].Error,
      );

      await createRosaWizardPage.hostPrefixInput().clear();
      await createRosaWizardPage
        .hostPrefixInput()
        .fill(clusterFieldValidations.Networking.CIDRRanges.HostPrefix[2].Value);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.HostPrefix[2].Error,
      );

      await createRosaWizardPage.hostPrefixInput().clear();
      await createRosaWizardPage.hostPrefixInput().fill('/23');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.CIDRRanges.HostPrefix[2].Error,
        false,
      );

      await createRosaWizardPage.useCIDRDefaultValues(true);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster roles and policies - widget validations', async () => {
      await createRosaWizardPage.isClusterRolesAndPoliciesScreen();
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterRolesAndPolicies.ConfigIdRequiredError,
      );
      await createRosaWizardPage.selectOidcConfigId(clusterFieldValidations.OidcConfigId);

      await createRosaWizardPage.customOperatorPrefixInput().scrollIntoViewIfNeeded();
      await createRosaWizardPage.customOperatorPrefixInput().selectText();
      await createRosaWizardPage
        .customOperatorPrefixInput()
        .fill(
          clusterFieldValidations.ClusterRolesAndPolicies.OperatorRoles[0].UpperCharacterLimitValue,
        );
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterRolesAndPolicies.OperatorRoles[0].Error,
      );

      await createRosaWizardPage.customOperatorPrefixInput().scrollIntoViewIfNeeded();
      await createRosaWizardPage.customOperatorPrefixInput().selectText();
      await createRosaWizardPage
        .customOperatorPrefixInput()
        .fill(clusterFieldValidations.ClusterRolesAndPolicies.OperatorRoles[1].InvalidValue);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterRolesAndPolicies.OperatorRoles[1].Error,
      );

      await createRosaWizardPage.customOperatorPrefixInput().scrollIntoViewIfNeeded();
      await createRosaWizardPage.customOperatorPrefixInput().selectText();
      await createRosaWizardPage.customOperatorPrefixInput().fill('test-123-test');
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.rosaCancelButton().click();
    });
  },
);
