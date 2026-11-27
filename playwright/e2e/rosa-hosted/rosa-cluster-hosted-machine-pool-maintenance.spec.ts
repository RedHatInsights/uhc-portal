import { expect, test } from '../../fixtures/pages';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const machinePoolFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-machine-pool-maintenance.spec.json');
const clusterProperties = clusterProfiles['rosa-hosted-public-advanced']['day1-profile'];
const { MinimumNodeCount, MaximumNodeCount } = machinePoolFixture.Autoscaling;
const maintenance = machinePoolFixture.Maintenance;
const clusterName = process.env.CLUSTER_NAME || clusterProperties.ClusterName;
let infraRegions: Record<
  string,
  { SUBNETS?: { ZONES?: Record<string, { PRIVATE_SUBNET_NAME?: string }> } }[]
> = {};
try {
  infraRegions = JSON.parse(process.env.QE_INFRA_REGIONS || '{}');
} catch (error) {
  console.warn('Failed to parse QE_INFRA_REGIONS environment variable:', error);
}
const region = Object.keys(infraRegions)[0] || clusterProperties.Region.split(',')[0];
const qeInfrastructure = infraRegions[region]?.[0] || {};
const privateSubnetName = Object.values(qeInfrastructure.SUBNETS?.ZONES || {})[0]
  ?.PRIVATE_SUBNET_NAME;

