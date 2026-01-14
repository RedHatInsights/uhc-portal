import { test, expect } from '../../fixtures/pages';

// Import cluster properties JSON
const clusterProfiles = require('../../fixtures/rosa/rosa-cluster-classic-creation.spec.json');
const clusterProperties = clusterProfiles['rosa-classic-smoke-default'];

test.describe.serial(
  'Rosa cluster wizard checks and cluster creation tests (OCP-50261)',
  { tag: ['@smoke', '@rosa', '@rosa-classic'] },
  () => {
    // awsAccountID, rolePrefix and installerARN are set by prerun script for smoke requirements.
    const awsAccountID = process.env.QE_AWS_ID || '';
    const rolePrefix = process.env.QE_ACCOUNT_ROLE_PREFIX || '';
    const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-Installer-Role`;
    const clusterName = `${clusterProperties.ClusterNamePrefix}-${Math.random().toString(36).substring(7)}`;
    const clusterDomainPrefix = `rosa${Math.random().toString(36).substring(2, 13)}`;

    test.beforeAll(async ({ navigateTo, createClusterPage }) => {
      // Navigate to create page
      await navigateTo('create');
      // Navigate to create cluster page
      await createClusterPage.isCreateClusterPageHeaderVisible();
    });
    test('Open Rosa cluster wizard', async ({ page, createRosaWizardPage }) => {
      await createRosaWizardPage.waitAndClick(createRosaWizardPage.rosaCreateClusterButton());
      await expect(createRosaWizardPage.rosaClusterWithWeb()).toBeVisible();
      await createRosaWizardPage.rosaClusterWithWeb().click();
      await createRosaWizardPage.isCreateRosaPage();
      await expect(page.locator('.spinner-loading-text')).not.toBeVisible();
    });

    test('Step - Control plane - Select control plane type', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.isControlPlaneTypeScreen();
      await createRosaWizardPage.selectStandaloneControlPlaneTypeOption().click();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Accounts and roles - Select Account roles, ARN definitions', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isAccountsAndRolesScreen();
      await createRosaWizardPage.howToAssociateNewAWSAccountButton().click();
      await createRosaWizardPage.isAssociateAccountsDrawer();
      await createRosaWizardPage.howToAssociateNewAWSAccountDrawerCloseButton().click();
      await createRosaWizardPage.selectAWSInfrastructureAccount(awsAccountID);
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.selectInstallerRole(installerARN);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Select Cluster name, version, regions', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterDetailsScreen();
      await createRosaWizardPage.setClusterName(clusterName);
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.createCustomDomainPrefixCheckbox().check();
      await createRosaWizardPage.setDomainPrefix(clusterDomainPrefix);
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.selectRegion(clusterProperties.Region);
      await createRosaWizardPage.selectVersion(
        clusterProperties.Version || process.env.VERSION || '',
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Select machine pool node type and node count', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterMachinepoolsScreen();
      await createRosaWizardPage.selectComputeNodeType(
        clusterProperties.MachinePools[0].InstanceType,
      );
      await createRosaWizardPage.enableAutoScaling();
      await createRosaWizardPage.disabledAutoScaling();
      await createRosaWizardPage.selectComputeNodeCount(
        clusterProperties.MachinePools[0].ComputeNodeCount,
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - configuration - Select cluster privacy', async ({
      createRosaWizardPage,
    }) => {
      await expect(createRosaWizardPage.clusterPrivacyPublicRadio()).toBeChecked();
      await expect(createRosaWizardPage.clusterPrivacyPrivateRadio()).not.toBeChecked();
      await createRosaWizardPage.selectClusterPrivacy('private');
      await createRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - CIDR Ranges - CIDR default values', async ({
      createRosaWizardPage,
    }) => {
      await expect(createRosaWizardPage.cidrDefaultValuesCheckBox()).toBeChecked();
      await createRosaWizardPage.useCIDRDefaultValues(false);
      await createRosaWizardPage.useCIDRDefaultValues(true);
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

    test('Step - Cluster roles and policies - role provider mode and its definitions', async ({
      createRosaWizardPage,
    }) => {
      await expect(createRosaWizardPage.createModeAutoRadio()).toBeChecked();
      await expect(createRosaWizardPage.createModeManualRadio()).not.toBeChecked();
      await createRosaWizardPage.selectRoleProviderMode('Manual');
      await createRosaWizardPage.selectRoleProviderMode('Auto');
      await expect(createRosaWizardPage.customOperatorPrefixInput()).toBeVisible();
      await expect(createRosaWizardPage.customOperatorPrefixInput()).toHaveValue(
        new RegExp(clusterName.slice(0, 27)),
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster update - update strategies and its definitions', async ({
      createRosaWizardPage,
    }) => {
      await expect(createRosaWizardPage.individualUpdateRadio()).toBeChecked();
      await expect(createRosaWizardPage.recurringUpdateRadio()).not.toBeChecked();
      await createRosaWizardPage.selectUpdateStratergy(clusterProperties.UpdateStrategy);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Review and create : Accounts and roles definitions', async ({
      page,
      createRosaWizardPage,
    }) => {
      await expect(page.getByTestId('Control-plane')).toHaveText('Classic architecture');
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'AWS infrastructure account ID',
        awsAccountID,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue('Installer role', installerARN);
    });

    test('Step - Review and create : Cluster Settings definitions', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterPropertyMatchesValue('Cluster name', clusterName);
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Domain prefix',
        clusterDomainPrefix,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Region',
        clusterProperties.Region.split(',')[0],
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Availability',
        clusterProperties.Availability,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Encrypt volumes with customer keys',
        clusterProperties.EncryptVolumesWithCustomerKeys,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'User workload monitoring',
        clusterProperties.UserWorkloadMonitoring,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Additional etcd encryption',
        clusterProperties.AdditionalEncryption,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'FIPS cryptography',
        clusterProperties.FIPSCryptography,
      );
    });

    test('Step - Review and create : Machine pool definitions', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Node instance type',
        clusterProperties.MachinePools[0].InstanceType,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Autoscaling',
        clusterProperties.MachinePools[0].Autoscaling,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Compute node count',
        clusterProperties.MachinePools[0].ComputeNodeCount,
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
    });

    test('Step - Review and create : Networking definitions', async ({ createRosaWizardPage }) => {
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
        clusterProperties.ApplicationIngress,
      );
    });

    test('Step - Review and create : cluster roles and update definitions', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Operator roles and OIDC provider mode',
        clusterProperties.OidcProviderMode,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Update strategy',
        clusterProperties.UpdateStrategy,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Node draining',
        clusterProperties.NodeDrainingGracePeriod,
      );
    });

    test('Create cluster and check the installation progress', async ({
      page,
      createRosaWizardPage,
      clusterDetailsPage,
    }) => {
      await page.waitForTimeout(2000); // Small delay for UI stability
      await createRosaWizardPage.createClusterButton().click();
      await clusterDetailsPage.waitForInstallerScreenToLoad();
      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
      await expect(page.locator('h2:has-text("Installing cluster")')).toBeVisible();
      await expect(page.locator('a:has-text("Download OC CLI")')).toBeVisible();
      await clusterDetailsPage.clusterDetailsPageRefresh();
      await clusterDetailsPage.checkInstallationStepStatus('Account setup');
      await clusterDetailsPage.checkInstallationStepStatus('OIDC and operator roles');
      await clusterDetailsPage.checkInstallationStepStatus('DNS setup');
      await clusterDetailsPage.checkInstallationStepStatus('Cluster installation');
      await expect(clusterDetailsPage.clusterTypeLabelValue()).toContainText(
        clusterProperties.Type,
      );
      await expect(clusterDetailsPage.clusterDomainPrefixLabelValue()).toContainText(
        clusterDomainPrefix,
      );
      await expect(clusterDetailsPage.clusterControlPlaneTypeLabelValue()).toContainText(
        clusterProperties.ControlPlaneType,
      );
      await expect(clusterDetailsPage.clusterRegionLabelValue()).toContainText(
        clusterProperties.Region.split(',')[0],
      );
      await expect(clusterDetailsPage.clusterAvailabilityLabelValue()).toContainText(
        clusterProperties.Availability,
      );
      await expect(clusterDetailsPage.clusterInfrastructureAWSaccountLabelValue()).toContainText(
        awsAccountID,
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
      await expect(clusterDetailsPage.clusterHostPrefixLabelValue()).toContainText('23');
    });

    test('Delete the cluster', async ({ page, clusterDetailsPage }) => {
      await clusterDetailsPage.actionsDropdownToggle().click();
      await clusterDetailsPage.deleteClusterDropdownItem().click();
      await clusterDetailsPage.deleteClusterNameInput().clear();
      await clusterDetailsPage.deleteClusterNameInput().fill(clusterName);
      await clusterDetailsPage.deleteClusterConfirm().click();
      await clusterDetailsPage.waitForDeleteClusterActionComplete();
    });
  },
);
