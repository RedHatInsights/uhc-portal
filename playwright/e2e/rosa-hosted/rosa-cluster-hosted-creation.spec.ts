import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ClusterDetailsPage } from '../../page-objects/cluster-details-page';
import { CreateRosaWizardPage } from '../../page-objects/create-rosa-wizard-page';
import { CreateClusterPage } from '../../page-objects/create-cluster-page';
import { OverviewPage } from '../../page-objects/overview-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

// Import cluster properties JSON
const clusterProperties = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-creation.spec.json');

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterDetailsPage: ClusterDetailsPage;
let createRosaWizardPage: CreateRosaWizardPage;
let createClusterPage: CreateClusterPage;
let overviewPage: OverviewPage;

test.describe.serial(
  'Rosa hosted cluster (hypershift) - wizard checks and cluster creation tests (OCP-57641)',
  { tag: ['@smoke', '@hcp'] },
  () => {
    // Setup cluster name and environment variables
    const region = clusterProperties.Region.split(',')[0];
    const awsAccountID = process.env.QE_AWS_ID || '';
    const awsBillingAccountID = process.env.QE_AWS_BILLING_ID || '';
    let qeInfrastructure: any = {};

    try {
      qeInfrastructure = JSON.parse(process.env.QE_INFRA_REGIONS || '{}')[region]?.[0] || {};
    } catch (error) {
      console.warn('Failed to parse QE_INFRA_REGIONS environment variable:', error);
    }

    const rolePrefix = process.env.QE_ACCOUNT_ROLE_PREFIX || '';
    const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-HCP-ROSA-Installer-Role`;
    const clusterName = `smoke-playwright-rosa-hypershift-${Math.random().toString(36).substring(7)}`;

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

    test('Open Rosa cluster wizard', async () => {
      await createRosaWizardPage.rosaCreateClusterButton().click();
      await createRosaWizardPage.rosaClusterWithWeb().click();
      await createRosaWizardPage.isCreateRosaPage();
      await expect(sharedPage.locator('.spinner-loading-text')).not.toBeVisible();
    });

    test('Step - Control plane - Select control plane type', async () => {
      await createRosaWizardPage.isControlPlaneTypeScreen();
      await createRosaWizardPage.selectHostedControlPlaneType();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Accounts and roles - Select Account roles, ARN definitions', async () => {
      await createRosaWizardPage.isAccountsAndRolesScreen();
      await createRosaWizardPage.selectAWSInfrastructureAccount(awsAccountID);
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.selectAWSBillingAccount(awsBillingAccountID);
      await createRosaWizardPage.selectInstallerRole(installerARN);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Select Cluster name, version, regions', async () => {
      await createRosaWizardPage.isClusterDetailsScreen();
      await createRosaWizardPage.selectRegion(clusterProperties.Region);
      await createRosaWizardPage.setClusterName(clusterName);
      await createRosaWizardPage.closePopoverDialogs();
      await createRosaWizardPage.createCustomDomainPrefixCheckbox().check();
      await createRosaWizardPage.setDomainPrefix(clusterProperties.DomainPrefix);
      await createRosaWizardPage.closePopoverDialogs();
      await sharedPage.waitForTimeout(2000); // Small delay for UI stability
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Select machine pool node type and node count', async () => {
      await createRosaWizardPage.isClusterMachinepoolsScreen(true);
      await expect(
        sharedPage.locator(
          `text=Select a VPC to install your machine pools into your selected region: ${region}`,
        ),
      ).toBeVisible();
      await createRosaWizardPage.waitForVPCList();
      await createRosaWizardPage.selectVPC(qeInfrastructure.VPC_NAME);
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools[0].AvailabilityZones]
          .PRIVATE_SUBNET_NAME,
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

    test('Step - Cluster Settings - configuration - Select cluster privacy', async () => {
      await expect(createRosaWizardPage.clusterPrivacyPublicRadio()).toBeChecked();
      await expect(createRosaWizardPage.clusterPrivacyPrivateRadio()).not.toBeChecked();
      await createRosaWizardPage.selectClusterPrivacy('private');
      await createRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await createRosaWizardPage.selectMachinePoolPublicSubnet(
        qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools[0].AvailabilityZones]
          .PUBLIC_SUBNET_NAME,
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - CIDR Ranges - CIDR default values', async () => {
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

    test('Step - Cluster roles and policies - role provider mode and its definitions', async () => {
      await createRosaWizardPage.selectOidcConfigId(clusterProperties.OidcConfigId);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster update - update strategies and its definitions', async () => {
      await expect(createRosaWizardPage.individualUpdateRadio()).not.toBeChecked();
      await expect(createRosaWizardPage.recurringUpdateRadio()).toBeChecked();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Review and create : Accounts and roles definitions', async () => {
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

    test('Step - Review and create : Cluster Settings definitions', async () => {
      await createRosaWizardPage.isClusterPropertyMatchesValue('Cluster name', clusterName);
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Domain prefix',
        clusterProperties.DomainPrefix,
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
        'Additional etcd encryption',
        clusterProperties.AdditionalEncryption,
      );
    });

    test('Step - Review and create : Machine pool definitions', async () => {
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

    test('Step - Review and create : Networking definitions', async () => {
      await createRosaWizardPage.isClusterPropertyMatchesValue('Cluster privacy', 'Public');
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Public subnet',
        qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools[0].AvailabilityZones]
          .PUBLIC_SUBNET_NAME,
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

    test('Step - Review and create : cluster roles and update definitions', async () => {
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'OIDC Configuration Type',
        clusterProperties.OidcConfigType,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'OIDC Configuration ID',
        clusterProperties.OidcConfigId,
      );
    });

    test('Create cluster and check the installation progress', async () => {
      await sharedPage.waitForTimeout(2000); // Small delay for UI stability
      await createRosaWizardPage.createClusterButton().click({ force: true });
      await clusterDetailsPage.waitForInstallerScreenToLoad();
      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
      await expect(sharedPage.locator('h2:has-text("Installing cluster")')).toBeVisible();
      await expect(sharedPage.locator('a:has-text("Download OC CLI")')).toBeVisible();
      await expect(
        sharedPage.locator('text=Cluster creation usually takes 10 minutes to complete'),
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
        clusterProperties.DomainPrefix,
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
      await expect(clusterDetailsPage.clusterBillingMarketplaceAccountLabelValue()).toContainText(
        awsBillingAccountID,
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

    test('Delete the cluster', async () => {
      await clusterDetailsPage.actionsDropdownToggle().click();
      await clusterDetailsPage.deleteClusterDropdownItem().click();
      await clusterDetailsPage.deleteClusterNameInput().clear();
      await clusterDetailsPage.deleteClusterNameInput().fill(clusterName);
      await clusterDetailsPage.deleteClusterConfirm().click();
      await clusterDetailsPage.waitForDeleteClusterActionComplete();
      await sharedPage.waitForTimeout(2000); // Small delay for UI stability
    });
  },
);