test.describe.serial(
  'ROSA HCP Machine Pool - IMDS and maintenance',
  {
    tag: ['@day2', '@advanced', '@rosa', '@rosa-hosted', '@machine-pool', '@hcp', '@maintenance'],
  },
  () => {
    // HCP node pool names are limited to 15 characters.
    const machinePoolId = `mp-mt-${Math.random().toString(36).slice(2, 7)}`;

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      if (!privateSubnetName) {
        throw new Error(
          `SUBNETS.ZONES PRIVATE_SUBNET_NAME is not defined in QE_INFRA_REGIONS for region "${region}"`,
        );
      }
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
    });

    test('Navigate to HCP cluster Machine pools tab', async ({
      clusterListPage,
      machinePoolsPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName, 'startsWith');
      await machinePoolsPage.goToMachinePoolsTab();
    });

    test('Verify IMDS options and maintenance defaults, hints, and limits', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.fillHostedMachinePoolBasics(
        machinePoolId,
        privateSubnetName,
        MinimumNodeCount,
        MaximumNodeCount,
      );
      await expect(machinePoolsPage.imdsV2OnlyRadio()).toBeChecked();
      await expect(machinePoolsPage.imdsV1AndV2Radio()).not.toBeChecked();
      await expect(machinePoolsPage.getByText(maintenance.ImdsV2Description)).toBeVisible();
      await expect(machinePoolsPage.getByText(maintenance.ImdsV1AndV2Description)).toBeVisible();

      await machinePoolsPage.imdsV1AndV2Radio().check();
      await expect(machinePoolsPage.imdsV1AndV2Radio()).toBeChecked();
      await expect(machinePoolsPage.imdsV2OnlyRadio()).not.toBeChecked();

      await machinePoolsPage.goToMaintenanceTab();
      await expect(machinePoolsPage.autoRepairCheckbox()).toBeChecked();
      await expect(machinePoolsPage.getByText(maintenance.AutoRepairDescription)).toBeVisible();
      await expect(machinePoolsPage.getByText(maintenance.UpgradeDescription)).toBeVisible();
      await expect(machinePoolsPage.maxSurgeInput()).toHaveValue(maintenance.DefaultMaxSurge);
      await expect(machinePoolsPage.maxUnavailableInput()).toHaveValue(
        maintenance.DefaultMaxUnavailable,
      );
      await expect(machinePoolsPage.nodeDrainTimeoutInput()).toHaveValue(
        maintenance.DefaultNodeDrainTimeout,
      );

      await machinePoolsPage.maxSurgeHintButton().click();
      await expect(machinePoolsPage.helpPopover(maintenance.MaxSurgeHint)).toContainText(
        maintenance.MaxSurgeHint,
      );
      await machinePoolsPage.closeHelpPopover();

      await machinePoolsPage.maxUnavailableHintButton().click();
      await expect(machinePoolsPage.helpPopover(maintenance.MaxUnavailableHint)).toContainText(
        maintenance.MaxUnavailableHint,
      );
      await machinePoolsPage.closeHelpPopover();

      await machinePoolsPage.nodeDrainTimeoutHintButton().click();
      await expect(machinePoolsPage.helpPopover(maintenance.NodeDrainTimeoutHint)).toContainText(
        maintenance.NodeDrainTimeoutHint,
      );
      await machinePoolsPage.closeHelpPopover();

      await machinePoolsPage.maxSurgeInput().fill(maintenance.BothZeroValue);
      await machinePoolsPage.maxSurgeInput().blur();
      // Helper text stays hidden until the field is touched. blur() does not fire
      // unless the input is focused, and this value is already the default.
      await machinePoolsPage.maxUnavailableInput().focus();
      await machinePoolsPage.maxUnavailableInput().blur();
      await expect(machinePoolsPage.getByText(maintenance.BothZeroSurgeError)).toBeVisible();
      await expect(machinePoolsPage.getByText(maintenance.BothZeroUnavailableError)).toBeVisible();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();

      await machinePoolsPage.maxSurgeInput().fill(maintenance.MaxSurge);
      await machinePoolsPage.maxUnavailableInput().fill(maintenance.MaxUnavailable);
      await machinePoolsPage.nodeDrainTimeoutInput().fill(maintenance.NodeDrainAboveMax);
      await machinePoolsPage.nodeDrainTimeoutInput().blur();
      await expect(machinePoolsPage.getByText(maintenance.NodeDrainMaxError)).toBeVisible();
      await expect(machinePoolsPage.getByText(maintenance.BothZeroSurgeError)).toBeHidden();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();

      await machinePoolsPage.nodeDrainTimeoutInput().fill(maintenance.NodeDrainTimeout);
      await machinePoolsPage.nodeDrainTimeoutInput().blur();
      await expect(machinePoolsPage.getByText(maintenance.NodeDrainMaxError)).toBeHidden();
      await machinePoolsPage.autoRepairCheckbox().uncheck();
      await expect(machinePoolsPage.autoRepairCheckbox()).not.toBeChecked();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeEnabled();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test('Create a machine pool with IMDSv1 and IMDSv2 and custom maintenance', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.fillHostedMachinePoolBasics(
        machinePoolId,
        privateSubnetName,
        MinimumNodeCount,
        MaximumNodeCount,
      );
      await machinePoolsPage.imdsV1AndV2Radio().check();

      await machinePoolsPage.goToMaintenanceTab();
      await machinePoolsPage.autoRepairCheckbox().uncheck();
      await machinePoolsPage.maxSurgeInput().fill(maintenance.MaxSurge);
      await machinePoolsPage.maxUnavailableInput().fill(maintenance.MaxUnavailable);
      await machinePoolsPage.nodeDrainTimeoutInput().fill(maintenance.NodeDrainTimeout);

      // IMDS is collected only when the pool is created, so the create request is the check.
      const body = await machinePoolsPage.submitNewNodePool();

      expect(body.id).toBe(machinePoolId);
      expect(body.aws_node_pool?.ec2_metadata_http_tokens).toBe(maintenance.ImdsV1AndV2Value);
      expect(body.auto_repair).toBe(false);
      expect(body.management_upgrade).toMatchObject({
        max_surge: maintenance.MaxSurge,
        max_unavailable: maintenance.MaxUnavailable,
      });
      expect(String(body.node_drain_grace_period?.value)).toBe(maintenance.NodeDrainTimeout);

      await expect(machinePoolsPage.getMachinePoolRow(machinePoolId)).toBeVisible({
        timeout: 60000,
      });
    });

    test('Verify AutoRepair is disabled on the created machine pool', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.expandMachinePoolRow(machinePoolId);
      await machinePoolsPage.verifyAutoRepair(machinePoolId, 'Disabled');
    });

    test('Edit maintenance and confirm IMDS stays fixed', async ({ machinePoolsPage }) => {
      await machinePoolsPage.editMachinePool(machinePoolId);

      await expect(machinePoolsPage.imdsV2OnlyRadio()).toHaveCount(0);
      await expect(machinePoolsPage.imdsV1AndV2Radio()).toHaveCount(0);

      await machinePoolsPage.goToMaintenanceTab();
      await expect(machinePoolsPage.autoRepairCheckbox()).not.toBeChecked();
      await expect(machinePoolsPage.maxSurgeInput()).toHaveValue(maintenance.MaxSurge);
      await expect(machinePoolsPage.maxUnavailableInput()).toHaveValue(maintenance.MaxUnavailable);
      await expect(machinePoolsPage.nodeDrainTimeoutInput()).toHaveValue(
        maintenance.NodeDrainTimeout,
      );
      await machinePoolsPage.autoRepairCheckbox().check();
      await machinePoolsPage.maxSurgeInput().fill(maintenance.EditedMaxSurge);
      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });
    });

    test('Verify the edited AutoRepair and maintenance values', async ({ machinePoolsPage }) => {
      await machinePoolsPage.expandMachinePoolRow(machinePoolId);
      await machinePoolsPage.verifyAutoRepair(machinePoolId, 'Enabled');

      await machinePoolsPage.editMachinePool(machinePoolId);
      await machinePoolsPage.goToMaintenanceTab();
      await expect(machinePoolsPage.autoRepairCheckbox()).toBeChecked();
      await expect(machinePoolsPage.maxSurgeInput()).toHaveValue(maintenance.EditedMaxSurge);
      await expect(machinePoolsPage.maxUnavailableInput()).toHaveValue(maintenance.MaxUnavailable);
      await expect(machinePoolsPage.nodeDrainTimeoutInput()).toHaveValue(
        maintenance.NodeDrainTimeout,
      );
      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test('Delete the maintenance machine pool', async ({ machinePoolsPage }) => {
      await machinePoolsPage.deleteMachinePool(machinePoolId);
    });

    test.afterAll(async ({ machinePoolsPage }) => {
      try {
        await machinePoolsPage.dismissMachinePoolModalIfOpen();
      } catch (error) {
        console.error('afterAll: failed to dismiss machine pool modal', error);
      }
      try {
        await machinePoolsPage.goToMachinePoolsTab();
        await machinePoolsPage.deleteMachinePool(machinePoolId);
      } catch (error) {
        console.error(`Failed to delete machine pool ${machinePoolId} or already deleted`, error);
      }
    });
  },
);
