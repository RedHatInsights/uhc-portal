import { test, expect } from '../../fixtures/pages';

// Import cluster properties JSON
const clusterProperties = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-creation.spec.json');

test.describe.serial(
  'Rosa hosted cluster (hypershift) - wizard checks and cluster creation tests (OCP-57641)',
  { tag: ['@smoke', '@rosa-hosted', '@rosa'] },
  () => {
    // Setup cluster name and environment variables
    const region = process.env.QE_AWS_REGION || clusterProperties.Region.split(',')[0];
    const awsAccountID = process.env.QE_AWS_ID || '';
    const awsBillingAccountID = process.env.QE_AWS_BILLING_ID || '';
    let qeInfrastructure: any = {};

    try {
      qeInfrastructure = JSON.parse(process.env.QE_INFRA_REGIONS || '{}')[region]?.[0] || {};
    } catch (error) {
      console.warn('Failed to parse QE_INFRA_REGIONS environment variable:', error);
    }

    const rolePrefix = process.env.QE_ACCOUNT_ROLE_PREFIX || '';
    const awsKMSKey = process.env.QE_AWS_KMS_KEY;
    const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-HCP-ROSA-Installer-Role`;
    const oidcConfigId = process.env.QE_OIDC_CONFIG_ID ?? clusterProperties.OidcConfigId;
    const clusterName = `smoke-playwright-rosa-hypershift-${Math.random().toString(36).substring(7)}`;
    const clusterDomainPrefix = `rosa${Math.random().toString(36).substring(2, 13)}`;
    const availabilityZone =
      Object.keys(qeInfrastructure.SUBNETS?.ZONES || {})[0] ||
      clusterProperties.MachinePools[0].AvailabilityZones;

    test.beforeAll(async ({ navigateTo }) => {
      // Navigate to create
      await navigateTo('create');
    });
    test('Open Rosa cluster wizard', async ({ page, createRosaWizardPage }) => {
      await createRosaWizardPage.waitAndClick(createRosaWizardPage.rosaCreateClusterButton());
      await createRosaWizardPage.rosaClusterWithWeb().click();
      await createRosaWizardPage.isCreateRosaPage();
      await expect(page.locator('.spinner-loading-text')).not.toBeVisible();
    });

    test('Step - Control plane - Select control plane type', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.isControlPlaneTypeScreen();
      await createRosaWizardPage.selectHostedControlPlaneType();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Accounts and roles - Select Account roles, ARN definitions', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isAccountsAndRolesScreen();
      await createRosaWizardPage.selectAWSInfrastructureAccount(awsAccountID);
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.selectAWSBillingAccount(awsBillingAccountID);
      await createRosaWizardPage.selectInstallerRole(installerARN);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Select Cluster name, version, regions', async ({
      page,
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterDetailsScreen();
      await createRosaWizardPage.selectRegion(region);
      await createRosaWizardPage.setClusterName(clusterName);
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.createCustomDomainPrefixCheckbox().check();
      await createRosaWizardPage.setDomainPrefix(clusterDomainPrefix);
      await createRosaWizardPage.selectVersion(
        clusterProperties.Version || process.env.VERSION || '',
      );
      await createRosaWizardPage.closePopoverDialogs();
      await page.waitForTimeout(2000); // Small delay for UI stability
      await createRosaWizardPage.advancedEncryptionLink().click();
      await createRosaWizardPage.enableFIPSCryptographyCheckbox().check();
      await expect(createRosaWizardPage.enableEncyptEtcdWithCustomKMSKeyCheckbox()).toBeChecked();
      await createRosaWizardPage.inputEncryptEtcdKeyARN(awsKMSKey);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Select machine pool node type and node count', async ({
      page,
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterMachinepoolsScreen(true);
      await expect(
        page.locator(
          `text=Select a VPC to install your machine pools into your selected region: ${region}`,
        ),
      ).toBeVisible();
      await createRosaWizardPage.waitForVPCList();
      await createRosaWizardPage.selectVPC(qeInfrastructure.VPC_NAME);
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[availabilityZone].PRIVATE_SUBNET_NAME,
        1,
      );
      await createRosaWizardPage.selectComputeNodeType(
        clusterProperties.MachinePools[0].InstanceType,
      );
      await createRosaWizardPage.enableAutoScaling();
      await createRosaWizardPage.disabledAutoScaling();
      await createRosaWizardPage.selectComputeNodeCount(
        clusterProperties.MachinePools[0].NodeCount,
      );
      await expect(createRosaWizardPage.useBothIMDSv1AndIMDSv2Radio()).toBeChecked();
      await createRosaWizardPage.useIMDSv2Radio().check();
      await expect(createRosaWizardPage.rootDiskSizeInput()).toHaveValue('300');
      await createRosaWizardPage.rootDiskSizeInput().clear();
      await createRosaWizardPage.rootDiskSizeInput().selectText();
      await createRosaWizardPage
        .rootDiskSizeInput()
        .fill(clusterProperties.MachinePools[0].RootDiskSize);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - configuration - Select cluster privacy', async ({
      createRosaWizardPage,
    }) => {
      await expect(createRosaWizardPage.clusterPrivacyPublicRadio()).toBeChecked();
      await expect(createRosaWizardPage.clusterPrivacyPrivateRadio()).not.toBeChecked();
      await createRosaWizardPage.selectClusterPrivacy('private');
      await createRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await createRosaWizardPage.selectMachinePoolPublicSubnet(
        qeInfrastructure.SUBNETS.ZONES[availabilityZone].PUBLIC_SUBNET_NAME,
      );
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
        clusterProperties.HostPrefix,
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster roles and policies - role provider mode and its definitions', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.selectOidcConfigId(oidcConfigId);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster update - update strategies and its definitions', async ({
      createRosaWizardPage,
    }) => {
      await expect(createRosaWizardPage.individualUpdateRadio()).not.toBeChecked();
      await expect(createRosaWizardPage.recurringUpdateRadio()).toBeChecked();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Review and create : Accounts and roles definitions', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Control plane',
        clusterProperties.ControlPlaneType,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'AWS infrastructure account ID',
        awsAccountID,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'AWS billing account ID',
        awsBillingAccountID,
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
      await createRosaWizardPage.isClusterPropertyMatchesValue('Region', region);
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Availability',
        clusterProperties.Availability,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Encrypt volumes with customer keys',
        clusterProperties.EncryptVolumesWithCustomerKeys,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'FIPS cryptography',
        clusterProperties.FIPSCryptography,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Additional etcd encryption',
        clusterProperties.AdditionalEncryption,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Etcd encryption key ARN',
        awsKMSKey,
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
        clusterProperties.MachinePools[0].NodeCount,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Worker root disk size',
        `${clusterProperties.MachinePools[0].RootDiskSize} GiB`,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Install to selected VPC',
        qeInfrastructure.VPC_NAME,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Instance Metadata Service (IMDS)',
        clusterProperties.InstanceMetadataService,
      );
    });

    test('Step - Review and create : Networking definitions', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.isClusterPropertyMatchesValue('Cluster privacy', 'Public');
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Public subnet',
        qeInfrastructure.SUBNETS.ZONES[availabilityZone].PUBLIC_SUBNET_NAME,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Cluster-wide proxy',
        clusterProperties.ClusterWideProxy,
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
    });

    test('Step - Review and create : cluster roles and update definitions', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'OIDC Configuration Type',
        clusterProperties.OidcConfigType,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'OIDC Configuration ID',
        oidcConfigId,
      );
    });

    test('Create cluster and check the installation progress', async ({
      page,
      createRosaWizardPage,
      clusterDetailsPage,
    }) => {
      await page.waitForTimeout(2000); // Small delay for UI stability
      await createRosaWizardPage.createClusterButton().click({ force: true });
      await clusterDetailsPage.waitForInstallerScreenToLoad();
      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
      await expect(page.locator('h2:has-text("Installing cluster")')).toBeVisible();
      await expect(page.locator('a:has-text("Download OC CLI")')).toBeVisible();
      await expect(
        page.locator('text=Cluster creation usually takes 10 minutes to complete'),
      ).toBeVisible();
      await clusterDetailsPage.clusterDetailsPageRefresh();
      await clusterDetailsPage.checkInstallationStepStatus('Account setup');
      await clusterDetailsPage.checkInstallationStepStatus('OIDC and operator roles');
      await clusterDetailsPage.checkInstallationStepStatus('Network settings');
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
      await expect(clusterDetailsPage.clusterRegionLabelValue()).toContainText(region);
      await expect(clusterDetailsPage.clusterAvailabilityLabelValue()).toContainText(
        clusterProperties.Availability,
      );
      await expect(clusterDetailsPage.clusterInfrastructureAWSaccountLabelValue()).toContainText(
        awsAccountID,
      );

      await expect(clusterDetailsPage.clusterFipsCryptographyStatus()).toContainText(
        'FIPS Cryptography enabled',
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
