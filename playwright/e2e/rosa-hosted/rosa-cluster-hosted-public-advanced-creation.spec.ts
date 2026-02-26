import { test, expect } from '../../fixtures/pages';

// Import cluster properties JSON
const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const clusterProperties = clusterProfiles['rosa-hosted-public-advanced']['day1-profile'];

test.describe.serial(
  'Rosa hosted cluster (hypershift) - create public advanced cluster with properties',
  { tag: ['@day1', '@hcp', '@rosa-hosted', '@public', '@hosted', '@advanced'] },
  () => {
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
    const clusterName = clusterProperties.ClusterName;
    const oidcConfigId = process.env.QE_OIDC_CONFIG_ID ?? clusterProperties.OidcConfigId;

    test.beforeAll(async ({ navigateTo }) => {
      // Initial navigation using navigateTo
      await navigateTo('create');
    });

    test(`Open Rosa wizard for public advanced cluster : ${clusterName}`, async ({
      page,
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.waitAndClick(createRosaWizardPage.rosaCreateClusterButton());
      await createRosaWizardPage.rosaClusterWithWeb().click();
      await createRosaWizardPage.isCreateRosaPage();
      await expect(page.locator('.spinner-loading-text')).not.toBeVisible();
    });

    test(`Step - Control plane - Select control plane type ${clusterName}`, async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.selectHostedControlPlaneType();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test(`Step - Accounts and roles - Select Accounts and roles for ${clusterName}`, async ({
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

    test(`Step - Cluster Settings - Set cluster details for ${clusterName}`, async ({
      createRosaWizardPage,
      page,
    }) => {
      await createRosaWizardPage.isClusterDetailsScreen();
      await createRosaWizardPage.selectRegion(clusterProperties.Region);
      await createRosaWizardPage.setClusterName(clusterName);
      await createRosaWizardPage.createCustomDomainPrefixCheckbox().check();
      await createRosaWizardPage.setDomainPrefix(clusterProperties.DomainPrefix);
      await createRosaWizardPage.selectVersion(
        clusterProperties.Version || process.env.VERSION || '',
      );
      await createRosaWizardPage.closePopoverAndNavigateNext();
    });

    test(`Step - Cluster Settings - Set machine pools for ${clusterName}`, async ({
      page,
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterMachinepoolsScreen(true);
      await createRosaWizardPage.waitForVPCList();
      await createRosaWizardPage.selectVPC(qeInfrastructure.VPC_NAME);

      for (let i = 1; i <= clusterProperties.MachinePools.MachinePoolCount; i++) {
        await createRosaWizardPage.selectMachinePoolPrivateSubnet(
          qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools.AvailabilityZones[i - 1]]
            .PRIVATE_SUBNET_NAME,
          i,
        );
        if (i < clusterProperties.MachinePools.MachinePoolCount) {
          await createRosaWizardPage.addMachinePoolLink().click();
        }
      }
      await createRosaWizardPage.selectComputeNodeType(clusterProperties.MachinePools.InstanceType);

      if (clusterProperties.ClusterAutoscaling.includes('Enabled')) {
        await createRosaWizardPage.enableAutoScaling();
        await createRosaWizardPage.setMinimumNodeCount(
          clusterProperties.MachinePools.MiniNodeCount,
        );
        await createRosaWizardPage.setMaximumNodeCount(clusterProperties.MachinePools.MaxNodeCount);
      } else {
        await createRosaWizardPage.disabledAutoScaling();
        await createRosaWizardPage.selectComputeNodeCount(clusterProperties.MachinePools.NodeCount);
      }

      if (clusterProperties.InstanceMetadataService.includes('IMDSv1')) {
        await createRosaWizardPage.useBothIMDSv1AndIMDSv2Radio().check();
      } else {
        await createRosaWizardPage.useIMDSv2Radio().check();
      }
      await createRosaWizardPage.rosaNextButton().click();
    });

    test(`Step - Cluster Settings - configuration - cluster privacy for ${clusterName}`, async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.selectClusterPrivacy('Private');
      await createRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      if (clusterProperties.ClusterPrivacy.includes('Public')) {
        await createRosaWizardPage.selectMachinePoolPublicSubnet(
          qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools.PublicSubnetZone]
            .PUBLIC_SUBNET_NAME,
        );
      }
      if (clusterProperties.ClusterWideProxy.includes('Enabled')) {
        await createRosaWizardPage.enableConfigureClusterWideProxy();
      }
      await createRosaWizardPage.rosaNextButton().click();
    });

    test(`Step - Cluster Settings - CIDR Ranges - CIDR default values for ${clusterName}`, async ({
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
      customCommands,
    }) => {
      await createRosaWizardPage.selectOidcConfigId(oidcConfigId);
      const operatorRoleCmd = await createRosaWizardPage.operatorRoleCommandInput().inputValue();
      await customCommands.executeRosaCmd(`${operatorRoleCmd} --mode auto`);
      await customCommands.executeRosaCmd(
        `rosa create oidc-provider --oidc-config-id "${oidcConfigId}" --mode auto -y`,
      );
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster update - update strategies and its definitions', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isUpdatesScreen();
      if (clusterProperties.UpdateStrategy.includes('Recurring')) {
        await createRosaWizardPage.recurringUpdateRadio().check({ force: true });
      } else {
        await createRosaWizardPage.individualUpdateRadio().check({ force: true });
      }
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

    test('Step - Review and create : Machine pool definitions', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Node instance type',
        clusterProperties.MachinePools.InstanceType,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Autoscaling',
        clusterProperties.MachinePools.Autoscaling,
      );
      if (clusterProperties.ClusterAutoscaling.includes('Enabled')) {
        await expect(createRosaWizardPage.computeNodeRangeLabelValue()).toContainText(
          `Minimum nodes per machine pool: ${clusterProperties.MachinePools.MiniNodeCount}`,
        );
        await expect(createRosaWizardPage.computeNodeRangeLabelValue()).toContainText(
          `Maximum nodes per machine pool: ${clusterProperties.MachinePools.MaxNodeCount}`,
        );
      } else {
        await createRosaWizardPage.isClusterPropertyMatchesValue(
          'Compute node count',
          (
            parseInt(clusterProperties.MachinePools.NodeCount) *
            clusterProperties.MachinePools.MachinePoolCount
          ).toString(),
        );
      }
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Install to selected VPC',
        qeInfrastructure.VPC_NAME,
      );

      for (let i = 1; i <= clusterProperties.MachinePools.MachinePoolCount; i++) {
        const zone = clusterProperties.MachinePools.AvailabilityZones[i - 1];
        const subnetName = qeInfrastructure.SUBNETS.ZONES[zone].PRIVATE_SUBNET_NAME;
        await expect(createRosaWizardPage.machinePoolLabelValue()).toContainText(zone);
        await expect(createRosaWizardPage.machinePoolLabelValue()).toContainText(subnetName);
      }

      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Instance Metadata Service (IMDS)',
        clusterProperties.InstanceMetadataService,
      );
    });

    test('Step - Review and create : Networking definitions', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Cluster privacy',
        clusterProperties.ClusterPrivacy,
      );
      if (clusterProperties.ClusterPrivacy.includes('Public')) {
        await createRosaWizardPage.isClusterPropertyMatchesValue(
          'Public subnet',
          qeInfrastructure.SUBNETS.ZONES[clusterProperties.MachinePools.AvailabilityZones[0]]
            .PUBLIC_SUBNET_NAME,
        );
      } else {
        await createRosaWizardPage.isClusterPropertyMatchesValue('PrivateLink', 'Enabled');
      }
      if (clusterProperties.ClusterWideProxy.includes('Enabled')) {
        await createRosaWizardPage.isClusterPropertyMatchesValue(
          'Cluster-wide proxy',
          clusterProperties.ClusterWideProxy,
        );
        await createRosaWizardPage.isClusterPropertyMatchesValue(
          'HTTP proxy URL',
          clusterProperties.ClusterProxy.HttpProxy,
        );
        await createRosaWizardPage.isClusterPropertyMatchesValue(
          'HTTPS proxy URL',
          clusterProperties.ClusterProxy.HttpsProxy,
        );
        await expect(createRosaWizardPage.noProxyDomainsLabelValue()).toContainText(
          clusterProperties.ClusterProxy.NoProxyDomains.split(',')[0],
        );
        await expect(createRosaWizardPage.noProxyDomainsLabelValue()).toContainText(
          clusterProperties.ClusterProxy.NoProxyDomains.split(',')[1],
        );
      }
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
      createRosaWizardPage,
      clusterDetailsPage,
      page,
    }) => {
      // Wait for the review screen to be fully loaded (role API calls to complete)
      await createRosaWizardPage.waitForReviewScreenReady();
      await createRosaWizardPage.createClusterButton().click();
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
    });
  },
);
