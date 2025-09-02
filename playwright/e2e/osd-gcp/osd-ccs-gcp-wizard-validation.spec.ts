import { test, expect, Page, BrowserContext } from '@playwright/test';
import { CreateOSDWizardPage } from '../../page-objects/create-osd-wizard-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

// Test data - importing as modules since JSON imports need special config
const testData = require('../../fixtures/osd-gcp/OsdCCSGCPWizardValidation.json');
const { Clusters, ClustersValidation } = testData;

// Environment variables
const QE_GCP = process.env.QE_GCP_OSDCCSADMIN_JSON;

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let osdWizardPage: CreateOSDWizardPage;

// Create parameterized tests for each cluster configuration
Clusters.forEach((clusterProperties, index) => {
  const isCCSCluster = !clusterProperties.InfrastructureType.includes('Red Hat');
  const testSuffix = clusterProperties.AuthenticationType
    ? `-${clusterProperties.AuthenticationType}`
    : '';
  const configName = `${clusterProperties.CloudProvider}-${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType}${testSuffix}`;

  test.describe.serial(
    `OSD Wizard validation tests (${configName}) - OCP-54134,OCP-73204`,
    { tag: ['@smoke', '@wizard-validation'] },
    () => {
      test.beforeAll(async ({ browser }) => {
        // Setup: auth + navigate to create page
        const setup = await setupTestSuite(browser, 'create');
        sharedContext = setup.context;
        sharedPage = setup.page;
        osdWizardPage = new CreateOSDWizardPage(sharedPage);
      });

      test.afterAll(async () => {
        await cleanupTestSuite(sharedContext);
      });

      test(`Launch OSD cluster wizard`, async () => {
        await osdWizardPage.osdCreateClusterButton().waitFor({ state: 'visible', timeout: 30000 });
        await osdWizardPage.osdCreateClusterButton().click();
        await osdWizardPage.isCreateOSDPage();
      });

      test(`Billing model validation`, async () => {
        await osdWizardPage.isBillingModelScreen();
        await osdWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
        await osdWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
        await osdWizardPage.wizardNextButton().click();
      });

      test(`Cloud provider field validations`, async () => {
        await osdWizardPage.isCloudProviderSelectionScreen();
        await osdWizardPage.selectCloudProvider(clusterProperties.CloudProvider);

        if (isCCSCluster) {
          await osdWizardPage.wizardNextButton().click();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.CloudProvider.Common.AcknowledgementUncheckedError,
          );

          if (clusterProperties.CloudProvider.includes('GCP')) {
            if (clusterProperties.AuthenticationType?.includes('Service Account')) {
              await osdWizardPage.serviceAccountButton().click();
              await osdWizardPage.wizardNextButton().click();
              await osdWizardPage.isTextContainsInPage(
                ClustersValidation.ClusterSettings.CloudProvider.GCP.EmptyGCPServiceJSONFieldError,
              );

              await osdWizardPage.uploadGCPServiceAccountJSON(
                ClustersValidation.ClusterSettings.CloudProvider.GCP
                  .InvalidFormatGCPServiceJSONValues,
              );
              await osdWizardPage.wizardNextButton().click();
              await osdWizardPage.isTextContainsInPage(
                ClustersValidation.ClusterSettings.CloudProvider.GCP
                  .InvalidFormatGCPServiceJSONFieldError,
              );

              await osdWizardPage.uploadGCPServiceAccountJSON(
                ClustersValidation.ClusterSettings.CloudProvider.GCP.InvalidGCPServiceJSONValues,
              );
              await osdWizardPage.wizardNextButton().click();
              await osdWizardPage.isTextContainsInPage(
                ClustersValidation.ClusterSettings.CloudProvider.GCP
                  .InvalidGCPServiceJSONFieldError,
              );

              if (QE_GCP) {
                await osdWizardPage.uploadGCPServiceAccountJSON(QE_GCP || '{}');
              }
            } else {
              await osdWizardPage.workloadIdentityFederationButton().click();
              await osdWizardPage.wizardNextButton().click();
              await osdWizardPage.isTextContainsInPage(
                ClustersValidation.ClusterSettings.CloudProvider.GCP.NoWIFConfigSelectionError,
              );
              await osdWizardPage.isTextContainsInPage(
                ClustersValidation.ClusterSettings.CloudProvider.Common
                  .AcknowledgementUncheckedError,
              );

              await expect(osdWizardPage.gcpWIFCommandInput()).toHaveValue(
                ClustersValidation.ClusterSettings.CloudProvider.GCP.WIFCommandValue,
              );

              await osdWizardPage.acknowlegePrerequisitesCheckbox().check();

              const wifConfig = process.env.QE_GCP_WIF_CONFIG;
              if (wifConfig) {
                await osdWizardPage.selectWorkloadIdentityConfiguration(wifConfig);
              }
            }
          }
          await osdWizardPage.acknowlegePrerequisitesCheckbox().check();
        }
        await osdWizardPage.wizardNextButton().click();
      });

      test(`Cluster details field validations`, async () => {
        await osdWizardPage.isClusterDetailsScreen();

        const clusterNameInput = sharedPage.locator(osdWizardPage.clusterNameInput);
        await clusterNameInput.scrollIntoViewIfNeeded();
        await clusterNameInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesValues[0],
        );
        await osdWizardPage.closePopoverDialogs();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesErrors[0],
        );

        await clusterNameInput.scrollIntoViewIfNeeded();
        await clusterNameInput.press('Control+a');
        await clusterNameInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesValues[1],
        );
        await osdWizardPage.closePopoverDialogs();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesErrors[1],
        );

        await clusterNameInput.scrollIntoViewIfNeeded();
        await clusterNameInput.press('Control+a');
        await clusterNameInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesValues[2],
        );
        await osdWizardPage.closePopoverDialogs();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidClusterNamesErrors[2],
        );

        await clusterNameInput.clear();
        await clusterNameInput.fill('wizardvalid');
        await clusterNameInput.blur();

        await osdWizardPage.createCustomDomainPrefixCheckbox().scrollIntoViewIfNeeded();
        await osdWizardPage.createCustomDomainPrefixCheckbox().check();

        const domainPrefixInput = osdWizardPage.domainPrefixInput();
        await domainPrefixInput.scrollIntoViewIfNeeded();
        await domainPrefixInput.press('Control+a');
        await domainPrefixInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixValues[0],
        );
        await osdWizardPage.closePopoverDialogs();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixErrors[0],
        );

        await domainPrefixInput.scrollIntoViewIfNeeded();
        await domainPrefixInput.press('Control+a');
        await domainPrefixInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixValues[1],
        );
        await osdWizardPage.closePopoverDialogs();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixErrors[1],
        );

        await domainPrefixInput.scrollIntoViewIfNeeded();
        await domainPrefixInput.press('Control+a');
        await domainPrefixInput.fill(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixValues[2],
        );
        await osdWizardPage.closePopoverDialogs();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Details.Common.InvalidDomainPrefixErrors[2],
        );

        await osdWizardPage.createCustomDomainPrefixCheckbox().uncheck();
        await osdWizardPage.selectAvailabilityZone('Single Zone');

        if (clusterProperties.CloudProvider.includes('GCP')) {
          await osdWizardPage.enableSecureBootSupportForSchieldedVMs(true);
        }
        await osdWizardPage.wizardNextButton().click();
      });

      test(`Machine pool nodes field validations`, async () => {
        await osdWizardPage.isMachinePoolScreen();
        await osdWizardPage.selectComputeNodeType(clusterProperties.InstanceType);

        const firstOptionText = isCCSCluster ? '2' : '4';
        await expect(osdWizardPage.computeNodeCountSelect().locator('option').first()).toHaveText(
          firstOptionText,
        );
        await expect(osdWizardPage.computeNodeCountSelect().locator('option').last()).toHaveText(
          '249',
        );

        await osdWizardPage.enableAutoScaling();
        await osdWizardPage.setMinimumNodeCount('0');

        const machinePoolProperties = isCCSCluster
          ? ClustersValidation.ClusterSettings.Machinepool.NodeCount.CCS
          : ClustersValidation.ClusterSettings.Machinepool.NodeCount.NonCCS;

        await osdWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.LowerLimitError);
        await osdWizardPage.setMinimumNodeCount('500');
        await osdWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.UpperLimitError);
        await osdWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
        );

        await osdWizardPage.setMinimumNodeCount(isCCSCluster ? '2' : '4');
        await osdWizardPage.setMaximumNodeCount('500');
        await osdWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.UpperLimitError);
        await osdWizardPage.setMaximumNodeCount('0');
        await osdWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.LowerLimitError);
        await osdWizardPage.setMaximumNodeCount(isCCSCluster ? '2' : '4');

        await osdWizardPage.minimumNodeCountPlusButton().click();
        await osdWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
        );
        await osdWizardPage.maximumNodeCountPlusButton().click();
        await osdWizardPage.maximumNodeCountMinusButton().click();
        await osdWizardPage.isTextContainsInPage(
          machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
        );
        await osdWizardPage.minimumNodeCountMinusButton().click();

        // Test multi-zone scenario
        await osdWizardPage.wizardBackButton().click();
        await osdWizardPage.selectAvailabilityZone('Multi-zone');
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.selectComputeNodeType(clusterProperties.InstanceType);
        await osdWizardPage.selectAutoScaling('disabled');

        await expect(osdWizardPage.computeNodeCountSelect()).not.toBeDisabled();
        const firstMultiZoneText = isCCSCluster ? '1' : '3';
        await expect(osdWizardPage.computeNodeCountSelect().locator('option').first()).toHaveText(
          firstMultiZoneText,
        );
        await expect(osdWizardPage.computeNodeCountSelect().locator('option').last()).toHaveText(
          '83',
        );

        await osdWizardPage.enableAutoScaling();
        await osdWizardPage.setMinimumNodeCount('0');
        await osdWizardPage.isTextContainsInPage(machinePoolProperties.MultiZone.LowerLimitError);
        await osdWizardPage.setMinimumNodeCount('500');
        await osdWizardPage.isTextContainsInPage(machinePoolProperties.MultiZone.UpperLimitError);
        await osdWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
        );

        await osdWizardPage.setMinimumNodeCount(isCCSCluster ? '2' : '3');
        await osdWizardPage.setMaximumNodeCount('500');
        await osdWizardPage.isTextContainsInPage(machinePoolProperties.MultiZone.UpperLimitError);
        await osdWizardPage.setMaximumNodeCount('0');
        await osdWizardPage.isTextContainsInPage(machinePoolProperties.MultiZone.LowerLimitError);
        await osdWizardPage.setMaximumNodeCount(isCCSCluster ? '2' : '3');

        await osdWizardPage.minimumNodeCountPlusButton().click();
        await osdWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
        );
        await osdWizardPage.maximumNodeCountPlusButton().click();
        await osdWizardPage.maximumNodeCountMinusButton().click();
        await osdWizardPage.isTextContainsInPage(
          machinePoolProperties.MultiZone.MinAndMaxLimitDependencyError,
        );
        await osdWizardPage.minimumNodeCountMinusButton().click();
      });

      if (isCCSCluster) {
        test(`Cluster autoscaling validations`, async () => {
          await osdWizardPage.editClusterAutoscalingSettingsButton().click();

          // Log verbosity validation
          await osdWizardPage.clusterAutoscalingLogVerbosityInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingLogVerbosityInput().fill('0');
          await osdWizardPage.clusterAutoscalingLogVerbosityInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .LogVerbosityLimitError,
          );

          await osdWizardPage.clusterAutoscalingLogVerbosityInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingLogVerbosityInput().fill('7');
          await osdWizardPage.clusterAutoscalingLogVerbosityInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .LogVerbosityLimitError,
          );

          await osdWizardPage.clusterAutoscalingLogVerbosityInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingLogVerbosityInput().fill('3');
          await osdWizardPage.clusterAutoscalingLogVerbosityInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .LogVerbosityLimitError,
            false,
          );

          // Max node provision time validation
          await osdWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
          await osdWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .RequiredFieldError,
          );

          await osdWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
          await osdWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().fill('8H');
          await osdWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await osdWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
          await osdWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().fill('90k');
          await osdWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await osdWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().clear();
          await osdWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().fill('8s');
          await osdWizardPage.clusterAutoscalingMaxNodeProvisionTimeInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
            false,
          );

          // Balancing ignored labels validation
          await osdWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().clear();
          await osdWizardPage
            .clusterAutoscalingBalancingIgnoredLabelsInput()
            .fill('test with whitespace,test');
          await osdWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .WhitespaceLabelValueError,
          );

          await osdWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().clear();
          await osdWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().fill('test,test,');
          await osdWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .EmptyLabelValueError,
          );

          await osdWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().clear();
          await osdWizardPage
            .clusterAutoscalingBalancingIgnoredLabelsInput()
            .fill('test@434$,123,&test_(t)35435');
          await osdWizardPage.clusterAutoscalingBalancingIgnoredLabelsInput().blur();
          await osdWizardPage.isTextContainsInPage('Empty labels are not allowed', false);

          // Cores validation
          await osdWizardPage.clusterAutoscalingCoresTotalMinInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingCoresTotalMinInput().fill('10');
          await osdWizardPage.clusterAutoscalingCoresTotalMinInput().blur();
          await osdWizardPage.clusterAutoscalingCoresTotalMaxInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingCoresTotalMaxInput().fill('9');
          await osdWizardPage.clusterAutoscalingCoresTotalMaxInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .MinMaxLimitError,
          );

          await osdWizardPage.clusterAutoscalingCoresTotalMinInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingCoresTotalMinInput().fill('9');
          await osdWizardPage.clusterAutoscalingCoresTotalMinInput().blur();
          await osdWizardPage.clusterAutoscalingCoresTotalMaxInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingCoresTotalMaxInput().fill('10');
          await osdWizardPage.clusterAutoscalingCoresTotalMaxInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .MinMaxLimitError,
            false,
          );

          // Memory validation
          await osdWizardPage.clusterAutoscalingMemoryTotalMinInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingMemoryTotalMinInput().fill('10');
          await osdWizardPage.clusterAutoscalingMemoryTotalMinInput().blur();
          await osdWizardPage.clusterAutoscalingMemoryTotalMaxInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingMemoryTotalMaxInput().fill('9');
          await osdWizardPage.clusterAutoscalingMemoryTotalMaxInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .MinMaxLimitError,
          );

          await osdWizardPage.clusterAutoscalingMemoryTotalMinInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingMemoryTotalMinInput().fill('-1');
          await osdWizardPage.clusterAutoscalingMemoryTotalMinInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .NegativeValueError,
          );

          await osdWizardPage.clusterAutoscalingMemoryTotalMaxInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingMemoryTotalMaxInput().fill('-1');
          await osdWizardPage.clusterAutoscalingMemoryTotalMaxInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .NegativeValueError,
          );

          await osdWizardPage.clusterAutoscalingMemoryTotalMinInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingMemoryTotalMinInput().fill('9');
          await osdWizardPage.clusterAutoscalingMemoryTotalMinInput().blur();
          await osdWizardPage.clusterAutoscalingMemoryTotalMaxInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingMemoryTotalMaxInput().fill('10');
          await osdWizardPage.clusterAutoscalingMemoryTotalMaxInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .NegativeValueError,
            false,
          );

          // Max nodes validation
          await expect(osdWizardPage.clusterAutoscalingMaxNodesTotalInput()).toHaveValue('255');
          await osdWizardPage.clusterAutoscalingMaxNodesTotalInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingMaxNodesTotalInput().fill('257');
          await osdWizardPage.clusterAutoscalingMaxNodesTotalInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .MaxNodesValueMultizoneLimitError,
          );

          await osdWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
          await osdWizardPage.clusterAutoscalingCloseButton().click();

          // Test single zone
          await osdWizardPage.wizardBackButton().click();
          await osdWizardPage.selectAvailabilityZone('Single Zone');
          await osdWizardPage.wizardNextButton().click();
          await osdWizardPage.selectComputeNodeType(clusterProperties.InstanceType);
          await osdWizardPage.enableAutoscalingCheckbox().uncheck();
          await osdWizardPage.enableAutoscalingCheckbox().check();
          await osdWizardPage.editClusterAutoscalingSettingsButton().click();

          await expect(osdWizardPage.clusterAutoscalingMaxNodesTotalInput()).toHaveValue('254');
          await osdWizardPage.clusterAutoscalingMaxNodesTotalInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingMaxNodesTotalInput().fill('255');
          await osdWizardPage.clusterAutoscalingMaxNodesTotalInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .MaxNodesValueSinglezoneLimitError,
          );

          if (clusterProperties.CloudProvider.includes('GCP')) {
            await osdWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
            await osdWizardPage.clusterAutoscalingCloseButton().click();
            await osdWizardPage.wizardBackButton().click();
            await osdWizardPage.selectAvailabilityZone('Multi-zone');
            await osdWizardPage.wizardNextButton().click();
            await osdWizardPage.selectComputeNodeType(clusterProperties.InstanceType);
            await osdWizardPage.enableAutoscalingCheckbox().uncheck();
            await osdWizardPage.enableAutoscalingCheckbox().check();
            await osdWizardPage.editClusterAutoscalingSettingsButton().click();
          }

          // GPU validation
          await osdWizardPage.clusterAutoscalingGPUsInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingGPUsInput().fill('test');
          await osdWizardPage.clusterAutoscalingGPUsInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidGPUValueError,
          );

          await osdWizardPage.clusterAutoscalingGPUsInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingGPUsInput().fill('test:10:5');
          await osdWizardPage.clusterAutoscalingGPUsInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidGPUValueError,
          );

          await osdWizardPage.clusterAutoscalingGPUsInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingGPUsInput().fill('test:10:5,');
          await osdWizardPage.clusterAutoscalingGPUsInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidGPUValueError,
          );

          await osdWizardPage.clusterAutoscalingGPUsInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingGPUsInput().fill('test:10:12,test:1:5');
          await osdWizardPage.clusterAutoscalingGPUsInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidGPUValueError,
            false,
          );
          // await expect(sharedPage.locator('div').filter({ hasText:  })).not.toBeVisible();

          // Scale down validation
          await osdWizardPage
            .clusterAutoscalingScaleDownUtilizationThresholdInput()
            .press('Control+a');
          await osdWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().fill('1.5');
          await osdWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .ThreasholdLimitError,
          );

          await osdWizardPage
            .clusterAutoscalingScaleDownUtilizationThresholdInput()
            .press('Control+a');
          await osdWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().fill('-1.5');
          await osdWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .NegativeValueError,
          );

          await osdWizardPage
            .clusterAutoscalingScaleDownUtilizationThresholdInput()
            .press('Control+a');
          await osdWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().fill('0.5');
          await osdWizardPage.clusterAutoscalingScaleDownUtilizationThresholdInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .NegativeValueError,
            false,
          );

          // Time-based validations
          await osdWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().fill('7H');
          await osdWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await osdWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().fill('7h');
          await osdWizardPage.clusterAutoscalingScaleDownUnneededTimeInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
            false,
          );

          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().fill('8Sec');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().fill('8s');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterAddInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
            false,
          );

          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().fill('10milli');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().press('Control+a');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().fill('10s');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterDeleteInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
            false,
          );

          await osdWizardPage
            .clusterAutoscalingScaleDownDelayAfterFailureInput()
            .press('Control+a');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().fill('5M');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
          );

          await osdWizardPage
            .clusterAutoscalingScaleDownDelayAfterFailureInput()
            .press('Control+a');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().fill('5m');
          await osdWizardPage.clusterAutoscalingScaleDownDelayAfterFailureInput().blur();
          await osdWizardPage.isTextContainsInPage(
            ClustersValidation.ClusterSettings.Machinepool.Common.ClusterAutoscaling
              .InvalidTimeValueError,
            false,
          );

          await osdWizardPage.clusterAutoscalingRevertAllToDefaultsButton().click();
          await osdWizardPage.clusterAutoscalingCloseButton().click();
        });
      }

      test(`Machine pool labels field validations`, async () => {
        await osdWizardPage.addNodeLabelLink().scrollIntoViewIfNeeded();
        await osdWizardPage.addNodeLabelLink().click();

        await osdWizardPage.addNodeLabelKeyAndValue(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0]
            .UpperCharacterLimitValue,
          'test',
          0,
        );
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
        );
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].LabelError,
          false,
        );

        await osdWizardPage.addNodeLabelKeyAndValue(
          'test',
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0]
            .UpperCharacterLimitValue,
          0,
        );
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
          false,
        );
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].LabelError,
        );

        await osdWizardPage.addNodeLabelKeyAndValue('test-t_123.com', 'test-t_123.com', 0);
        await sharedPage.getByText('Node labels (optional)').click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
          false,
        );
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].LabelError,
          false,
        );

        await osdWizardPage.addNodeLabelKeyAndValue(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].InvalidValue,
          'test',
          0,
        );
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].KeyError,
        );

        await osdWizardPage.addNodeLabelKeyAndValue(
          'testing',
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].InvalidValue,
          0,
        );
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].LabelError,
        );

        await osdWizardPage.addNodeLabelKeyAndValue(
          'test',
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[2].InvalidValue,
          0,
        );
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[2].LabelError,
        );

        await osdWizardPage.addNodeLabelKeyAndValue(
          'example12-ing.com/MyName',
          'test-ing_123.com',
          0,
        );
        await sharedPage.getByText('Node labels (optional)').click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].KeyError,
          false,
        );
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[1].KeyError,
          false,
        );
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[2].KeyError,
          false,
        );

        await osdWizardPage.wizardNextButton().click();
      });

      test(`Networking configuration field validations`, async () => {
        if (clusterProperties.CloudProvider.includes('GCP') && !isCCSCluster) {
          console.log(
            `Cloud provider : ${clusterProperties.CloudProvider} -${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType} with CCS cluster=${isCCSCluster} not supported Networking configuration > Cluster privacy`,
          );
        } else {
          await osdWizardPage.isNetworkingScreen();

          if (isCCSCluster) {
            await osdWizardPage.applicationIngressCustomSettingsRadio().check();

            await osdWizardPage.applicationIngressRouterSelectorsInput().clear();
            await osdWizardPage
              .applicationIngressRouterSelectorsInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .RouteSelector[0].UpperCharacterLimitValue,
              );
            await sharedPage.getByText('Route selector').click();
            await osdWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[0].Error,
            );

            await osdWizardPage.applicationIngressRouterSelectorsInput().clear();
            await osdWizardPage
              .applicationIngressRouterSelectorsInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .RouteSelector[1].InvalidValue,
              );
            await sharedPage.getByText('Route selector').click();
            await osdWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[1].Error,
            );

            await osdWizardPage.applicationIngressRouterSelectorsInput().clear();
            await osdWizardPage
              .applicationIngressRouterSelectorsInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .RouteSelector[2].InvalidValue,
              );
            await sharedPage.getByText('Route selector').click();
            await osdWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[2].Error,
            );

            await osdWizardPage.applicationIngressRouterSelectorsInput().clear();
            await osdWizardPage
              .applicationIngressRouterSelectorsInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .RouteSelector[3].InvalidValue,
              );
            await sharedPage.getByText('Route selector').click();
            await osdWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[3].Error,
            );

            await osdWizardPage.applicationIngressRouterSelectorsInput().clear();
            await osdWizardPage
              .applicationIngressRouterSelectorsInput()
              .fill('valid123-k.com/Hello_world2');
            await sharedPage.getByText('Route selector').click();
            await osdWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .RouteSelector[0].Error,
              false,
            );

            await osdWizardPage.applicationIngressExcludedNamespacesInput().clear();
            await osdWizardPage
              .applicationIngressExcludedNamespacesInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .ExcludedNamespaces[0].UpperCharacterLimitValue,
              );
            await sharedPage.getByText('Route selector').click();
            await osdWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .ExcludedNamespaces[0].Error,
            );

            await osdWizardPage.applicationIngressExcludedNamespacesInput().clear();
            await osdWizardPage
              .applicationIngressExcludedNamespacesInput()
              .fill(
                ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                  .ExcludedNamespaces[1].InvalidValue,
              );
            await sharedPage.getByText('Route selector').click();
            await osdWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .ExcludedNamespaces[1].Error,
            );

            await osdWizardPage.applicationIngressExcludedNamespacesInput().clear();
            await osdWizardPage.applicationIngressExcludedNamespacesInput().fill('abc-123');
            await sharedPage.getByText('Route selector').click();
            await osdWizardPage.isTextContainsInPage(
              ClustersValidation.Networking.Configuration.Common.IngressSettings.CustomSettings
                .ExcludedNamespaces[1].Error,
              false,
            );
          }
          await osdWizardPage.wizardNextButton().click();
        }
      });

      test(`CIDR field validations`, async () => {
        await osdWizardPage.isCIDRScreen();
        await osdWizardPage.useCIDRDefaultValues(false);

        // Machine CIDR validation
        await osdWizardPage.machineCIDRInput().clear();
        await osdWizardPage
          .machineCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Error,
        );

        await osdWizardPage.machineCIDRInput().clear();
        await osdWizardPage
          .machineCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Error,
        );

        await osdWizardPage.machineCIDRInput().clear();
        await osdWizardPage
          .machineCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
        );

        await osdWizardPage.machineCIDRInput().clear();
        await osdWizardPage.machineCIDRInput().fill('10.0.0.0/16');
        await osdWizardPage.machineCIDRInput().blur();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
          false,
        );

        // Service CIDR validation
        await osdWizardPage.serviceCIDRInput().clear();
        await osdWizardPage
          .serviceCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Error,
        );

        await osdWizardPage.serviceCIDRInput().clear();
        await osdWizardPage
          .serviceCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Error,
        );

        await osdWizardPage.serviceCIDRInput().clear();
        await osdWizardPage
          .serviceCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
        );

        await osdWizardPage.serviceCIDRInput().clear();
        await osdWizardPage.serviceCIDRInput().fill('172.30.0.0/16');
        await osdWizardPage.serviceCIDRInput().blur();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
          false,
        );

        // Pod CIDR validation
        await osdWizardPage.podCIDRInput().clear();
        await osdWizardPage
          .podCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[0].Error,
        );

        await osdWizardPage.podCIDRInput().clear();
        await osdWizardPage
          .podCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[1].Error,
        );

        await osdWizardPage.podCIDRInput().clear();
        await osdWizardPage
          .podCIDRInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
        );

        await osdWizardPage.podCIDRInput().clear();
        await osdWizardPage.podCIDRInput().fill('10.128.0.0/14');
        await osdWizardPage.podCIDRInput().blur();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.CIDR[2].Error,
          false,
        );

        // Host prefix validation
        await osdWizardPage.hostPrefixInput().clear();
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage('Field is required');
        // await expect(sharedPage.locator('div').filter({ hasText: '' })).toBeVisible();
        await osdWizardPage.hostPrefixInput().clear();
        await osdWizardPage
          .hostPrefixInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[0].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[0].Error,
        );

        await osdWizardPage.hostPrefixInput().clear();
        await osdWizardPage
          .hostPrefixInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[1].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[1].Error,
        );

        await osdWizardPage.hostPrefixInput().clear();
        await osdWizardPage
          .hostPrefixInput()
          .fill(ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[2].Value);
        await osdWizardPage.wizardNextButton().click();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[2].Error,
        );

        await osdWizardPage.hostPrefixInput().clear();
        await osdWizardPage.hostPrefixInput().fill('/23');
        await osdWizardPage.hostPrefixInput().blur();
        await osdWizardPage.isTextContainsInPage(
          ClustersValidation.Networking.CIDRRanges.Common.HostPrefix[2].Error,
          false,
        );
        await osdWizardPage.useCIDRDefaultValues(true);
        await osdWizardPage.wizardNextButton().click();
      });
    },
  );
});
