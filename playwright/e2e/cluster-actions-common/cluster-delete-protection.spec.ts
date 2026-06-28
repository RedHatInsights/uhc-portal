import { expect, test } from '../../fixtures/pages';

const fixtureData = require('../../fixtures/cluster-actions-common/cluster-delete-protection.spec.json');
const rosaHostedFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const testData = fixtureData['delete-protection'];
const clusterName =
  process.env.CLUSTER_NAME ||
  rosaHostedFixture['rosa-hosted-public-advanced']['day1-profile'].ClusterName;

test.describe.serial(
  'Cluster delete protection - Day 2 management (OCP-72600)',
  { tag: ['@day2', '@clusters', '@advanced', '@delete-protection', '@rosa-hosted', '@hcp'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage, clusterDetailsPage }) => {
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await clusterDetailsPage.isClusterDetailsPage(clusterName);
    });

    test('can see the Delete Protection section on the Overview tab', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.deleteProtectionTerm()).toBeVisible();
    });

    test('can open the enable deletion protection modal and verify its content', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openEnableDeleteProtectionModal();

      await expect(clusterDetailsPage.deleteProtectionModalHeading('Enable')).toBeVisible();
      await expect(clusterDetailsPage.deleteProtectionModalDialog()).toContainText(
        testData.ModalContent.EnableDescription,
      );
      await expect(clusterDetailsPage.deleteProtectionModalPrimaryButton()).toContainText('Enable');
      await expect(clusterDetailsPage.deleteProtectionModalCancelButton()).toBeVisible();
    });

    test('can cancel the enable deletion protection modal without changing state', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.cancelDeleteProtectionModal();

      await expect(clusterDetailsPage.deleteProtectionModalDialog()).toBeHidden();
      await expect(clusterDetailsPage.deleteProtectionEnableButton()).toBeVisible();
    });

    test('can enable delete protection and verify the state changes to enabled', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.enableDeleteProtection();

      await expect(clusterDetailsPage.deleteProtectionDisableButton()).toBeVisible({
        timeout: 15000,
      });
    });

    test('Delete cluster action is disabled with a locked tooltip in Actions dropdown when delete protection is enabled', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openActionsDropdown();

      await expect(clusterDetailsPage.deleteClusterDropdownItem()).toBeDisabled();

      await clusterDetailsPage.deleteClusterDropdownItem().hover();
      await expect(clusterDetailsPage.deleteProtectionDropdownTooltip()).toBeVisible({
        timeout: 5000,
      });
      await expect(clusterDetailsPage.deleteProtectionDropdownTooltip()).toContainText(
        testData.TooltipContent.DeleteProtectionLocked,
      );

      await clusterDetailsPage.closeActionsDropdown();
    });

    test('can open the disable deletion protection modal and verify its content', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openDisableDeleteProtectionModal();

      await expect(clusterDetailsPage.deleteProtectionModalHeading('Disable')).toBeVisible();
      await expect(clusterDetailsPage.deleteProtectionModalDialog()).toContainText(
        testData.ModalContent.DisableDescription,
      );
      await expect(clusterDetailsPage.deleteProtectionModalPrimaryButton()).toContainText(
        'Disable',
      );
      await expect(clusterDetailsPage.deleteProtectionModalCancelButton()).toBeVisible();
    });

    test('can cancel the disable deletion protection modal without changing state', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.cancelDeleteProtectionModal();

      await expect(clusterDetailsPage.deleteProtectionModalDialog()).toBeHidden();
      await expect(clusterDetailsPage.deleteProtectionDisableButton()).toBeVisible();
    });

    test('can disable delete protection and restore to initial disabled state', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.disableDeleteProtection();

      await expect(clusterDetailsPage.deleteProtectionEnableButton()).toBeVisible({
        timeout: 15000,
      });
    });

    test('Delete cluster action is enabled with no locked tooltip in Actions dropdown when delete protection is disabled', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openActionsDropdown();

      await expect(clusterDetailsPage.deleteClusterDropdownItem()).not.toBeDisabled();

      await clusterDetailsPage.deleteClusterDropdownItem().hover();
      await expect(clusterDetailsPage.deleteProtectionDropdownTooltip()).toBeHidden({
        timeout: 5000,
      });

      await clusterDetailsPage.closeActionsDropdown();
    });

    test.afterAll(async ({ clusterDetailsPage }) => {
      const isEnabled = await clusterDetailsPage
        .deleteProtectionDisableButton()
        .isVisible()
        .catch(() => false);

      if (isEnabled) {
        await clusterDetailsPage.disableDeleteProtection().catch((error) => {
          console.error('afterAll: failed to restore delete protection to disabled state', error);
        });
      }
    });
  },
);
