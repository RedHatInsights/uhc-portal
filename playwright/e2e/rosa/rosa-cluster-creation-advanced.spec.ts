import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ClusterDetailsPage } from '../../page-objects/cluster-details-page';
import { CreateRosaWizardPage } from '../../page-objects/create-rosa-wizard-page';
import { CreateClusterPage } from '../../page-objects/create-cluster-page';
import { OverviewPage } from '../../page-objects/overview-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

// Import cluster properties JSON
const clusterProfiles = require('../../fixtures/rosa/RosaClusterClassicCreation.json');
const clusterProperties = clusterProfiles['rosa-classic-smoke-advanced'];

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterDetailsPage: ClusterDetailsPage;
let createRosaWizardPage: CreateRosaWizardPage;
let createClusterPage: CreateClusterPage;
let overviewPage: OverviewPage;

test.describe.serial(
  'Rosa cluster wizard advanced settings with cluster creation tests (OCP-36105)',
  { tag: ['@smoke'] },
  () => {
    // awsAccountID, rolePrefix and installerARN are set by prerun script for smoke requirements.
    const region = clusterProperties.Region.split(',')[0];
    const awsAccountID = process.env.QE_AWS_ID || '';
    const rolePrefix = process.env.QE_ACCOUNT_ROLE_PREFIX || '';
    const qeInfrastructure = JSON.parse(process.env.QE_INFRA_REGIONS || '{}')[region]?.[0];
    const securityGroups = qeInfrastructure?.SECURITY_GROUPS_NAME || [];
    const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-Installer-Role`;
    const clusterSuffix = Math.random().toString(36).slice(3, 7);
    const clusterName = `${clusterProperties.ClusterNamePrefix}-${clusterSuffix}`;
    const clusterDomainPrefix = `rosa${Math.random().toString(36).substring(2)}`;

    test.beforeAll(async ({ browser }) => {
      // Setup: auth + navigate to overview
      const setup = await setupTestSuite(browser, '/openshift/overview');

      sharedContext = setup.context;
      sharedPage = setup.page;

      // Initialize page objects for this test suite
      clusterDetailsPage = new ClusterDetailsPage(sharedPage);
      createRosaWizardPage = new CreateRosaWizardPage(sharedPage);
      createClusterPage = new CreateClusterPage(sharedPage);
      overviewPage = new OverviewPage(sharedPage);

      // Navigate to create cluster page
      await overviewPage.waitForViewAllOpenshiftClusterTypesLink();
      await overviewPage.viewAllOpenshiftClusterTypesLink().click();
      await createClusterPage.isCreateClusterPageHeaderVisible();
    });

    test.afterAll(async () => {
      await cleanupTestSuite(sharedContext);
    });

    test('Open Rosa cluster wizard with advanced settings', async () => {
      await createRosaWizardPage.rosaCreateClusterButton().click();
      await expect(createRosaWizardPage.rosaClusterWithWeb()).toBeVisible();
      await createRosaWizardPage.rosaClusterWithWeb().click();
      await createRosaWizardPage.isCreateRosaPage();
      await expect(sharedPage.locator('.spinner-loading-text')).not.toBeVisible();
    });

    test('Step - Control plane - Select control plane type', async () => {
      await createRosaWizardPage.isControlPlaneTypeScreen();
      await createRosaWizardPage.selectStandaloneControlPlaneTypeOption().click();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Accounts and roles - Select Account roles, ARN definitions', async () => {
      await createRosaWizardPage.isAccountsAndRolesScreen();
      await createRosaWizardPage.selectAWSInfrastructureAccount(awsAccountID);
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.selectInstallerRole(installerARN);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Select advanced options', async () => {
      await createRosaWizardPage.isClusterDetailsScreen();
      await createRosaWizardPage.setClusterName(clusterName);
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.createCustomDomainPrefixCheckbox().check();
      await createRosaWizardPage.setDomainPrefix(clusterDomainPrefix);
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.selectRegion(clusterProperties.Region);
      await createRosaWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      await createRosaWizardPage.advancedEncryptionLink().click();
      await createRosaWizardPage.enableAdditionalEtcdEncryptionCheckbox().check();
      await createRosaWizardPage.enableFIPSCryptographyCheckbox().check();
      await createRosaWizardPage.advancedEncryptionLink().click();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - machine pool - Select advanced options', async () => {
      await createRosaWizardPage.isClusterMachinepoolsScreen();
      await createRosaWizardPage.selectComputeNodeType(
        clusterProperties.MachinePools[0].InstanceType,
      );
      await createRosaWizardPage.enableAutoScaling();
      await createRosaWizardPage.setMinimumNodeCount(
        clusterProperties.MachinePools[0].MinimumNodeCount,
      );
      await expect(sharedPage.locator('span:has-text("x 3 zones = 6")')).toBeVisible();
      await createRosaWizardPage.setMaximumNodeCount(
        clusterProperties.MachinePools[0].MaximumNodeCount,
      );
      await expect(sharedPage.locator('span:has-text("x 3 zones = 9")')).toBeVisible();
      await createRosaWizardPage.useIMDSv2Radio().check();
      await createRosaWizardPage.rootDiskSizeInput().clear();
      await createRosaWizardPage.rootDiskSizeInput().selectText();
      await createRosaWizardPage.rootDiskSizeInput().fill(clusterProperties.RootDiskSize);
      await createRosaWizardPage.editNodeLabelLink().click();
      await createRosaWizardPage.addNodeLabelKeyAndValue(
        clusterProperties.MachinePools[0].NodeLabels[0].Key,
        clusterProperties.MachinePools[0].NodeLabels[0].Value,
        0,
      );
      await createRosaWizardPage.addAdditionalLabelLink().click();
      await createRosaWizardPage.addNodeLabelKeyAndValue(
        clusterProperties.MachinePools[0].NodeLabels[1].Key,
        clusterProperties.MachinePools[0].NodeLabels[1].Value,
        1,
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Networking - Configuration settings', async () => {
      await createRosaWizardPage.selectClusterPrivacy('private');
      await createRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await createRosaWizardPage.enableInstallIntoExistingVpc();
      await sharedPage.locator('button:has-text("Next")').click();
    });

    test('Step - Networking - VPC Settings', async () => {
      await createRosaWizardPage.isVPCSettingsScreen();
      await expect(
        sharedPage.locator(
          `text=Select a VPC to install your cluster into your selected region: ${region}`,
        ),
      ).toBeVisible();
      await createRosaWizardPage.waitForVPCList();
      await createRosaWizardPage.selectVPC(qeInfrastructure.VPC_NAME);

      let i = 0;
      for (const zone of clusterProperties.MachinePools[0].AvailabilityZones) {
        await createRosaWizardPage.selectSubnetAvailabilityZone(zone);
        await createRosaWizardPage.selectPrivateSubnet(
          i,
          qeInfrastructure.SUBNETS.ZONES[zone].PRIVATE_SUBNET_NAME,
        );
        await createRosaWizardPage.selectPublicSubnet(
          i,
          qeInfrastructure.SUBNETS.ZONES[zone].PUBLIC_SUBNET_NAME,
        );
        i = i + 1;
      }

      await createRosaWizardPage.additionalSecurityGroupsLink().click();
      await createRosaWizardPage.applySameSecurityGroupsToAllNodeTypes().check();
      for (const securityGroup of securityGroups) {
        await createRosaWizardPage.selectAdditionalSecurityGroups(securityGroup);
      }
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Networking - CIDR Ranges - advanced options', async () => {
      await createRosaWizardPage.useCIDRDefaultValues(false);
      await expect(createRosaWizardPage.machineCIDRInput()).toHaveValue(
        clusterProperties.MachineCIDR,
      );
      await expect(createRosaWizardPage.serviceCIDRInput()).toHaveValue(
        clusterProperties.ServiceCIDR,
      );
      await expect(createRosaWizardPage.podCIDRInput()).toHaveValue(clusterProperties.PodCIDR);
      await expect(createRosaWizardPage.hostPrefixInput()).toHaveValue(
        `/${clusterProperties.HostPrefix}`,
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster roles and policies - advanced options', async () => {
      await createRosaWizardPage.selectRoleProviderMode('Auto');
      await expect(createRosaWizardPage.customOperatorPrefixInput()).toBeVisible();
      await expect(createRosaWizardPage.customOperatorPrefixInput()).toHaveValue(
        new RegExp(clusterName.substring(0, 27)),
      );
      await createRosaWizardPage.customOperatorPrefixInput().selectText();
      await createRosaWizardPage
        .customOperatorPrefixInput()
        .fill(`${clusterName.substring(0, 27)}${clusterSuffix}`);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster update - update strategies - advanced options', async () => {
      await createRosaWizardPage.selectUpdateStratergy(clusterProperties.UpdateStrategy);
      await createRosaWizardPage.selectGracePeriod(clusterProperties.NodeDrainingGracePeriod);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Cluster wizard revisit - Step - Accounts and roles', async () => {
      await createRosaWizardPage.clickEditStepOfSection('Accounts and roles');
      await createRosaWizardPage.isAccountsAndRolesScreen();
      await createRosaWizardPage.waitForARNList();
      await expect(createRosaWizardPage.supportRoleInput()).toHaveValue(
        `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-Support-Role`,
      );
      await expect(createRosaWizardPage.workerRoleInput()).toHaveValue(
        `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-Worker-Role`,
      );
      await expect(createRosaWizardPage.controlPlaneRoleInput()).toHaveValue(
        `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-ControlPlane-Role`,
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Cluster wizard revisit - Step - cluster details', async () => {
      await expect(createRosaWizardPage.clusterNameInput()).toHaveValue(clusterName);
      await expect(createRosaWizardPage.createCustomDomainPrefixCheckbox()).toBeChecked();
      await expect(createRosaWizardPage.domainPrefixInput()).toHaveValue(clusterDomainPrefix);
      await expect(createRosaWizardPage.multiZoneAvilabilityRadio()).toBeChecked();
      await createRosaWizardPage.advancedEncryptionLink().click();
      await expect(createRosaWizardPage.enableAdditionalEtcdEncryptionCheckbox()).toBeChecked();
      await expect(createRosaWizardPage.enableFIPSCryptographyCheckbox()).toBeChecked();
      await createRosaWizardPage.advancedEncryptionLink().click();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Cluster wizard revisit - Step - cluster details - machine pool', async () => {
      await expect(createRosaWizardPage.minimumNodeInput()).toHaveValue(
        clusterProperties.MachinePools[0].MinimumNodeCount,
      );
      await expect(createRosaWizardPage.maximumNodeInput()).toHaveValue(
        clusterProperties.MachinePools[0].MaximumNodeCount,
      );
      await expect(createRosaWizardPage.rootDiskSizeInput()).toHaveValue(
        clusterProperties.RootDiskSize,
      );
      await expect(createRosaWizardPage.useIMDSv2Radio()).toBeChecked();
      await createRosaWizardPage.isNodeLabelKeyAndValue(
        clusterProperties.MachinePools[0].NodeLabels[0].Key,
        clusterProperties.MachinePools[0].NodeLabels[0].Value,
        0,
      );
      await createRosaWizardPage.isNodeLabelKeyAndValue(
        clusterProperties.MachinePools[0].NodeLabels[1].Key,
        clusterProperties.MachinePools[0].NodeLabels[1].Value,
        1,
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Cluster wizard revisit - Step - Networking Configuration', async () => {
      await expect(createRosaWizardPage.clusterPrivacyPublicRadio()).toBeChecked();
      await expect(createRosaWizardPage.installIntoExistingVpcCheckbox()).toBeChecked();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Cluster wizard revisit - Step - Networking VPC settings', async () => {
      await createRosaWizardPage.isVPCSettingsScreen();
      await expect(
        sharedPage.locator(
          `text=Select a VPC to install your cluster into your selected region: ${region}`,
        ),
      ).toBeVisible();
      await expect(
        sharedPage.locator('text', { hasText: new RegExp(`^${qeInfrastructure.VPC_NAME}$`) }),
      ).toBeVisible();

      let i = 0;
      for (const zone of clusterProperties.MachinePools[0].AvailabilityZones) {
        await createRosaWizardPage.isSubnetAvailabilityZoneSelected(zone);
        await createRosaWizardPage.isPrivateSubnetSelected(
          i,
          qeInfrastructure.SUBNETS.ZONES[zone].PRIVATE_SUBNET_NAME,
        );
        await createRosaWizardPage.isPubliceSubnetSelected(
          i,
          qeInfrastructure.SUBNETS.ZONES[zone].PUBLIC_SUBNET_NAME,
        );
        i = i + 1;
      }

      for (const securityGroup of securityGroups) {
        await expect(sharedPage.locator('text', { hasText: securityGroup })).toBeVisible();
      }
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Cluster wizard revisit - Step - Networking CIDR settings', async () => {
      await expect(createRosaWizardPage.cidrDefaultValuesCheckBox()).not.toBeChecked();
      await expect(createRosaWizardPage.machineCIDRInput()).toHaveValue(
        clusterProperties.MachineCIDR,
      );
      await expect(createRosaWizardPage.serviceCIDRInput()).toHaveValue(
        clusterProperties.ServiceCIDR,
      );
      await expect(createRosaWizardPage.podCIDRInput()).toHaveValue(clusterProperties.PodCIDR);
      await expect(createRosaWizardPage.hostPrefixInput()).toHaveValue(
        clusterProperties.HostPrefix,
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Cluster wizard revisit - Step - Cluster roles and policies', async () => {
      await expect(createRosaWizardPage.createModeAutoRadio()).toBeChecked();
      await expect(createRosaWizardPage.customOperatorPrefixInput()).toHaveValue(
        `${clusterName.substring(0, 27)}${clusterSuffix}`,
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Cluster wizard revisit - Step - cluster update strategies', async () => {
      await expect(createRosaWizardPage.recurringUpdateRadio()).toBeChecked();
      await expect(createRosaWizardPage.individualUpdateRadio()).not.toBeChecked();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Review and create step - its definitions', async () => {
      // Some situation the ARN spinner in progress and blocks cluster creation.
      await expect(sharedPage.locator('.pf-v6-c-spinner')).not.toBeVisible({ timeout: 30000 });
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Control plane',
        clusterProperties.ControlPlaneType,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Availability',
        clusterProperties.Availability,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Domain prefix',
        clusterDomainPrefix,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'User workload monitoring',
        clusterProperties.UserWorkloadMonitoring,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Encrypt volumes with customer keys',
        'Disabled',
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Additional etcd encryption',
        clusterProperties.AdditionalEncryption,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'FIPS cryptography',
        clusterProperties.FIPSCryptography,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Node instance type',
        clusterProperties.MachinePools[0].InstanceType,
      );
      await expect(createRosaWizardPage.computeNodeRangeValue()).toContainText(
        `Minimum nodes per zone: ${clusterProperties.MachinePools[0].MinimumNodeCount}`,
      );
      await expect(createRosaWizardPage.computeNodeRangeValue()).toContainText(
        `Maximum nodes per zone: ${clusterProperties.MachinePools[0].MaximumNodeCount}`,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Autoscaling',
        clusterProperties.MachinePools[0].Autoscaling,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Install into existing VPC',
        clusterProperties.InstallIntoExistingVPC,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Instance Metadata Service (IMDS)',
        clusterProperties.InstanceMetadataService,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Worker root disk size',
        `${clusterProperties.RootDiskSize} GiB`,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Cluster privacy',
        clusterProperties.ClusterPrivacy,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Machine CIDR',
        clusterProperties.MachineCIDR,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Service CIDR',
        clusterProperties.ServiceCIDR,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Pod CIDR',
        clusterProperties.PodCIDR,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Host prefix',
        clusterProperties.HostPrefix,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Application ingress',
        'Use default settings',
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Operator roles and OIDC provider mode',
        'auto',
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Update strategy',
        clusterProperties.UpdateStrategy,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Node draining',
        clusterProperties.NodeDrainingGracePeriod,
      );
      await createRosaWizardPage.reviewAndCreateTree().click();
    });

    test('Create Rosa advanced cluster and check the installation progress', async () => {
      await createRosaWizardPage.createClusterButton().click();
      await clusterDetailsPage.waitForInstallerScreenToLoad();
      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
      await expect(sharedPage.locator('h2:has-text("Installing cluster")')).toBeVisible();
      await expect(sharedPage.locator('a:has-text("Download OC CLI")')).toBeVisible();
      await clusterDetailsPage.clusterDetailsPageRefresh();
      await clusterDetailsPage.checkInstallationStepStatus('Account setup');
      await clusterDetailsPage.checkInstallationStepStatus('OIDC and operator roles');
      await clusterDetailsPage.checkInstallationStepStatus('Network settings');
      await clusterDetailsPage.checkInstallationStepStatus('DNS setup');
      await clusterDetailsPage.checkInstallationStepStatus('Cluster installation');
      await expect(clusterDetailsPage.clusterTypeLabelValue()).toContainText(
        clusterProperties.Type,
      );
      await expect(clusterDetailsPage.clusterAvailabilityLabelValue()).toContainText(
        clusterProperties.Availability,
      );
      await expect(clusterDetailsPage.clusterDomainPrefixLabelValue()).toContainText(
        clusterDomainPrefix,
      );
      await expect(clusterDetailsPage.clusterControlPlaneTypeLabelValue()).toContainText(
        clusterProperties.ControlPlaneType,
      );
      await expect(clusterDetailsPage.clusterInfrastructureAWSaccountLabelValue()).toContainText(
        awsAccountID,
      );
      await expect(clusterDetailsPage.clusterFipsCryptographyStatus()).toContainText(
        'FIPS Cryptography enabled',
      );
      await expect(clusterDetailsPage.clusterIMDSValue()).toContainText(
        clusterProperties.InstanceMetadataService,
      );
      await expect(clusterDetailsPage.clusterAutoScalingStatus()).toContainText('Enabled');
      await expect(clusterDetailsPage.clusterAdditionalEncryptionStatus()).toContainText('Enabled');
      await expect(clusterDetailsPage.clusterMachineCIDRLabelValue()).toContainText(
        clusterProperties.MachineCIDR,
      );
      await expect(clusterDetailsPage.clusterServiceCIDRLabelValue()).toContainText(
        clusterProperties.ServiceCIDR,
      );
      await expect(clusterDetailsPage.clusterPodCIDRLabelValue()).toContainText(
        clusterProperties.PodCIDR,
      );
      await expect(clusterDetailsPage.clusterHostPrefixLabelValue()).toContainText('23');
    });

    test('Delete the advanced ROSA cluster', async () => {
      await clusterDetailsPage.actionsDropdownToggle().click();
      await clusterDetailsPage.deleteClusterDropdownItem().click();
      await clusterDetailsPage.deleteClusterNameInput().clear();
      await clusterDetailsPage.deleteClusterNameInput().fill(clusterName);
      await clusterDetailsPage.deleteClusterConfirm().click();
      await clusterDetailsPage.waitForDeleteClusterActionComplete();
    });
  },
);
