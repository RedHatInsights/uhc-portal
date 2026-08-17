import { test, expect } from '../../fixtures/pages';

const clusterProperties = require('../../fixtures/osd-gcp/osd-ccs-gcp-private-wif-psc-cluster-creation-advanced.spec.json');
const clusterName = `${clusterProperties.ClusterName}-${Math.random().toString(36).substring(7)}`;
const clusterDomainPrefix = `osd${Math.random().toString(36).substring(2, 13)}`;
const authType = `${clusterProperties.AuthenticationType}`;
const isPscEnabled = 'PrivateServiceConnect';

const QE_GCP_WIF_CONFIG = process.env.QE_GCP_WIF_CONFIG || '';
const gcpKeyRingLocation = process.env.QE_GCP_KEY_RING_LOCATION || '';
const gcpKeyRing = process.env.QE_GCP_KEY_RING || '';
const gcpKeyName = process.env.QE_GCP_KEY_NAME || '';
const gcpKMSServiceAccount = process.env.QE_GCP_KMS_SERVICE_ACCOUNT || '';
const QE_INFRA_GCP = JSON.parse(process.env.QE_INFRA_GCP || '{}');
const PSC_INFRA = QE_INFRA_GCP['PSC_INFRA'] || {};
const region = PSC_INFRA['REGION'] || clusterProperties.Region.split(',')[0];
const hasCustomGcpKms =
  Boolean(gcpKeyRingLocation) &&
  Boolean(gcpKeyRing) &&
  Boolean(gcpKeyName) &&
  Boolean(gcpKMSServiceAccount);

