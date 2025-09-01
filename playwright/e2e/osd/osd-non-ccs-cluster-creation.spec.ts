import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ClusterDetailsPage } from '../../page-objects/cluster-details-page';
import { CreateOSDWizardPage } from '../../page-objects/create-osd-wizard-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';
const clusterData = require('../../fixtures/osd/OsdNonCcsClusterProperties.json');
const { Clusters } = clusterData;

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterDetailsPage: ClusterDetailsPage;
let createOSDWizardPage: CreateOSDWizardPage;

test.describe(
  'OSD Non CCS cluster creation tests (OCP-42746, OCP-21086)',
  { tag: ['@smoke'] },
  () => {
    // Iterate through each cluster configuration
    for (const clusterProperties of Clusters) {
      test.describe.serial(`${clusterProperties.CloudProvider} cluster creation`, () => {
        test.beforeAll(async ({ browser }) => {
          // Setup: auth + navigate to cluster creation
          const setup = await setupTestSuite(browser, 'create');

          sharedContext = setup.context;
          sharedPage = setup.page;

          // Initialize page objects for this test suite
          clusterDetailsPage = new ClusterDetailsPage(sharedPage);
          createOSDWizardPage = new CreateOSDWizardPage(sharedPage);
        });

        test.afterAll(async () => {
          await cleanupTestSuite(sharedContext);
        });

        test(`Launch OSD - ${clusterProperties.CloudProvider} cluster wizard`, async () => {
          await sharedPage.goto('create');
          await expect(createOSDWizardPage.osdCreateClusterButton()).toBeVisible();
          await expect(createOSDWizardPage.osdCreateClusterButton()).toBeEnabled();
          await createOSDWizardPage.osdCreateClusterButton().click();
          await createOSDWizardPage.isCreateOSDPage();
        });

        test(`OSD ${clusterProperties.CloudProvider} wizard - Billing model and its definitions`, async () => {
          await createOSDWizardPage.isBillingModelScreen();
          await expect(
            createOSDWizardPage.subscriptionTypeAnnualFixedCapacityRadio(),
          ).toBeChecked();
          await createOSDWizardPage.infrastructureTypeRedHatCloudAccountRadio().check();
          await sharedPage.locator(createOSDWizardPage.primaryButton).click();
        });

        test(`OSD ${clusterProperties.CloudProvider} wizard - Cluster Settings - Cloud provider definitions`, async () => {
          await createOSDWizardPage.isCloudProviderSelectionScreen();
          await createOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
          await sharedPage.locator(createOSDWizardPage.primaryButton).click();
        });

        test(`OSD ${clusterProperties.CloudProvider} wizard - Cluster Settings - Cluster details definitions`, async () => {
          await createOSDWizardPage.isClusterDetailsScreen();
          await sharedPage
            .locator(createOSDWizardPage.clusterNameInput)
            .fill(clusterProperties.ClusterName);
          await createOSDWizardPage.hideClusterNameValidation();
          await expect(createOSDWizardPage.singleZoneAvilabilityRadio()).toBeChecked();
          await createOSDWizardPage.selectRegion(clusterProperties.Region);
          await createOSDWizardPage.selectPersistentStorage(clusterProperties.PersistentStorage);
          await createOSDWizardPage.selectLoadBalancers(clusterProperties.LoadBalancers);
          await expect(createOSDWizardPage.enableUserWorkloadMonitoringCheckbox()).toBeChecked();
          await sharedPage.locator(createOSDWizardPage.primaryButton).click();
        });

        test(`OSD ${clusterProperties.CloudProvider} wizard - Cluster Settings - Default machinepool definitions`, async () => {
          await createOSDWizardPage.isMachinePoolScreen();
          await createOSDWizardPage.selectComputeNodeType(
            clusterProperties.MachinePools[0].InstanceType,
          );
          await createOSDWizardPage.selectComputeNodeCount(
            clusterProperties.MachinePools[0].NodeCount,
          );
          await expect(createOSDWizardPage.enableAutoscalingCheckbox()).not.toBeChecked();
          await expect(createOSDWizardPage.addNodeLabelLink()).toBeVisible();
          await sharedPage.locator(createOSDWizardPage.primaryButton).click();
        });

        if (!clusterProperties.CloudProvider.includes('GCP')) {
          test(`OSD ${clusterProperties.CloudProvider} wizard - Networking configuration - cluster privacy definitions`, async () => {
            await createOSDWizardPage.isNetworkingScreen();
            await expect(createOSDWizardPage.clusterPrivacyPublicRadio()).toBeChecked();
            await expect(createOSDWizardPage.clusterPrivacyPrivateRadio()).not.toBeChecked();
            await sharedPage.locator(createOSDWizardPage.primaryButton).click();
          });
        }

        test(`OSD ${clusterProperties.CloudProvider} wizard - Networking configuration - CIDR definitions`, async () => {
          await createOSDWizardPage.isCIDRScreen();
          await expect(createOSDWizardPage.cidrDefaultValuesCheckBox()).toBeChecked();
          await expect(createOSDWizardPage.machineCIDRInput()).toHaveValue(
            clusterProperties.MachineCIDR,
          );
          await expect(createOSDWizardPage.serviceCIDRInput()).toHaveValue(
            clusterProperties.ServiceCIDR,
          );
          await expect(createOSDWizardPage.podCIDRInput()).toHaveValue(clusterProperties.PodCIDR);
          await expect(createOSDWizardPage.hostPrefixInput()).toHaveValue(
            clusterProperties.HostPrefix,
          );
          await sharedPage.locator(createOSDWizardPage.primaryButton).click();
        });

        test(`OSD ${clusterProperties.CloudProvider} wizard - Cluster updates definitions`, async () => {
          await createOSDWizardPage.isClusterUpdatesScreen();
          await expect(createOSDWizardPage.updateStrategyIndividualRadio()).toBeChecked();
          await expect(createOSDWizardPage.updateStrategyRecurringRadio()).not.toBeChecked();
          await createOSDWizardPage.selectNodeDraining(clusterProperties.NodeDraining);
          await sharedPage.locator(createOSDWizardPage.primaryButton).click();
        });

        test(`OSD ${clusterProperties.CloudProvider} wizard - Review and create page and its definitions`, async () => {
          await createOSDWizardPage.isReviewScreen();
          await expect(createOSDWizardPage.subscriptionTypeValue()).toContainText(
            clusterProperties.SubscriptionType,
          );
          await expect(createOSDWizardPage.infrastructureTypeValue()).toContainText(
            clusterProperties.InfrastructureType,
          );
          await expect(createOSDWizardPage.cloudProviderValue()).toContainText(
            clusterProperties.CloudProvider,
          );
          await expect(createOSDWizardPage.clusterNameValue()).toContainText(
            clusterProperties.ClusterName,
          );
          await expect(createOSDWizardPage.regionValue()).toContainText(
            clusterProperties.Region.split(',')[0],
          );
          await expect(createOSDWizardPage.availabilityValue()).toContainText(
            clusterProperties.Availability,
          );
          await expect(createOSDWizardPage.userWorkloadMonitoringValue()).toContainText(
            clusterProperties.UserWorkloadMonitoring,
          );
          await expect(createOSDWizardPage.persistentStorageValue()).toContainText(
            clusterProperties.PersistentStorage,
          );
          await expect(createOSDWizardPage.additionalEtcdEncryptionValue()).toContainText(
            clusterProperties.AdditionalEncryption,
          );
          await expect(createOSDWizardPage.fipsCryptographyValue()).toContainText(
            clusterProperties.FIPSCryptography,
          );
          await expect(createOSDWizardPage.nodeInstanceTypeValue()).toContainText(
            clusterProperties.MachinePools[0].InstanceType,
          );
          await expect(createOSDWizardPage.autoscalingValue()).toContainText(
            clusterProperties.MachinePools[0].Autoscaling,
          );
          await expect(createOSDWizardPage.computeNodeCountValue()).toContainText(
            clusterProperties.MachinePools[0].NodeCount.toString(),
          );

          await expect(createOSDWizardPage.clusterPrivacyValue()).toContainText(
            clusterProperties.ClusterPrivacy,
          );
          await expect(createOSDWizardPage.machineCIDRValue()).toContainText(
            clusterProperties.MachineCIDR,
          );
          await expect(createOSDWizardPage.serviceCIDRValue()).toContainText(
            clusterProperties.ServiceCIDR,
          );
          await expect(createOSDWizardPage.podCIDRValue()).toContainText(clusterProperties.PodCIDR);
          await expect(createOSDWizardPage.hostPrefixValue()).toContainText(
            clusterProperties.HostPrefix,
          );
          await expect(createOSDWizardPage.updateStratergyValue()).toContainText(
            clusterProperties.UpdateStrategy,
          );
          await expect(createOSDWizardPage.nodeDrainingValue()).toContainText(
            `${parseInt(clusterProperties.NodeDraining) * 60} minutes`,
          );
        });

        test(`OSD ${clusterProperties.CloudProvider} wizard - Cluster submission & overview definitions`, async () => {
          await createOSDWizardPage.createClusterButton().click();
          await clusterDetailsPage.waitForInstallerScreenToLoad();
          await expect(clusterDetailsPage.clusterNameTitle()).toContainText(
            clusterProperties.ClusterName,
          );
          await expect(clusterDetailsPage.clusterInstallationHeader()).toContainText(
            'Installing cluster',
          );
          await expect(clusterDetailsPage.clusterInstallationHeader()).toBeVisible();
          await expect(clusterDetailsPage.clusterInstallationExpectedText()).toContainText(
            'Cluster creation usually takes 30 to 60 minutes to complete',
          );
          await expect(clusterDetailsPage.clusterInstallationExpectedText()).toBeVisible();
          await expect(clusterDetailsPage.downloadOcCliLink()).toContainText('Download OC CLI');
          await expect(clusterDetailsPage.downloadOcCliLink()).toBeVisible();
          await clusterDetailsPage.clusterDetailsPageRefresh();
          await clusterDetailsPage.checkInstallationStepStatus('Account setup');
          await clusterDetailsPage.checkInstallationStepStatus('Network settings');
          await clusterDetailsPage.checkInstallationStepStatus('DNS setup');
          await clusterDetailsPage.checkInstallationStepStatus('Cluster installation');
          await expect(clusterDetailsPage.clusterTypeLabelValue()).toContainText(
            clusterProperties.Type,
          );
          await expect(clusterDetailsPage.clusterAutoScalingStatus()).toContainText(
            clusterProperties.ClusterAutoscaling,
          );
          await expect(clusterDetailsPage.clusterRegionLabelValue()).toContainText(
            clusterProperties.Region.split(',')[0],
          );
          await expect(clusterDetailsPage.clusterPersistentStorageLabelValue()).toContainText(
            clusterProperties.PersistentStorage,
          );
          await expect(clusterDetailsPage.clusterAvailabilityLabelValue()).toContainText(
            clusterProperties.Availability,
          );
          await expect(clusterDetailsPage.clusterMachineCIDRLabelValue()).toContainText(
            clusterProperties.MachineCIDR,
          );
          await expect(clusterDetailsPage.clusterServiceCIDRLabelValue()).toContainText(
            clusterProperties.ServiceCIDR,
          );
          await expect(clusterDetailsPage.clusterPodCIDRLabelValue()).toContainText(
            clusterProperties.PodCIDR,
          );
          await expect(clusterDetailsPage.clusterHostPrefixLabelValue()).toContainText(
            clusterProperties.HostPrefix.replace('/', ''),
          );
          await expect(clusterDetailsPage.clusterSubscriptionBillingModelValue()).toContainText(
            clusterProperties.SubscriptionBillingModel,
          );
          await expect(clusterDetailsPage.clusterInfrastructureBillingModelValue()).toContainText(
            clusterProperties.InfrastructureType,
          );

          await clusterDetailsPage.settingsTab().click();
          await expect(clusterDetailsPage.enableUserWorkloadMonitoringCheckbox()).toBeChecked();
          await expect(clusterDetailsPage.individualUpdatesRadioButton()).toBeChecked();
          await expect(clusterDetailsPage.recurringUpdatesRadioButton()).not.toBeChecked();
        });

        test(`Delete OSD ${clusterProperties.CloudProvider} cluster`, async () => {
          await clusterDetailsPage.actionsDropdownToggle().click();
          await clusterDetailsPage.deleteClusterDropdownItem().click();
          await clusterDetailsPage.deleteClusterNameInput().clear();
          await clusterDetailsPage.deleteClusterNameInput().fill(clusterProperties.ClusterName);
          await clusterDetailsPage.deleteClusterConfirm().click();
          await clusterDetailsPage.waitForDeleteClusterActionComplete();
          await sharedPage.waitForTimeout(5000); // Small delay for UI stability
        });
      });
    }
  },
);
