import { expect, test } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';
import { CREATE_CLUSTER_ROUTE } from '../../support/playwright-constants';

const clusterProperties = require('../../fixtures/osd-gcp/osd-ondemand-gcp-wif-sharedvpc-firewall-cluster-creation.spec.json');
const userSuffix = getUsernameSuffix();
const clusterName = `${clusterProperties.ClusterName}-${userSuffix}`;
const clusterDomainPrefix = clusterProperties.DomainPrefix;

// Dedicated WIF for shared-VPC BYO firewall (1 WIF : 1 firewall-rules set).
// Do not fall back to QE_GCP_WIF_CONFIG — that is the public WIF and filters out shared FW rules.
const QE_GCP_WIF_CONFIG_SHARED_VPC = process.env.QE_GCP_WIF_CONFIG_SHARED_VPC?.trim() || '';
const QE_INFRA_GCP = JSON.parse(process.env.QE_INFRA_GCP || '{}');
const SHARED_VPC_INFRA = QE_INFRA_GCP['SHARED_VPC_INFRA'] || {};
const region = SHARED_VPC_INFRA['REGION'] || clusterProperties.Region.split(',')[0];
const FIREWALL_RULES_NAME_SHARED_VPC = SHARED_VPC_INFRA['FIREWALL_RULES_NAME'] || '';

/**
 * Day-1 OSD GCP WIF Shared VPC BYO firewall rules (ROSAENG-72666).
 * Reference: osd-ondemand-gcp-wif-sharedvpc-dns-cluster-creation.spec.ts
 */
