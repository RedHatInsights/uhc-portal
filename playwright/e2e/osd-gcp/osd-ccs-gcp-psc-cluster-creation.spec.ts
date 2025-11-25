import { test, expect } from '../../fixtures/pages';
const gcpClusterProperties = require('../../fixtures/osd-gcp/osd-ccs-gcp-psc-cluster-creation.spec.json');
const clusterName = `${gcpClusterProperties.ClusterName}-${Math.random().toString(36).substring(7)}`;
const clusterDomainPrefix = `osd${Math.random().toString(36).substring(2, 13)}`;

const authType = `${gcpClusterProperties.AuthenticationType}`;
const isPscEnabled = 'PrivateServiceConnect';
// Environment variables
const QE_GCP = process.env.QE_GCP_OSDCCSADMIN_JSON;

test.describe.serial(
  'OSD GCP(Service Authentication) CCS PSC cluster creation tests (OCP-35992, OCP-26750)',
  { tag: ['@smoke', '@osd'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      // Navigate to create
      await navigateTo('create');
    });

    test(`Launch OSD - ${gcpClusterProperties.CloudProvider} cluster wizard`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdCreateClusterButton());
      await createOSDWizardPage.isCreateOSDPage();
    });

    test(`OSD ${gcpClusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Billing model and its definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isBillingModelScreen();
      await expect(createOSDWizardPage.subscriptionTypeAnnualFixedCapacityRadio()).toBeChecked();
      await createOSDWizardPage.infrastructureTypeClusterCloudSubscriptionRadio().check();
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${gcpClusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster Settings - Cloud provider definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isCloudProviderSelectionScreen();
      await createOSDWizardPage.selectCloudProvider(gcpClusterProperties.CloudProvider);
      if (gcpClusterProperties.AuthenticationType.includes('Service Account')) {
        await createOSDWizardPage.serviceAccountButton().click();
        await createOSDWizardPage.uploadGCPServiceAccountJSON(QE_GCP || '{}');
      } else {
        await createOSDWizardPage.workloadIdentityFederationButton().click();
        await createOSDWizardPage.selectWorkloadIdentityConfiguration(
          process.env.QE_GCP_WIF_CONFIG || '',
        );
      }

      await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${gcpClusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster Settings - Cluster details definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterDetailsScreen();
      await createOSDWizardPage.createCustomDomainPrefixCheckbox().scrollIntoViewIfNeeded();
      await createOSDWizardPage.createCustomDomainPrefixCheckbox().check();
      await createOSDWizardPage.setClusterName(clusterName);
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.setDomainPrefix(clusterDomainPrefix);
      await createOSDWizardPage.closePopoverDialogs();
      await expect(createOSDWizardPage.singleZoneAvilabilityRadio()).toBeChecked();
      await createOSDWizardPage.selectVersion(
        gcpClusterProperties.Version || process.env.VERSION || '',
      );
      await createOSDWizardPage.selectRegion(gcpClusterProperties.Region);
      await createOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);

      await expect(createOSDWizardPage.enableUserWorkloadMonitoringCheckbox()).toBeChecked();
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${gcpClusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster Settings - Default machinepool definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isMachinePoolScreen();
      await createOSDWizardPage.selectComputeNodeType(
        gcpClusterProperties.MachinePools[0].InstanceType,
      );
      await createOSDWizardPage.selectComputeNodeCount(
        gcpClusterProperties.MachinePools[0].NodeCount,
      );
      await expect(createOSDWizardPage.enableAutoscalingCheckbox()).not.toBeChecked();
      if (gcpClusterProperties.CloudProvider.includes('AWS')) {
        await expect(createOSDWizardPage.useBothIMDSv1AndIMDSv2Radio()).toBeChecked();
      }
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${gcpClusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Networking configuration - cluster privacy definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await expect(createOSDWizardPage.clusterPrivacyPublicRadio()).toBeChecked();
      await expect(createOSDWizardPage.applicationIngressDefaultSettingsRadio()).toBeChecked();
      await createOSDWizardPage.selectClusterPrivacy(gcpClusterProperties.ClusterPrivacy);
      if (gcpClusterProperties.ClusterPrivacy.includes('Private')) {
        await expect(createOSDWizardPage.installIntoExistingVpcCheckBox()).toBeChecked();
        await expect(createOSDWizardPage.usePrivateServiceConnectCheckBox()).toBeChecked();
      } else {
        await expect(createOSDWizardPage.installIntoExistingVpcCheckBox()).not.toBeChecked();
      }
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    if (
      gcpClusterProperties.ClusterPrivacy.includes('Private') &&
      gcpClusterProperties.UsePrivateServiceConnect?.includes('Enabled')
    ) {
      test(`OSD wizard - ${gcpClusterProperties.CloudProvider} ${authType} ${isPscEnabled} : VPC Settings definitions`, async ({
        createOSDWizardPage,
      }) => {
        await createOSDWizardPage.isVPCSubnetScreen();
        const qeInfraGcp = JSON.parse(process.env.QE_INFRA_GCP || '{}');
        await createOSDWizardPage.selectGcpVPC(qeInfraGcp?.PSC_INFRA?.VPC_NAME || '');
        await createOSDWizardPage.selectControlPlaneSubnetName(
          qeInfraGcp?.PSC_INFRA?.CONTROLPLANE_SUBNET || '',
        );
        await createOSDWizardPage.selectComputeSubnetName(
          qeInfraGcp?.PSC_INFRA?.COMPUTE_SUBNET || '',
        );
        await createOSDWizardPage.selectPrivateServiceConnectSubnetName(
          qeInfraGcp?.PSC_INFRA?.PRIVATE_SERVICE_CONNECT_SUBNET || '',
        );
        await createOSDWizardPage.wizardNextButton().click();
      });
    }

    test(`OSD ${gcpClusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - CIDR configuration - cidr definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isCIDRScreen();
      await expect(createOSDWizardPage.cidrDefaultValuesCheckBox()).toBeChecked();
      await expect(createOSDWizardPage.machineCIDRInput()).toHaveValue(
        gcpClusterProperties.MachineCIDR,
      );
      await expect(createOSDWizardPage.serviceCIDRInput()).toHaveValue(
        gcpClusterProperties.ServiceCIDR,
      );
      await expect(createOSDWizardPage.podCIDRInput()).toHaveValue(gcpClusterProperties.PodCIDR);
      await expect(createOSDWizardPage.hostPrefixInput()).toHaveValue(
        gcpClusterProperties.HostPrefix,
      );
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${gcpClusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster updates definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterUpdatesScreen();
      await expect(createOSDWizardPage.updateStrategyIndividualRadio()).toBeChecked();
      await createOSDWizardPage.selectNodeDraining(gcpClusterProperties.NodeDraining);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD ${gcpClusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Review and create page and its definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isReviewScreen();
      await expect(createOSDWizardPage.subscriptionTypeValue()).toContainText(
        gcpClusterProperties.SubscriptionType,
      );
      await expect(createOSDWizardPage.infrastructureTypeValue()).toContainText(
        gcpClusterProperties.InfrastructureType,
      );
      await expect(createOSDWizardPage.cloudProviderValue()).toContainText(
        gcpClusterProperties.CloudProvider,
      );

      await expect(createOSDWizardPage.authenticationTypeValue()).toContainText(
        gcpClusterProperties.AuthenticationType,
      );
      if (gcpClusterProperties.AuthenticationType.includes('Workload Identity Federation')) {
        await expect(createOSDWizardPage.wifConfigurationValue()).toContainText(
          process.env.QE_GCP_WIF_CONFIG || '',
        );
      }

      await expect(createOSDWizardPage.clusterDomainPrefixLabelValue()).toContainText(
        clusterDomainPrefix,
      );
      await expect(createOSDWizardPage.clusterNameValue()).toContainText(clusterName);
      await expect(createOSDWizardPage.regionValue()).toContainText(
        gcpClusterProperties.Region.split(',')[0],
      );
      await expect(createOSDWizardPage.availabilityValue()).toContainText(
        gcpClusterProperties.Availability,
      );

      if (gcpClusterProperties.CloudProvider.includes('GCP')) {
        await expect(createOSDWizardPage.securebootSupportForShieldedVMsValue()).toContainText(
          gcpClusterProperties.SecureBootSupportForShieldedVMs,
        );
      }

      await expect(createOSDWizardPage.userWorkloadMonitoringValue()).toContainText(
        gcpClusterProperties.UserWorkloadMonitoring,
      );
      await expect(createOSDWizardPage.encryptVolumesWithCustomerkeysValue()).toContainText(
        gcpClusterProperties.EncryptVolumesWithCustomerKeys,
      );
      await expect(createOSDWizardPage.additionalEtcdEncryptionValue()).toContainText(
        gcpClusterProperties.AdditionalEncryption,
      );
      await expect(createOSDWizardPage.fipsCryptographyValue()).toContainText(
        gcpClusterProperties.FIPSCryptography,
      );
      await expect(createOSDWizardPage.nodeInstanceTypeValue()).toContainText(
        gcpClusterProperties.MachinePools[0].InstanceType,
      );
      await expect(createOSDWizardPage.autoscalingValue()).toContainText(
        gcpClusterProperties.MachinePools[0].Autoscaling,
      );
      await expect(createOSDWizardPage.computeNodeCountValue()).toContainText(
        gcpClusterProperties.MachinePools[0].NodeCount.toString(),
      );

      await expect(createOSDWizardPage.clusterPrivacyValue()).toContainText(
        gcpClusterProperties.ClusterPrivacy,
      );
      await expect(createOSDWizardPage.installIntoExistingVpcValue()).toContainText(
        gcpClusterProperties.InstallIntoExistingVPC,
      );

      if (gcpClusterProperties.hasOwnProperty('UsePrivateServiceConnect')) {
        await expect(createOSDWizardPage.privateServiceConnectValue()).toContainText(
          gcpClusterProperties.UsePrivateServiceConnect,
        );
      }

      await expect(createOSDWizardPage.applicationIngressValue()).toContainText(
        gcpClusterProperties.ApplicationIngress,
      );

      await expect(createOSDWizardPage.machineCIDRValue()).toContainText(
        gcpClusterProperties.MachineCIDR,
      );
      await expect(createOSDWizardPage.serviceCIDRValue()).toContainText(
        gcpClusterProperties.ServiceCIDR,
      );
      await expect(createOSDWizardPage.podCIDRValue()).toContainText(gcpClusterProperties.PodCIDR);
      await expect(createOSDWizardPage.hostPrefixValue()).toContainText(
        gcpClusterProperties.HostPrefix,
      );

      await expect(createOSDWizardPage.updateStratergyValue()).toContainText(
        gcpClusterProperties.UpdateStrategy,
      );
      await expect(createOSDWizardPage.nodeDrainingValue()).toContainText(
        `${parseInt(gcpClusterProperties.NodeDraining) * 60} minutes`,
      );
    });

    test(`OSD ${gcpClusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster submission & overview definitions`, async ({
      createOSDWizardPage,
      clusterDetailsPage,
    }) => {
      await createOSDWizardPage.createClusterButton().click();
      await clusterDetailsPage.waitForInstallerScreenToLoad();
      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
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
        gcpClusterProperties.Type,
      );
      await expect(clusterDetailsPage.clusterRegionLabelValue()).toContainText(
        gcpClusterProperties.Region.split(',')[0],
      );
      await expect(clusterDetailsPage.clusterAvailabilityLabelValue()).toContainText(
        gcpClusterProperties.Availability,
      );
      await expect(clusterDetailsPage.clusterMachineCIDRLabelValue()).toContainText(
        gcpClusterProperties.MachineCIDR,
      );
      await expect(clusterDetailsPage.clusterServiceCIDRLabelValue()).toContainText(
        gcpClusterProperties.ServiceCIDR,
      );
      await expect(clusterDetailsPage.clusterPodCIDRLabelValue()).toContainText(
        gcpClusterProperties.PodCIDR,
      );
      await expect(clusterDetailsPage.clusterHostPrefixLabelValue()).toContainText(
        gcpClusterProperties.HostPrefix.replace('/', ''),
      );
      await expect(clusterDetailsPage.clusterSubscriptionBillingModelValue()).toContainText(
        gcpClusterProperties.SubscriptionBillingModel,
      );
      await expect(clusterDetailsPage.clusterInfrastructureBillingModelValue()).toContainText(
        gcpClusterProperties.InfrastructureType,
      );

      await expect(clusterDetailsPage.clusterSecureBootSupportForShieldedVMsValue()).toContainText(
        gcpClusterProperties.SecureBootSupportForShieldedVMs,
      );
      await expect(clusterDetailsPage.clusterAuthenticationTypeLabelValue()).toContainText(
        gcpClusterProperties.AuthenticationType,
      );
      if (gcpClusterProperties.AuthenticationType.includes('Workload Identity Federation')) {
        await expect(clusterDetailsPage.clusterWifConfigurationValue()).toContainText(
          process.env.QE_GCP_WIF_CONFIG || '',
        );
      }
    });

    test(`Delete OSD ${gcpClusterProperties.CloudProvider} ${authType} ${isPscEnabled} cluster`, async ({
      page,
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.actionsDropdownToggle().click();
      await clusterDetailsPage.deleteClusterDropdownItem().click();
      await clusterDetailsPage.deleteClusterNameInput().clear();
      await clusterDetailsPage.deleteClusterNameInput().fill(clusterName);
      await clusterDetailsPage.deleteClusterConfirm().click();
      await clusterDetailsPage.waitForDeleteClusterActionComplete();
    });
  },
);
