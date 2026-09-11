import { test, expect } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';
import { CREATE_CLUSTER_ROUTE } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/osd-gcp/osd-non-ccs-gcp-advanced-cluster-creation.spec.json');
const clusterProperties = clusterProfiles['osd-nonccs-gcp-advanced'].day1Profile;
const machinePool = clusterProperties.MachinePools;

const userSuffix = getUsernameSuffix();
const clusterName = `${clusterProperties.ClusterName}-${userSuffix}`;
const clusterDomainPrefix = `${clusterProperties.DomainPrefix}${userSuffix}`;

test.describe.serial(
  'OSD Non-CCS GCP multi-zone public cluster creation',
  { tag: ['@day1', '@osd', '@gcp', '@nonccs', '@multizone', '@public', '@advanced'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      await navigateTo(CREATE_CLUSTER_ROUTE);
    });

    test(`Launch OSD (non-CCS) - ${clusterProperties.CloudProvider} - ${clusterProperties.Availability} cluster wizard`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdCreateClusterButton());
      await createOSDWizardPage.isCreateOSDPage();
    });

    test(`OSD (non-CCS) - ${clusterProperties.CloudProvider} - ${clusterProperties.Availability} - Billing model`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isBillingModelScreen();
      await expect(createOSDWizardPage.subscriptionTypeAnnualFixedCapacityRadio()).toBeChecked();
      await createOSDWizardPage.infrastructureTypeRedHatCloudAccountRadio().check();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD (non-CCS) - ${clusterProperties.CloudProvider} - ${clusterProperties.Availability} - Cloud provider`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isCloudProviderSelectionScreen();
      await createOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD (non-CCS) - ${clusterProperties.CloudProvider} - ${clusterProperties.Availability} - Cluster details`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterDetailsScreen();
      await createOSDWizardPage.setClusterNameAndWaitForAvailability(clusterName);
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.createCustomDomainPrefixCheckbox().check();
      await createOSDWizardPage.setDomainPrefix(clusterDomainPrefix);
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      await createOSDWizardPage.selectRegion(clusterProperties.Region);
      await createOSDWizardPage.selectPersistentStorage(clusterProperties.PersistentStorage);
      await createOSDWizardPage.selectLoadBalancers(clusterProperties.LoadBalancers);
      await expect(createOSDWizardPage.enableUserWorkloadMonitoringCheckbox()).toBeChecked();
      await createOSDWizardPage.enableSecureBootSupportForSchieldedVMs(
        clusterProperties.EnableSecureBootSupportForSchieldedVMs.includes('Enabled'),
      );
      if (clusterProperties.AdditionalEncryption.includes('Enabled')) {
        await createOSDWizardPage.advancedEncryptionLink().click();
        await createOSDWizardPage.enableAdditionalEtcdEncryptionCheckbox().check();
        if (clusterProperties.FIPSCryptography.includes('Enabled')) {
          await createOSDWizardPage.enableFIPSCryptographyCheckbox().check();
        }
      }
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD (non-CCS) ${clusterProperties.CloudProvider} - ${clusterProperties.Availability} - Default machine pool`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isMachinePoolScreen();
      await createOSDWizardPage.selectComputeNodeType(machinePool.InstanceType);
      if (machinePool.Autoscaling.includes('Enabled')) {
        await createOSDWizardPage.enableAutoscalingCheckbox().check();
        await createOSDWizardPage.setMinimumNodeCount(machinePool.MinimumNodeCount);
        await createOSDWizardPage.setMaximumNodeCount(machinePool.MaximumNodeCount);
      } else {
        await expect(createOSDWizardPage.enableAutoscalingCheckbox()).not.toBeChecked();
        await createOSDWizardPage.selectComputeNodeCount(Number(machinePool.NodeCount));
      }
      if (machinePool.NodeLabel?.length) {
        await createOSDWizardPage.addNodeLabelLink().click();
        await createOSDWizardPage.addNodeLabelKeyAndValue(
          machinePool.NodeLabel[0].Key,
          clusterName,
          0,
        );
      }
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD (non-CCS) ${clusterProperties.CloudProvider} - ${clusterProperties.Availability} - Networking CIDR`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isCIDRScreen();
      await expect(createOSDWizardPage.cidrDefaultValuesCheckBox()).toBeChecked();
      await createOSDWizardPage.cidrDefaultValuesCheckBox().uncheck();
      await expect(createOSDWizardPage.machineCIDRInput()).toHaveValue(clusterProperties.MachineCIDR);
      await expect(createOSDWizardPage.serviceCIDRInput()).toHaveValue(clusterProperties.ServiceCIDR);
      await expect(createOSDWizardPage.podCIDRInput()).toHaveValue(clusterProperties.PodCIDR);
      await expect(createOSDWizardPage.hostPrefixInput()).toHaveValue(clusterProperties.HostPrefix);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD (non-CCS) ${clusterProperties.CloudProvider} - ${clusterProperties.Availability} - Cluster updates`, async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isClusterUpdatesScreen();
      await expect(createOSDWizardPage.updateStrategyIndividualRadio()).toBeChecked();
      await expect(createOSDWizardPage.updateStrategyRecurringRadio()).not.toBeChecked();
      if (clusterProperties.UpdateStrategy.includes('Recurring')) {
        await createOSDWizardPage.updateStrategyRecurringRadio().check();
      } else {
        await createOSDWizardPage.updateStrategyIndividualRadio().check();
      }
      await createOSDWizardPage.selectGracePeriod(clusterProperties.NodeDraining);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test(`OSD (non-CCS) ${clusterProperties.CloudProvider} - ${clusterProperties.Availability} - Review and create`, async ({
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
      await expect(createOSDWizardPage.clusterDomainPrefixLabelValue()).toContainText(
        clusterDomainPrefix,
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
      await expect(createOSDWizardPage.persistentStorageValue()).toContainText(
        clusterProperties.PersistentStorage,
      );
      await expect(createOSDWizardPage.loadBalancersValue()).toContainText(
        clusterProperties.LoadBalancers,
      );
      await expect(createOSDWizardPage.additionalEtcdEncryptionValue()).toContainText(
        clusterProperties.AdditionalEncryption,
      );
      await expect(createOSDWizardPage.fipsCryptographyValue()).toContainText(
        clusterProperties.FIPSCryptography,
      );
      await expect(createOSDWizardPage.nodeInstanceTypeValue()).toContainText(
        machinePool.InstanceType,
      );
      await expect(createOSDWizardPage.autoscalingValue()).toContainText(machinePool.Autoscaling);
      if (machinePool.Autoscaling.includes('Enabled')) {
        await expect(createOSDWizardPage.computeNodeRangeValue()).toContainText(
          `Minimum nodes per zone: ${machinePool.MinimumNodeCount}`,
        );
        await expect(createOSDWizardPage.computeNodeRangeValue()).toContainText(
          `Maximum nodes per zone: ${machinePool.MaximumNodeCount}`,
        );
      } else {
        await expect(createOSDWizardPage.computeNodeCountValue()).toContainText(
          machinePool.NodeCount,
        );
      }
      await expect(createOSDWizardPage.clusterPrivacyValue()).toContainText(
        clusterProperties.ClusterPrivacy,
      );
      await expect(createOSDWizardPage.machineCIDRValue()).toContainText(clusterProperties.MachineCIDR);
      await expect(createOSDWizardPage.serviceCIDRValue()).toContainText(clusterProperties.ServiceCIDR);
      await expect(createOSDWizardPage.podCIDRValue()).toContainText(clusterProperties.PodCIDR);
      await expect(createOSDWizardPage.hostPrefixValue()).toContainText(clusterProperties.HostPrefix);
      await expect(createOSDWizardPage.updateStratergyValue()).toContainText(
        clusterProperties.UpdateStrategy,
      );
      await expect(createOSDWizardPage.nodeDrainingValue()).toContainText(
        clusterProperties.NodeDraining,
      );
    });

    test(`OSD (non-CCS) ${clusterProperties.CloudProvider} - ${clusterProperties.Availability} - Cluster submission`, async ({
      createOSDWizardPage,
      clusterDetailsPage,
    }) => {
      await createOSDWizardPage.createClusterButton().click();
      await clusterDetailsPage.waitForInstallerScreenToLoad();
      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
      await expect(clusterDetailsPage.clusterInstallationHeader()).toContainText('Installing cluster');
      await expect(clusterDetailsPage.clusterInstallationHeader()).toBeVisible();
      await expect(clusterDetailsPage.clusterInstallationExpectedText()).toContainText(
        'Cluster creation usually takes 30 to 60 minutes to complete',
      );
      await expect(clusterDetailsPage.downloadOcCliLink()).toContainText('Download OC CLI');
      await expect(clusterDetailsPage.downloadOcCliLink()).toBeVisible();
      await clusterDetailsPage.clusterDetailsPageRefresh();
      await clusterDetailsPage.checkInstallationStepStatus('Account setup');
      await clusterDetailsPage.checkInstallationStepStatus('Network settings');
      await clusterDetailsPage.checkInstallationStepStatus('DNS setup');
      await clusterDetailsPage.checkInstallationStepStatus('Cluster installation');
      await expect(clusterDetailsPage.clusterTypeLabelValue()).toContainText(clusterProperties.Type);
      await expect(clusterDetailsPage.clusterPersistentStorageLabelValue()).toContainText(
        clusterProperties.PersistentStorage,
      );
      const expectedLoadBalancers =
        Number(clusterProperties.LoadBalancers) > 0 ? clusterProperties.LoadBalancers : 'N/A';
      await expect(clusterDetailsPage.clusterLoadBalancersValue()).toContainText(
        expectedLoadBalancers,
      );
    });
  },
);
