import { test, expect } from '../../fixtures/pages';

const testData = require('../../fixtures/osd-aws/osd-ccs-aws-ystream-channel.spec.json');
const clusterProperties = testData.Clusters;
const yStream = testData.YStreamChannel;

const awsAccountID = process.env.QE_AWS_ID;
const awsAccessKey = process.env.QE_AWS_ACCESS_KEY_ID;
const awsSecretKey = process.env.QE_AWS_ACCESS_KEY_SECRET;

const configName = `${clusterProperties.CloudProvider}-${clusterProperties.SubscriptionType}-${clusterProperties.InfrastructureType}`;

const versionWithChannels =
  process.env.QE_YSTREAM_VERSION_WITH_CHANNELS ||
  yStream.SelectedVersion ||
  process.env.VERSION ||
  '';

const CHANNEL_TOOLTIP_TEXT =
  'Channels provide recommended release versions and help control the pace of updates. Update channels align to a minor version, for example 4.20. To update to the next minor release, you might need to change the channel.';

const OCP_UPDATE_CHANNELS_DOC_FRAGMENT =
  'understanding-openshift-updates-1#understanding-update-channels-releases';

test.describe.serial(
  `OSD AWS CCS Y-stream Channel wizard tests (${configName})`,
  { tag: ['@advanced', '@day1', '@ystream', '@osd', '@aws'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      await navigateTo('create');
    });

    test('Launch OSD cluster wizard', async ({ createOSDWizardPage }) => {
      await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdCreateClusterButton());
      await createOSDWizardPage.isCreateOSDPage();
    });

    test('Billing model', async ({ createOSDWizardPage }) => {
      await createOSDWizardPage.isBillingModelScreen();
      await createOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      await createOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      await createOSDWizardPage.wizardNextButton().click();
    });

    test('Cloud provider', async ({ createOSDWizardPage }) => {
      test.skip(
        !awsAccountID || !awsAccessKey || !awsSecretKey,
        'Set QE_AWS_ID, QE_AWS_ACCESS_KEY_ID, and QE_AWS_ACCESS_KEY_SECRET in playwright.env.json.',
      );

      await createOSDWizardPage.completeAwsCloudProviderStep(
        awsAccountID!,
        awsAccessKey!,
        awsSecretKey!,
      );
    });

    test('Channel group is not shown on Cluster details', async ({ createOSDWizardPage }) => {
      await createOSDWizardPage.isClusterDetailsScreen();
      await createOSDWizardPage.assertYStreamChannelUiWithoutChannelGroup();
    });

    test('Version field appears before Channel field on Cluster details', async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.assertVersionFieldAppearsBeforeChannelField();
    });

    test('Channel tooltip explains channels and Learn more links to OCP update channels doc', async ({
      createOSDWizardPage,
      page,
    }) => {
      await createOSDWizardPage.channelInfoIcon().click();

      const channelPopover = createOSDWizardPage.channelPopover();
      await expect(channelPopover).toBeVisible();
      await expect(channelPopover).toContainText(CHANNEL_TOOLTIP_TEXT);

      await createOSDWizardPage.followChannelPopoverLearnMoreLink(OCP_UPDATE_CHANNELS_DOC_FRAGMENT);
      await page.keyboard.press('Escape');
    });

    test('Channel is optional on first load — Next proceeds without a channel selection', async ({
      createOSDWizardPage,
    }) => {
      test.skip(
        !versionWithChannels,
        'Set QE_YSTREAM_VERSION_WITH_CHANNELS or YStreamChannel.SelectedVersion.',
      );

      await createOSDWizardPage.setClusterName(clusterProperties.Name);
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.selectAvailabilityZone('Single Zone');
      await createOSDWizardPage.selectRegion(clusterProperties.Region);
      await createOSDWizardPage.selectVersion(versionWithChannels);
      await expect(createOSDWizardPage.channelSelect()).toHaveValue('');
      await createOSDWizardPage.wizardNextButton().click();
      await createOSDWizardPage.isMachinePoolScreen();
    });

    test('Selecting a version displays the available list of channels', async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.ensureClusterDetailsScreen();
      await createOSDWizardPage.selectVersion(yStream.SelectedVersion);

      await createOSDWizardPage.channelSelect().click();

      const availableChannelOptions = await createOSDWizardPage.channelSelectOptionValues();

      for (const expectedChannel of yStream.AvailableChannels) {
        expect(availableChannelOptions).toContain(expectedChannel);
      }
    });

    test('Selected version and channel values persist after user makes selections', async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.resetClusterDetailsSelections();

      await createOSDWizardPage.selectVersion(yStream.SelectedVersion);
      await expect(createOSDWizardPage.versionDropdownToggle()).toContainText(
        yStream.SelectedVersion,
      );

      await createOSDWizardPage.selectChannel(yStream.SelectedChannel);
      await expect(createOSDWizardPage.channelSelect()).toHaveValue(yStream.SelectedChannel);

      await createOSDWizardPage.selectAvailabilityZone('Multi-zone');
      await createOSDWizardPage.selectAvailabilityZone('Single Zone');

      await expect(createOSDWizardPage.versionDropdownToggle()).toContainText(
        yStream.SelectedVersion,
      );
      await expect(createOSDWizardPage.channelSelect()).toHaveValue(yStream.SelectedChannel);

      await createOSDWizardPage.wizardNextButton().click();
    });

    test('Machine pool', async ({ createOSDWizardPage }) => {
      await createOSDWizardPage.completeMachinePoolStep(
        clusterProperties.MachinePool.InstanceType,
        clusterProperties.MachinePool.NodeCount,
      );
      await createOSDWizardPage.wizardNextButton().click();
    });

    test('Networking configuration', async ({ createOSDWizardPage }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test('CIDR ranges', async ({ createOSDWizardPage }) => {
      await createOSDWizardPage.isCIDRScreen();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test('Cluster update strategy', async ({ createOSDWizardPage }) => {
      await createOSDWizardPage.isClusterUpdatesScreen();
      await createOSDWizardPage.wizardNextButton().click();
    });

    test('Review shows "No channels available for the selected version" when version has no channels', async ({
      createOSDWizardPage,
    }) => {
      const versionWithoutChannels = process.env.QE_YSTREAM_VERSION_WITHOUT_CHANNELS ?? '';
      test.skip(
        !versionWithoutChannels,
        'Set QE_YSTREAM_VERSION_WITHOUT_CHANNELS to a version whose available_channels is empty in this environment.',
      );

      await createOSDWizardPage.navigateWizardBackToClusterDetails();
      await createOSDWizardPage.selectVersion(versionWithoutChannels);
      await expect(createOSDWizardPage.channelSelect()).toBeDisabled();
      await createOSDWizardPage.advanceOsdWizardToReview(
        clusterProperties.MachinePool.InstanceType,
        clusterProperties.MachinePool.NodeCount,
      );

      await expect(createOSDWizardPage.reviewChannelValue()).toContainText(
        yStream.ReviewNoChannelsAvailable,
      );
    });

    test('Review shows selected channel and version when user chose a channel on Cluster details', async ({
      createOSDWizardPage,
    }) => {
      await expect(createOSDWizardPage.reviewChannelValue()).toContainText(yStream.SelectedChannel);
      await expect(createOSDWizardPage.reviewVersionValue()).toContainText(yStream.SelectedVersion);
      await createOSDWizardPage.createClusterButton().click();
      await createOSDWizardPage.waitForClusterCreationAndOverview();
    });
  },
);
