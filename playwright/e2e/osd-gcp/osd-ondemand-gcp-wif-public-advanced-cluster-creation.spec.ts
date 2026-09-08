import { test, expect } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';

const clusterProperties = require('../../fixtures/osd-gcp/osd-ondemand-gcp-wif-public-advanced-cluster-creation.spec.json');
const userSuffix = getUsernameSuffix();
const clusterName = `${clusterProperties.ClusterName}-${userSuffix}`;
const clusterDomainPrefix = `osd${userSuffix}`;

const QE_GCP_WIF_CONFIG = process.env.QE_GCP_WIF_CONFIG || '';
const QE_INFRA_GCP = JSON.parse(process.env.QE_INFRA_GCP || '{}');

test.describe.serial(
  'OSD On-Demand GCP WIF public advanced cluster creation',
  { tag: ['@day1', '@osd', '@gcp', '@wif', '@ondemand', '@public', '@advanced'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      if (!QE_GCP_WIF_CONFIG?.trim()) {
        throw new Error('QE_GCP_WIF_CONFIG must be set for GCP WIF public advanced tests');
      }
      if (
        !QE_INFRA_GCP.REGION ||
        !QE_INFRA_GCP.VPC_NAME ||
        !QE_INFRA_GCP.CONTROLPLANE_SUBNET ||
        !QE_INFRA_GCP.COMPUTE_SUBNET
      ) {
        throw new Error(
          'QE_INFRA_GCP must include top-level REGION, VPC_NAME, CONTROLPLANE_SUBNET, and COMPUTE_SUBNET',
        );
      }
      await navigateTo('create');
    });

    test(`Launch OSD - ${clusterProperties.CloudProvider} WIF public advanced wizard`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdCreateClusterButton());
      await createOSDWizardPage.isCreateOSDPage();
    });

    test(`OSD ${clusterProperties.CloudProvider} WIF wizard - Billing model and its definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isBillingModelScreen();
      await createOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      await createOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} WIF wizard - Cluster Settings - Cloud provider definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isOnlyGCPCloudProviderSelectionScreen();
      await createOSDWizardPage.workloadIdentityFederationButton().click();
      await createOSDWizardPage.selectWorkloadIdentityConfiguration(QE_GCP_WIF_CONFIG);
      await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} WIF wizard - Cluster Settings - Cluster details definitions`, async ({
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
        clusterProperties.Version || process.env.VERSION || '',
      );
      await createOSDWizardPage.selectRegion(QE_INFRA_GCP.REGION);
      await createOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      await expect(createOSDWizardPage.enableUserWorkloadMonitoringCheckbox()).toBeChecked();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} WIF wizard - Cluster Settings - Default machinepool definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isMachinePoolScreen();
      await createOSDWizardPage.selectComputeNodeType(
        clusterProperties.MachinePools[0].InstanceType,
      );
      await createOSDWizardPage.enableAutoscalingCheckbox().check();
      await createOSDWizardPage.setMinimumNodeCount(
        clusterProperties.MachinePools[0].MinimumNodeCount,
      );
      await createOSDWizardPage.setMaximumNodeCount(
        clusterProperties.MachinePools[0].MaximumNodeCount,
      );
      await createOSDWizardPage.addNodeLabelLink().click();
      await createOSDWizardPage.addNodeLabelKeyAndValue(
        clusterProperties.MachinePools[0].Labels[0].Key,
        clusterProperties.MachinePools[0].Labels[0].Value,
      );
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} WIF wizard - Networking configuration - cluster privacy definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await expect(createOSDWizardPage.clusterPrivacyPublicRadio()).toBeChecked();
      await createOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await createOSDWizardPage.installIntoExistingVpcCheckBox().check();
      await createOSDWizardPage.applicationIngressCustomSettingsRadio().check();
      await createOSDWizardPage
        .applicationIngressRouterSelectorsInput()
        .fill(clusterProperties.RouteSelector.KeyValue);
      await createOSDWizardPage
        .applicationIngressExcludedNamespacesInput()
        .fill(clusterProperties.ExcludedNamespaces.Values);
      await createOSDWizardPage
        .applicationIngressExcludeNamespaceSelectorKeyInput()
        .fill(clusterProperties.ExcludeNamespaceSelectors.Key);
      await createOSDWizardPage
        .applicationIngressExcludeNamespaceSelectorValuesInput()
        .fill(clusterProperties.ExcludeNamespaceSelectors.Values);
      await expect(
        createOSDWizardPage.applicationIngressNamespaceOwnershipPolicyRadio(),
      ).toBeChecked();
      await expect(
        createOSDWizardPage.applicationIngressWildcardPolicyAllowedRadio(),
      ).not.toBeChecked();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} WIF wizard - VPC and subnet definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isVPCSubnetScreen();
      await createOSDWizardPage.selectGcpVPC(QE_INFRA_GCP.VPC_NAME);
      await createOSDWizardPage.selectControlPlaneSubnetName(QE_INFRA_GCP.CONTROLPLANE_SUBNET);
      await createOSDWizardPage.selectComputeSubnetName(QE_INFRA_GCP.COMPUTE_SUBNET);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} WIF wizard - CIDR configuration - cidr definitions`, async ({
      createOSDWizardPage,
    }) => {
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
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} WIF wizard - Cluster updates definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterUpdatesScreen();
      await expect(createOSDWizardPage.updateStrategyIndividualRadio()).toBeChecked();
      await createOSDWizardPage.selectNodeDraining(clusterProperties.NodeDraining);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD ${clusterProperties.CloudProvider} WIF wizard - Review and create page and its definitions`, async ({
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
      await expect(createOSDWizardPage.clusterDomainPrefixLabelValue()).toContainText(
        clusterDomainPrefix,
      );
      await expect(createOSDWizardPage.clusterNameValue()).toContainText(clusterName);
      await expect(createOSDWizardPage.regionValue()).toContainText(QE_INFRA_GCP.REGION);
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
      await expect(createOSDWizardPage.autoscalingValue()).toContainText(
        clusterProperties.MachinePools[0].Autoscaling,
      );
      await expect(createOSDWizardPage.computeNodeRangeValue()).toContainText(
        `Minimum nodes: ${clusterProperties.MachinePools[0].MinimumNodeCount}`,
      );
      await expect(createOSDWizardPage.computeNodeRangeValue()).toContainText(
        `Maximum nodes: ${clusterProperties.MachinePools[0].MaximumNodeCount}`,
      );
      const label = `${clusterProperties.MachinePools[0].Labels[0].Key} = ${clusterProperties.MachinePools[0].Labels[0].Value}`;
      await expect(createOSDWizardPage.nodeLabelsValue(label)).toBeVisible();
      await expect(createOSDWizardPage.clusterPrivacyValue()).toContainText(
        clusterProperties.ClusterPrivacy,
      );
      await expect(createOSDWizardPage.installIntoExistingVpcValue()).toContainText(
        clusterProperties.InstallIntoExistingVPC,
      );
      await expect(createOSDWizardPage.vpcSubnetSettingsValue()).toContainText(
        QE_INFRA_GCP.VPC_NAME,
      );
      await expect(createOSDWizardPage.vpcSubnetSettingsValue()).toContainText(
        QE_INFRA_GCP.CONTROLPLANE_SUBNET,
      );
      await expect(createOSDWizardPage.vpcSubnetSettingsValue()).toContainText(
        QE_INFRA_GCP.COMPUTE_SUBNET,
      );
      await expect(createOSDWizardPage.applicationIngressValue()).toContainText(
        clusterProperties.ApplicationIngress,
      );
      await expect(createOSDWizardPage.routeSelectorsValue()).toContainText(
        clusterProperties.RouteSelector.KeyValue.replace('=', ' = '),
      );
      for (const namespace of clusterProperties.ExcludedNamespaces.Values.split(',')) {
        await expect(createOSDWizardPage.excludedNamespacesValue()).toContainText(namespace.trim());
      }
      await expect(createOSDWizardPage.excludeNamespaceSelectorsValue()).toContainText(
        `${clusterProperties.ExcludeNamespaceSelectors.Key} = ${clusterProperties.ExcludeNamespaceSelectors.Values.split(',').join(', ')}`,
      );
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

    test(`OSD ${clusterProperties.CloudProvider} WIF wizard - Cluster submission & overview definitions`, async ({
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
      await expect(clusterDetailsPage.clusterRegionLabelValue()).toContainText(QE_INFRA_GCP.REGION);
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
      await expect(clusterDetailsPage.clusterSecureBootSupportForShieldedVMsValue()).toContainText(
        clusterProperties.SecureBootSupportForShieldedVMs,
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
