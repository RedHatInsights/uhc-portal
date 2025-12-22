import { test, expect } from '../../fixtures/pages';

// Test data - importing as modules since JSON imports need special config
const testData = require('../../fixtures/osd/osd-non-ccs-wizard-validation.spec.json');
const { Clusters, ClustersValidation } = testData;
const clusterProperties = Clusters.AWS; // Get only the 1st item (nonCCS AWS configuration)

// Create parameterized tests for each cluster configuration
const configName = `${clusterProperties.CloudProvider}-${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType}`;

test.describe.serial(
  `OSD Wizard non CCS AWS validation tests (${configName}) - OCP-54134,OCP-73204`,
  { tag: ['@smoke', '@osd'] },
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
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`Machine pool nodes field validations`, async ({ createOSDWizardPage }) => {
      const machinePoolProperties = ClustersValidation.ClusterSettings.Machinepool.NodeCount.NonCCS;
      await createOSDWizardPage.isMachinePoolScreen();
      await createOSDWizardPage.selectComputeNodeType(clusterProperties.InstanceType);

      var minNodes = '4';
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

      await createOSDWizardPage.setMinimumNodeCount('4');
      await createOSDWizardPage.setMaximumNodeCount('500');
      await createOSDWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.UpperLimitError,
      );
      await createOSDWizardPage.setMaximumNodeCount('0');
      await createOSDWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.LowerLimitError,
      );
      await createOSDWizardPage.setMaximumNodeCount('4');

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

      minNodes = '3';
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

      await createOSDWizardPage.setMinimumNodeCount('3');
      await createOSDWizardPage.setMaximumNodeCount('500');
      await createOSDWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.UpperLimitError,
      );
      await createOSDWizardPage.setMaximumNodeCount('0');
      await createOSDWizardPage.isTextContainsInPage(
        machinePoolProperties.MultiZone.LowerLimitError,
      );
      await createOSDWizardPage.setMaximumNodeCount('3');

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

    test(`Machine pool labels field validations`, async ({ page, createOSDWizardPage }) => {
      await createOSDWizardPage.addNodeLabelLink().scrollIntoViewIfNeeded();
      await createOSDWizardPage.addNodeLabelLink().click();

      await createOSDWizardPage.addNodeLabelKeyAndValue(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].UpperCharacterLimitValue,
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
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].UpperCharacterLimitValue,
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

    test(`Networking configuration field validations`, async ({ createOSDWizardPage }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await createOSDWizardPage.wizardNextButton().click();
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
