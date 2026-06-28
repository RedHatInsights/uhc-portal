import { test, expect } from '../../fixtures/pages';

const autonodeFixtureData = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-autonode.spec.json');
const clusterProfileFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const creationProfile = clusterProfileFixture['rosa-hosted-public-advanced']['day1-profile'];

test.describe.serial(
  'ROSA HCP Autonode (Red Hat build of Karpenter) - Overview management(OCP-89243)',
  { tag: ['@day2', '@rosa-hosted', '@rosa', '@hcp', '@autonode', '@advanced'] },
  () => {
    const clusterName = process.env.CLUSTER_NAME || creationProfile.ClusterName;
    const iamRoleArn = process.env.QE_AUTONODE_ROLE_ARN;
    const updatedIamRoleArn = process.env.QE_AUTONODE_ROLE_ARN_SECONDARY;

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      if (!iamRoleArn) {
        throw new Error(
          'QE_AUTONODE_ROLE_ARN environment variable is required to run this test suite',
        );
      }
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test('Navigate to ROSA HCP cluster Overview tab', async ({
      clusterListPage,
      clusterDetailsPage,
    }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterDetailsPage.isAutoNodeSectionVisible();
    });

    test('Verify Autonode default status is Disabled', async ({ clusterDetailsPage }) => {
      await expect(clusterDetailsPage.autoNodeStatus()).toHaveText('Disabled');
    });

    test('Open the Edit Autonode modal and verify all modal elements are present', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openEditAutoNodeModal();
      await expect(clusterDetailsPage.editAutoNodeModalHeading()).toBeVisible();
      await expect(clusterDetailsPage.enableAutoNodeSwitch()).toBeVisible();
      await expect(clusterDetailsPage.autoNodeIamRoleArnInput()).toBeVisible();
      await expect(clusterDetailsPage.saveAutoNodeButton()).toBeVisible();
      await expect(clusterDetailsPage.cancelAutoNodeButton()).toBeVisible();
    });

    test('Verify IAM role ARN input and Save button are disabled when Autonode switch is off', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.autoNodeIamRoleArnInput()).toBeDisabled();
      await expect(clusterDetailsPage.saveAutoNodeButton()).toBeDisabled();
    });

    test('Verify enabling the switch shows the irreversible-action warning alert', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.checkAutoNodeSwitch();
      await clusterDetailsPage.isTextContainsInPage(autonodeFixtureData.irreversibleWarning);
      await clusterDetailsPage.uncheckAutoNodeSwitch();
      await clusterDetailsPage.isTextContainsInPage(autonodeFixtureData.irreversibleWarning, false);
    });

    test('Verify IAM role ARN input becomes enabled after toggling the Autonode switch on', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.checkAutoNodeSwitch();
      await expect(clusterDetailsPage.autoNodeIamRoleArnInput()).toBeEnabled();
      await clusterDetailsPage.uncheckAutoNodeSwitch();
    });

    test('Verify Save is disabled when Autonode is toggled on but ARN is empty', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.checkAutoNodeSwitch();
      await clusterDetailsPage.autoNodeIamRoleArnInput().clear();
      await clusterDetailsPage.autoNodeIamRoleArnInput().blur();
      await expect(clusterDetailsPage.saveAutoNodeButton()).toBeDisabled();
      await clusterDetailsPage.uncheckAutoNodeSwitch();
    });

    test('Verify an invalid ARN format shows a validation error and disables Save', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.checkAutoNodeSwitch();
      await clusterDetailsPage.autoNodeIamRoleArnInput().fill(autonodeFixtureData.invalidArn);
      await clusterDetailsPage.autoNodeIamRoleArnInput().blur();
      await clusterDetailsPage.isTextContainsInPage(autonodeFixtureData.invalidArnError);
      await expect(clusterDetailsPage.saveAutoNodeButton()).toBeDisabled();
      await clusterDetailsPage.uncheckAutoNodeSwitch();
    });

    test('Verify a valid ARN with Autonode enabled activates the Save button', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.checkAutoNodeSwitch();
      await clusterDetailsPage.autoNodeIamRoleArnInput().fill(iamRoleArn);
      await clusterDetailsPage.autoNodeIamRoleArnInput().blur();
      await clusterDetailsPage.isTextContainsInPage(autonodeFixtureData.invalidArnError, false);
      await expect(clusterDetailsPage.saveAutoNodeButton()).toBeEnabled();
      await clusterDetailsPage.uncheckAutoNodeSwitch();
    });

    test('Verify an ARN with leading/trailing whitespace shows a validation error and disables Save', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.checkAutoNodeSwitch();
      await clusterDetailsPage
        .autoNodeIamRoleArnInput()
        .fill(autonodeFixtureData.arnWithWhitespace);
      await clusterDetailsPage.autoNodeIamRoleArnInput().blur();
      await clusterDetailsPage.isTextContainsInPage(autonodeFixtureData.arnWithWhitespaceError);
      await expect(clusterDetailsPage.saveAutoNodeButton()).toBeDisabled();
      await clusterDetailsPage.uncheckAutoNodeSwitch();
    });

    test('Enable Autonode with a valid ARN and save', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.enableAutoNodeWithArn(iamRoleArn!);
      await expect(clusterDetailsPage.editAutoNodeModal()).toBeHidden();
    });

    test('Verify Autonode status shows Enabled and IAM role ARN is displayed on Overview', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.autoNodeStatus()).toHaveText('Enabled', { timeout: 30000 });
      await expect(clusterDetailsPage.autoNodeIamRoleArnText()).toBeVisible();
      await expect(clusterDetailsPage.autoNodeIamRoleArnText()).toContainText(iamRoleArn!);
    });

    test('Verify post-enable edit behavior: switch disabled, ARN editable, Save disabled with no changes', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openEditAutoNodeModal();
      await expect(clusterDetailsPage.editAutoNodeModalHeading()).toBeVisible();
      await expect(clusterDetailsPage.enableAutoNodeSwitch()).toBeChecked();
      await expect(clusterDetailsPage.enableAutoNodeSwitch()).toBeDisabled();
      await expect(clusterDetailsPage.autoNodeIamRoleArnInput()).toBeEnabled();
      await expect(clusterDetailsPage.autoNodeIamRoleArnInput()).toHaveValue(iamRoleArn);
      await expect(clusterDetailsPage.saveAutoNodeButton()).toBeDisabled();
      await clusterDetailsPage.closeEditAutoNodeModal();
      await expect(clusterDetailsPage.editAutoNodeModal()).toBeHidden();
    });

    test('Verify Karpenter node reference with tooltip', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.autoNodeKarpenterCountContainer()).toBeVisible({
        timeout: 60000,
      });
      await expect(clusterDetailsPage.autoNodeKarpenterCount()).toBeVisible();
      await expect(clusterDetailsPage.autoNodeKarpenterTooltipButton()).toBeVisible();
      await clusterDetailsPage.autoNodeKarpenterTooltipButton().click();
      await clusterDetailsPage.isTextContainsInPage(autonodeFixtureData.karpenterTooltipHint);
    });

    test('Edit Autonode ARN to a new value and verify updated ARN on Overview', async ({
      clusterDetailsPage,
    }) => {
      test.skip(!updatedIamRoleArn, 'QE_AUTONODE_ROLE_ARN_SECONDARY env var is required');
      await clusterDetailsPage.openEditAutoNodeModal();
      await clusterDetailsPage.autoNodeIamRoleArnInput().clear();
      await clusterDetailsPage.autoNodeIamRoleArnInput().fill(updatedIamRoleArn!);
      await clusterDetailsPage.autoNodeIamRoleArnInput().blur();
      await expect(clusterDetailsPage.saveAutoNodeButton()).toBeEnabled();
      await clusterDetailsPage.saveAutoNodeButton().click();
      await expect(clusterDetailsPage.editAutoNodeModal()).toBeHidden({ timeout: 30000 });
      await expect(clusterDetailsPage.autoNodeIamRoleArnText()).toContainText(updatedIamRoleArn!, {
        timeout: 30000,
      });
    });
  },
);
