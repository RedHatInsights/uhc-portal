import { test, expect, Page, BrowserContext } from '@playwright/test';
import { CreateOSDWizardPage } from '../../page-objects/create-osd-wizard-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

// Test data - importing as modules since JSON imports need special config
const testData = require('../../fixtures/osd/osd-non-ccs-wizard-validation.spec.json');
const { Clusters, ClustersValidation } = testData;
const clusterProperties = Clusters.AWS; // Get only the 1st item (nonCCS AWS configuration)

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let osdWizardPage: CreateOSDWizardPage;

// Create parameterized tests for each cluster configuration
const configName = `${clusterProperties.CloudProvider}-${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType}`;

test.describe.serial(
  `OSD Wizard validation tests (${configName}) - OCP-54134,OCP-73204`,
  { tag: ['@smoke'] },
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
      await osdWizardPage.waitAndClick(osdWizardPage.osdCreateClusterButton());
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

      const firstOptionText = '4';
      await expect(osdWizardPage.computeNodeCountSelect().locator('option').first()).toHaveText(
        firstOptionText,
      );
      await expect(osdWizardPage.computeNodeCountSelect().locator('option').last()).toHaveText(
        '249',
      );

      await osdWizardPage.enableAutoScaling();
      await osdWizardPage.setMinimumNodeCount('0');

      const machinePoolProperties = ClustersValidation.ClusterSettings.Machinepool.NodeCount.NonCCS;

      await osdWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.LowerLimitError);
      await osdWizardPage.setMinimumNodeCount('500');
      await osdWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.UpperLimitError);
      await osdWizardPage.isTextContainsInPage(
        machinePoolProperties.SingleZone.MinAndMaxLimitDependencyError,
      );

      await osdWizardPage.setMinimumNodeCount('4');
      await osdWizardPage.setMaximumNodeCount('500');
      await osdWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.UpperLimitError);
      await osdWizardPage.setMaximumNodeCount('0');
      await osdWizardPage.isTextContainsInPage(machinePoolProperties.SingleZone.LowerLimitError);
      await osdWizardPage.setMaximumNodeCount('4');

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
      const firstMultiZoneText = '3';
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

      await osdWizardPage.setMinimumNodeCount('3');
      await osdWizardPage.setMaximumNodeCount('500');
      await osdWizardPage.isTextContainsInPage(machinePoolProperties.MultiZone.UpperLimitError);
      await osdWizardPage.setMaximumNodeCount('0');
      await osdWizardPage.isTextContainsInPage(machinePoolProperties.MultiZone.LowerLimitError);
      await osdWizardPage.setMaximumNodeCount('3');

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

    test(`Machine pool labels field validations`, async () => {
      await osdWizardPage.addNodeLabelLink().scrollIntoViewIfNeeded();
      await osdWizardPage.addNodeLabelLink().click();

      await osdWizardPage.addNodeLabelKeyAndValue(
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].UpperCharacterLimitValue,
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
        ClustersValidation.ClusterSettings.Machinepool.Common.NodeLabel[0].UpperCharacterLimitValue,
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
      if (clusterProperties.CloudProvider.includes('GCP')) {
        console.log(
          `Cloud provider : ${clusterProperties.CloudProvider} -${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType}  not supported Networking configuration > Cluster privacy`,
        );
      } else {
        await osdWizardPage.isNetworkingScreen();
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
