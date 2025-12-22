import { test, expect } from '../../fixtures/pages';
const clusterProperties = require('../../fixtures/osd-gcp/osd-trial-gcp-cluster-creation.spec.json');
const clusterName = `${clusterProperties.ClusterName}-${Math.random().toString(36).substring(7)}`;

// Environment variables
const QE_GCP = process.env.QE_GCP_OSDCCSADMIN_JSON;

// Shared context and page objects for test execution

test.describe(
  'OSD Trial GCP cluster creation tests (OCP-39415)',
  { tag: ['@smoke, @trial', '@osd'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      // Navigate to create
      await navigateTo('create');
    });

    test(`Launch OSD - ${clusterProperties.CloudProvider} cluster wizard`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdTrialCreateClusterButton());
      await createOSDWizardPage.isCreateOSDPage();
    });

    test(`OSD - ${clusterProperties.CloudProvider} wizard - Billing model and its definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isBillingModelScreen();
      await createOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      await createOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD - ${clusterProperties.CloudProvider} wizard - Cluster Settings - Cloud provider definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isCloudProviderSelectionScreen();
      await createOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
      await createOSDWizardPage.serviceAccountButton().click();
      await createOSDWizardPage.uploadGCPServiceAccountJSON(QE_GCP || '{}');
      await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD - ${clusterProperties.CloudProvider} wizard - Cluster Settings - Cluster details definitions`, async ({
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
      await createOSDWizardPage.multiZoneAvilabilityRadio().check();
      await createOSDWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      await createOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      await createOSDWizardPage.enableAdditionalEtcdEncryption(true, true);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD - ${clusterProperties.CloudProvider} wizard - Cluster Settings - Default machinepool definitions`, async ({
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

    test(`OSD - ${clusterProperties.CloudProvider} wizard - cluster privacy definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await createOSDWizardPage.selectClusterPrivacy('private');
      await createOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD - ${clusterProperties.CloudProvider} wizard - Networking configuration - CIDR ranges definitions`, async ({
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

    test(`OSD - ${clusterProperties.CloudProvider} wizard - Cluster updates definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterUpdatesScreen();
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD - ${clusterProperties.CloudProvider} wizard - Review and create page and its definitions`, async ({
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
      await expect(createOSDWizardPage.computeNodeCountValue()).toContainText(
        clusterProperties.MachinePools[0].NodeCount,
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

    test(`OSD ${clusterProperties.CloudProvider} wizard - Cluster submission & overview definitions`, async ({
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
      await expect(clusterDetailsPage.clusterInfrastructureBillingModelValue()).toContainText(
        clusterProperties.InfrastructureType,
      );
      await expect(clusterDetailsPage.clusterSubscriptionBillingModelValue()).toContainText(
        clusterProperties.SubscriptionType.replace(/.$/, '').replace(' (', ', '),
      );

      await expect(clusterDetailsPage.clusterSecureBootSupportForShieldedVMsValue()).toContainText(
        clusterProperties.SecureBootSupportForShieldedVMs,
      );
    });

    test(`Delete OSD ${clusterProperties.CloudProvider} cluster`, async ({
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
