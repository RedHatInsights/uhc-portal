import { test, expect } from '../../fixtures/pages';

const clusterProfile = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-private-advanced-creation.spec.json');
const day1Profile = clusterProfile['rosa-hosted-private-advanced']['day1-profile'];
let infraRegions: any = {};
try {
  infraRegions = JSON.parse(process.env.QE_INFRA_REGIONS || '{}');
} catch (error) {
  console.warn('Failed to parse QE_INFRA_REGIONS environment variable:', error);
}
const region = Object.keys(infraRegions)[0] || day1Profile.Region.split(',')[0];
const qeInfrastructure = infraRegions[region]?.[0] || {};
const zones = qeInfrastructure.SUBNETS?.ZONES;

test.describe.serial(
  'ROSA HCP Machine Pool - Compute node count definition with autoscaling (OCMUI-4932)',
  { tag: ['@day2', '@rosa-hosted', '@rosa', '@hcp', '@machine-pool', '@advanced', '@private'] },
  () => {
    const clusterName = process.env.CLUSTER_NAME || day1Profile.ClusterName;
    const mpAutoscale1 = `mp-as1-${Math.random().toString(36).slice(2, 7)}`;
    const mpAutoscale2 = `mp-as2-${Math.random().toString(36).slice(2, 7)}`;

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      if (!zones || Object.keys(zones).length === 0) {
        throw new Error(`SUBNETS.ZONES is not defined in QE_INFRA_REGIONS for region "${region}"`);
      }
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
    });

    test('Navigate to HCP cluster Machine pools tab', async ({
      clusterListPage,
      machinePoolsPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await machinePoolsPage.goToMachinePoolsTab();
    });

    test('Verify delete is disabled for default machine pools due to minimum count restrictions', async ({
      machinePoolsPage,
    }) => {
      const minCountTooltip =
        'There needs to be at least 2 nodes without taints across all machine pools';

      await machinePoolsPage.verifyDeleteDisabled('workers-0', minCountTooltip);
      await machinePoolsPage.verifyDeleteDisabled('workers-1', minCountTooltip);
    });

    test('Verify autoscaling min and max allow 0 for HCP in Add machine pool modal', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();

      await machinePoolsPage.autoscalingCheckbox().check();
      await expect(machinePoolsPage.autoscalingCheckbox()).toBeChecked();
      await expect(machinePoolsPage.autoscaleMinInput()).toHaveValue('2');
      await expect(machinePoolsPage.autoscaleMaxInput()).toHaveValue('2');

      await expect(machinePoolsPage.autoscaleMinInput()).toBeVisible();
      await machinePoolsPage.autoscaleMinInput().fill('0');
      await machinePoolsPage.autoscaleMinInput().blur();
      await expect(machinePoolsPage.autoscaleMinMinusButton()).toBeDisabled();

      await expect(machinePoolsPage.autoscaleMaxInput()).toBeVisible();
      await machinePoolsPage.autoscaleMaxInput().fill('0');
      await machinePoolsPage.autoscaleMaxInput().blur();
      await expect(machinePoolsPage.autoscaleMaxMinusButton()).toBeDisabled();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Verify node count allows 0 for HCP without autoscaling', async ({ machinePoolsPage }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await expect(machinePoolsPage.autoscalingCheckbox()).not.toBeChecked();
      await expect(machinePoolsPage.nodeCountInput()).toBeVisible();
      await expect(machinePoolsPage.nodeCountInput()).toHaveValue('2');

      await machinePoolsPage.nodeCountInput().fill('0');
      await machinePoolsPage.nodeCountInput().blur();
      // Minus button should be disabled at the 0 floor
      await expect(machinePoolsPage.nodeCountMinusButton()).toBeDisabled();
      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Create first machine pool with autoscaling min=0, max=0', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.machinePoolIdInput().fill(mpAutoscale1);
      const firstZone = Object.keys(zones || {})[0];
      await machinePoolsPage.selectPrivateSubnet(zones[firstZone].PRIVATE_SUBNET_NAME);

      await machinePoolsPage.setAutoscalingRange('0', '1');

      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });
      await expect(machinePoolsPage.getMachinePoolRow(mpAutoscale1)).toBeVisible({
        timeout: 60000,
      });
    });

    test('Create second machine pool with autoscaling min=0, max=0 and a taint', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.machinePoolIdInput().fill(mpAutoscale2);
      const firstZone = Object.keys(zones || {})[0];
      await machinePoolsPage.selectPrivateSubnet(zones[firstZone].PRIVATE_SUBNET_NAME);

      await machinePoolsPage.setAutoscalingRange('0', '1');

      await machinePoolsPage.openTaintsSection();
      await machinePoolsPage.setTaint(0, 'e2e-test', 'tainted');

      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });
      await expect(machinePoolsPage.getMachinePoolRow(mpAutoscale2)).toBeVisible({
        timeout: 60000,
      });
    });

    test('Edit machine pool and verify autoscaleMin=0 is valid for HCP', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(mpAutoscale1);

      await expect(machinePoolsPage.autoscalingCheckbox()).toBeChecked();
      await expect(machinePoolsPage.autoscaleMinInput()).toHaveValue('0');
      await expect(machinePoolsPage.autoscaleMaxInput()).toHaveValue('1');

      // No validation error should be shown for min=0 on HCP
      await expect(machinePoolsPage.getByText(/Input cannot be less than/)).toBeHidden();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Edit machine pool and verify autoscaleMin below 0 is rejected', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(mpAutoscale1);

      await machinePoolsPage.autoscaleMinInput().fill('-1');
      await machinePoolsPage.autoscaleMinInput().blur();

      await expect(machinePoolsPage.getByText('Input cannot be less than 0.')).toBeVisible();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Edit machine pool and verify autoscaleMax and autoscaleMin below 0 are rejected', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(mpAutoscale1);

      await machinePoolsPage.autoscaleMinInput().fill('-1');
      await machinePoolsPage.autoscaleMinInput().blur();
      await expect(machinePoolsPage.getByText('Input cannot be less than 0.')).toBeVisible();

      await machinePoolsPage.autoscaleMaxInput().fill('-1');
      await machinePoolsPage.autoscaleMaxInput().blur();
      await expect(machinePoolsPage.getByText('Max nodes cannot be negative.')).toBeVisible();

      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Edit machine pool and verify min greater than max is rejected', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(mpAutoscale1);

      await machinePoolsPage.autoscaleMaxInput().fill('1');
      await machinePoolsPage.autoscaleMinInput().fill('5');
      await machinePoolsPage.autoscaleMinInput().blur();

      await expect(
        machinePoolsPage.getByText('Min nodes cannot be more than max nodes.'),
      ).toBeVisible();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Edit machine pool and verify autoscaleMax above quota limit is rejected', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(mpAutoscale1);

      await machinePoolsPage.autoscaleMaxInput().fill('500');
      await machinePoolsPage.autoscaleMaxInput().blur();

      await expect(machinePoolsPage.getByText(/Input cannot be more than/)).toBeVisible();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Scale tainted pool mpAutoscale2 max > 2 and verify delete still disabled for default pools', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(mpAutoscale2);
      await machinePoolsPage.autoscaleMaxInput().fill('3');
      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });

      await machinePoolsPage.editMachinePool(mpAutoscale1);
      await machinePoolsPage.openTaintsSection();
      await machinePoolsPage.setTaint(0, 'e2e-test', 'tainted');
      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });

      const minCountTooltip =
        'There needs to be at least 2 nodes without taints across all machine pools';

      await machinePoolsPage.verifyDeleteDisabled('workers-0', minCountTooltip);
      await machinePoolsPage.verifyDeleteDisabled('workers-1', minCountTooltip);
    });

    test('Edit workers-0 and verify autoscaleMax=0 is rejected by capacity validation and nodeCount=0 is rejected', async ({
      machinePoolsPage,
    }) => {
      // workers-0 max=2 should be accepted
      await machinePoolsPage.editMachinePool('workers-0');
      await machinePoolsPage.autoscaleMaxInput().fill('2');
      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });



      // workers-1 node count=0 without autoscaling should be accepted
      await machinePoolsPage.editMachinePool('workers-1');
      await machinePoolsPage.autoscalingCheckbox().uncheck();
      await machinePoolsPage.nodeCountInput().fill('0');
      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });


      await machinePoolsPage.editMachinePool('workers-0');
      // For HCP, max=0 is rejected as min max requirement is now 1
      await machinePoolsPage.autoscaleMaxInput().fill('0');
      await machinePoolsPage.autoscaleMaxInput().blur();
      await expect(machinePoolsPage.getByText(/Max nodes must be greater than 0./)).toBeVisible();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();
      // For HCP, max=1 is rejected as minimum untainted node count is 2 per cluster
      await machinePoolsPage.autoscaleMaxInput().fill('1');
      await machinePoolsPage.autoscaleMaxInput().blur();
      await expect(
        machinePoolsPage.getByText(
          /Max nodes must be at least \d+ to satisfy the cluster-wide untainted-node minimum/,
        ),
      ).toBeVisible();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();

      // workers-0 max=2 should be accepted
      await machinePoolsPage.autoscaleMaxInput().fill('2');
      await machinePoolsPage.autoscaleMaxInput().blur();
      await expect(
        machinePoolsPage.getByText(
          /Max nodes must be at least \d+ to satisfy the cluster-wide untainted-node minimum/,
        ),
      ).toBeHidden();

      // Disable autoscaling and set node count to 0
      await machinePoolsPage.autoscalingCheckbox().uncheck();
      await machinePoolsPage.nodeCountInput().fill('0');
      await machinePoolsPage.nodeCountInput().blur();
      await expect(machinePoolsPage.getByText(/Input cannot be less than \d+\./)).toBeVisible();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
      // Verify delete state: workers-0 max=2, workers-1 node count=0
      // Removing workers-0 leaves 0 untainted capacity → delete disabled
      await machinePoolsPage.verifyDeleteDisabled(
        'workers-0',
        'There needs to be at least 2 nodes without taints across all machine pools',
      );
      // Removing workers-1 leaves workers-0 max=2 which still meets the minimum → delete enabled
      await machinePoolsPage.verifyDeleteEnabled('workers-1');

      await machinePoolsPage.resetMachinePoolAutoscaling('workers-1', '0', '1');
      await machinePoolsPage.resetMachinePoolAutoscaling('workers-0', '0', '1');
    });

    test('Delete untainted machine pools when max_replicas capacity is sufficient', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.deleteMachinePool(mpAutoscale1);
      await machinePoolsPage.deleteMachinePool(mpAutoscale2);
    });

    test.afterAll(async ({ machinePoolsPage }) => {
      for (const mpName of [mpAutoscale1, mpAutoscale2]) {
        const row = machinePoolsPage.getMachinePoolRow(mpName);
        const isVisible = await row
          .waitFor({ state: 'visible', timeout: 5000 })
          .then(() => true)
          .catch(() => false);
        if (isVisible) {
          await machinePoolsPage.deleteMachinePool(mpName);
        }
      }
      await machinePoolsPage.resetMachinePoolAutoscaling('workers-1', '0', '1');
      await machinePoolsPage.resetMachinePoolAutoscaling('workers-0', '0', '1');
    });
  },
);
