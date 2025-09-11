import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ClusterDetailsPage } from '../../page-objects/cluster-details-page';
import { CreateOSDWizardPage } from '../../page-objects/create-osd-wizard-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';
const clusterProperties = require('../../fixtures/osd-aws/osd-ccs-aws-cluster-creation.spec.json');

const awsAccountID = process.env.QE_AWS_ID;
const awsAccessKey = process.env.QE_AWS_ACCESS_KEY_ID;
const awsSecretKey = process.env.QE_AWS_ACCESS_KEY_SECRET;

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterDetailsPage: ClusterDetailsPage;
let createOSDWizardPage: CreateOSDWizardPage;

test.describe.serial(
  'OSD AWS CCS cluster creation tests (OCP-35992, OCP-26750)',
  { tag: ['@smoke'] },
  () => {
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
      await createOSDWizardPage.osdCreateClusterButton().waitFor({
        state: 'visible',
        timeout: 60000,
      });
      await createOSDWizardPage.osdCreateClusterButton().click();
      await createOSDWizardPage.isCreateOSDPage();
    });

    test(`OSD ${clusterProperties.CloudProvider}  wizard - Billing model and its definitions`, async () => {
      await createOSDWizardPage.isBillingModelScreen();
      await expect(createOSDWizardPage.subscriptionTypeAnnualFixedCapacityRadio()).toBeChecked();
      await createOSDWizardPage
        .infrastructureTypeClusterCloudSubscriptionRadio()
        .check({ force: true });
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${clusterProperties.CloudProvider}  wizard - Cluster Settings - Cloud provider definitions`, async () => {
      await createOSDWizardPage.isCloudProviderSelectionScreen();
      await createOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);

      await createOSDWizardPage.awsAccountIDInput().fill(awsAccountID || '');
      await createOSDWizardPage.awsAccessKeyInput().fill(awsAccessKey || '');
      await createOSDWizardPage.awsSecretKeyInput().fill(awsSecretKey || '');

      await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${clusterProperties.CloudProvider}  wizard - Cluster Settings - Cluster details definitions`, async () => {
      await createOSDWizardPage.isClusterDetailsScreen();
      await createOSDWizardPage.createCustomDomainPrefixCheckbox().scrollIntoViewIfNeeded();
      await createOSDWizardPage.createCustomDomainPrefixCheckbox().check();
      await createOSDWizardPage.setClusterName(clusterProperties.ClusterName);
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.setDomainPrefix(clusterProperties.ClusterDomainPrefix);
      await createOSDWizardPage.closePopoverDialogs();
      await expect(createOSDWizardPage.singleZoneAvilabilityRadio()).toBeChecked();
      await createOSDWizardPage.selectRegion(clusterProperties.Region);

      await expect(createOSDWizardPage.enableUserWorkloadMonitoringCheckbox()).toBeChecked();
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${clusterProperties.CloudProvider}  wizard - Cluster Settings - Default machinepool definitions`, async () => {
      await createOSDWizardPage.isMachinePoolScreen();
      await createOSDWizardPage.selectComputeNodeType(
        clusterProperties.MachinePools[0].InstanceType,
      );
      await createOSDWizardPage.selectComputeNodeCount(clusterProperties.MachinePools[0].NodeCount);
      await expect(createOSDWizardPage.enableAutoscalingCheckbox()).not.toBeChecked();
      if (clusterProperties.CloudProvider.includes('AWS')) {
        await expect(createOSDWizardPage.useBothIMDSv1AndIMDSv2Radio()).toBeChecked();
      }
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${clusterProperties.CloudProvider} wizard - Networking configuration - cluster privacy definitions`, async () => {
      await createOSDWizardPage.isNetworkingScreen();
      await expect(createOSDWizardPage.clusterPrivacyPublicRadio()).toBeChecked();
      await expect(createOSDWizardPage.applicationIngressDefaultSettingsRadio()).toBeChecked();
      await createOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      if (
        clusterProperties.ClusterPrivacy.includes('Private') &&
        clusterProperties.CloudProvider.includes('GCP')
      ) {
        await expect(createOSDWizardPage.installIntoExistingVpcCheckBox()).toBeChecked();
        await expect(createOSDWizardPage.usePrivateServiceConnectCheckBox()).toBeChecked();
      } else {
        await expect(createOSDWizardPage.installIntoExistingVpcCheckBox()).not.toBeChecked();
      }
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${clusterProperties.CloudProvider}  wizard - CIDR configuration - cidr definitions`, async () => {
      await createOSDWizardPage.isCIDRScreen();
      await expect(createOSDWizardPage.cidrDefaultValuesCheckBox()).toBeChecked();
      await expect(createOSDWizardPage.machineCIDRInput()).toHaveValue(
        clusterProperties.MachineCIDR,
      );
      await expect(createOSDWizardPage.serviceCIDRInput()).toHaveValue(
        clusterProperties.ServiceCIDR,
      );
      await expect(createOSDWizardPage.podCIDRInput()).toHaveValue(clusterProperties.PodCIDR);
      await expect(createOSDWizardPage.hostPrefixInput()).toHaveValue(clusterProperties.HostPrefix);
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${clusterProperties.CloudProvider}  wizard - Cluster updates definitions`, async () => {
      await createOSDWizardPage.isClusterUpdatesScreen();
      await expect(createOSDWizardPage.updateStrategyIndividualRadio()).toBeChecked();
      await createOSDWizardPage.selectNodeDraining(clusterProperties.NodeDraining);
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${clusterProperties.CloudProvider}  wizard - Review and create page and its definitions`, async () => {
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

      await expect(createOSDWizardPage.clusterDomainPrefixLabelValue()).toContainText(
        clusterProperties.ClusterDomainPrefix,
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
      await expect(createOSDWizardPage.encryptVolumesWithCustomerkeysValue()).toContainText(
        clusterProperties.EncryptVolumesWithCustomerKeys,
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
      await expect(createOSDWizardPage.installIntoExistingVpcValue()).toContainText(
        clusterProperties.InstallIntoExistingVPC,
      );

      await expect(createOSDWizardPage.applicationIngressValue()).toContainText(
        clusterProperties.ApplicationIngress,
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

    test(`OSD ${clusterProperties.CloudProvider}  wizard - Cluster submission & overview definitions`, async () => {
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
      await expect(clusterDetailsPage.clusterRegionLabelValue()).toContainText(
        clusterProperties.Region.split(',')[0],
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
    });

    test(`Delete OSD ${clusterProperties.CloudProvider}  cluster`, async () => {
      await clusterDetailsPage.actionsDropdownToggle().click();
      await clusterDetailsPage.deleteClusterDropdownItem().click();
      await clusterDetailsPage.deleteClusterNameInput().clear();
      await clusterDetailsPage.deleteClusterNameInput().fill(clusterProperties.ClusterName);
      await clusterDetailsPage.deleteClusterConfirm().click();
      await clusterDetailsPage.waitForDeleteClusterActionComplete();
      await sharedPage.waitForTimeout(2000); // Small delay for UI stability
    });
  },
);
