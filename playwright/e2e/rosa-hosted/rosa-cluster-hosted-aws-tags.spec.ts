import { AWS_TAGS_NEW_MP } from '../../../src/queries/featureGates/featureConstants';
import { expect, test } from '../../fixtures/pages';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const awsTagsFixtureData = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-aws-tags.spec.json');
const clusterProfileFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const creationProfile = clusterProfileFixture['rosa-hosted-public-advanced']['day1-profile'];

// Requires the Day 1 cluster to run OpenShift 4.20 or above, where AWS tags can be edited
test.describe.serial(
  'ROSA HCP AWS tags - cluster and machine pool day-2 editing',
  { tag: ['@day2', '@rosa-hosted', '@rosa', '@hcp', '@aws-tags', '@advanced'] },
  () => {
    const clusterName = process.env.CLUSTER_NAME || creationProfile.ClusterName;
    const tagKey = `${awsTagsFixtureData.tagKeyPrefix}-${Math.random().toString(36).slice(2, 7)}`;
    const { clusterTagValue, machinePoolTagValue } = awsTagsFixtureData;
    const machinePoolTagsReason = `The ${AWS_TAGS_NEW_MP} feature gate is disabled`;
    let isMachinePoolTagsEnabled = false;
    let machinePoolId = '';

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      const gatePromise = clusterListPage.isFeatureGateEnabled(AWS_TAGS_NEW_MP);
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
      isMachinePoolTagsEnabled = await gatePromise;
    });

    test.afterAll(async ({ clusterDetailsPage, machinePoolsPage }) => {
      // Restore the shared Day 1 cluster: remove the machine pool override, then the cluster tag
      await clusterDetailsPage.dismissEditAwsTagsModalIfOpen().catch(() => {});
      await machinePoolsPage.dismissMachinePoolModalIfOpen().catch(() => {});
      if (machinePoolId) {
        await machinePoolsPage.goToMachinePoolsTab().catch(() => {});
        await machinePoolsPage
          .removeMachinePoolAwsTagIfPresent(machinePoolId, tagKey)
          .catch((error) => {
            console.error('afterAll: failed to remove the machine pool AWS tag', error);
          });
      }
      await clusterDetailsPage.removeClusterAwsTagIfPresent(tagKey).catch((error) => {
        console.error('afterAll: failed to remove the cluster AWS tag', error);
      });
    });

    test('Navigate to ROSA HCP cluster Overview tab', async ({
      clusterListPage,
      clusterDetailsPage,
    }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName, 'startsWith');
      await expect(clusterDetailsPage.editAwsTagsButton()).toBeVisible({ timeout: 30000 });
      await expect(
        clusterDetailsPage.editAwsTagsButton(),
        'AWS tag editing requires the cluster to be ready and on OpenShift 4.20 or above',
      ).not.toHaveAttribute('aria-disabled', 'true');
    });

    test('Open the Edit cluster AWS tags modal and verify system tags are read-only', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openEditAwsTagsModal();
      await clusterDetailsPage.isTextContainsInPage(awsTagsFixtureData.clusterTagsDescription);
      await expect(
        clusterDetailsPage.awsTagsReadOnlyList(awsTagsFixtureData.systemTagsReason),
      ).toBeVisible();
      await clusterDetailsPage.isTextContainsInPage(awsTagsFixtureData.systemTagsNote);
      await expect(clusterDetailsPage.saveAwsTagsButton()).toBeDisabled();
    });

    test('Verify a tag without a value shows a validation error and disables Save', async ({
      clusterDetailsPage,
    }) => {
      const modal = clusterDetailsPage.editAwsTagsModal();
      await clusterDetailsPage.addAwsTag(modal, tagKey, '');
      const index = await clusterDetailsPage.awsTagRowIndex(modal, tagKey);
      await expect(clusterDetailsPage.awsTagValueInput(modal, index)).toHaveAccessibleErrorMessage(
        new RegExp(`^${awsTagsFixtureData.requiredValueError}`),
      );
      await expect(clusterDetailsPage.saveAwsTagsButton()).toBeDisabled();

      await clusterDetailsPage.awsTagRemoveButton(modal, index).click();
      await expect(clusterDetailsPage.saveAwsTagsButton()).toBeDisabled();
    });

    test('Add a cluster AWS tag and verify only the new tag is sent', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.addAwsTag(
        clusterDetailsPage.editAwsTagsModal(),
        tagKey,
        clusterTagValue,
      );
      const body = await clusterDetailsPage.saveClusterAwsTags();

      expect(body).toEqual({ aws: { tags: { [tagKey]: clusterTagValue } } });
      await clusterDetailsPage.expectOverviewAwsTagVisible(tagKey, clusterTagValue);
    });

    test('Verify the cluster tag is inherited by an existing machine pool', async ({
      machinePoolsPage,
    }) => {
      test.skip(!isMachinePoolTagsEnabled, machinePoolTagsReason);
      await machinePoolsPage.goToMachinePoolsTab();
      machinePoolId = await machinePoolsPage.firstExistingMachinePoolId();
      await machinePoolsPage.openMachinePoolAwsTags(machinePoolId);

      const modal = machinePoolsPage.machinePoolModal();
      const index = await machinePoolsPage.awsTagRowIndex(modal, tagKey);
      expect(index, `${tagKey} should be listed as an inherited tag`).toBeGreaterThanOrEqual(0);
      await expect(machinePoolsPage.awsTagKeyInput(modal, index)).toHaveAttribute('readonly');
      await expect(machinePoolsPage.awsTagValueInput(modal, index)).toHaveValue(clusterTagValue);
      await expect(
        machinePoolsPage.awsTagsReadOnlyList(awsTagsFixtureData.systemTagsReason),
      ).toBeVisible();

      await machinePoolsPage.awsTagKeyInput(modal, index).hover();
      await expect(
        machinePoolsPage.awsTagTooltip(awsTagsFixtureData.inheritedTagTooltip),
      ).toBeVisible();

      const removeButton = machinePoolsPage.awsTagRemoveButton(modal, index);
      await expect(removeButton).toHaveAttribute('aria-disabled', 'true');
      await removeButton.hover();
      await expect(
        machinePoolsPage.awsTagTooltip(awsTagsFixtureData.inheritedTagRemoveReason),
      ).toBeVisible();
    });

    test('Override the inherited tag on the machine pool and verify only the override is sent', async ({
      machinePoolsPage,
    }) => {
      test.skip(!isMachinePoolTagsEnabled, machinePoolTagsReason);
      const modal = machinePoolsPage.machinePoolModal();
      const index = await machinePoolsPage.awsTagRowIndex(modal, tagKey);
      await machinePoolsPage.awsTagValueInput(modal, index).fill(machinePoolTagValue);
      const body = await machinePoolsPage.saveMachinePoolAndGetPatchBody(machinePoolId);

      expect(body.aws_node_pool?.tags).toEqual({ [tagKey]: machinePoolTagValue });
    });

    test('Verify removing the override resets the tag to the cluster value and sends null', async ({
      machinePoolsPage,
    }) => {
      test.skip(!isMachinePoolTagsEnabled, machinePoolTagsReason);
      await machinePoolsPage.openMachinePoolAwsTags(machinePoolId);

      const modal = machinePoolsPage.machinePoolModal();
      const index = await machinePoolsPage.awsTagRowIndex(modal, tagKey);
      await expect(machinePoolsPage.awsTagKeyInput(modal, index)).toHaveAttribute('readonly');
      await expect(machinePoolsPage.awsTagValueInput(modal, index)).toHaveValue(
        machinePoolTagValue,
      );

      await machinePoolsPage.awsTagRemoveButton(modal, index).click();
      await expect(machinePoolsPage.awsTagKeyInput(modal, index)).toHaveValue(tagKey);
      await expect(machinePoolsPage.awsTagValueInput(modal, index)).toHaveValue(clusterTagValue);
      const body = await machinePoolsPage.saveMachinePoolAndGetPatchBody(machinePoolId);

      expect(body.aws_node_pool?.tags).toEqual({ [tagKey]: null });
    });

    test('Verify removing the override restores the inherited cluster value', async ({
      machinePoolsPage,
    }) => {
      test.skip(!isMachinePoolTagsEnabled, machinePoolTagsReason);
      await machinePoolsPage.openMachinePoolAwsTags(machinePoolId);

      const modal = machinePoolsPage.machinePoolModal();
      const index = await machinePoolsPage.awsTagRowIndex(modal, tagKey);
      await expect(machinePoolsPage.awsTagKeyInput(modal, index)).toHaveAttribute('readonly');
      await expect(machinePoolsPage.awsTagValueInput(modal, index)).toHaveValue(clusterTagValue);
      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(modal).toBeHidden({ timeout: 15000 });
    });

    test('Remove the cluster AWS tag and verify a null value is sent', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.overviewTab().click();
      await clusterDetailsPage.openEditAwsTagsModal();

      const modal = clusterDetailsPage.editAwsTagsModal();
      const index = await clusterDetailsPage.awsTagRowIndex(modal, tagKey);
      await clusterDetailsPage.awsTagRemoveButton(modal, index).click();
      const body = await clusterDetailsPage.saveClusterAwsTags();

      expect(body).toEqual({ aws: { tags: { [tagKey]: null } } });
      await expect(clusterDetailsPage.awsTagsOverviewLabel(tagKey, clusterTagValue)).toBeHidden({
        timeout: 30000,
      });
    });
  },
);
