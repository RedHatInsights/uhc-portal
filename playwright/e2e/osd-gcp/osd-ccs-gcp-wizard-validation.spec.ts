import { test, expect } from '../../fixtures/pages';

// Test data - importing as modules since JSON imports need special config
const testData = require('../../fixtures/osd-gcp/osd-ccs-gcp-wizard-validation.spec.json');
const { Clusters, ClustersValidation } = testData;

// Environment variables
const QE_GCP = process.env.QE_GCP_OSDCCSADMIN_JSON;

// Create parameterized tests for each cluster configuration
Clusters.forEach((clusterProperties, index) => {
  const isCCSCluster = !clusterProperties.InfrastructureType.includes('Red Hat');
  const testSuffix = clusterProperties.AuthenticationType
    ? `-${clusterProperties.AuthenticationType}`
    : '';
  const configName = `${clusterProperties.CloudProvider}-${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType}${testSuffix}`;

  test.describe.serial(
    `OSD Wizard CCS GCP validation tests (${configName}) - OCP-54134,OCP-73204`,
    { tag: ['@smoke', '@wizard-validation', '@osd'] },
    () => {
      test.beforeAll(async ({ navigateTo }) => {
        // Navigate to create
        await navigateTo('create');
      });
      test(`Launch OSD cluster wizard`, async ({ createOSDWizardPage }) => {
        await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdCreateClusterButton());
        await createOSDWizardPage.isCreateOSDPage();
      });

      test(`Billing model validation`, async ({ createOSDWizardPage }) => {
        await createOSDWizardPage.isBillingModelScreen();
        await createOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
        await createOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
        await createOSDWizardPage.wizardNextButton().click();
      });

      test(`Cloud provider field validations`, async ({ createOSDWizardPage }) => {
        await createOSDWizardPage.isCloudProviderSelectionScreen();
        await createOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);

        if (isCCSCluster) {
          await createOSDWizardPage.wizardNextButton().click();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.CloudProvider.Common.AcknowledgementUncheckedError,
          );

          if (clusterProperties.CloudProvider.includes('GCP')) {
            if (clusterProperties.AuthenticationType?.includes('Service Account')) {
              await createOSDWizardPage.serviceAccountButton().click();
              await createOSDWizardPage.wizardNextButton().click();
              await createOSDWizardPage.isTextContainsInPage(
                ClustersValidation.ClusterSettings.CloudProvider.GCP.EmptyGCPServiceJSONFieldError,
              );

              await createOSDWizardPage.uploadGCPServiceAccountJSON(
                ClustersValidation.ClusterSettings.CloudProvider.GCP
                  .InvalidFormatGCPServiceJSONValues,
              );
              await createOSDWizardPage.wizardNextButton().click();
              await createOSDWizardPage.isTextContainsInPage(
                ClustersValidation.ClusterSettings.CloudProvider.GCP
                  .InvalidFormatGCPServiceJSONFieldError,
              );

              await createOSDWizardPage.uploadGCPServiceAccountJSON(
                ClustersValidation.ClusterSettings.CloudProvider.GCP.InvalidGCPServiceJSONValues,
              );
              await createOSDWizardPage.wizardNextButton().click();
              await createOSDWizardPage.isTextContainsInPage(
                ClustersValidation.ClusterSettings.CloudProvider.GCP
                  .InvalidGCPServiceJSONFieldError,
              );

              if (QE_GCP) {
                await createOSDWizardPage.uploadGCPServiceAccountJSON(QE_GCP || '{}');
              }
            } else {
              await createOSDWizardPage.workloadIdentityFederationButton().click();
              await createOSDWizardPage.wizardNextButton().click();
              await createOSDWizardPage.isTextContainsInPage(
                ClustersValidation.ClusterSettings.CloudProvider.GCP.NoWIFConfigSelectionError,
              );
              await createOSDWizardPage.isTextContainsInPage(
                ClustersValidation.ClusterSettings.CloudProvider.Common
                  .AcknowledgementUncheckedError,
              );

              await expect(createOSDWizardPage.gcpWIFCommandInput()).toHaveValue(
                ClustersValidation.ClusterSettings.CloudProvider.GCP.WIFCommandValue,
              );

              await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();

              const wifConfig = process.env.QE_GCP_WIF_CONFIG;
              if (wifConfig) {
                await createOSDWizardPage.selectWorkloadIdentityConfiguration(wifConfig);
              }
            }
          }
          await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
        }
        await createOSDWizardPage.wizardNextButton().click();
      });

      test(`Cluster details field validations`, async ({ page, createOSDWizardPage }) => {
        await createOSDWizardPage.isClusterDetailsScreen();

        const clusterNameInput = page.locator(createOSDWizardPage.clusterNameInput);
        await clusterNameInput.scrollIntoViewIfNeeded();
        await clusterNameInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesValues[0],
        );
        await createOSDWizardPage.closePopoverDialogs();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesErrors[0],
        );

        await clusterNameInput.scrollIntoViewIfNeeded();
        await clusterNameInput.press('Control+a');
        await clusterNameInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesValues[1],
        );
        await createOSDWizardPage.closePopoverDialogs();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesErrors[1],
        );

        await clusterNameInput.scrollIntoViewIfNeeded();
        await clusterNameInput.press('Control+a');
        await clusterNameInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesValues[2],
        );
        await createOSDWizardPage.closePopoverDialogs();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesErrors[2],
        );

        await clusterNameInput.clear();
        await clusterNameInput.fill('wizardvalid');
        await clusterNameInput.blur();

        await createOSDWizardPage.createCustomDomainPrefixCheckbox().scrollIntoViewIfNeeded();
        await createOSDWizardPage.createCustomDomainPrefixCheckbox().check();

        const domainPrefixInput = createOSDWizardPage.domainPrefixInput();
        await domainPrefixInput.scrollIntoViewIfNeeded();
        await domainPrefixInput.press('Control+a');
        await domainPrefixInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixValues[0],
        );
        await createOSDWizardPage.closePopoverDialogs();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixErrors[0],
        );

        await domainPrefixInput.scrollIntoViewIfNeeded();
        await domainPrefixInput.press('Control+a');
        await domainPrefixInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixValues[1],
        );
        await createOSDWizardPage.closePopoverDialogs();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixErrors[1],
        );

        await domainPrefixInput.scrollIntoViewIfNeeded();
        await domainPrefixInput.press('Control+a');
        await domainPrefixInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixValues[2],
        );
        await createOSDWizardPage.closePopoverDialogs();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixErrors[2],
        );

        await createOSDWizardPage.createCustomDomainPrefixCheckbox().uncheck();
        await createOSDWizardPage.selectAvailabilityZone('Single Zone');

        if (clusterProperties.CloudProvider.includes('GCP')) {
          await createOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
        }
        await createOSDWizardPage.wizardNextButton().click();
      });

      test(`Machine pool nodes field validations`, async ({ createOSDWizardPage }) => {
        const machinePoolProperties = isCCSCluster
          ? ClustersValidation.ClusterSettings.Machinepool.NodeCount.CCS
          : ClustersValidation.ClusterSettings.Machinepool.NodeCount.NonCCS;

        await createOSDWizardPage.isMachinePoolScreen();
        await createOSDWizardPage.selectComputeNodeType(clusterProperties.InstanceType);

        var minNodes = '2';
        var maxNodes = '249';
        await expect(createOSDWizardPage.computeNodeCountInput()).toHaveValue(minNodes);
        await expect(createOSDWizardPage.computeNodeCountDecrementButton()).not.toBeEnabled();
        await createOSDWizardPage.computeNodeCountInput().fill((parseInt(minNodes) - 1).toString());
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.LowerLimitError,
        );
        await createOSDWizardPage.computeNodeCountIncrementButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.LowerLimitError,
          false,
        );
        await createOSDWizardPage.computeNodeCountInput().fill(maxNodes);
        await expect(createOSDWizardPage.computeNodeCountIncrementButton()).not.toBeEnabled();
        await expect(createOSDWizardPage.computeNodeCountDecrementButton()).toBeEnabled();
        await createOSDWizardPage.computeNodeCountInput().fill((parseInt(maxNodes) + 1).toString());
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.UpperLimitError,
        );
        await createOSDWizardPage.computeNodeCountDecrementButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.UpperLimitError,
          false,
        );

        await createOSDWizardPage.enableAutoScaling();
        await createOSDWizardPage.setMinimumNodeCount('0');

        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.LowerLimitError,
        );
        await createOSDWizardPage.setMinimumNodeCount('500');
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.UpperLimitError,
        );
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
        );

        await createOSDWizardPage.setMinimumNodeCount(isCCSCluster ? '2' : '4');
        await createOSDWizardPage.setMaximumNodeCount('500');
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.UpperLimitError,
        );
        await createOSDWizardPage.setMaximumNodeCount('0');
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.LowerLimitError,
        );
        await createOSDWizardPage.setMaximumNodeCount(isCCSCluster ? '2' : '4');

        await createOSDWizardPage.minimumNodeCountPlusButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
        );
        await createOSDWizardPage.maximumNodeCountPlusButton().click();
        await createOSDWizardPage.maximumNodeCountMinusButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
        );
        await createOSDWizardPage.minimumNodeCountMinusButton().click();

        // Test multi-zone scenario
        await createOSDWizardPage.wizardBackButton().click();
        await createOSDWizardPage.selectAvailabilityZone('Multi-zone');
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.selectComputeNodeType(clusterProperties.InstanceType);
        await createOSDWizardPage.selectAutoScaling('disabled');

        minNodes = '1';
        maxNodes = '83';
        await expect(createOSDWizardPage.computeNodeCountInput()).toHaveValue(minNodes);
        await expect(createOSDWizardPage.computeNodeCountDecrementButton()).not.toBeEnabled();
        await createOSDWizardPage.computeNodeCountInput().fill((parseInt(minNodes) - 1).toString());
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.LowerLimitError,
        );
        await createOSDWizardPage.computeNodeCountIncrementButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.LowerLimitError,
          false,
        );
        await createOSDWizardPage.computeNodeCountInput().fill(maxNodes);
        await expect(createOSDWizardPage.computeNodeCountIncrementButton()).not.toBeEnabled();
        await expect(createOSDWizardPage.computeNodeCountDecrementButton()).toBeEnabled();
        await createOSDWizardPage.computeNodeCountInput().fill((parseInt(maxNodes) + 1).toString());
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.UpperLimitError,
        );
        await createOSDWizardPage.computeNodeCountDecrementButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.UpperLimitError,
          false,
        );

        await createOSDWizardPage.enableAutoScaling();
        await createOSDWizardPage.setMinimumNodeCount('0');
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.LowerLimitError,
        );
        await createOSDWizardPage.setMinimumNodeCount('500');
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.UpperLimitError,
        );
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
        );

        await createOSDWizardPage.setMinimumNodeCount(isCCSCluster ? '2' : '3');
        await createOSDWizardPage.setMaximumNodeCount('500');
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.UpperLimitError,
        );
        await createOSDWizardPage.setMaximumNodeCount('0');
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.LowerLimitError,
        );
        await createOSDWizardPage.setMaximumNodeCount(isCCSCluster ? '2' : '3');

        await createOSDWizardPage.minimumNodeCountPlusButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
        );
        await createOSDWizardPage.maximumNodeCountPlusButton().click();
        await createOSDWizardPage.maximumNodeCountMinusButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
        );
        await createOSDWizardPage.minimumNodeCountMinusButton().click();
      });

      if (isCCSCluster) {
        test(`Cluster autoscaling validations`, async ({ createOSDWizardPage }) => {
          await createOSDWizardPage.editClusterAutoscalingSettingsButton().click();

          // Log verbosity validation
          await createOSDWizardPage.clusterAutoscalingLogVerbosityInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingLogVerbosityInput().fill('0');
          await createOSDWizardPage.clusterAutoscalingLogVerbosityInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .LogVerbosityLimitError,
          );

          await createOSDWizardPage.clusterAutoscalingLogVerbosityInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingLogVerbosityInput().fill('7');
          await createOSDWizardPage.clusterAutoscalingLogVerbosityInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .LogVerbosityLimitError,
          );

          await createOSDWizardPage.clusterAutoscalingLogVerbosityInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingLogVerbosityInput().fill('3');
          await createOSDWizardPage.clusterAutoscalingLogVerbosityInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .LogVerbosityLimitError,
            false,
          );

          // Max node provision time validation
          await createOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
          await createOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .RequiredFieldError,
          );

          await createOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
          await createOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().fill('8H');
          await createOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await createOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
          await createOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().fill('90k');
          await createOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await createOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
          await createOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().fill('8s');
          await createOSDWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
            false,
          );

          // Balancing ignored labels validation
          await createOSDWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().clear();
          await createOSDWizardPage
            .clusterAutoscalingBalancingIgnoredLabelsInput()
            .fill('test with whitespace,test');
          await createOSDWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .WhitespaceLabelValueError,
          );

          await createOSDWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().clear();
          await createOSDWizardPage
            .clusterAutoscalingBalancingIgnoredLabelsInput()
            .fill('test,test,');
          await createOSDWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .EmptyLabelValueError,
          );

          await createOSDWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().clear();
          await createOSDWizardPage
            .clusterAutoscalingBalancingIgnoredLabelsInput()
            .fill('test@434$,123,&test_(t)35435');
          await createOSDWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().blur();
          await createOSDWizardPage.isTextContainsInPage('Empty labels are not allowed', false);

          // Cores validation
          await createOSDWizardPage.clusterAutoscalingCoresTotalMinInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingCoresTotalMinInput().fill('10');
          await createOSDWizardPage.clusterAutoscalingCoresTotalMinInput().blur();
          await createOSDWizardPage.clusterAutoscalingCoresTotalMaxInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingCoresTotalMaxInput().fill('9');
          await createOSDWizardPage.clusterAutoscalingCoresTotalMaxInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .MinMaxLimitError,
          );

          await createOSDWizardPage.clusterAutoscalingCoresTotalMinInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingCoresTotalMinInput().fill('9');
          await createOSDWizardPage.clusterAutoscalingCoresTotalMinInput().blur();
          await createOSDWizardPage.clusterAutoscalingCoresTotalMaxInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingCoresTotalMaxInput().fill('10');
          await createOSDWizardPage.clusterAutoscalingCoresTotalMaxInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .MinMaxLimitError,
            false,
          );

          // Memory validation
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMinInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMinInput().fill('10');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMinInput().blur();
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput().fill('9');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .MinMaxLimitError,
          );

          await createOSDWizardPage.clusterAutoscalingMemoryTotalMinInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMinInput().fill('-1');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMinInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .NegativeValueError,
          );

          await createOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput().fill('-1');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .NegativeValueError,
          );

          await createOSDWizardPage.clusterAutoscalingMemoryTotalMinInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMinInput().fill('9');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMinInput().blur();
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput().fill('10');
          await createOSDWizardPage.clusterAutoscalingMemoryTotalMaxInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .NegativeValueError,
            false,
          );

          // Max nodes validation
          await expect(createOSDWizardPage.clusterAutoscalingMaxNodesTotalInput()).toHaveValue(
            '255',
          );
          await createOSDWizardPage.clusterAutoscalingMaxNodesTotalInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingMaxNodesTotalInput().fill('257');
          await createOSDWizardPage.clusterAutoscalingMaxNodesTotalInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .MaxNodesValueMultizoneLimitError,
          );

          await createOSDWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
          await createOSDWizardPage.clusterAutoscalingCloseButton().click();

          // Test single zone
          await createOSDWizardPage.wizardBackButton().click();
          await createOSDWizardPage.selectAvailabilityZone('Single Zone');
          await createOSDWizardPage.wizardNextButton().click();
          await createOSDWizardPage.selectComputeNodeType(clusterProperties.InstanceType);
          await createOSDWizardPage.enableAutoscalingCheckbox().uncheck();
          await createOSDWizardPage.enableAutoscalingCheckbox().check();
          await createOSDWizardPage.editClusterAutoscalingSettingsButton().click();

          await expect(createOSDWizardPage.clusterAutoscalingMaxNodesTotalInput()).toHaveValue(
            '254',
          );
          await createOSDWizardPage.clusterAutoscalingMaxNodesTotalInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingMaxNodesTotalInput().fill('255');
          await createOSDWizardPage.clusterAutoscalingMaxNodesTotalInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .MaxNodesValueSinglezoneLimitError,
          );

          if (clusterProperties.CloudProvider.includes('GCP')) {
            await createOSDWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
            await createOSDWizardPage.clusterAutoscalingCloseButton().click();
            await createOSDWizardPage.wizardBackButton().click();
            await createOSDWizardPage.selectAvailabilityZone('Multi-zone');
            await createOSDWizardPage.wizardNextButton().click();
            await createOSDWizardPage.selectComputeNodeType(clusterProperties.InstanceType);
            await createOSDWizardPage.enableAutoscalingCheckbox().uncheck();
            await createOSDWizardPage.enableAutoscalingCheckbox().check();
            await createOSDWizardPage.editClusterAutoscalingSettingsButton().click();
          }

          // GPU validation
          await createOSDWizardPage.clusterAutoscalingGPUsInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingGPUsInput().fill('test');
          await createOSDWizardPage.clusterAutoscalingGPUsInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidGPUValueError,
          );

          await createOSDWizardPage.clusterAutoscalingGPUsInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingGPUsInput().fill('test:10:5');
          await createOSDWizardPage.clusterAutoscalingGPUsInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidGPUValueError,
          );

          await createOSDWizardPage.clusterAutoscalingGPUsInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingGPUsInput().fill('test:10:5,');
          await createOSDWizardPage.clusterAutoscalingGPUsInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidGPUValueError,
          );

          await createOSDWizardPage.clusterAutoscalingGPUsInput().press('Control+a');
          await createOSDWizardPage.clusterAutoscalingGPUsInput().fill('test:10:12,test:1:5');
          await createOSDWizardPage.clusterAutoscalingGPUsInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidGPUValueError,
            false,
          );
          // await expect(page.locator('div').filter({ hasText:  })).not.toBeVisible();

          // Scale down validation
          await createOSDWizardPage
            .clusterAutoscalingScaleDownUtilizationThresholdInput()
            .press('Control+a');
          await createOSDWizardPage
            .clusterAutoscalingScaleDownUtilizationThresholdInput()
            .fill('1.5');
          await createOSDWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .ThreasholdLimitError,
          );

          await createOSDWizardPage
            .clusterAutoscalingScaleDownUtilizationThresholdInput()
            .press('Control+a');
          await createOSDWizardPage
            .clusterAutoscalingScaleDownUtilizationThresholdInput()
            .fill('-1.5');
          await createOSDWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .NegativeValueError,
          );

          await createOSDWizardPage
            .clusterAutoscalingScaleDownUtilizationThresholdInput()
            .press('Control+a');
          await createOSDWizardPage
            .clusterAutoscalingScaleDownUtilizationThresholdInput()
            .fill('0.5');
          await createOSDWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .NegativeValueError,
            false,
          );

          // Time-based validations
          await createOSDWizardPage
            .clusterAutoscalingScaleDownUnneededTimeInput()
            .press('Control+a');
          await createOSDWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().fill('7H');
          await createOSDWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await createOSDWizardPage
            .clusterAutoscalingScaleDownUnneededTimeInput()
            .press('Control+a');
          await createOSDWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().fill('7h');
          await createOSDWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
            false,
          );

          await createOSDWizardPage
            .clusterAutoscalingScaleDownDelayAfterAddInput()
            .press('Control+a');
          await createOSDWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().fill('8Sec');
          await createOSDWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await createOSDWizardPage
            .clusterAutoscalingScaleDownDelayAfterAddInput()
            .press('Control+a');
          await createOSDWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().fill('8s');
          await createOSDWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
            false,
          );

          await createOSDWizardPage
            .clusterAutoscalingScaleDownDelayAfterDeleteInput()
            .press('Control+a');
          await createOSDWizardPage
            .clusterAutoscalingScaleDownDelayAfterDeleteInput()
            .fill('10milli');
          await createOSDWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await createOSDWizardPage
            .clusterAutoscalingScaleDownDelayAfterDeleteInput()
            .press('Control+a');
          await createOSDWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().fill('10s');
          await createOSDWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
            false,
          );

          await createOSDWizardPage
            .clusterAutoscalingScaleDownDelayAfterFailureInput()
            .press('Control+a');
          await createOSDWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().fill('5M');
          await createOSDWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await createOSDWizardPage
            .clusterAutoscalingScaleDownDelayAfterFailureInput()
            .press('Control+a');
          await createOSDWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().fill('5m');
          await createOSDWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().blur();
          await createOSDWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
            false,
          );

          await createOSDWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
          await createOSDWizardPage.clusterAutoscalingCloseButton().click();
        });
      }

      test(`Machine pool labels field validations`, async ({ page, createOSDWizardPage }) => {
        await createOSDWizardPage.addNodeLabelLink().scrollIntoViewIfNeeded();
        await createOSDWizardPage.addNodeLabelLink().click();

        await createOSDWizardPage.addNodeLabelKeyAndValue(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0]
            .UpperCharacterLimitValue,
          'test',
          0,
        );
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
        );
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].LabelError,
          false,
        );

        await createOSDWizardPage.addNodeLabelKeyAndValue(
          'test',
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0]
            .UpperCharacterLimitValue,
          0,
        );
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
          false,
        );
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].LabelError,
        );

        await createOSDWizardPage.addNodeLabelKeyAndValue('test-t_123.com', 'test-t_123.com', 0);
        await page.getByText('Node labels (optional)').click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
          false,
        );
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].LabelError,
          false,
        );

        await createOSDWizardPage.addNodeLabelKeyAndValue(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].InvalidValue,
          'test',
          0,
        );
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].KeyError,
        );

        await createOSDWizardPage.addNodeLabelKeyAndValue(
          'testing',
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].InvalidValue,
          0,
        );
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].LabelError,
        );

        await createOSDWizardPage.addNodeLabelKeyAndValue(
          'test',
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[2].InvalidValue,
          0,
        );
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[2].LabelError,
        );

        await createOSDWizardPage.addNodeLabelKeyAndValue(
          'example12-ing.com/MyName',
          'test-ing_123.com',
          0,
        );
        await page.getByText('Node labels (optional)').click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
          false,
        );
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].KeyError,
          false,
        );
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[2].KeyError,
          false,
        );

        await createOSDWizardPage.wizardNextButton().click();
      });

      test(`Networking configuration field validations`, async ({ page, createOSDWizardPage }) => {
        if (clusterProperties.CloudProvider.includes('GCP') && !isCCSCluster) {
          console.log(
            `Cloud provider : ${clusterProperties.CloudProvider} -${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType} with CCS cluster=${isCCSCluster} not supported Networking configuration > Cluster privacy`,
          );
        } else {
          await createOSDWizardPage.isNetworkingScreen();

          if (isCCSCluster) {
            await createOSDWizardPage.applicationIngressCustomSettingsRadio().check();

            await createOSDWizardPage.applicationIngressRouterSelectorsInput().clear();
            await createOSDWizardPage
              .applicationIngressRouterSelectorsInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .RouteSelector[0].UpperCharacterLimitValue,
              );
            await page.getByText('Route selector').click();
            await createOSDWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[0].Error,
            );

            await createOSDWizardPage.applicationIngressRouterSelectorsInput().clear();
            await createOSDWizardPage
              .applicationIngressRouterSelectorsInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .RouteSelector[1].InvalidValue,
              );
            await page.getByText('Route selector').click();
            await createOSDWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[1].Error,
            );

            await createOSDWizardPage.applicationIngressRouterSelectorsInput().clear();
            await createOSDWizardPage
              .applicationIngressRouterSelectorsInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .RouteSelector[2].InvalidValue,
              );
            await page.getByText('Route selector').click();
            await createOSDWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[2].Error,
            );

            await createOSDWizardPage.applicationIngressRouterSelectorsInput().clear();
            await createOSDWizardPage
              .applicationIngressRouterSelectorsInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .RouteSelector[3].InvalidValue,
              );
            await page.getByText('Route selector').click();
            await createOSDWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[3].Error,
            );

            await createOSDWizardPage.applicationIngressRouterSelectorsInput().clear();
            await createOSDWizardPage
              .applicationIngressRouterSelectorsInput()
              .fill('valid123-k.com/Hello_world2');
            await page.getByText('Route selector').click();
            await createOSDWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[0].Error,
              false,
            );

            await createOSDWizardPage.applicationIngressExcludedNamespacesInput().clear();
            await createOSDWizardPage
              .applicationIngressExcludedNamespacesInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .ExcludedNamespaces[0].UpperCharacterLimitValue,
              );
            await page.getByText('Route selector').click();
            await createOSDWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .ExcludedNamespaces[0].Error,
            );

            await createOSDWizardPage.applicationIngressExcludedNamespacesInput().clear();
            await createOSDWizardPage
              .applicationIngressExcludedNamespacesInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .ExcludedNamespaces[1].InvalidValue,
              );
            await page.getByText('Route selector').click();
            await createOSDWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .ExcludedNamespaces[1].Error,
            );

            await createOSDWizardPage.applicationIngressExcludedNamespacesInput().clear();
            await createOSDWizardPage.applicationIngressExcludedNamespacesInput().fill('abc-123');
            await page.getByText('Route selector').click();
            await createOSDWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .ExcludedNamespaces[1].Error,
              false,
            );
          }
          await createOSDWizardPage.wizardNextButton().click();
        }
      });

      test(`CIDR field validations`, async ({ createOSDWizardPage }) => {
        await createOSDWizardPage.isCIDRScreen();
        await createOSDWizardPage.useCIDRDefaultValues(false);

        // Machine CIDR validation
        await createOSDWizardPage.machineCIDRInput().clear();
        await createOSDWizardPage
          .machineCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Error,
        );

        await createOSDWizardPage.machineCIDRInput().clear();
        await createOSDWizardPage
          .machineCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Error,
        );

        await createOSDWizardPage.machineCIDRInput().clear();
        await createOSDWizardPage
          .machineCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
        );

        await createOSDWizardPage.machineCIDRInput().clear();
        await createOSDWizardPage.machineCIDRInput().fill('10.0.0.0/16');
        await createOSDWizardPage.machineCIDRInput().blur();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
          false,
        );

        // Service CIDR validation
        await createOSDWizardPage.serviceCIDRInput().clear();
        await createOSDWizardPage
          .serviceCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Error,
        );

        await createOSDWizardPage.serviceCIDRInput().clear();
        await createOSDWizardPage
          .serviceCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Error,
        );

        await createOSDWizardPage.serviceCIDRInput().clear();
        await createOSDWizardPage
          .serviceCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
        );

        await createOSDWizardPage.serviceCIDRInput().clear();
        await createOSDWizardPage.serviceCIDRInput().fill('172.30.0.0/16');
        await createOSDWizardPage.serviceCIDRInput().blur();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
          false,
        );

        // Pod CIDR validation
        await createOSDWizardPage.podCIDRInput().clear();
        await createOSDWizardPage
          .podCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Error,
        );

        await createOSDWizardPage.podCIDRInput().clear();
        await createOSDWizardPage
          .podCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Error,
        );

        await createOSDWizardPage.podCIDRInput().clear();
        await createOSDWizardPage
          .podCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
        );

        await createOSDWizardPage.podCIDRInput().clear();
        await createOSDWizardPage.podCIDRInput().fill('10.128.0.0/14');
        await createOSDWizardPage.podCIDRInput().blur();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
          false,
        );

        // Host prefix validation
        await createOSDWizardPage.hostPrefixInput().clear();
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage('Field is required');
        // await expect(page.locator('div').filter({ hasText: '' })).toBeVisible();
        await createOSDWizardPage.hostPrefixInput().clear();
        await createOSDWizardPage
          .hostPrefixInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[0].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[0].Error,
        );

        await createOSDWizardPage.hostPrefixInput().clear();
        await createOSDWizardPage
          .hostPrefixInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[1].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[1].Error,
        );

        await createOSDWizardPage.hostPrefixInput().clear();
        await createOSDWizardPage
          .hostPrefixInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[2].Value);
        await createOSDWizardPage.wizardNextButton().click();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[2].Error,
        );

        await createOSDWizardPage.hostPrefixInput().clear();
        await createOSDWizardPage.hostPrefixInput().fill('/23');
        await createOSDWizardPage.hostPrefixInput().blur();
        await createOSDWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[2].Error,
          false,
        );
        await createOSDWizardPage.useCIDRDefaultValues(true);
        await createOSDWizardPage.wizardNextButton().click();
      });
    },
  );
});
