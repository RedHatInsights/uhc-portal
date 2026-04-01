import { test, expect } from '../../fixtures/pages';
const clusterProperties = require('../../fixtures/osd-gcp/osd-ondemand-gcp-wif-sharedvpc-dns-cluster-creation.spec.json');
const clusterName = `${clusterProperties.ClusterName}-${Math.random().toString(36).substring(7)}`;

// Environment variables
const QE_GCP_WIF_CONFIG = process.env.QE_GCP_WIF_CONFIG || '';
const QE_INFRA_GCP = JSON.parse(process.env.QE_INFRA_GCP || '{}');
const SHARED_VPC_INFRA = QE_INFRA_GCP['SHARED_VPC_INFRA'] || {};
const region = SHARED_VPC_INFRA['REGION'] || clusterProperties.Region.split(',')[0];

test.describe.serial(
  'OSD Marketplace GCP WIF Shared VPC DNS cluster creation tests',
  { tag: ['@smoke', '@osd', '@wif', '@sharedvpc', '@dns'] },
  () => {
    let clusterSubmitted = false;

    test.beforeAll(async ({ navigateTo }) => {
      if (!QE_GCP_WIF_CONFIG?.trim()) {
        throw new Error(
          'QE_GCP_WIF_CONFIG must be set for GCP WIF Shared VPC DNS tests',
        );
      }
      await navigateTo('create');
    });
    test(`Launch OSD - GCP shared VPC DNS zone cluster wizard`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdCreateClusterButton());
      await createOSDWizardPage.isCreateOSDPage();
    });

    test(`OSD wizard - GCP shared VPC DNS zone : Billing model and its definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isBillingModelScreen();
      await createOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      await createOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard - GCP shared VPC DNS zone : Cluster Settings - Cloud provider definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.workloadIdentityFederationButton().click();
      await createOSDWizardPage.selectWorkloadIdentityConfiguration(QE_GCP_WIF_CONFIG);
      await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard - GCP shared VPC DNS zone : Cluster Settings - Cluster details definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterDetailsScreen();
      await page.locator(createOSDWizardPage.clusterNameInput).fill(clusterName);
      await createOSDWizardPage.createCustomDomainPrefixCheckbox().check();
      await createOSDWizardPage.domainPrefixInput().fill(clusterProperties.DomainPrefix);
      await createOSDWizardPage.hideClusterNameValidation();
      await createOSDWizardPage.selectRegion(region);
      await createOSDWizardPage.selectVersion(
        clusterProperties.Version || process.env.VERSION || '',
      );
      await createOSDWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      await createOSDWizardPage.enableAdditionalEtcdEncryption(true, true);
      await createOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard - GCP shared VPC DNS zone  : Cluster Settings - Default machinepool definitions`, async ({
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

    test(`OSD wizard - GCP shared VPC DNS zone : Networking configuration - cluster privacy definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await createOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await createOSDWizardPage.installIntoExistingVpcCheckBox().check();
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard - GCP shared VPC DNS zone  : VPC Settings definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isVPCSubnetScreen();
      await createOSDWizardPage.installIntoSharedVpcCheckBox().check();
      await createOSDWizardPage
        .sharedHostProjectIdInput()
        .fill(SHARED_VPC_INFRA['HOST_PROJECT_ID'] || '');
      await createOSDWizardPage.createDnsZoneToggle().click();
      await expect(createOSDWizardPage.createDnsZoneCommand()).toHaveValue(
        `ocm gcp create dns-zone --domain-prefix ${clusterProperties.DomainPrefix} --project-id <project-id> --network-project-id <network-project-id> --network-id <vpc-id>`,
      );
      await createOSDWizardPage.selectDnsZone(clusterProperties.DomainPrefix, true);
      await createOSDWizardPage.vpcNameInput().fill(SHARED_VPC_INFRA['VPC_NAME'] || '');
      await createOSDWizardPage
        .controlPlaneSubnetInput()
        .fill(SHARED_VPC_INFRA['CONTROLPLANE_SUBNET'] || '');
      await createOSDWizardPage.computeSubnetInput().fill(SHARED_VPC_INFRA['COMPUTE_SUBNET'] || '');
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD wizard - GCP shared VPC DNS zone  : Networking configuration - CIDR ranges definitions`, async ({
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

    test(`OSD wizard - GCP shared VPC DNS zone : Cluster updates definitions`, async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isUpdatesScreen();
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`OSD wizard - GCP shared VPC DNS zone  : Review and create page definitions`, async ({
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
      await expect(createOSDWizardPage.regionValue()).toContainText(region);
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
      await expect(createOSDWizardPage.sharedHostProjectIdValue()).toContainText(
        SHARED_VPC_INFRA['HOST_PROJECT_ID'] || '',
      );
      await expect(createOSDWizardPage.dnsZoneValue()).toContainText(clusterProperties.DomainPrefix);
      await expect(createOSDWizardPage.vpcSubnetSettingsValue()).toContainText(
        SHARED_VPC_INFRA['VPC_NAME'] || '',
      );
      await expect(createOSDWizardPage.vpcSubnetSettingsValue()).toContainText(
        SHARED_VPC_INFRA['CONTROLPLANE_SUBNET'] || '',
      );
      await expect(createOSDWizardPage.vpcSubnetSettingsValue()).toContainText(
        SHARED_VPC_INFRA['COMPUTE_SUBNET'] || '',
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

    test(`OSD wizard -  GCP shared VPC DNS zone  : Cluster submission & overview definitions`, async ({
      createOSDWizardPage,
      clusterDetailsPage,
    }) => {
      await createOSDWizardPage.createClusterButton().click();
      clusterSubmitted = true;
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
      await expect(clusterDetailsPage.clusterRegionLabelValue()).toContainText(region);
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

    test.afterAll(async ({ clusterDetailsPage }) => {
      if (!clusterSubmitted) return;
      try {
        await clusterDetailsPage.actionsDropdownToggle().click();
        await clusterDetailsPage.deleteClusterDropdownItem().click();
        await clusterDetailsPage.deleteClusterNameInput().clear();
        await clusterDetailsPage.deleteClusterNameInput().fill(clusterName);
        await clusterDetailsPage.deleteClusterConfirm().click();
        await clusterDetailsPage.waitForDeleteClusterActionComplete();
      } catch (error) {
        console.error(`Cleanup failed for cluster "${clusterName}":`, error);
      }
    });
  },
);
