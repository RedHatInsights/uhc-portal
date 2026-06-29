import { test, expect } from '../../fixtures/pages';

const clusterProfiles = require('../../fixtures/rosa/rosa-cluster-classic-public-creation-advanced.spec.json');
const clusterProperties = clusterProfiles['rosa-classic-public-advanced'];

test.describe.serial(
  'ROSA cluster creation multizone public advanced settings',
  { tag: ['@day1', '@rosa', '@rosa-classic', '@public', '@multi-zone', '@advanced'] },
  () => {
    const region = process.env.QE_AWS_REGION || clusterProperties.Region.split(',')[0];
    const version = process.env.VERSION || clusterProperties.Version || '';
    const awsAccountID = process.env.QE_AWS_ID || '';
    const rolePrefix = process.env.QE_ACCOUNT_ROLE_PREFIX || '';
    const qeInfrastructure = JSON.parse(process.env.QE_INFRA_REGIONS || '{}')[region]?.[0];
    const availabilityZones = Object.keys(qeInfrastructure?.SUBNETS?.ZONES || {});
    const zoneCount = availabilityZones.length;
    const securityGroups = qeInfrastructure?.SECURITY_GROUPS_NAME || [];
    const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-Installer-Role`;
    const clusterSuffix = Math.random().toString(36).slice(3, 7);
    const clusterName = `${clusterProperties.ClusterNamePrefix}-${clusterSuffix}`;
    const clusterDomainPrefix = `rosa${Math.random().toString(36).substring(2, 13)}`;

    test.beforeAll(async ({ navigateTo }) => {
      await navigateTo('create');
    });

    test('Open Rosa cluster wizard with advanced settings', async ({
      page,
      createRosaWizardPage,
    }) => {
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
      await createRosaWizardPage.selectAWSInfrastructureAccount(awsAccountID);
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.refreshInfrastructureAWSAccountButton().click();
      await createRosaWizardPage.waitForARNList();
      await createRosaWizardPage.selectInstallerRole(installerARN);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - Select advanced options', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.isClusterDetailsScreen();
      await createRosaWizardPage.setClusterName(clusterName);
      await createRosaWizardPage.createCustomDomainPrefixCheckbox().check();
      await createRosaWizardPage.setDomainPrefix(clusterDomainPrefix);
      await createRosaWizardPage.selectRegion(clusterProperties.Region);
      await createRosaWizardPage.selectVersion(version);
      await createRosaWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      await createRosaWizardPage.advancedEncryptionLink().click();
      await createRosaWizardPage.enableAdditionalEtcdEncryptionCheckbox().check();
      await createRosaWizardPage.enableFIPSCryptographyCheckbox().check();
      await createRosaWizardPage.advancedEncryptionLink().click();
      await createRosaWizardPage.closePopoverAndNavigateNext();
    });

    test('Step - Cluster Settings - machine pool - Select advanced options', async ({
      page,
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.isClusterMachinepoolsScreen();
      await createRosaWizardPage.selectComputeNodeType(
        clusterProperties.MachinePools[0].InstanceType,
      );
      await createRosaWizardPage.enableAutoScaling();
      const minimumNodeCount = Number(clusterProperties.MachinePools[0].MinimumNodeCount);
      const maximumNodeCount = Number(clusterProperties.MachinePools[0].MaximumNodeCount);
      await createRosaWizardPage.setMinimumNodeCount(
        clusterProperties.MachinePools[0].MinimumNodeCount,
      );
      await expect(
        page.getByText(`x ${zoneCount} zones = ${minimumNodeCount * zoneCount}`),
      ).toBeVisible();
      await createRosaWizardPage.setMaximumNodeCount(
        clusterProperties.MachinePools[0].MaximumNodeCount,
      );
      await expect(
        page.getByText(`x ${zoneCount} zones = ${maximumNodeCount * zoneCount}`),
      ).toBeVisible();
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
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Networking - Configuration settings', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.selectClusterPrivacy('private');
      await createRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await createRosaWizardPage.enableInstallIntoExistingVpc();
      if (clusterProperties.ApplicationIngress.includes('Custom settings')) {
        await createRosaWizardPage.applicationIngressCustomSettingsRadio().check();
        await createRosaWizardPage
          .applicationIngressExcludedNamespacesInput()
          .fill(clusterProperties.ExcludedNamespaces);
        await createRosaWizardPage
          .applicationIngressRouterSelectorsInput()
          .fill(clusterProperties.RouteSelector);
      } else {
        await createRosaWizardPage.applicationIngressDefaultSettingsRadio().check();
      }
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Networking - VPC Settings', async ({ page, createRosaWizardPage }) => {
      await createRosaWizardPage.isVPCSettingsScreen();
      await expect(
        page.getByText(
          `Select a VPC to install your cluster into your selected region: ${region}`,
        ),
      ).toBeVisible();
      await createRosaWizardPage.waitForVPCList();
      await createRosaWizardPage.selectVPC(qeInfrastructure.VPC_NAME);

      let i = 0;
      for (const zone of availabilityZones) {
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

    test('Step - Networking - CIDR Ranges - advanced options', async ({ createRosaWizardPage }) => {
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

    test('Step - Cluster roles and policies - advanced options', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.selectRoleProviderMode(clusterProperties.OidcProviderMode);
      await expect(createRosaWizardPage.customOperatorPrefixInput()).toBeVisible();
      await expect(createRosaWizardPage.customOperatorPrefixInput()).toHaveValue(
        new RegExp(clusterName.substring(0, 27)),
      );
      await createRosaWizardPage.customOperatorPrefixInput().selectText();
      await createRosaWizardPage
        .customOperatorPrefixInput()
        .fill(clusterName.substring(0, 27));
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster update - update strategies - advanced options', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.selectUpdateStratergy(clusterProperties.UpdateStrategy);
      await createRosaWizardPage.selectGracePeriod(clusterProperties.NodeDrainingGracePeriod);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Review and create step - its definitions', async ({
      page,
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.waitForReviewScreenReady();

      await expect(createRosaWizardPage.controlPlaneType()).toHaveText(
        clusterProperties.ControlPlaneType,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'AWS infrastructure account ID',
        awsAccountID,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue('Installer role', installerARN);
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Availability',
        clusterProperties.Availability,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue('Cluster name', clusterName);
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
        clusterProperties.ApplicationIngress,
      );
      for (const selector of clusterProperties.RouteSelector.split(',')) {
        const [key, val] = selector.split('=');
        await createRosaWizardPage.isClusterPropertyMatchesValue(
          'Route selectors',
          `${key} = ${val}`,
        );
      }
      for (const ns of clusterProperties.ExcludedNamespaces.split(',')) {
        await createRosaWizardPage.isClusterPropertyMatchesValue('Excluded namespaces', ns);
      }
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Wildcard policy',
        clusterProperties.WildcardPolicy,
      );
      await createRosaWizardPage.isClusterPropertyMatchesValue(
        'Namespace ownership policy',
        `${clusterProperties.NamespaceOwnershipPolicy} namespace ownership`,
      );
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
      await createRosaWizardPage.waitForReviewScreenReady();
      await createRosaWizardPage.createClusterButton().click();
      await clusterDetailsPage.waitForInstallerScreenToLoad();
      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
      await expect(page.getByRole('heading', { name: 'Installing cluster' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Download OC CLI' })).toBeVisible();
      await clusterDetailsPage.clusterDetailsPageRefresh();
      await clusterDetailsPage.checkInstallationStepStatus('Account setup');
      await clusterDetailsPage.checkInstallationStepStatus('OIDC and operator roles');
      await clusterDetailsPage.checkInstallationStepStatus('DNS setup');
      await clusterDetailsPage.checkInstallationStepStatus('Cluster installation');
    });
  },
);
