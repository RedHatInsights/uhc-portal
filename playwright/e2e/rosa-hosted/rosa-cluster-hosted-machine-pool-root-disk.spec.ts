import { expect, test } from '../../fixtures/pages';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const machinePoolFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-machine-pool-root-disk.spec.json');
const clusterProperties = clusterProfiles['rosa-hosted-public-advanced']['day1-profile'];
const { MinimumNodeCount, MaximumNodeCount } = machinePoolFixture.Autoscaling;
const rootDisk = machinePoolFixture.RootDisk;
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
  'ROSA HCP Machine Pool - Root disk size',
  { tag: ['@day2', '@advanced', '@rosa', '@rosa-hosted', '@machine-pool', '@hcp', '@root-disk'] },
  () => {
    // HCP node pool names are limited to 15 characters.
    const machinePoolId = `mp-rd-${Math.random().toString(36).slice(2, 7)}`;

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

    test('Verify root disk size defaults, hint, and limits', async ({ machinePoolsPage }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await expect(machinePoolsPage.rootDiskSizeInput()).toHaveValue(rootDisk.DefaultSize);
      await expect(machinePoolsPage.rootDiskSizeInput()).toBeEnabled();

      await machinePoolsPage.rootDiskSizeHintButton().click();
      await expect(machinePoolsPage.helpPopover(rootDisk.Hint)).toContainText(rootDisk.Hint);
      await machinePoolsPage.closeHelpPopover();

      await machinePoolsPage.rootDiskSizeInput().fill(rootDisk.BelowMin);
      await machinePoolsPage.rootDiskSizeInput().blur();
      await expect(machinePoolsPage.getByText(rootDisk.MinError)).toBeVisible();

      await machinePoolsPage.rootDiskSizeInput().fill(rootDisk.AboveMax);
      await machinePoolsPage.rootDiskSizeInput().blur();
      await expect(machinePoolsPage.getByText(rootDisk.MaxError)).toBeVisible();
      await expect(machinePoolsPage.getByText(rootDisk.MinError)).toBeHidden();

      await machinePoolsPage.rootDiskSizeInput().fill(rootDisk.DecimalValue);
      await machinePoolsPage.rootDiskSizeInput().blur();
      await expect(machinePoolsPage.getByText(rootDisk.DecimalError)).toBeVisible();
      await expect(machinePoolsPage.getByText(rootDisk.MaxError)).toBeHidden();

      await machinePoolsPage.rootDiskSizeInput().fill(rootDisk.ValidSize);
      await machinePoolsPage.rootDiskSizeInput().blur();
      await expect(machinePoolsPage.getByText(rootDisk.DecimalError)).toBeHidden();
      await expect(machinePoolsPage.rootDiskSizeInput()).toHaveValue(rootDisk.ValidSize);

      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test('Create a machine pool with a custom root disk size', async ({ machinePoolsPage }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.fillHostedMachinePoolBasics(
        machinePoolId,
        privateSubnetName,
        MinimumNodeCount,
        MaximumNodeCount,
      );
      await machinePoolsPage.rootDiskSizeInput().fill(rootDisk.ValidSize);
      await machinePoolsPage.rootDiskSizeInput().blur();

      const body = await machinePoolsPage.submitNewNodePool();
      expect(body.id).toBe(machinePoolId);
      expect(Number(body.aws_node_pool?.root_volume?.size)).toBe(Number(rootDisk.ValidSize));

      await expect(machinePoolsPage.getMachinePoolRow(machinePoolId)).toBeVisible({
        timeout: 60000,
      });
    });

    test('Verify root disk size is immutable when editing the machine pool', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(machinePoolId);
      await expect(machinePoolsPage.rootDiskSizeInput()).toBeDisabled();
      await expect(machinePoolsPage.rootDiskSizeInput()).toHaveValue(rootDisk.ValidSize);

      await machinePoolsPage.hoverRootDiskSize();
      await expect(machinePoolsPage.immutableSettingTooltip()).toBeVisible();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test('Delete the root disk machine pool', async ({ machinePoolsPage }) => {
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
