import { test, expect } from '../../fixtures/pages';

// Import cluster field validations JSON
const clusterFieldValidations = require('../../fixtures/rosa/rosa-cluster-classic-wizard-validation.spec.json');

test.describe.serial(
  'Rosa Classic cluster wizard validations',
  { tag: ['@smoke', '@wizard-validation', '@rosa', '@rosa-classic'] },
  () => {
    // Environment variables and test data setup
    const awsAccountID = process.env.QE_AWS_ID || '';
    const rolePrefix = process.env.QE_ACCOUNT_ROLE_PREFIX || '';
    const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-Installer-Role`;
    const clusterName = `ocmui-playwright-smoke-rosa-${Math.random().toString(36).substring(7)}`;

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
      await createRosaWizardPage.selectStandaloneControlPlaneTypeOption().click();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Accounts and roles - widget validations', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.isAccountsAndRolesScreen();
      await createRosaWizardPage.selectAWSInfrastructureAccount(awsAccountID);
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.selectInstallerRole(installerARN);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - widget validations', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.isClusterDetailsScreen();
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

      await createRosaWizardPage.setClusterName(clusterName);
      await createRosaWizardPage.closePopoverDialogs();

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
      await createRosaWizardPage.advancedEncryptionLink().click();
      await createRosaWizardPage.useCustomKMSKeyRadio().check();
      await createRosaWizardPage.customerManageKeyARNInput().click();
      await createRosaWizardPage.customerManageKeyARNInput().blur();
      await createRosaWizardPage.isTextContainsInPage('Field is required');
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
      await expect(createRosaWizardPage.rosaNextButton()).not.toBeDisabled();
      await expect(createRosaWizardPage.rosaBackButton()).not.toBeDisabled();
      await expect(createRosaWizardPage.rosaCancelButton()).not.toBeDisabled();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - machine pool- Node count section - widget validations', async ({
      createRosaWizardPage,
    }) => {
      const machinePoolProperties = clusterFieldValidations.ClusterSettings.Machinepool.NodeCount;
      await createRosaWizardPage.isClusterMachinepoolsScreen();
      var minNodes = '2';
      var maxNodes = '249';
      await expect(createRosaWizardPage.computeNodeCountInput()).toHaveValue(minNodes);
      await expect(createRosaWizardPage.computeNodeCountDecrementButton()).not.toBeEnabled();
      await createRosaWizardPage.selectComputeNodeCount((parseInt(minNodes) - 1).toString());
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.LowerLimitError,
      );
      await createRosaWizardPage.computeNodeCountIncrementButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.LowerLimitError,
        false,
      );
      await createRosaWizardPage.selectComputeNodeCount(maxNodes);
      await expect(createRosaWizardPage.computeNodeCountIncrementButton()).not.toBeEnabled();
      await expect(createRosaWizardPage.computeNodeCountDecrementButton()).toBeEnabled();
      await createRosaWizardPage.selectComputeNodeCount((parseInt(maxNodes) + 1).toString());
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.UpperLimitError,
      );
      await createRosaWizardPage.computeNodeCountDecrementButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.UpperLimitError,
        false,
      );

      await createRosaWizardPage.enableAutoScaling();
      await createRosaWizardPage.setMinimumNodeCount('0');
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.LowerLimitError,
      );

      await createRosaWizardPage.setMinimumNodeCount('500');
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.UpperLimitError,
      );
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.setMinimumNodeCount('2');
      await createRosaWizardPage.setMaximumNodeCount('500');
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.UpperLimitError,
      );

      await createRosaWizardPage.setMaximumNodeCount('0');
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.LowerLimitError,
      );

      await createRosaWizardPage.setMaximumNodeCount('2');
      await createRosaWizardPage.minimumNodeCountPlusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.maximumNodeCountPlusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
        false,
      );

      await createRosaWizardPage.maximumNodeCountMinusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.minimumNodeCountMinusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
        false,
      );

      await createRosaWizardPage.rosaBackButton().click();
      await createRosaWizardPage.selectAvailabilityZone('Multi-zone');
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.disabledAutoScaling();

      var minNodes = '1';
      var maxNodes = '83';
      await expect(createRosaWizardPage.computeNodeCountInput()).toHaveValue(minNodes);
      await expect(createRosaWizardPage.computeNodeCountDecrementButton()).not.toBeEnabled();
      await createRosaWizardPage.selectComputeNodeCount((parseInt(minNodes) - 1).toString());
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.LowerLimitError,
      );
      await createRosaWizardPage.computeNodeCountIncrementButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.LowerLimitError,
        false,
      );
      await createRosaWizardPage.selectComputeNodeCount(maxNodes);
      await expect(createRosaWizardPage.computeNodeCountIncrementButton()).not.toBeEnabled();
      await expect(createRosaWizardPage.computeNodeCountDecrementButton()).toBeEnabled();
      await createRosaWizardPage.selectComputeNodeCount((parseInt(maxNodes) + 1).toString());
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.UpperLimitError,
      );
      await createRosaWizardPage.computeNodeCountDecrementButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.UpperLimitError,
        false,
      );

      await createRosaWizardPage.enableAutoScaling();
      await createRosaWizardPage.setMinimumNodeCount('0');
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.LowerLimitError,
      );

      await createRosaWizardPage.setMinimumNodeCount('500');
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.UpperLimitError,
      );

      await createRosaWizardPage.setMaximumNodeCount('2');
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.setMinimumNodeCount('2');
      await createRosaWizardPage.setMaximumNodeCount('500');
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.UpperLimitError,
      );

      await createRosaWizardPage.setMaximumNodeCount('0');
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.LowerLimitError,
      );

      await createRosaWizardPage.setMaximumNodeCount('2');
      await createRosaWizardPage.minimumNodeCountPlusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.maximumNodeCountPlusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
        false,
      );

      await createRosaWizardPage.maximumNodeCountMinusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
      );

      await createRosaWizardPage.minimumNodeCountMinusButton().click();
      await createRosaWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
        false,
      );
    });

    test('Step - Cluster Settings - machine pool- Cluster autoscaling section - widget validations', async ({
      page,
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.disabledAutoScaling();
      await createRosaWizardPage.enableAutoScaling();
      await createRosaWizardPage.editClusterAutoscalingSettingsButton().click();

      await createRosaWizardPage.clusterAutoscalingLogVerbosityInput().selectText();
      await createRosaWizardPage.clusterAutoscalingLogVerbosityInput().fill('0');
      await createRosaWizardPage.clusterAutoscalingLogVerbosityInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .LogVerbosityLimitError,
      );

      await createRosaWizardPage.clusterAutoscalingLogVerbosityInput().selectText();
      await createRosaWizardPage.clusterAutoscalingLogVerbosityInput().fill('7');
      await createRosaWizardPage.clusterAutoscalingLogVerbosityInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .LogVerbosityLimitError,
      );

      await createRosaWizardPage.clusterAutoscalingLogVerbosityInput().selectText();
      await createRosaWizardPage.clusterAutoscalingLogVerbosityInput().fill('3');
      await createRosaWizardPage.clusterAutoscalingLogVerbosityInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .LogVerbosityLimitError,
        false,
      );

      await createRosaWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
      await createRosaWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling.RequiredFieldError,
      );

      await createRosaWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
      await createRosaWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().fill('8H');
      await createRosaWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .InvalidTimeValueError,
      );

      await createRosaWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
      await createRosaWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().fill('90k');
      await createRosaWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .InvalidTimeValueError,
      );

      await createRosaWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
      await createRosaWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().fill('8s');
      await createRosaWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .InvalidTimeValueError,
        false,
      );

      await createRosaWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().clear();
      await createRosaWizardPage
        .clusterAutoscalingBalancingIgnoredLabelsInput()
        .fill('test with whitespace,test');
      await createRosaWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .WhitespaceLabelValueError,
      );

      await createRosaWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().clear();
      await createRosaWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().fill('test,test,');
      await createRosaWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling.EmptyLabelValueError,
      );

      await createRosaWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().clear();
      await createRosaWizardPage
        .clusterAutoscalingBalancingIgnoredLabelsInput()
        .fill('test@434$,123,&test_(t)35435');
      await createRosaWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().blur();
      await createRosaWizardPage.isTextContainsInPage('Empty labels are not allowed', false);

      await createRosaWizardPage.clusterAutoscalingCoresTotalMinInput().selectText();
      await createRosaWizardPage.clusterAutoscalingCoresTotalMinInput().fill('10');
      await createRosaWizardPage.clusterAutoscalingCoresTotalMinInput().blur();
      await createRosaWizardPage.clusterAutoscalingCoresTotalMaxInput().selectText();
      await createRosaWizardPage.clusterAutoscalingCoresTotalMaxInput().fill('9');
      await createRosaWizardPage.clusterAutoscalingCoresTotalMaxInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling.MinMaxLimitError,
      );

      await createRosaWizardPage.clusterAutoscalingCoresTotalMinInput().selectText();
      await createRosaWizardPage.clusterAutoscalingCoresTotalMinInput().fill('9');
      await createRosaWizardPage.clusterAutoscalingCoresTotalMinInput().blur();
      await createRosaWizardPage.clusterAutoscalingCoresTotalMaxInput().selectText();
      await createRosaWizardPage.clusterAutoscalingCoresTotalMaxInput().fill('10');
      await createRosaWizardPage.clusterAutoscalingCoresTotalMaxInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling.MinMaxLimitError,
        false,
      );

      await createRosaWizardPage.clusterAutoscalingMemoryTotalMinInput().selectText();
      await createRosaWizardPage.clusterAutoscalingMemoryTotalMinInput().fill('10');
      await createRosaWizardPage.clusterAutoscalingMemoryTotalMinInput().blur();
      await createRosaWizardPage.clusterAutoscalingMemoryTotalMaxInput().selectText();
      await createRosaWizardPage.clusterAutoscalingMemoryTotalMaxInput().fill('9');
      await createRosaWizardPage.clusterAutoscalingMemoryTotalMaxInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling.MinMaxLimitError,
      );

      await createRosaWizardPage.clusterAutoscalingMemoryTotalMinInput().selectText();
      await createRosaWizardPage.clusterAutoscalingMemoryTotalMinInput().fill('9');
      await createRosaWizardPage.clusterAutoscalingMemoryTotalMinInput().blur();
      await createRosaWizardPage.clusterAutoscalingMemoryTotalMaxInput().selectText();
      await createRosaWizardPage.clusterAutoscalingMemoryTotalMaxInput().fill('10');
      await createRosaWizardPage.clusterAutoscalingMemoryTotalMaxInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling.MinMaxLimitError,
        false,
      );

      await expect(createRosaWizardPage.clusterAutoscalingMaxNodesTotalInput()).toHaveValue('255');
      await createRosaWizardPage.clusterAutoscalingMaxNodesTotalInput().selectText();
      await createRosaWizardPage.clusterAutoscalingMaxNodesTotalInput().fill('257');
      await createRosaWizardPage.clusterAutoscalingMaxNodesTotalInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .MaxNodesValueMultizoneLimitError,
      );

      await createRosaWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
      await createRosaWizardPage.clusterAutoscalingCloseButton().click();
      await createRosaWizardPage.rosaBackButton().click();
      await createRosaWizardPage.selectAvailabilityZone('Single Zone');
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.disabledAutoScaling();
      await createRosaWizardPage.enableAutoScaling();
      await createRosaWizardPage.editClusterAutoscalingSettingsButton().click();
      await expect(createRosaWizardPage.clusterAutoscalingMaxNodesTotalInput()).toHaveValue('254');
      await createRosaWizardPage.clusterAutoscalingMaxNodesTotalInput().selectText();
      await createRosaWizardPage.clusterAutoscalingMaxNodesTotalInput().fill('255');
      await createRosaWizardPage.clusterAutoscalingMaxNodesTotalInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .MaxNodesValueSinglezoneLimitError,
      );

      await createRosaWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
      await createRosaWizardPage.clusterAutoscalingCloseButton().click();
      await createRosaWizardPage.rosaBackButton().click();
      await createRosaWizardPage.selectAvailabilityZone('Multi-zone');
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.disabledAutoScaling();
      await createRosaWizardPage.enableAutoScaling();
      await createRosaWizardPage.editClusterAutoscalingSettingsButton().click();

      await createRosaWizardPage.clusterAutoscalingGPUsInput().selectText();
      await createRosaWizardPage.clusterAutoscalingGPUsInput().fill('test');
      await createRosaWizardPage.clusterAutoscalingGPUsInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling.InvalidGPUValueError,
      );

      await createRosaWizardPage.clusterAutoscalingGPUsInput().selectText();
      await createRosaWizardPage.clusterAutoscalingGPUsInput().fill('test:10:5');
      await createRosaWizardPage.clusterAutoscalingGPUsInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling.InvalidGPUValueError,
      );

      await createRosaWizardPage.clusterAutoscalingGPUsInput().selectText();
      await createRosaWizardPage.clusterAutoscalingGPUsInput().fill('test:10:5,');
      await createRosaWizardPage.clusterAutoscalingGPUsInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling.InvalidGPUValueError,
      );

      await createRosaWizardPage.clusterAutoscalingGPUsInput().selectText();
      await createRosaWizardPage.clusterAutoscalingGPUsInput().fill('test:10:12,test:1:5');
      await createRosaWizardPage.clusterAutoscalingGPUsInput().blur();
      await expect(
        page.locator('div').filter({
          hasText:
            clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
              .InvalidGPUValueError,
        }),
      ).not.toBeVisible();

      await createRosaWizardPage
        .clusterAutoscalingScaleDownUtilizationThresholdInput()
        .selectText();
      await createRosaWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().fill('1.5');
      await createRosaWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling.ThreasholdLimitError,
      );

      await createRosaWizardPage
        .clusterAutoscalingScaleDownUtilizationThresholdInput()
        .selectText();
      await createRosaWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().fill('0.5');
      await createRosaWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().blur();

      await createRosaWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().selectText();
      await createRosaWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().fill('7H');
      await createRosaWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .InvalidTimeValueError,
      );

      await createRosaWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().selectText();
      await createRosaWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().fill('7h');
      await createRosaWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .InvalidTimeValueError,
        false,
      );

      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().selectText();
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().fill('8Sec');
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .InvalidTimeValueError,
      );

      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().selectText();
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().fill('8s');
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .InvalidTimeValueError,
        false,
      );

      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().selectText();
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().fill('10milli');
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .InvalidTimeValueError,
      );

      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().selectText();
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().fill('10s');
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .InvalidTimeValueError,
        false,
      );

      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().selectText();
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().fill('5M');
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .InvalidTimeValueError,
      );

      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().selectText();
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().fill('5m');
      await createRosaWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.ClusterAutoscaling
          .InvalidTimeValueError,
        false,
      );

      await createRosaWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
      await createRosaWizardPage.clusterAutoscalingCloseButton().click();
    });

    test('Step - Cluster Settings - machine pool- Root disk size and node labels section - widget validations', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.rootDiskSizeInput().selectText();
      await createRosaWizardPage.rootDiskSizeInput().fill('125');
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
      await createRosaWizardPage.rootDiskSizeInput().fill('555');
      await createRosaWizardPage.editNodeLabelLink().click();

      await createRosaWizardPage.addNodeLabelKeyAndValue(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[0].UpperCharacterLimitValue,
        'test',
        0,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[0].KeyError,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[0].LabelError,
        false,
      );

      await createRosaWizardPage.addNodeLabelKeyAndValue(
        'test',
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[0].UpperCharacterLimitValue,
        0,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[0].KeyError,
        false,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[0].LabelError,
      );

      await createRosaWizardPage.addNodeLabelKeyAndValue('test-t_123.com', 'test-t_123.com', 0);
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[0].KeyError,
        false,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[0].LabelError,
        false,
      );

      await createRosaWizardPage.addNodeLabelKeyAndValue(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[1].InvalidValue,
        'test',
        0,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[1].KeyError,
      );

      await createRosaWizardPage.addNodeLabelKeyAndValue(
        'testing',
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[1].InvalidValue,
        0,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[1].LabelError,
      );

      await createRosaWizardPage.addNodeLabelKeyAndValue(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[2].InvalidValue,
        'test',
        0,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[2].KeyError,
      );

      await createRosaWizardPage.addNodeLabelKeyAndValue(
        'example12-ing.com/MyName',
        'test-ing_123.com',
        0,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[0].KeyError,
        false,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[1].LabelError,
        false,
      );
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.ClusterSettings.Machinepool.NodeLabel[1].KeyError,
        false,
      );

      await expect(createRosaWizardPage.addAdditionalLabelLink()).toBeEnabled();
      await expect(createRosaWizardPage.rosaNextButton()).toBeEnabled();
      await expect(createRosaWizardPage.rosaBackButton()).toBeEnabled();
      await expect(createRosaWizardPage.rosaCancelButton()).toBeEnabled();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Networking - widget validations', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.applicationIngressCustomSettingsRadio().check();
      await createRosaWizardPage.applicationIngressRouterSelectorsInput().clear();
      await createRosaWizardPage
        .applicationIngressRouterSelectorsInput()
        .fill(
          clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
            .RouteSelector[0].UpperCharacterLimitValue,
        );
      await createRosaWizardPage.applicationIngressRouterSelectorsInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
          .RouteSelector[0].Error,
      );

      await createRosaWizardPage.applicationIngressRouterSelectorsInput().clear();
      await createRosaWizardPage
        .applicationIngressRouterSelectorsInput()
        .fill(
          clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
            .RouteSelector[1].InvalidValue,
        );
      await createRosaWizardPage.applicationIngressRouterSelectorsInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
          .RouteSelector[1].Error,
      );

      await createRosaWizardPage.applicationIngressRouterSelectorsInput().clear();
      await createRosaWizardPage
        .applicationIngressRouterSelectorsInput()
        .fill(
          clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
            .RouteSelector[2].InvalidValue,
        );
      await createRosaWizardPage.applicationIngressRouterSelectorsInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
          .RouteSelector[2].Error,
      );

      await createRosaWizardPage.applicationIngressRouterSelectorsInput().clear();
      await createRosaWizardPage
        .applicationIngressRouterSelectorsInput()
        .fill(
          clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
            .RouteSelector[3].InvalidValue,
        );
      await createRosaWizardPage.applicationIngressRouterSelectorsInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
          .RouteSelector[3].Error,
      );

      await createRosaWizardPage.applicationIngressRouterSelectorsInput().clear();
      await createRosaWizardPage
        .applicationIngressRouterSelectorsInput()
        .fill('valid123-k.com/Hello_world2');
      await createRosaWizardPage.applicationIngressRouterSelectorsInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
          .RouteSelector[0].Error,
        false,
      );

      await createRosaWizardPage.applicationIngressExcludedNamespacesInput().clear();
      await createRosaWizardPage
        .applicationIngressExcludedNamespacesInput()
        .fill(
          clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
            .ExcludedNamespaces[0].UpperCharacterLimitValue,
        );
      await createRosaWizardPage.applicationIngressExcludedNamespacesInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
          .ExcludedNamespaces[0].Error,
      );

      await createRosaWizardPage.applicationIngressExcludedNamespacesInput().clear();
      await createRosaWizardPage
        .applicationIngressExcludedNamespacesInput()
        .fill(
          clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
            .ExcludedNamespaces[1].InvalidValue,
        );
      await createRosaWizardPage.applicationIngressExcludedNamespacesInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
          .ExcludedNamespaces[1].Error,
      );

      await createRosaWizardPage.applicationIngressExcludedNamespacesInput().clear();
      await createRosaWizardPage.applicationIngressExcludedNamespacesInput().fill('abc-123');
      await createRosaWizardPage.applicationIngressExcludedNamespacesInput().blur();
      await createRosaWizardPage.isTextContainsInPage(
        clusterFieldValidations.Networking.Configuration.IngressSettings.CustomSettings
          .ExcludedNamespaces[1].Error,
        false,
      );

      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Networking - CIDR Ranges - widget validations', async ({
      createRosaWizardPage,
    }) => {
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
