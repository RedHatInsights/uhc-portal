import { test, expect } from '../../fixtures/pages';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-ystream-channel.spec.json');
const clusterProperties = clusterProfiles.Clusters;
const yStream = clusterProfiles.YStreamChannel;

/** Shared with rosa-cluster-hosted-ystream-channel-day2.spec.ts (Day-1 create / Day-2 navigation). */
const clusterName =
  process.env.CLUSTER_NAME ||
  process.env.QE_YSTREAM_DAY2_CLUSTER_NAME ||
  clusterProperties.ClusterName ||
  clusterProperties.Name;

const CHANNEL_TOOLTIP_TEXT =
  'Channels provide recommended release versions and help control the pace of updates. Update channels align to a minor version, for example 4.20. To update to the next minor release, you might need to change the channel.';

const OCP_UPDATE_CHANNELS_DOC_FRAGMENT =
  'understanding-openshift-updates-1#understanding-update-channels-releases';

test.describe.serial(
  `ROSA HCP Y-stream Channel wizard tests (${clusterProperties.ControlPlaneType})`,
  { tag: ['@advanced', '@day1', '@ystream', '@rosa-hosted', '@rosa', '@hcp'] },
  () => {
    const region = process.env.QE_AWS_REGION || clusterProperties.Region.split(',')[0];
    const awsAccountID = process.env.QE_AWS_ID || '';
    const awsBillingAccountID = process.env.QE_AWS_BILLING_ID || '';
    let qeInfrastructure: Record<string, any> = {};

    try {
      qeInfrastructure = JSON.parse(process.env.QE_INFRA_REGIONS || '{}')[region]?.[0] || {};
    } catch (error) {
      console.warn('Failed to parse QE_INFRA_REGIONS environment variable:', error);
    }

    const rolePrefix = process.env.QE_ACCOUNT_ROLE_PREFIX || '';
    const installerARN = `arn:aws:iam::${awsAccountID}:role/${rolePrefix}-HCP-ROSA-Installer-Role`;
    const oidcConfigId = process.env.QE_OIDC_CONFIG_ID ?? clusterProperties.OidcConfigId;
    const availabilityZone =
      Object.keys(qeInfrastructure.SUBNETS?.ZONES || {})[0] ||
      clusterProperties.MachinePools[0].AvailabilityZones;

    const zoneSubnets = qeInfrastructure?.SUBNETS?.ZONES?.[availabilityZone];
    const hasQeInfrastructure = Boolean(
      qeInfrastructure?.VPC_NAME &&
        zoneSubnets?.PRIVATE_SUBNET_NAME &&
        zoneSubnets?.PUBLIC_SUBNET_NAME,
    );
    const QE_INFRA_SKIP_REASON =
      'Set QE_INFRA_REGIONS with VPC_NAME and subnet names for the target region.';

    const versionWithChannels =
      process.env.QE_YSTREAM_VERSION_WITH_CHANNELS ||
      yStream.SelectedVersion ||
      process.env.VERSION ||
      '';

    test.beforeAll(async ({ navigateTo }) => {
      await navigateTo('create');
    });

    test('Open Rosa cluster wizard', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.waitAndClick(createRosaWizardPage.rosaCreateClusterButton());
      await createRosaWizardPage.rosaClusterWithWeb().click();
      await createRosaWizardPage.isCreateRosaPage();
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

    test('Channel group is not shown on Cluster details', async ({ createRosaWizardPage }) => {
      await createRosaWizardPage.isClusterDetailsScreen();
      await createRosaWizardPage.assertYStreamChannelUiWithoutChannelGroup();
    });

    test('Version field appears before Channel field on Cluster details', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.assertVersionFieldAppearsBeforeChannelField();
    });

    test('Channel tooltip explains channels and Learn more links to OCP update channels doc', async ({
      createRosaWizardPage,
      page,
    }) => {
      await createRosaWizardPage.channelInfoIcon().click();

      const channelPopover = createRosaWizardPage.channelPopover();
      await expect(channelPopover).toBeVisible();
      await expect(channelPopover).toContainText(CHANNEL_TOOLTIP_TEXT);

      await createRosaWizardPage.followChannelPopoverLearnMoreLink(
        OCP_UPDATE_CHANNELS_DOC_FRAGMENT,
      );
      await page.keyboard.press('Escape');
    });

    test('Channel is optional on first load — Next proceeds without a channel selection', async ({
      createRosaWizardPage,
    }) => {
      test.skip(
        !versionWithChannels,
        'Set QE_YSTREAM_VERSION_WITH_CHANNELS or YStreamChannel.SelectedVersion.',
      );

      await createRosaWizardPage.selectRegion(region);
      await createRosaWizardPage.setClusterName(clusterName);
      await createRosaWizardPage.selectVersion(versionWithChannels);
      await expect(createRosaWizardPage.channelDropdown()).toHaveValue('');
      await createRosaWizardPage.closePopoverAndNavigateNext();
    });

    test('Selecting a version displays the available list of channels', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.ensureClusterDetailsScreen();
      await createRosaWizardPage.selectRegion(region);
      await createRosaWizardPage.selectVersion(yStream.SelectedVersion);

      await createRosaWizardPage.channelDropdown().click();

      const availableChannelOptions = await createRosaWizardPage.channelDropdownOptionValues();

      for (const expectedChannel of yStream.AvailableChannels) {
        expect(availableChannelOptions).toContain(expectedChannel);
      }
    });

    test('Selected version and channel values persist after user makes selections', async ({
      createRosaWizardPage,
    }) => {
      await createRosaWizardPage.resetClusterDetailsSelections();

      await createRosaWizardPage.selectVersion(yStream.SelectedVersion);
      await expect(createRosaWizardPage.versionDropdownToggle()).toContainText(
        yStream.SelectedVersion,
      );

      for (const channel of yStream.AvailableChannels) {
        await createRosaWizardPage.selectChannel(channel);
        await expect(createRosaWizardPage.channelDropdown()).toHaveValue(channel);
        await expect(createRosaWizardPage.versionDropdownToggle()).toContainText(
          yStream.SelectedVersion,
        );
      }

      await createRosaWizardPage.closePopoverAndNavigateNext();
    });

    test('Step - Cluster Settings - Select machine pool node type and node count', async ({
      createRosaWizardPage,
    }) => {
      test.skip(!hasQeInfrastructure, QE_INFRA_SKIP_REASON);

      await createRosaWizardPage.isClusterMachinepoolsScreen(true);
      await expect(createRosaWizardPage.machinePoolVpcRegionPrompt(region)).toBeVisible();
      await createRosaWizardPage.waitForVPCList();
      await createRosaWizardPage.selectVPC(qeInfrastructure.VPC_NAME);
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(zoneSubnets.PRIVATE_SUBNET_NAME, 1);
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
      await createRosaWizardPage.navigateNextFromMachinePools();
    });

    test('Step - Cluster Settings - configuration - Select cluster privacy', async ({
      createRosaWizardPage,
    }) => {
      test.skip(!hasQeInfrastructure, QE_INFRA_SKIP_REASON);

      await createRosaWizardPage.waitForNetworkingConfigurationScreen();
      await expect(createRosaWizardPage.clusterPrivacyPublicRadio()).toBeChecked();
      await expect(createRosaWizardPage.clusterPrivacyPrivateRadio()).not.toBeChecked();
      await createRosaWizardPage.selectClusterPrivacy('private');
      await createRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await createRosaWizardPage.selectClusterPrivacyPublicSubnet(zoneSubnets.PUBLIC_SUBNET_NAME);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster Settings - CIDR Ranges - CIDR default values', async ({
      createRosaWizardPage,
    }) => {
      test.skip(!hasQeInfrastructure, QE_INFRA_SKIP_REASON);

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
      test.skip(!hasQeInfrastructure, QE_INFRA_SKIP_REASON);

      await createRosaWizardPage.selectOidcConfigId(oidcConfigId);
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Cluster update - update strategies and its definitions', async ({
      createRosaWizardPage,
    }) => {
      test.skip(!hasQeInfrastructure, QE_INFRA_SKIP_REASON);

      await expect(createRosaWizardPage.individualUpdateRadio()).not.toBeChecked();
      await expect(createRosaWizardPage.recurringUpdateRadio()).toBeChecked();
      // Day-2 channel edit on Overview requires Individual updates (no scheduled upgrade policy).
      await createRosaWizardPage.selectUpdateStratergy('Individual updates');
      await expect(createRosaWizardPage.individualUpdateRadio()).toBeChecked();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Step - Additional set up - Control plane log forwarding options', async ({
      createRosaWizardPage,
    }) => {
      test.skip(!hasQeInfrastructure, QE_INFRA_SKIP_REASON);
      await createRosaWizardPage.isLogForwardingScreen();
      await expect(createRosaWizardPage.amazonS3Heading()).toBeVisible();
      await expect(createRosaWizardPage.cloudWatchHeading()).toBeVisible();
      await expect(createRosaWizardPage.amazonS3EnableCheckbox()).not.toBeChecked();
      await expect(createRosaWizardPage.cloudWatchEnableCheckbox()).not.toBeChecked();
      await createRosaWizardPage.rosaNextButton().click();
    });

    test('Review shows "No channels available for the selected version" when version has no channels', async ({
      createRosaWizardPage,
    }) => {
      const versionWithoutChannels = process.env.QE_YSTREAM_VERSION_WITHOUT_CHANNELS ?? '';
      test.skip(
        !versionWithoutChannels,
        'Set QE_YSTREAM_VERSION_WITHOUT_CHANNELS to a version whose available_channels is empty in this environment.',
      );
      test.skip(!hasQeInfrastructure, QE_INFRA_SKIP_REASON);

      await createRosaWizardPage.navigateWizardBackToClusterDetails();
      await createRosaWizardPage.selectVersion(versionWithoutChannels);
      await expect(createRosaWizardPage.channelDropdown()).toBeDisabled();
      await createRosaWizardPage.closePopoverAndNavigateNext();

      await createRosaWizardPage.waitForVPCList();
      await createRosaWizardPage.selectVPC(qeInfrastructure.VPC_NAME);
      await createRosaWizardPage.selectMachinePoolPrivateSubnet(zoneSubnets.PRIVATE_SUBNET_NAME, 1);
      await createRosaWizardPage.selectComputeNodeType(
        clusterProperties.MachinePools[0].InstanceType,
      );
      await createRosaWizardPage.selectComputeNodeCount(
        clusterProperties.MachinePools[0].NodeCount,
      );
      await createRosaWizardPage.navigateNextFromMachinePools();

      await createRosaWizardPage.waitForNetworkingConfigurationScreen();
      await createRosaWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await createRosaWizardPage.selectClusterPrivacyPublicSubnet(zoneSubnets.PUBLIC_SUBNET_NAME);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.selectOidcConfigId(oidcConfigId);
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.rosaNextButton().click();
      await createRosaWizardPage.waitForReviewScreenReady();
      await expect(createRosaWizardPage.reviewChannelValue()).toContainText(
        yStream.ReviewNoChannelsAvailable,
      );
    });

    test('Review shows selected channel and version when user chose a channel on Cluster details', async ({
      createRosaWizardPage,
      clusterDetailsPage,
    }) => {
      test.skip(!hasQeInfrastructure, QE_INFRA_SKIP_REASON);

      await createRosaWizardPage.waitForReviewScreenReady();
      await expect(createRosaWizardPage.reviewChannelValue()).toContainText(
        yStream.SelectedChannel,
      );
      await expect(createRosaWizardPage.reviewVersionValue()).toContainText(
        yStream.SelectedVersion,
      );
      await createRosaWizardPage.createClusterButton().click();
      await clusterDetailsPage.expectRosaHcpClusterInstallationInProgress(clusterName);
      await clusterDetailsPage.clusterDetailsPageRefresh();
      await clusterDetailsPage.checkInstallationStepStatus('Account setup');
      await clusterDetailsPage.checkInstallationStepStatus('OIDC and operator roles');
      await clusterDetailsPage.checkInstallationStepStatus('Network settings');
      await clusterDetailsPage.checkInstallationStepStatus('DNS setup');
      await clusterDetailsPage.checkInstallationStepStatus('Cluster installation');
    });
  },
);
