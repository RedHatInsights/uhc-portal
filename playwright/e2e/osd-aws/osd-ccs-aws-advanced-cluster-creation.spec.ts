import { test, expect } from '../../fixtures/pages';

const clusterProperties = require('../../fixtures/osd-aws/osd-ccs-aws-advanced-cluster-creation.spec.json');

const awsAccountID = process.env.QE_AWS_ID;
const awsAccessKey = process.env.QE_AWS_ACCESS_KEY_ID;
const awsSecretKey = process.env.QE_AWS_ACCESS_KEY_SECRET;
const clusterName = clusterProperties.ClusterName;

// Get region and QE infrastructure from environment
const region = clusterProperties.Region.split(',')[0];
const qeInfraRegions = JSON.parse(process.env.QE_INFRA_REGIONS || '{}');
const qeInfrastructure = qeInfraRegions[region]?.[0] || {};

const selectZones = clusterProperties.MachinePools[0].AvailabilityZones;
const securityGroups = qeInfrastructure.SECURITY_GROUPS_NAME || [];

test.describe.serial(
  'OSD AWS CCS Cluster - Create public advanced AWS CCS cluster (OCP-21100, OCP-42745)',
  { tag: ['@day1', '@osd', '@aws', '@public', '@advanced'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      await navigateTo('create');
    });

    test('Launch OSD AWS CCS cluster wizard', async ({ createOSDWizardPage }) => {
      await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdCreateClusterButton());
      await createOSDWizardPage.isCreateOSDPage();
    });

    test('Step OSD - AWS CCS wizard Billing model', async ({ createOSDWizardPage }) => {
      await createOSDWizardPage.isBillingModelScreen();
      await createOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      await createOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test('Step OSD - AWS CCS wizard - Cluster Settings - Select cloud provider definitions', async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isCloudProviderSelectionScreen();
      await createOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
      await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      await createOSDWizardPage.awsAccountIDInput().fill(awsAccountID || '');
      await createOSDWizardPage.awsAccessKeyInput().fill(awsAccessKey || '');
      await createOSDWizardPage.awsSecretKeyInput().fill(awsSecretKey || '');

      await createOSDWizardPage.wizardNextButton().click();
    });

    test('Step OSD - AWS CCS wizard - Cluster Settings - Select Cluster details definitions', async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterDetailsScreen();
      await createOSDWizardPage.setClusterName(clusterName);
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.multiZoneAvilabilityRadio().check();
      await createOSDWizardPage.selectVersion(
        clusterProperties.Version || process.env.VERSION || '',
      );
      await createOSDWizardPage.selectRegion(clusterProperties.Region);
      await expect(createOSDWizardPage.enableUserWorkloadMonitoringCheckbox()).toBeChecked();
      await createOSDWizardPage.advancedEncryptionLink().click();
      await createOSDWizardPage.useDefaultKMSKeyRadio().click();
      await createOSDWizardPage.enableAdditionalEtcdEncryptionCheckbox().check();
      await createOSDWizardPage.enableFIPSCryptographyCheckbox().check();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test('Step OSD - AWS CCS wizard - Cluster Settings - Select machinepool definitions', async ({
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
      await expect(createOSDWizardPage.useBothIMDSv1AndIMDSv2Radio()).toBeChecked();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test('Step OSD - AWS CCS wizard - Networking configuration - Select cluster privacy definitions', async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await expect(createOSDWizardPage.clusterPrivacyPublicRadio()).toBeChecked();
      await createOSDWizardPage.installIntoExistingVpcCheckBox().check();
    });

    test('Step OSD - AWS CCS wizard - Networking configuration - Application ingress definitions', async ({
      createOSDWizardPage,
    }) => {
      if (clusterProperties.CustomApplicationIngress.includes('Custom settings')) {
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

    test('Step OSD - AWS CCS wizard - Networking configuration - Select VPC and subnet definitions', async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isVPCSubnetScreen();
      await createOSDWizardPage.waitForVPCRefresh();
      await createOSDWizardPage.selectVPC(qeInfrastructure.VPC_NAME || '');

      for (const zone of selectZones) {
        await createOSDWizardPage.selectSubnetAvailabilityZone(zone);
      }

      for (let i = 0; i < clusterProperties.MachinePools[0].AvailabilityZonesCount; i++) {
        const zone = clusterProperties.MachinePools[0].AvailabilityZones[i];
        const subnets = qeInfrastructure.SUBNETS?.ZONES?.[zone] || {};
        await createOSDWizardPage.selectPrivateSubnet(i, subnets.PRIVATE_SUBNET_NAME || '');
        await createOSDWizardPage.selectPublicSubnet(i, subnets.PUBLIC_SUBNET_NAME || '');
      }
    });

    test('Step OSD - AWS CCS wizard - Networking configuration - Select security group definitions', async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.additionalSecurityGroupsLink().click();
      // Always check the "Apply same security groups to all node types" checkbox
      await createOSDWizardPage.applySameSecurityGroupsToAllNodeTypesCheckbox().check();

      // Since we're checking the box, always use the simplified flow
      for (const securityGroup of securityGroups) {
        await createOSDWizardPage.selectAdditionalSecurityGroups(securityGroup);
      }

      await createOSDWizardPage.wizardNextButton().click();
    });

    test('Step OSD - AWS CCS wizard - CIDR Ranges - Select CIDR default values', async ({
      createOSDWizardPage,
    }) => {
      await expect(createOSDWizardPage.cidrDefaultValuesCheckBox()).toBeChecked();
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

    test('Step OSD - AWS CCS wizard - Cluster update - Select update strategies and its definitions', async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isUpdatesScreen();
      if (clusterProperties.UpdateStrategy.includes('Recurring')) {
        await createOSDWizardPage.updateStrategyRecurringRadio().check();
      } else {
        await createOSDWizardPage.updateStrategyIndividualRadio().check();
      }
      await createOSDWizardPage.selectNodeDraining(clusterProperties.NodeDraining);

      await createOSDWizardPage.wizardNextButton().click();
    });

    test('Step OSD - AWS CCS wizard - Review billing definitions', async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isReviewScreen();
      await expect(createOSDWizardPage.subscriptionTypeValue()).toContainText(
        clusterProperties.SubscriptionType,
      );
      await expect(createOSDWizardPage.infrastructureTypeValue()).toContainText(
        clusterProperties.InfrastructureType,
      );
    });

    test('Step OSD - AWS CCS wizard - Review and create : Cluster Settings definitions', async ({
      createOSDWizardPage,
    }) => {
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
    });

    test('Step OSD - AWS CCS wizard - Review and create : Machine pool definitions', async ({
      createOSDWizardPage,
    }) => {
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
    });

    test('Step OSD - AWS CCS wizard - Review and create : Networking definitions', async ({
      createOSDWizardPage,
    }) => {
      await expect(createOSDWizardPage.clusterPrivacyValue()).toContainText(
        clusterProperties.ClusterPrivacy,
      );
      await expect(createOSDWizardPage.installIntoExistingVpcValue()).toContainText(
        clusterProperties.InstallIntoExistingVPC,
      );
    });

    test('Step OSD - AWS CCS wizard - Review and create : Application ingress definitions', async ({
      createOSDWizardPage,
    }) => {
      await expect(createOSDWizardPage.applicationIngressValue()).toContainText(
        clusterProperties.CustomApplicationIngress,
      );
      await expect(createOSDWizardPage.routeSelectorsValue()).toContainText(
        clusterProperties.RouteSelector.KeyValue,
      );
      await expect(createOSDWizardPage.excludedNamespacesValue()).toContainText(
        clusterProperties.ExcludedNamespaces.Values,
      );
      await expect(createOSDWizardPage.wildcardPolicyValue()).toContainText(
        clusterProperties.WildcardPolicy,
      );
      await expect(createOSDWizardPage.namespaceOwnershipValue()).toContainText(
        clusterProperties.NamespaceOwnershipPolicy,
      );
    });

    test('Step OSD - AWS CCS wizard - Review and create : VPC and subnet definitions', async ({
      createOSDWizardPage,
    }) => {
      // Verify each row: zone, private subnet, public subnet
      for (let i = 0; i < clusterProperties.MachinePools[0].AvailabilityZonesCount; i++) {
        const zone = clusterProperties.MachinePools[0].AvailabilityZones[i];
        const subnets = qeInfrastructure.SUBNETS?.ZONES?.[zone] || {};
        await createOSDWizardPage.verifyVpcSubnetRow(
          zone,
          subnets.PRIVATE_SUBNET_NAME || '',
          subnets.PUBLIC_SUBNET_NAME || '',
        );
      }
    });

    test('Step OSD - AWS CCS wizard - Review and create : Security group definitions', async ({
      createOSDWizardPage,
    }) => {
      // Since we checked "Apply same security groups to all node types" checkbox,
      // the review screen will show unified security groups, not separate sections
      await createOSDWizardPage.verifySecurityGroups(securityGroups);
    });

    test('Step OSD - AWS CCS wizard - Review and create : CIDR definitions', async ({
      createOSDWizardPage,
    }) => {
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
    });

    test('Step OSD - AWS CCS wizard - Review and create : Update definitions', async ({
      createOSDWizardPage,
    }) => {
      await expect(createOSDWizardPage.updateStratergyValue()).toContainText(
        clusterProperties.UpdateStrategy,
      );
      const nodeDrainingMinutes = parseInt(clusterProperties.NodeDraining) * 60;
      await expect(createOSDWizardPage.nodeDrainingValue()).toContainText(
        `${nodeDrainingMinutes} minutes`,
      );
    });

    test('Step OSD - AWS CCS wizard - Cluster submission & overview definitions', async ({
      createOSDWizardPage,
      clusterDetailsPage,
    }) => {
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
  },
);