test.describe.serial(
  'OSD GCP CCS WIF private PSC advanced cluster creation tests',
  {
    tag: ['@advanced', '@day1', '@osd', '@ccs', '@gcp', '@private', '@wif', '@psc', '@multizone'],
  },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      await navigateTo('create');
    });

    test(`Launch OSD - ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} cluster wizard`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdCreateClusterButton());
      await createOSDWizardPage.isCreateOSDPage();
    });

    test(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Billing model and its definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isBillingModelScreen();
      await expect(createOSDWizardPage.subscriptionTypeAnnualFixedCapacityRadio()).toBeChecked();
      await createOSDWizardPage.infrastructureTypeClusterCloudSubscriptionRadio().check();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster Settings - Cloud provider definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isCloudProviderSelectionScreen();
      await createOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
      await createOSDWizardPage.workloadIdentityFederationButton().click();
      await createOSDWizardPage.selectWorkloadIdentityConfiguration(QE_GCP_WIF_CONFIG);
      await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster Settings - Cluster details definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterDetailsScreen();
      await createOSDWizardPage.createCustomDomainPrefixCheckbox().scrollIntoViewIfNeeded();
      await createOSDWizardPage.createCustomDomainPrefixCheckbox().check();
      await createOSDWizardPage.setClusterName(clusterName);
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.setDomainPrefix(clusterDomainPrefix);
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      await createOSDWizardPage.selectRegion(region);
      if (clusterProperties.CloudProvider.includes('Google Cloud')) {
        await createOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      }
      await expect(createOSDWizardPage.enableUserWorkloadMonitoringCheckbox()).toBeChecked();

      if (clusterProperties.AdditionalEncryption.includes('Enabled')) {
        await createOSDWizardPage.advancedEncryptionLink().click();
        await createOSDWizardPage.enableAdditionalEtcdEncryptionCheckbox().check();
        if (clusterProperties.FIPSCryptography.includes('Enabled')) {
          await createOSDWizardPage.enableFIPSCryptographyCheckbox().check();
        }
        if (
          clusterProperties.EncryptVolumesWithCustomerKeys.includes('Enabled') &&
          hasCustomGcpKms
        ) {
          await createOSDWizardPage.configureCustomGcpKmsKey({
            keyRingLocation: gcpKeyRingLocation,
            keyRing: gcpKeyRing,
            keyName: gcpKeyName,
            kmsServiceAccount: gcpKMSServiceAccount,
          });
        }
      }

      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster Settings - Default machinepool definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isMachinePoolScreen();
      await createOSDWizardPage.selectComputeNodeType(
        clusterProperties.MachinePools[0].InstanceType,
      );
      if (clusterProperties.MachinePools[0].Autoscaling.includes('Enabled')) {
        await createOSDWizardPage.enableAutoscalingCheckbox().check();
        await createOSDWizardPage.setMinimumNodeCount(
          clusterProperties.MachinePools[0].MinimumNodeCount,
        );
        await createOSDWizardPage.setMaximumNodeCount(
          clusterProperties.MachinePools[0].MaximumNodeCount,
        );
      } else {
        await expect(createOSDWizardPage.enableAutoscalingCheckbox()).not.toBeChecked();
        await createOSDWizardPage.selectComputeNodeCount(
          clusterProperties.MachinePools[0].NodeCount,
        );
      }
      if (clusterProperties.MachinePools[0].Labels?.length) {
        await createOSDWizardPage.addNodeLabelLink().click();
        await createOSDWizardPage.addNodeLabelKeyAndValue(
          clusterProperties.MachinePools[0].Labels[0].Key,
          clusterProperties.MachinePools[0].Labels[0].Value,
          0,
        );
      }
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Networking configuration - cluster privacy definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await createOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await expect(createOSDWizardPage.installIntoExistingVpcCheckBox()).toBeChecked();
      await expect(createOSDWizardPage.usePrivateServiceConnectCheckBox()).toBeChecked();

      if (clusterProperties.ApplicationIngress.includes('Custom settings')) {
        await createOSDWizardPage.applicationIngressCustomSettingsRadio().check();
        await createOSDWizardPage
          .applicationIngressRouterSelectorsInput()
          .fill(clusterProperties.RouteSelector.KeyValue);
        await createOSDWizardPage
          .applicationIngressExcludedNamespacesInput()
          .fill(clusterProperties.ExcludedNamespaces.Values);
        await expect(
          createOSDWizardPage.applicationIngressNamespaceOwnershipPolicyRadio(),
        ).toBeChecked();
        await expect(
          createOSDWizardPage.applicationIngressWildcardPolicyDisallowedRadio(),
        ).not.toBeChecked();
      } else {
        await expect(createOSDWizardPage.applicationIngressDefaultSettingsRadio()).toBeChecked();
      }
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Networking configuration - VPC and subnet definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isVPCSubnetScreen();
      await createOSDWizardPage.selectGcpVPC(PSC_INFRA['VPC_NAME'] || '');
      await createOSDWizardPage.selectControlPlaneSubnetName(
        PSC_INFRA['CONTROLPLANE_SUBNET'] || '',
      );
      await createOSDWizardPage.selectComputeSubnetName(PSC_INFRA['COMPUTE_SUBNET'] || '');
      await createOSDWizardPage.selectPrivateServiceConnectSubnetName(
        PSC_INFRA['PRIVATE_SERVICE_CONNECT_SUBNET'] || '',
      );
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - CIDR configuration - cidr definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isCIDRScreen();
      await createOSDWizardPage.cidrDefaultValuesCheckBox().uncheck();
      await createOSDWizardPage.machineCIDRInput().clear();
      await createOSDWizardPage.machineCIDRInput().fill(clusterProperties.MachineCIDR);
      await expect(createOSDWizardPage.serviceCIDRInput()).toHaveValue(
        clusterProperties.ServiceCIDR,
      );
      await expect(createOSDWizardPage.podCIDRInput()).toHaveValue(clusterProperties.PodCIDR);
      await expect(createOSDWizardPage.hostPrefixInput()).toHaveValue(clusterProperties.HostPrefix);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster updates definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterUpdatesScreen();
      await expect(createOSDWizardPage.updateStrategyIndividualRadio()).toBeChecked();
      await createOSDWizardPage.selectNodeDraining(clusterProperties.NodeDraining);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Review and create page and its definitions`, async ({
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
      await expect(createOSDWizardPage.wifConfigurationValue()).toContainText(QE_GCP_WIF_CONFIG);
      await expect(createOSDWizardPage.clusterNameValue()).toContainText(clusterName);
      await expect(createOSDWizardPage.clusterDomainPrefixLabelValue()).toContainText(
        clusterDomainPrefix,
      );
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
      await expect(createOSDWizardPage.encryptVolumesWithCustomerkeysValue()).toContainText(
        hasCustomGcpKms ? clusterProperties.EncryptVolumesWithCustomerKeys : 'Disabled',
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
      await expect(createOSDWizardPage.computeNodeRangeValue()).toContainText(
        `Minimum nodes per zone: ${clusterProperties.MachinePools[0].MinimumNodeCount}`,
      );
      await expect(createOSDWizardPage.computeNodeRangeValue()).toContainText(
        `Maximum nodes per zone: ${clusterProperties.MachinePools[0].MaximumNodeCount}`,
      );
      await expect(createOSDWizardPage.clusterPrivacyValue()).toContainText(
        clusterProperties.ClusterPrivacy,
      );
      await expect(createOSDWizardPage.installIntoExistingVpcValue()).toContainText(
        clusterProperties.InstallIntoExistingVPC,
      );
      await expect(createOSDWizardPage.privateServiceConnectValue()).toContainText(
        clusterProperties.UsePrivateServiceConnect,
      );
      await expect(createOSDWizardPage.applicationIngressValue()).toContainText(
        clusterProperties.ApplicationIngress,
      );
      const [routeSelectorKey, routeSelectorValue] =
        clusterProperties.RouteSelector.KeyValue.split('=');
      await expect(createOSDWizardPage.routeSelectorsValue()).toContainText(
        `${routeSelectorKey} = ${routeSelectorValue}`,
      );
      const excludedNamespacesMoreButton = createOSDWizardPage
        .excludedNamespacesValue()
        .getByRole('button', { name: /\d+ more/ });
      if (await excludedNamespacesMoreButton.isVisible()) {
        await excludedNamespacesMoreButton.click();
      }
      for (const namespace of clusterProperties.ExcludedNamespaces.Values.split(',')) {
        await expect(createOSDWizardPage.excludedNamespacesValue()).toContainText(namespace.trim());
      }
      await expect(createOSDWizardPage.wildcardPolicyValue()).toContainText(
        clusterProperties.WildcardPolicy,
      );
      await expect(createOSDWizardPage.namespaceOwnershipValue()).toContainText(
        clusterProperties.NamespaceOwnershipPolicy,
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
        clusterProperties.NodeDraining,
      );
    });

    test(`OSD ${clusterProperties.CloudProvider} ${authType} ${isPscEnabled} wizard - Cluster submission & overview definitions`, async ({
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
        clusterProperties.Type,
      );
      await expect(clusterDetailsPage.clusterAuthenticationTypeLabelValue()).toContainText(
        clusterProperties.AuthenticationType,
      );
      await expect(clusterDetailsPage.clusterWifConfigurationValue()).toContainText(
        QE_GCP_WIF_CONFIG,
      );
    });
  },
);
