import { test, expect } from '../../fixtures/pages';
const clusterProperties = require('../../fixtures/osd-gcp/osd-marketplace-gcp-sa-cluster-creation.spec.json');
const clusterName = `${clusterProperties.ClusterName}-${Math.random().toString(36).substring(7)}`;

// Environment variables
const QE_GCP = process.env.QE_GCP_OSDCCSADMIN_JSON;
const QE_GCP_WIF_CONFIG = process.env.QE_GCP_WIF_CONFIG;
const QE_INFRA_GCP = JSON.parse(process.env.QE_INFRA_GCP || '{}');

test.describe.serial(
  'OSD Marketplace GCP Service Account cluster creation tests (OCP-67514)',
  { tag: ['@smoke', '@osd'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      // Navigate to create
      await navigateTo('create');
    });

    test(`Launch OSD -${clusterProperties.Marketplace} ${clusterProperties.AuthenticationType}  cluster wizard`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdCreateClusterButton());
      await createOSDWizardPage.isCreateOSDPage();
    });

    test(`OSD wizard -${clusterProperties.Marketplace} ${clusterProperties.AuthenticationType}  : Billing model and its definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isBillingModelScreen();
      await createOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      await createOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard -${clusterProperties.Marketplace} ${clusterProperties.AuthenticationType}  : Cluster Settings - Cloud provider definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
      if (clusterProperties.AuthenticationType.includes('Service Account')) {
        await createOSDWizardPage.serviceAccountButton().click();
        await createOSDWizardPage.uploadGCPServiceAccountJSON(QE_GCP || '{}');
      } else {
        await createOSDWizardPage.workloadIdentityFederationButton().click();
        await createOSDWizardPage.selectWorkloadIdentityConfiguration(QE_GCP_WIF_CONFIG);
      }

      await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard -${clusterProperties.Marketplace} ${clusterProperties.AuthenticationType}  : Cluster Settings - Cluster details definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterDetailsScreen();
      await page.locator(createOSDWizardPage.clusterNameInput).fill(clusterName);
      await createOSDWizardPage.hideClusterNameValidation();
      await createOSDWizardPage.selectRegion(clusterProperties.Region);
      await createOSDWizardPage.selectVersion(
        clusterProperties.Version || process.env.VERSION || '',
      );
      await createOSDWizardPage.singleZoneAvilabilityRadio().check();
      await createOSDWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      await createOSDWizardPage.enableAdditionalEtcdEncryption(true, true);
      await createOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard -${clusterProperties.Marketplace} ${clusterProperties.AuthenticationType}   : Cluster Settings - Default machinepool definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
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
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard -${clusterProperties.Marketplace} ${clusterProperties.AuthenticationType}  : Networking configuration - cluster privacy definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await createOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);

      if (
        clusterProperties.ClusterPrivacy.includes('Private') &&
        clusterProperties.CloudProvider.includes('GCP')
      ) {
        await expect(createOSDWizardPage.installIntoExistingVpcCheckBox()).toBeChecked();
        await expect(createOSDWizardPage.usePrivateServiceConnectCheckBox()).toBeChecked();
      }

      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    if (
      clusterProperties.ClusterPrivacy.includes('Private') &&
      clusterProperties.UsePrivateServiceConnect.includes('Enabled')
    ) {
      test(`OSD wizard -${clusterProperties.Marketplace} ${clusterProperties.AuthenticationType}   : VPC Settings definitions`, async ({
        page,
        createOSDWizardPage,
      }) => {
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

    test(`OSD wizard -${clusterProperties.Marketplace} ${clusterProperties.AuthenticationType}   : Networking configuration - CIDR ranges definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
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

      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard -${clusterProperties.Marketplace} ${clusterProperties.AuthenticationType}  : Cluster updates definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isUpdatesScreen();
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard -${clusterProperties.Marketplace} ${clusterProperties.AuthenticationType}   : Review and create page definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
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

      await expect(createOSDWizardPage.clusterNameValue()).toContainText(clusterName);
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

    test(`OSD wizard -  -${clusterProperties.Marketplace} ${clusterProperties.AuthenticationType}   : Cluster submission & overview definitions`, async ({
      createOSDWizardPage,
      clusterDetailsPage,
    }) => {
      await createOSDWizardPage.createClusterButton().click();
      await clusterDetailsPage.waitForInstallerScreenToLoad();

      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
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

    test('Delete OSD cluster', async ({ page, clusterDetailsPage }) => {
      await clusterDetailsPage.actionsDropdownToggle().click();
      await clusterDetailsPage.deleteClusterDropdownItem().click();
      await clusterDetailsPage.deleteClusterNameInput().clear();
      await clusterDetailsPage.deleteClusterNameInput().fill(clusterName);
      await clusterDetailsPage.deleteClusterConfirm().click();
      await clusterDetailsPage.waitForDeleteClusterActionComplete();
    });
  },
);
