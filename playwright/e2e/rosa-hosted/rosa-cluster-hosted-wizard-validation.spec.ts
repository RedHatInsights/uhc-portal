import { test, expect } from '../../fixtures/pages';

// Import cluster field validations JSON
const clusterFieldValidations = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-wizard-validation.spec.json');

test.describe.serial(
  'Rosa hosted(Hypershift) cluster wizard validations',
  { tag: ['@smoke', '@rosa-hosted', '@wizard-validation', '@rosa'] },
  () => {
    // Environment variables and test data setup
    const region = process.env.QE_AWS_REGION || clusterFieldValidations.Region.split(',')[0];
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
    const oidcConfigId = process.env.QE_OIDC_CONFIG_ID ?? clusterFieldValidations.OidcConfigId;
    const clusterName = `smoke-playwright-rosa-hypershift-${Math.random().toString(36).substring(7)}`;
    const availabilityZones = Object.keys(qeInfrastructure.SUBNETS?.ZONES || {});
    const getAvailabilityZone = (index: number): string =>
      availabilityZones[index] || clusterFieldValidations.MachinePools[index]?.AvailabilityZones;

    test.beforeAll(async ({ navigateTo }) => {
      // Navigate to create
      await navigateTo('create');
    });
    test('Open Rosa cluster wizard', async ({ page, createRosaWizardPage }) => {
      await createRosaWizardPage.waitAndClick(createRosaWizardPage.rosaCreateClusterButton());
      await createRosaWizardPage.rosaClusterWithWeb().click();
      await createRosaWizardPage.isCreateRosaPage();
      await expect(page.locator('.spinner-loading-text')).not.toBeVisible();
    });

    test('Step - Control plane - widget validations', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.isControlPlaneTypeScreen();
      await expect(createRosaWizardPage.rosaNextButton()).not.toBeDisabled();
      await expect(createRosaWizardPage.rosaBackButton()).toBeDisabled();
      await expect(createRosaWizardPage.rosaCancelButton()).not.toBeDisabled();
      await createRosaWizardPage.selectHostedControlPlaneTypeOption().click();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Accounts and roles - widget validations', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.isAccountsAndRolesScreen();
      await createRosaWizardPage.selectAWSInfrastructureAccount(awsAccountID);
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.selectAWSBillingAccount(awsBillingAccountID);
      await createRosaWizardPage.selectInstallerRole(installerARN);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Details - widget validations', async ({
      page,
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterDetailsScreen();
      await createRosaWizardPage.selectRegion(region);

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

      await createRosaWizardPage.versionSelectorToggle().click();
      await expect(createRosaWizardPage.versionOptionsByChannel('fast')).not.toHaveCount(0);
      await createRosaWizardPage.versionSelectorToggle().click();

      // Open the channel dropdown and verify a fast option exists
      await createRosaWizardPage.channelSelect().click();
      await expect(createRosaWizardPage.channelSelectOptionsByPrefix('fast')).not.toHaveCount(0);
      await createRosaWizardPage.channelSelect().click();

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
      // default fips cryptography and etcd encryption checkbox status
      await expect(createRosaWizardPage.enableFIPSCryptographyCheckbox()).not.toBeChecked();
      await expect(
        createRosaWizardPage.enableEncyptEtcdWithCustomKMSKeyCheckbox(),
      ).not.toBeChecked();
      // check fips cryptography checkbox and status of etcd encryption checkbox
      await createRosaWizardPage.enableFIPSCryptographyCheckbox().check();
      await expect(createRosaWizardPage.enableEncyptEtcdWithCustomKMSKeyCheckbox()).toBeChecked();
      await expect(createRosaWizardPage.enableEncyptEtcdWithCustomKMSKeyCheckbox()).toBeDisabled();
      await expect(createRosaWizardPage.fipsRequiredHelperText()).toBeVisible();
      await expect(createRosaWizardPage.encryptEtcdKeyARNInput()).toBeVisible();
      // uncheck fips cryptography checkbox and status of etcd encryption checkbox
      await createRosaWizardPage.enableFIPSCryptographyCheckbox().uncheck();
      await expect(createRosaWizardPage.enableEncyptEtcdWithCustomKMSKeyCheckbox()).toBeChecked();
      await expect(createRosaWizardPage.fipsRequiredHelperText()).not.toBeVisible();
      await expect(createRosaWizardPage.encryptEtcdKeyARNInput()).toBeVisible();
      await createRosaWizardPage.enableEncyptEtcdWithCustomKMSKeyCheckbox().uncheck();
      await expect(createRosaWizardPage.encryptEtcdKeyARNInput()).not.toBeVisible();

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
      await page.waitForTimeout(2000); // Small delay for UI stability
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Machine pools - widget validations', async ({
      page,
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterMachinepoolsScreen(true);
      await expect(
        page.locator(
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
        qeInfrastructure.SUBNETS.ZONES[getAvailabilityZone(0)].PRIVATE_SUBNET_NAME,
        1,
      );

      var minNodes = '2';
      var maxNodes = '500';
      await expect(createRosaWizardPage.computeNodeCountInput()).toHaveValue(minNodes);
      await expect(createRosaWizardPage.computeNodeCountDecrementButton()).not.toBeEnabled();
      await createRosaWizardPage.selectComputeNodeCount((parseInt(minNodes) - 1).toString());
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.LowerLimitError,
      );
      await createRosaWizardPage.computeNodeCountIncrementButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.LowerLimitError,
        false,
      );
      await createRosaWizardPage.selectComputeNodeCount(maxNodes);
      await expect(createRosaWizardPage.computeNodeCountIncrementButton()).not.toBeEnabled();
      await expect(createRosaWizardPage.computeNodeCountDecrementButton()).toBeEnabled();
      await createRosaWizardPage.selectComputeNodeCount((parseInt(maxNodes) + 1).toString());
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.UpperLimitError,
      );
      await createRosaWizardPage.computeNodeCountDecrementButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.UpperLimitError,
        false,
      );

      await createRosaWizardPage.addMachinePoolLink().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.SubnetRequiredError,
      );

      await createRosaWizardPage.checkVieworHideUsedSubnetsPresence(
        qeInfrastructure.SUBNETS.ZONES[getAvailabilityZone(0)].PRIVATE_SUBNET_NAME,
        2,
      );

      await createRosaWizardPage.removeMachinePool(2);
      await createRosaWizardPage.addMachinePoolLink().click();

      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[getAvailabilityZone(0)].PRIVATE_SUBNET_NAME,
        2,
        true,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.DuplicateSubnetsError,
      );

      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[getAvailabilityZone(1)].PRIVATE_SUBNET_NAME,
        2,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.DuplicateSubnetsError,
        false,
      );

      var minNodes = '1';
      var maxNodes = '250';
      await createRosaWizardPage.selectComputeNodeCount((parseInt(minNodes) - 1).toString());
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount
          .LowerLimitErrorWithMultipleMachinePools,
      );
      await createRosaWizardPage.computeNodeCountIncrementButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount
          .LowerLimitErrorWithMultipleMachinePools,
        false,
      );
      await createRosaWizardPage.selectComputeNodeCount(maxNodes);
      await expect(createRosaWizardPage.computeNodeCountIncrementButton()).not.toBeEnabled();
      await expect(createRosaWizardPage.computeNodeCountDecrementButton()).toBeEnabled();
      await createRosaWizardPage.selectComputeNodeCount((parseInt(maxNodes) + 1).toString());
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount
          .UpperLimitErrorWithMultipleMachinePools,
      );
      await createRosaWizardPage.computeNodeCountDecrementButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount
          .UpperLimitErrorWithMultipleMachinePools,
        false,
      );

      await createRosaWizardPage.removeMachinePool(2);
      await createRosaWizardPage.selectComputeNodeType(
        clusterFieldValidations.MachinePools[0].InstanceType,
      );

      await createRosaWizardPage.enableAutoScaling();

      // Test node count validations
      await expect(createRosaWizardPage.minimumNodeCountInput()).toHaveValue('2');
      await expect(createRosaWizardPage.maximumNodeCountInput()).toHaveValue('2');
      await expect(createRosaWizardPage.minimumNodeCountMinusButton()).toBeEnabled();
      await expect(createRosaWizardPage.maximumNodeCountMinusButton()).not.toBeEnabled();

      await createRosaWizardPage.setMinimumNodeCount('-1');
      await expect(createRosaWizardPage.minimumNodeCountMinusButton()).not.toBeEnabled();
      await expect(createRosaWizardPage.minimumNodeCountPlusButton()).toBeEnabled();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.Autoscaling.LowerLimitError,
      );
      await createRosaWizardPage.setMinimumNodeCount('600');
      await expect(createRosaWizardPage.minimumNodeCountMinusButton()).toBeEnabled();
      await expect(createRosaWizardPage.minimumNodeCountPlusButton()).not.toBeEnabled();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.UpperLimitError,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.setMinimumNodeCount('0');
      await expect(createRosaWizardPage.minimumNodeCountMinusButton()).not.toBeEnabled();
      await expect(createRosaWizardPage.minimumNodeCountPlusButton()).toBeEnabled();

      await createRosaWizardPage.setMaximumNodeCount('600');
      await expect(createRosaWizardPage.maximumNodeCountMinusButton()).toBeEnabled();
      await expect(createRosaWizardPage.maximumNodeCountPlusButton()).not.toBeEnabled();

      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.UpperLimitError,
      );

      await createRosaWizardPage.setMaximumNodeCount('0');
      await expect(createRosaWizardPage.maximumNodeCountMinusButton()).not.toBeEnabled();
      await expect(createRosaWizardPage.maximumNodeCountPlusButton()).toBeEnabled();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.Autoscaling
          .LowerLimitErrorInMaximumNodeCount,
      );

      await createRosaWizardPage.setMaximumNodeCount('2');
      await createRosaWizardPage.minimumNodeCountPlusButton().click();
      await createRosaWizardPage.minimumNodeCountPlusButton().click();
      await createRosaWizardPage.minimumNodeCountPlusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.maximumNodeCountPlusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MinAndMaxLimitDependencyError,
        false,
      );

      await createRosaWizardPage.maximumNodeCountMinusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.minimumNodeCountMinusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MinAndMaxLimitDependencyError,
        false,
      );
      // Check for validation errors in machine pool node counts fields after subnet changes
      await createRosaWizardPage.addMachinePoolLink().click();
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[getAvailabilityZone(1)].PRIVATE_SUBNET_NAME,
        2,
      );
      await createRosaWizardPage.maximumNodeCountMinusButton().click();
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[getAvailabilityZone(2)].PRIVATE_SUBNET_NAME,
        2,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.minimumNodeCountMinusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.LowerLimitError,
        false,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MinAndMaxLimitDependencyError,
        false,
      );

      // Check for minimum and maximum node counts when both fields set to minimum value
      await createRosaWizardPage.removeMachinePool(2);
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MinAndMaxLimitDependencyError,
        false,
      );
      await expect(createRosaWizardPage.minimumNodeInput()).toHaveValue('1');
      await expect(createRosaWizardPage.maximumNodeInput()).toHaveValue('2');

      // Check for minimum and maximum node count when both fields set to > minimum value
      await createRosaWizardPage.addMachinePoolLink().click();
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[getAvailabilityZone(2)].PRIVATE_SUBNET_NAME,
        2,
      );
      await createRosaWizardPage.setMinimumNodeCount('3');
      await createRosaWizardPage.removeMachinePool(2);
      await expect(createRosaWizardPage.minimumNodeInput()).toHaveValue('3');
      await expect(createRosaWizardPage.maximumNodeInput()).toHaveValue('2');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MinAndMaxLimitDependencyError,
      );

      // Check for validation errors when minimum node count > maximum node count
      await createRosaWizardPage.addMachinePoolLink().click();
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[getAvailabilityZone(1)].PRIVATE_SUBNET_NAME,
        2,
      );
      await createRosaWizardPage.addMachinePoolLink().click();
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[getAvailabilityZone(2)].PRIVATE_SUBNET_NAME,
        3,
      );
      await createRosaWizardPage.setMinimumNodeCount('0');
      await createRosaWizardPage.setMaximumNodeCount('1');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.Autoscaling
          .LowerLimitErrorInMaximumNodeCount,
        false,
      );
      await createRosaWizardPage.setMinimumNodeCount('3');
      await createRosaWizardPage.removeMachinePool(2);
      await createRosaWizardPage.removeMachinePool(2);
      await expect(createRosaWizardPage.minimumNodeInput()).toHaveValue('3');
      await expect(createRosaWizardPage.maximumNodeInput()).toHaveValue('2');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.LowerLimitError,
        false,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeCount.MinAndMaxLimitDependencyError,
      );
      await createRosaWizardPage.setMinimumNodeCount('0');
      await createRosaWizardPage.setMinimumNodeCount('2');
    });

    test('Step - Machine pool - Root disk size - widget validations', async ({
      createRosaWizardPage,
    }) => {
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

    test('Step - Networking - Configuration - widget validations', async ({
      createRosaWizardPage,
    }) => {
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
        qeInfrastructure.SUBNETS.ZONES[getAvailabilityZone(0)].PUBLIC_SUBNET_NAME,
      );
      await createRosaWizardPage.enableConfigureClusterWideProxy();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Networking - Cluster-wide proxy - widget validations', async ({
      createRosaWizardPage,
    }) => {
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

    test('Step - Networking - CIDR Ranges - widget validations', async ({
      createRosaWizardPage,
    }) => {
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

    test('Step - Cluster roles and policies - widget validations', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterRolesAndPoliciesScreen();
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterRolesAndPolicies.ConfigIdRequiredError,
      );
      await createRosaWizardPage.selectOidcConfigId(oidcConfigId);

      // Verify the order of theoperator-roles command contains --hosted-cp for HCP clusters
      const operatorRolesCommand = await createRosaWizardPage
        .operatorRolesCommandField()
        .inputValue();
      expect(operatorRolesCommand).toMatch(
        /^rosa create operator-roles.*--prefix.*--oidc-config-id.*--hosted-cp.*--installer-role-arn/,
      );
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
    });

    test('Step - Cluster updates - navigate through', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.isUpdatesScreen();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Control plane log forwarding - widget validations', async ({
      createRosaWizardPage,
    }) => {
      // --- S3 validations ---
      await createRosaWizardPage.amazonS3EnableCheckbox().check();

      // Click Next with empty S3 bucket name → required error
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.BucketNameRequired,
      );

      // Bucket name too short (< 3 chars)
      await createRosaWizardPage
        .logForwardingS3BucketNameInput()
        .fill(clusterFieldValidations.LogForwarding.S3.BucketNameTooShort);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.BucketNameTooShortError,
      );

      // Bucket name too long (> 63 chars)
      await createRosaWizardPage.logForwardingS3BucketNameInput().clear();
      await createRosaWizardPage
        .logForwardingS3BucketNameInput()
        .fill(clusterFieldValidations.LogForwarding.S3.BucketNameTooLong);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.BucketNameTooLongError,
      );

      // Bucket name starts with uppercase
      await createRosaWizardPage.logForwardingS3BucketNameInput().clear();
      await createRosaWizardPage
        .logForwardingS3BucketNameInput()
        .fill(clusterFieldValidations.LogForwarding.S3.BucketNameStartsUppercase);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.BucketNameStartsUppercaseError,
      );

      // Bucket name with consecutive dots
      await createRosaWizardPage.logForwardingS3BucketNameInput().clear();
      await createRosaWizardPage
        .logForwardingS3BucketNameInput()
        .fill(clusterFieldValidations.LogForwarding.S3.BucketNameConsecutiveDots);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.BucketNameConsecutiveDotsError,
      );

      // Bucket name formatted as IP address
      await createRosaWizardPage.logForwardingS3BucketNameInput().clear();
      await createRosaWizardPage
        .logForwardingS3BucketNameInput()
        .fill(clusterFieldValidations.LogForwarding.S3.BucketNameIPAddress);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.BucketNameIPAddressError,
      );

      // Bucket prefix with consecutive dots
      await createRosaWizardPage.logForwardingS3BucketNameInput().clear();
      await createRosaWizardPage
        .logForwardingS3BucketNameInput()
        .fill(clusterFieldValidations.LogForwarding.S3.BucketNameValid);
      await createRosaWizardPage
        .logForwardingS3BucketPrefixInput()
        .fill(clusterFieldValidations.LogForwarding.S3.BucketPrefixConsecutiveDots);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.BucketPrefixConsecutiveDotsError,
      );

      // Clear prefix error with valid bucket name
      await createRosaWizardPage.logForwardingS3BucketPrefixInput().clear();
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.BucketPrefixConsecutiveDotsError,
        false,
      );

      // Click Next without selecting any S3 groups → required error
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.SelectedItemsRequired,
      );

      // Uncheck S3 to clear its errors
      await createRosaWizardPage.amazonS3EnableCheckbox().uncheck();

      // --- CloudWatch validations ---
      await createRosaWizardPage.cloudWatchEnableCheckbox().check();

      // Log group name auto-fills; clear it and verify required error
      await createRosaWizardPage.logForwardingCloudWatchLogGroupNameInput().clear();
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.LogGroupNameRequired,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.RoleArnRequired,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.PrerequisiteAckRequired,
      );

      // Log group name with invalid characters
      await createRosaWizardPage
        .logForwardingCloudWatchLogGroupNameInput()
        .fill(clusterFieldValidations.LogForwarding.CloudWatch.LogGroupNameInvalidChars);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.LogGroupNameInvalidCharsError,
      );

      // Log group name with colon (rejected by OCM)
      await createRosaWizardPage.logForwardingCloudWatchLogGroupNameInput().clear();
      await createRosaWizardPage
        .logForwardingCloudWatchLogGroupNameInput()
        .fill(clusterFieldValidations.LogForwarding.CloudWatch.LogGroupNameWithColon);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.LogGroupNameWithColonError,
      );

      // Log group name too long (> 512 chars)
      await createRosaWizardPage.logForwardingCloudWatchLogGroupNameInput().clear();
      await createRosaWizardPage
        .logForwardingCloudWatchLogGroupNameInput()
        .fill(clusterFieldValidations.LogForwarding.CloudWatch.LogGroupNameTooLong);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.LogGroupNameTooLongError,
      );

      // Valid log group name → error clears
      await createRosaWizardPage.logForwardingCloudWatchLogGroupNameInput().clear();
      await createRosaWizardPage.logForwardingCloudWatchLogGroupNameInput().fill('valid-log-group');
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.LogGroupNameRequired,
        false,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.LogGroupNameInvalidCharsError,
        false,
      );

      // Role ARN with invalid format
      await createRosaWizardPage
        .logForwardingCloudWatchRoleArnInput()
        .fill(clusterFieldValidations.LogForwarding.CloudWatch.RoleArnInvalidFormat);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.RoleArnInvalidFormatError,
      );

      // Role ARN with whitespace
      await createRosaWizardPage.logForwardingCloudWatchRoleArnInput().clear();
      await createRosaWizardPage
        .logForwardingCloudWatchRoleArnInput()
        .fill(clusterFieldValidations.LogForwarding.CloudWatch.RoleArnWhitespace);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.RoleArnWhitespaceError,
      );

      // --- Fill valid S3 and CloudWatch data, then verify group selection required ---

      // Enable S3 and fill valid data
      await createRosaWizardPage.amazonS3EnableCheckbox().check();
      await createRosaWizardPage
        .logForwardingS3BucketNameInput()
        .fill(clusterFieldValidations.LogForwarding.S3.ValidBucketName);
      await createRosaWizardPage
        .logForwardingS3BucketPrefixInput()
        .fill(clusterFieldValidations.LogForwarding.S3.ValidBucketPrefix);

      // Clear CloudWatch errors and fill valid data
      await createRosaWizardPage.logForwardingCloudWatchRoleArnInput().clear();
      await createRosaWizardPage
        .logForwardingCloudWatchRoleArnInput()
        .fill(clusterFieldValidations.LogForwarding.CloudWatch.ValidRoleArn);
      await createRosaWizardPage.logForwardingCloudWatchLogGroupNameInput().clear();
      await createRosaWizardPage
        .logForwardingCloudWatchLogGroupNameInput()
        .fill(clusterFieldValidations.LogForwarding.CloudWatch.ValidLogGroupName);
      await createRosaWizardPage.logForwardingCloudWatchPrerequisiteCheckbox().check();

      // Click Next without selecting any groups → both S3 and CloudWatch group errors
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.SelectedItemsRequired,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.SelectedItemsRequired,
      );

      // Select groups (both S3 and CloudWatch trees are visible: S3=nth(0), CloudWatch=nth(1))
      await createRosaWizardPage.selectLogForwardingGroup('api', 'S3');
      await createRosaWizardPage.selectLogForwardingGroup('api', 'CloudWatch');

      // Navigate to Review and Create
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.waitForReviewScreenReady();

      // Verify S3 details on review screen
      await createRosaWizardPage.isTextContainsInPage('Amazon S3');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.ValidBucketName,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.S3.ValidBucketPrefix,
      );
      // Verify CloudWatch details on review screen
      await createRosaWizardPage.isTextContainsInPage('CloudWatch');
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.ValidLogGroupName,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.LogForwarding.CloudWatch.ValidRoleArn,
      );

      await createRosaWizardPage.rosaCancelButton().click();
    });
  },
);
