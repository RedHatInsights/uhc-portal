import { test, expect, Page, BrowserContext } from '@playwright/test';
import { CreateOSDWizardPage } from '../../page-objects/create-osd-wizard-page';
import { ClusterDetailsPage } from '../../page-objects/cluster-details-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';
const clusterProperties = require('../../fixtures/osd-gcp/osd-marketplace-gcp-sa-cluster-creation.spec.json');

// Environment variables
const QE_GCP = process.env.QE_GCP_OSDCCSADMIN_JSON;
const QE_GCP_WIF_CONFIG = process.env.QE_GCP_WIF_CONFIG;
const QE_INFRA_GCP = JSON.parse(process.env.QE_INFRA_GCP || '{}');

// Shared context and page objects for test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let createOSDWizardPage: CreateOSDWizardPage;
let clusterDetailsPage: ClusterDetailsPage;

const authType = clusterProperties.CloudProvider.includes('Google Cloud Platform')
  ? `-${clusterProperties.AuthenticationType}`
  : '';
const isPscEnabled =
  clusterProperties.hasOwnProperty('UsePrivateServiceConnect') &&
  clusterProperties.UsePrivateServiceConnect.includes('Enabled')
    ? 'PrivateServiceConnect'
    : '';

test.describe.serial(
  'OSD Marketplace GCP Service Account cluster creation tests (OCP-67514)',
  { tag: ['@smoke'] },
  () => {
    test.beforeAll(async ({ browser }) => {
      // Setup: auth + navigate to create page
      const setup = await setupTestSuite(browser, 'create');
      sharedContext = setup.context;
      sharedPage = setup.page;

      // Initialize page objects for this test suite
      createOSDWizardPage = new CreateOSDWizardPage(sharedPage);
      clusterDetailsPage = new ClusterDetailsPage(sharedPage);
    });

    test.afterAll(async () => {
      await cleanupTestSuite(sharedContext);
    });

    test(`Launch OSD - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} cluster wizard`, async () => {
      await createOSDWizardPage.osdCreateClusterButton().waitFor({
        state: 'visible',
        timeout: 60000,
      });
      await createOSDWizardPage.osdCreateClusterButton().click();
      await createOSDWizardPage.isCreateOSDPage();
    });

    test(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} : Billing model and its definitions`, async () => {
      await createOSDWizardPage.isBillingModelScreen();
      await createOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      await createOSDWizardPage.selectMarketplaceSubscription(clusterProperties.Marketplace);
      await createOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} : Cluster Settings - Cloud provider definitions`, async () => {
      await createOSDWizardPage.isCloudProviderSelectionScreen();

      await createOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);

      if (clusterProperties.AuthenticationType.includes('Service Account')) {
        await createOSDWizardPage.serviceAccountButton().click();
        await createOSDWizardPage.uploadGCPServiceAccountJSON(QE_GCP || '{}');
      } else {
        await createOSDWizardPage.workloadIdentityFederationButton().click();
        await createOSDWizardPage.selectWorkloadIdentityConfiguration(QE_GCP_WIF_CONFIG);
      }

      await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} : Cluster Settings - Cluster details definitions`, async () => {
      await createOSDWizardPage.isClusterDetailsScreen();
      await sharedPage
        .locator(createOSDWizardPage.clusterNameInput)
        .fill(clusterProperties.ClusterName);
      await createOSDWizardPage.hideClusterNameValidation();
      await createOSDWizardPage.selectRegion(clusterProperties.Region);

      if (clusterProperties.hasOwnProperty('Version')) {
        await createOSDWizardPage.selectVersion(clusterProperties.Version);
      }

      await createOSDWizardPage.singleZoneAvilabilityRadio().check();
      await createOSDWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      await createOSDWizardPage.enableAdditionalEtcdEncryption(true, true);
      await createOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} -${clusterProperties.Marketplace} : Cluster Settings - Default machinepool definitions`, async () => {
      await createOSDWizardPage.isMachinePoolScreen();
      await createOSDWizardPage.selectComputeNodeType(
        clusterProperties.MachinePools[0].InstanceType,
      );
      await createOSDWizardPage.selectComputeNodeCount(clusterProperties.MachinePools[0].NodeCount);
      await createOSDWizardPage.addNodeLabelLink().click();
      await createOSDWizardPage.addNodeLabelKeyAndValue(
        clusterProperties.MachinePools[0].Labels[0].Key,
        clusterProperties.MachinePools[0].Labels[0].Value,
      );
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} : Networking configuration - cluster privacy definitions`, async () => {
      await createOSDWizardPage.isNetworkingScreen();
      await createOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);

      if (
        clusterProperties.ClusterPrivacy.includes('Private') &&
        clusterProperties.CloudProvider.includes('GCP')
      ) {
        await expect(createOSDWizardPage.installIntoExistingVpcCheckBox()).toBeChecked();
        await expect(createOSDWizardPage.usePrivateServiceConnectCheckBox()).toBeChecked();
      }

      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    if (
      clusterProperties.ClusterPrivacy.includes('Private') &&
      clusterProperties.UsePrivateServiceConnect.includes('Enabled')
    ) {
      test(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} -${clusterProperties.Marketplace} : VPC Settings definitions`, async () => {
        await createOSDWizardPage.isVPCSubnetScreen();
        await createOSDWizardPage.selectGcpVPC(QE_INFRA_GCP['PSC_INFRA']['VPC_NAME']);
        await createOSDWizardPage.selectControlPlaneSubnetName(
          QE_INFRA_GCP['PSC_INFRA']['CONTROLPLANE_SUBNET'],
        );
        await createOSDWizardPage.selectComputeSubnetName(
          QE_INFRA_GCP['PSC_INFRA']['COMPUTE_SUBNET'],
        );
        await createOSDWizardPage.selectPrivateServiceConnectSubnetName(
          QE_INFRA_GCP['PSC_INFRA']['PRIVATE_SERVICE_CONNECT_SUBNET'],
        );
        await createOSDWizardPage.wizardNextButton().click();
      });
    }

    test(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} -${clusterProperties.Marketplace} : Networking configuration - CIDR ranges definitions`, async () => {
      await createOSDWizardPage.isCIDRScreen();
      await createOSDWizardPage.useCIDRDefaultValues(false);
      await createOSDWizardPage.useCIDRDefaultValues(true);

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

    test(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled}-${clusterProperties.Marketplace} : Cluster updates definitions`, async () => {
      await createOSDWizardPage.isUpdatesScreen();
      await sharedPage.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} -${clusterProperties.Marketplace} : Review and create page definitions`, async () => {
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

      await expect(createOSDWizardPage.authenticationTypeValue()).toContainText(
        clusterProperties.AuthenticationType,
      );
      if (clusterProperties.AuthenticationType.includes('Workload Identity Federation')) {
        await expect(createOSDWizardPage.wifConfigurationValue()).toContainText(QE_GCP_WIF_CONFIG);
      }

      await expect(createOSDWizardPage.clusterNameValue()).toContainText(
        clusterProperties.ClusterName,
      );
      await expect(createOSDWizardPage.regionValue()).toContainText(
        clusterProperties.Region.split(',')[0],
      );
      await expect(createOSDWizardPage.availabilityValue()).toContainText(
        clusterProperties.Availability,
      );
      await expect(createOSDWizardPage.securebootSupportForShieldedVMsValue()).toContainText(
        clusterProperties.SecureBootSupportForShieldedVMs,
      );
      await expect(createOSDWizardPage.userWorkloadMonitoringValue()).toContainText(
        clusterProperties.UserWorkloadMonitoring,
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
        `${clusterProperties.MachinePools[0].NodeCount} (× 3 zones = ${clusterProperties.MachinePools[0].NodeCount * 3} compute nodes)`,
      );
      const label = `${clusterProperties.MachinePools[0].Labels[0].Key} = ${clusterProperties.MachinePools[0].Labels[0].Value}`;
      await expect(createOSDWizardPage.nodeLabelsValue(label)).toBeVisible();
      await expect(createOSDWizardPage.clusterPrivacyValue()).toContainText(
        clusterProperties.ClusterPrivacy,
      );
      await expect(createOSDWizardPage.installIntoExistingVpcValue()).toContainText(
        clusterProperties.InstallIntoExistingVPC,
      );

      if (clusterProperties.hasOwnProperty('UsePrivateServiceConnect')) {
        await expect(createOSDWizardPage.privateServiceConnectValue()).toContainText(
          clusterProperties.UsePrivateServiceConnect,
        );
      }

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
      await expect(createOSDWizardPage.applicationIngressValue()).toContainText(
        clusterProperties.ApplicationIngress,
      );
      await expect(createOSDWizardPage.updateStratergyValue()).toContainText(
        clusterProperties.UpdateStrategy,
      );
      await expect(createOSDWizardPage.nodeDrainingValue()).toContainText(
        clusterProperties.NodeDraining,
      );
    });

    test(`OSD wizard -  ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} -${clusterProperties.Marketplace} : Cluster submission & overview definitions`, async () => {
      await createOSDWizardPage.createClusterButton().click();
      await clusterDetailsPage.waitForInstallerScreenToLoad();

      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(
        clusterProperties.ClusterName,
      );
      await expect(clusterDetailsPage.clusterInstallationHeader()).toContainText(
        'Installing cluster',
      );
      await expect(clusterDetailsPage.clusterInstallationExpectedText()).toContainText(
        'Cluster creation usually takes 30 to 60 minutes to complete',
      );
      await expect(clusterDetailsPage.downloadOcCliLink()).toContainText('Download OC CLI');

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
        `On-demand via ${clusterProperties.Marketplace}`,
      );
      await expect(clusterDetailsPage.clusterInfrastructureBillingModelValue()).toContainText(
        clusterProperties.InfrastructureType,
      );
      await expect(clusterDetailsPage.clusterSecureBootSupportForShieldedVMsValue()).toContainText(
        clusterProperties.SecureBootSupportForShieldedVMs,
      );
      await expect(clusterDetailsPage.clusterAuthenticationTypeLabelValue()).toContainText(
        clusterProperties.AuthenticationType,
      );

      if (clusterProperties.AuthenticationType.includes('Workload Identity Federation')) {
        await expect(clusterDetailsPage.clusterWifConfigurationValue()).toContainText(
          QE_GCP_WIF_CONFIG,
        );
      }
    });

    test('Delete OSD cluster', async () => {
      await clusterDetailsPage.actionsDropdownToggle().click();
      await clusterDetailsPage.deleteClusterDropdownItem().click();
      await clusterDetailsPage.deleteClusterNameInput().clear();
      await clusterDetailsPage.deleteClusterNameInput().fill(clusterProperties.ClusterName);
      await clusterDetailsPage.deleteClusterConfirm().click();
      await clusterDetailsPage.waitForDeleteClusterActionComplete();
      await sharedPage.waitForTimeout(5000); // Small delay for UI stability
    });
  },
);