test.describe.serial(
  'OSD Marketplace GCP WIF Shared VPC firewall rules cluster creation',
  {
    tag: ['@day1', '@osd', '@gcp', '@wif', '@ondemand', '@sharedvpc', '@firewall', '@dns'],
  },
  () => {
    let clusterSubmitted = false;

    test.beforeAll(async ({ navigateTo }) => {
      if (!QE_GCP_WIF_CONFIG_SHARED_VPC) {
        throw new Error(
          'QE_GCP_WIF_CONFIG_SHARED_VPC must be set for Shared VPC BYO firewall tests (do not reuse QE_GCP_WIF_CONFIG)',
        );
      }
      if (!FIREWALL_RULES_NAME_SHARED_VPC?.trim()) {
        throw new Error(
          'QE_INFRA_GCP.SHARED_VPC_INFRA.FIREWALL_RULES_NAME must be set for Shared VPC BYO firewall coverage',
        );
      }
      if (
        !SHARED_VPC_INFRA['HOST_PROJECT_ID'] ||
        !SHARED_VPC_INFRA['VPC_NAME'] ||
        !SHARED_VPC_INFRA['CONTROLPLANE_SUBNET'] ||
        !SHARED_VPC_INFRA['COMPUTE_SUBNET']
      ) {
        throw new Error(
          'QE_INFRA_GCP.SHARED_VPC_INFRA must include HOST_PROJECT_ID, VPC_NAME, CONTROLPLANE_SUBNET, and COMPUTE_SUBNET',
        );
      }
      await navigateTo(CREATE_CLUSTER_ROUTE);
    });

    test(`Launch OSD - GCP shared VPC firewall rules cluster wizard`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdCreateClusterButton());
      await createOSDWizardPage.isCreateOSDPage();
    });

    test(`OSD wizard - GCP shared VPC firewall rules : Billing model and its definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isBillingModelScreen();
      await createOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      await createOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD wizard - GCP shared VPC firewall rules : Cluster Settings - Cloud provider definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.workloadIdentityFederationButton().click();
      await createOSDWizardPage.selectWorkloadIdentityConfiguration(QE_GCP_WIF_CONFIG_SHARED_VPC);
      await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD wizard - GCP shared VPC firewall rules : Cluster Settings - Cluster details definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterDetailsScreen();
      await createOSDWizardPage.createCustomDomainPrefixCheckbox().check();
      await createOSDWizardPage.setClusterName(clusterName);
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.setDomainPrefix(clusterDomainPrefix);
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.selectRegion(region);
      await createOSDWizardPage.selectVersion(
        clusterProperties.Version || process.env.VERSION || '',
      );
      await createOSDWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      await createOSDWizardPage.enableAdditionalEtcdEncryption(true, true);
      await createOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD wizard - GCP shared VPC firewall rules : Cluster Settings - Default machinepool definitions`, async ({
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
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD wizard - GCP shared VPC firewall rules : Networking configuration - cluster privacy definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await createOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await createOSDWizardPage.installIntoExistingVpcCheckBox().check();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD wizard - GCP shared VPC firewall rules : VPC Settings definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isVPCSubnetScreen();
      await createOSDWizardPage.installIntoSharedVpcCheckBox().check();
      await createOSDWizardPage
        .sharedHostProjectIdInput()
        .fill(SHARED_VPC_INFRA['HOST_PROJECT_ID'] || '');
      await createOSDWizardPage.createDnsZoneToggle().click();
      await expect(createOSDWizardPage.createDnsZoneCommand()).toHaveValue(
        `ocm gcp create dns-zone --domain-prefix ${clusterDomainPrefix} --project-id <project-id> --network-project-id <network-project-id> --network-id <vpc-id>`,
      );
      await createOSDWizardPage.selectDnsZone(clusterDomainPrefix, true);
      await createOSDWizardPage.vpcNameInput().fill(SHARED_VPC_INFRA['VPC_NAME'] || '');
      await createOSDWizardPage
        .controlPlaneSubnetInput()
        .fill(SHARED_VPC_INFRA['CONTROLPLANE_SUBNET'] || '');
      await createOSDWizardPage.computeSubnetInput().fill(SHARED_VPC_INFRA['COMPUTE_SUBNET'] || '');

      // BYO firewall rules (ROSAENG-72666): host project + shared VPC / public profile.
      await createOSDWizardPage.createFirewallRulesToggle().click();
      await expect(createOSDWizardPage.createFirewallRulesCommand()).toHaveValue(
        /ocm gcp create firewall-rules/,
      );
      await expect(createOSDWizardPage.createFirewallRulesCommand()).toHaveValue(
        new RegExp(`--project-id=${SHARED_VPC_INFRA['HOST_PROJECT_ID']}`),
      );
      await expect(createOSDWizardPage.createFirewallRulesCommand()).toHaveValue(
        new RegExp(`--vpc-name=${SHARED_VPC_INFRA['VPC_NAME']}`),
      );
      await expect(createOSDWizardPage.createFirewallRulesCommand()).not.toHaveValue(
        /--profile=private/,
      );
      await createOSDWizardPage.selectFirewallRules(FIREWALL_RULES_NAME_SHARED_VPC);

      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD wizard - GCP shared VPC firewall rules : Networking configuration - CIDR ranges definitions`, async ({
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

      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD wizard - GCP shared VPC firewall rules : Cluster updates definitions`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isUpdatesScreen();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD wizard - GCP shared VPC firewall rules : Review and create page definitions`, async ({
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
      await expect(createOSDWizardPage.wifConfigurationValue()).toContainText(
        QE_GCP_WIF_CONFIG_SHARED_VPC,
      );

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
      await expect(createOSDWizardPage.dnsZoneValue()).toContainText(clusterDomainPrefix);
      await expect(createOSDWizardPage.firewallRulesValue()).toHaveText(
        FIREWALL_RULES_NAME_SHARED_VPC,
      );
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

    test(`OSD wizard - GCP shared VPC firewall rules : Cluster submission & overview definitions`, async ({
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
      await expect(clusterDetailsPage.clusterWifConfigurationValue()).toContainText(
        QE_GCP_WIF_CONFIG_SHARED_VPC,
      );
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
