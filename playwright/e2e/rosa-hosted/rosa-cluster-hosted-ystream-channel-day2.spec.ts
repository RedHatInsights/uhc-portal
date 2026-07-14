import { test, expect } from '../../fixtures/pages';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-ystream-channel.spec.json');
const clusterProperties = clusterProfiles.Clusters;
const yStream = clusterProfiles.YStreamChannel;
const day2Fixture = clusterProfiles.Day2;

/** Cluster from Day-1 create (rosa-cluster-hosted-ystream-channel-day1.spec.ts) or env override. */
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
  `ROSA HCP Y-stream Channel Day-2 overview and edit (${clusterName})`,
  { tag: ['@advanced', '@ystream', '@rosa-hosted', '@rosa', '@hcp', '@day2'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      test.skip(!clusterName, 'Set CLUSTER_NAME or Clusters.ClusterName in the Y-stream fixture.');

      await navigateTo('clusters/list');
      await clusterListPage.waitForDataReady();
    });

    test('Navigate to ROSA HCP cluster overview', async ({
      clusterListPage,
      clusterDetailsPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await clusterDetailsPage.openOverviewTab();
    });

    test('Overview does not show Channel group when Y-stream channel is enabled', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openOverviewTab();
      await expect(clusterDetailsPage.channelGroupOverviewLabel()).not.toBeVisible();
      await expect(clusterDetailsPage.overviewChannelRow()).toBeVisible();
    });

    test('Overview Channel row shows value, hint, and Learn more link', async ({
      clusterDetailsPage,
      page,
    }) => {
      await clusterDetailsPage.openOverviewTab();
      const channelText = await clusterDetailsPage.overviewChannelValue().innerText();
      expect(channelText).toMatch(/stable-4\.\d+|fast-4\.\d+|candidate-4\.\d+|eus-4\.\d+|N\/A/);

      await clusterDetailsPage.channelOverviewHintButton().click();
      await expect(clusterDetailsPage.channelOverviewPopover()).toContainText(CHANNEL_TOOLTIP_TEXT);
      await expect(clusterDetailsPage.channelOverviewLearnMoreLink()).toHaveAttribute(
        'href',
        new RegExp(OCP_UPDATE_CHANNELS_DOC_FRAGMENT),
      );
      await page.keyboard.press('Escape');
    });

    test('Channel edit is shown but disabled while cluster is not ready', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openOverviewTab();
      const editButton = clusterDetailsPage.channelEditButton();
      await expect(editButton).toBeVisible();

      test.skip(
        !(await editButton.isDisabled()),
        'Cluster edit is enabled because the cluster is ready; re-run against a cluster still installing.',
      );

      await expect(editButton).toBeDisabled();
      await editButton.click({ force: true });
      await expect(clusterDetailsPage.editChannelModal()).not.toBeVisible();
    });

    test('Switch to Individual updates so Overview channel edit is enabled', async ({
      clusterDetailsPage,
    }) => {
      // Day-1 should create with Individual updates; this covers existing clusters created with Recurring.
      await clusterDetailsPage.ensureIndividualUpdatesForChannelEdit();
    });

    test('Edit channel modal opens with Save disabled until selection changes', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openOverviewTab();
      await clusterDetailsPage.openEditChannelModal();

      await expect(clusterDetailsPage.editChannelModalSaveButton()).toBeDisabled();
      await clusterDetailsPage.editChannelModalCloseButton().click({ force: true });
      await expect(clusterDetailsPage.editChannelModal()).not.toBeVisible();
    });

    test('Save enabled when selection changes', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.openOverviewTab();
      await expect(clusterDetailsPage.channelEditButton()).toBeEnabled({ timeout: 30000 });
      await clusterDetailsPage.openEditChannelModal();

      await expect(clusterDetailsPage.editChannelModalSaveButton()).toBeDisabled();
      await clusterDetailsPage.expectEditChannelModalHasOption(yStream.SelectedChannel);
      await clusterDetailsPage.selectEditChannelModalOption(yStream.SelectedChannel);
      await expect(clusterDetailsPage.editChannelModalChannelSelect()).toHaveValue(
        yStream.SelectedChannel,
      );
      await clusterDetailsPage.editChannelModalCloseButton().click({ force: true });
      await expect(clusterDetailsPage.editChannelModal()).not.toBeVisible();
    });

    test('Recurring updates strategy disables channel edit with scheduled-policy tooltip', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openUpgradeSettingsTab();
      await clusterDetailsPage.ensureUpdateStrategy('Recurring updates');
      await clusterDetailsPage.expectChannelSettingsEditDisabled();
    });

    test('Individual updates on a ready cluster enables channel edit without scheduled-policy tooltip', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.ensureUpdateStrategy('Individual updates');
      const editPencil = clusterDetailsPage.channelSettingsEditButton();
      await editPencil.scrollIntoViewIfNeeded();
      await editPencil.click();
      await clusterDetailsPage.editChannelModalCloseButton().click({ force: true });
      await expect(clusterDetailsPage.editChannelModal()).not.toBeVisible();
    });

    test('Save updates on Overview page Channel row', async ({ clusterDetailsPage }) => {
      test.skip(
        !day2Fixture.AlternateChannel,
        'Set Day2.AlternateChannel in the Y-stream fixture.',
      );

      await clusterDetailsPage.openOverviewTab();
      await expect(clusterDetailsPage.channelEditButton()).toBeEnabled({ timeout: 30000 });
      await clusterDetailsPage.openEditChannelModal();
      await clusterDetailsPage.expectEditChannelModalHasOption(day2Fixture.AlternateChannel);
      await clusterDetailsPage.selectEditChannelModalOption(day2Fixture.AlternateChannel);
      await expect(clusterDetailsPage.editChannelModalChannelSelect()).toHaveValue(
        day2Fixture.AlternateChannel,
      );
      await expect(clusterDetailsPage.editChannelModalSaveButton()).toBeEnabled();
      await clusterDetailsPage.editChannelModalSaveButton().click();
      await expect(clusterDetailsPage.editChannelModal()).not.toBeVisible({ timeout: 30000 });
      await expect(clusterDetailsPage.overviewChannelValue()).toContainText(
        day2Fixture.AlternateChannel,
      );

      await clusterDetailsPage.openEditChannelModal();
      await clusterDetailsPage.expectEditChannelModalHasOption(yStream.SelectedChannel);
      await clusterDetailsPage.selectEditChannelModalOption(yStream.SelectedChannel);
      await expect(clusterDetailsPage.editChannelModalChannelSelect()).toHaveValue(
        yStream.SelectedChannel,
      );
      await expect(clusterDetailsPage.editChannelModalSaveButton()).toBeEnabled();
      await clusterDetailsPage.editChannelModalSaveButton().click();
      await expect(clusterDetailsPage.editChannelModal()).not.toBeVisible({ timeout: 30000 });
      await expect(clusterDetailsPage.overviewChannelValue()).toContainText(
        yStream.SelectedChannel,
      );
    });

    test('Delete ROSA HCP Y-stream channel cluster', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.deleteClusterByName(clusterName, { cooldownMs: 10_000 });
    });
  
  },
);
