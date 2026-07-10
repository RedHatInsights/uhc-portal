import { test, expect } from '../../fixtures/pages';
import { CLUSTER_LIST_FULL_PATH } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/rosa/rosa-cluster-classic-public-creation-advanced.spec.json');
const day1 = clusterProfiles['rosa-classic-public-advanced'];
const day2 = day1['day2-profile'].MachinePoolsValidation;

const clusterNamePrefix = process.env.CLUSTER_NAME || day1.ClusterNamePrefix;
const defaultPool = day1.MachinePools[0];
const editData = day2.EditMachinePool;
const region = process.env.QE_AWS_REGION || day1.Region.split(',')[0];
const qeInfrastructure = JSON.parse(process.env.QE_INFRA_REGIONS || '{}')[region]?.[0];
const azKeys = Object.keys(qeInfrastructure?.SUBNETS?.ZONES || {});
const availabilityZones = azKeys.join(', ');
const zoneCount = azKeys.length || 3;
const workerName = `worker-${(Math.random() + 1).toString(36).substring(4)}`;

test.describe.serial(
  'ROSA Classic machine pools validation (OCP-35970)',
  { tag: ['@advanced', '@day2', '@rosa', '@rosa-classic', '@machine-pools'] },
  () => {
    test.beforeAll(async ({
      navigateTo,
      clusterListPage,
      clusterDetailsPage,
      machinePoolsPage,
    }) => {
      await navigateTo(CLUSTER_LIST_FULL_PATH);
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterNamePrefix);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterNamePrefix, 'startsWith');
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await machinePoolsPage.goToMachinePoolsTab();
    });

    test('Verify machine pools table headers and default values', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.verifyTableHeader('Machine pool');
      await machinePoolsPage.verifyTableHeader('Instance type');
      await machinePoolsPage.verifyTableHeader('Availability zones');
      await machinePoolsPage.verifyTableHeader('Node count');
      await machinePoolsPage.verifyTableHeader('Autoscaling');

      await expect(machinePoolsPage.addMachinePoolButton()).toBeVisible();
      await expect(machinePoolsPage.editClusterAutoscalingButton()).toBeVisible();

      if (availabilityZones) {
        await machinePoolsPage.verifyTableContainsValue(availabilityZones);
      }
      await machinePoolsPage.verifyTableContainsValue(defaultPool.InstanceType);
      await machinePoolsPage.verifyTableContainsValue(defaultPool.Autoscaling);
    });

    test('Verify add machine pool modal default elements', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await expect(machinePoolsPage.machinePoolIdInput()).toBeVisible();
      await machinePoolsPage.machinePoolIdInput().click();
      await machinePoolsPage.selectInstanceType(day2.NewMachinePool.InstanceType);
      await expect(machinePoolsPage.autoscalingCheckbox()).not.toBeChecked();
      await machinePoolsPage.costSavingsTab().click();
      await expect(machinePoolsPage.spotInstanceCheckbox()).not.toBeChecked();
      await machinePoolsPage.securityGroupsTab().click();
      await expect(machinePoolsPage.securityGroupsNoChangeAlert()).toBeVisible();
      await expect(machinePoolsPage.securityGroupsToggle()).toBeVisible();
      await machinePoolsPage.labelsAndTaintsTab().click();
      await expect(machinePoolsPage.closeMachinePoolModalButton()).toBeVisible();
      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Verify add machine pool modal additional elements', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.goToMachinePoolsTab();
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.nodeCountInput().fill(day2.ComputeNodeCount);

      await machinePoolsPage.rootDiskSizeInput().fill('125000');
      await expect(machinePoolsPage.getByText(day2.RootDiskSize.LimitError)).toBeVisible();
      await machinePoolsPage.rootDiskSizeInput().fill('16385');
      await expect(machinePoolsPage.getByText(day2.RootDiskSize.LimitError)).toBeVisible();
      await machinePoolsPage.rootDiskSizeInput().fill('555');

      await machinePoolsPage.labelsAndTaintsTab().click();
      await expect(machinePoolsPage.addLabelButton()).toBeEnabled();
      await expect(machinePoolsPage.addTaintButton()).toBeEnabled();

      await machinePoolsPage.costSavingsTab().click();
      await machinePoolsPage.spotInstanceCheckbox().check();
      await expect(machinePoolsPage.onDemandPriceRadio()).toBeChecked();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Configure autoscaling and name for new machine pool', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.machinePoolIdInput().fill(workerName);
      await machinePoolsPage.selectInstanceType(day2.NewMachinePool.InstanceType);
      await machinePoolsPage.setAutoscalingRange(
        day2.NewMachinePool.MinimumNodeCount,
        day2.NewMachinePool.MaximumNodeCount,
      );
    });

    test('Configure node labels and taints for new machine pool', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.labelsAndTaintsTab().click();

      await machinePoolsPage.setLabel(0, day2.NodeLabels[0].Key, day2.NodeLabels[0].Value);
      await machinePoolsPage.addLabelButton().click();
      await machinePoolsPage.setLabel(1, day2.NodeLabels[1].Key, day2.NodeLabels[1].Value);

      await machinePoolsPage.setTaint(
        0,
        day2.Taints[0].Key,
        day2.Taints[0].Value,
        day2.Taints[0].Effect,
      );
      await machinePoolsPage.addTaintButton().click();
      await machinePoolsPage.setTaint(
        1,
        day2.Taints[1].Key,
        day2.Taints[1].Value,
        day2.Taints[1].Effect,
      );
    });

    test('Configure security groups for new machine pool', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.securityGroupsTab().click();
      await expect(machinePoolsPage.securityGroupsNoChangeAlert()).toBeVisible();
      await expect(machinePoolsPage.securityGroupsToggle()).toBeVisible();
      await machinePoolsPage.selectFirstSecurityGroup();
    });

    test('Configure EC2 spot instance and submit machine pool', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.costSavingsTab().click();
      await machinePoolsPage.spotInstanceCheckbox().check();
      await machinePoolsPage.setMaxPriceRadio().check();
      await machinePoolsPage.maxPriceInput().clear();
      await machinePoolsPage.maxPriceInput().fill(day2.SetMaximumPrice);
      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });
      await expect(machinePoolsPage.getMachinePoolRow(workerName)).toBeVisible({ timeout: 30000 });
    });

    test('Expand and verify created machine pool details', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.expandMachinePoolRow(workerName);

      await machinePoolsPage.verifyLabels(
        workerName,
        day2.NodeLabels[0].Key,
        day2.NodeLabels[0].Value,
      );
      await machinePoolsPage.verifyLabels(
        workerName,
        day2.NodeLabels[1].Key,
        day2.NodeLabels[1].Value,
      );

      await machinePoolsPage.verifyTaints(
        workerName,
        day2.Taints[0].Key,
        day2.Taints[0].Value,
        day2.Taints[0].Effect,
      );
      await machinePoolsPage.verifyTaints(
        workerName,
        day2.Taints[1].Key,
        day2.Taints[1].Value,
        day2.Taints[1].Effect,
      );

      await machinePoolsPage.verifySpotInstancePricing(workerName, day2.SetMaximumPrice);

      await machinePoolsPage.verifyMultiZoneAutoscaling(
        workerName,
        day2.NewMachinePool.MinimumNodeCount,
        day2.NewMachinePool.MaximumNodeCount,
      );
    });

    test('Verify edit modal retains created values across all tabs', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(workerName);

      await expect(machinePoolsPage.autoscalingCheckbox()).toBeChecked();
      await expect(machinePoolsPage.autoscaleMinInput()).toHaveValue(
        day2.NewMachinePool.MinimumNodeCount,
      );
      await expect(machinePoolsPage.autoscaleMaxInput()).toHaveValue(
        day2.NewMachinePool.MaximumNodeCount,
      );

      await machinePoolsPage.labelsAndTaintsTab().click();
      await expect(machinePoolsPage.labelKeyInput(0)).toHaveValue(day2.NodeLabels[0].Key);
      await expect(machinePoolsPage.labelValueInput(0)).toHaveValue(day2.NodeLabels[0].Value);
      await expect(machinePoolsPage.labelKeyInput(1)).toHaveValue(day2.NodeLabels[1].Key);
      await expect(machinePoolsPage.labelValueInput(1)).toHaveValue(day2.NodeLabels[1].Value);
      await expect(machinePoolsPage.taintKeyInput(0)).toHaveValue(day2.Taints[0].Key);
      await expect(machinePoolsPage.taintValueInput(0)).toHaveValue(day2.Taints[0].Value);
      await expect(machinePoolsPage.taintKeyInput(1)).toHaveValue(day2.Taints[1].Key);
      await expect(machinePoolsPage.taintValueInput(1)).toHaveValue(day2.Taints[1].Value);

      await machinePoolsPage.costSavingsTab().click();
      await expect(machinePoolsPage.spotInstanceCheckbox()).toBeChecked();
      await expect(machinePoolsPage.spotInstanceCheckbox()).toBeDisabled();
      await expect(machinePoolsPage.setMaxPriceRadio()).toBeChecked();

      await machinePoolsPage.securityGroupsTab().click();
      await expect(machinePoolsPage.securityGroupsNoEditWarning()).toBeVisible();
      await expect(machinePoolsPage.securityGroupsEmptyMessage()).not.toBeVisible();
      await expect(machinePoolsPage.securityGroupsToggle()).not.toBeVisible();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Edit autoscaling range and labels', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(workerName);

      await machinePoolsPage.autoscaleMinInput().fill(editData.MinimumNodeCount);
      await machinePoolsPage.autoscaleMaxInput().fill(editData.MaximumNodeCount);

      await machinePoolsPage.labelsAndTaintsTab().click();
      await machinePoolsPage.setLabel(0, editData.NodeLabels[0].Key, editData.NodeLabels[0].Value);
      await machinePoolsPage.setLabel(1, editData.NodeLabels[1].Key, editData.NodeLabels[1].Value);

      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });
    });

    test('Verify edited machine pool details', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.goToMachinePoolsTab();
      await machinePoolsPage.expandMachinePoolRow(workerName);

      await machinePoolsPage.verifyLabels(
        workerName,
        editData.NodeLabels[0].Key,
        editData.NodeLabels[0].Value,
      );
      await machinePoolsPage.verifyLabels(
        workerName,
        editData.NodeLabels[1].Key,
        editData.NodeLabels[1].Value,
      );

      await machinePoolsPage.verifyMultiZoneAutoscaling(
        workerName,
        editData.MinimumNodeCount,
        editData.MaximumNodeCount,
      );
    });

    test('Verify overview page nodes and autoscaling', async ({
      clusterDetailsPage,
      machinePoolsPage,
    }) => {
      await clusterDetailsPage.overviewTab().click();

      for (const nodeType of ['Control plane', 'Infra', 'Compute'] as const) {
        await machinePoolsPage.verifyOverviewProperty('Nodes', day2.Nodes[nodeType]);
      }
      await machinePoolsPage.verifyOverviewProperty(
        'Autoscale',
        day2.NewMachinePool.Autoscaling,
      );

      const expectedMin = (Number(defaultPool.MinimumNodeCount) + Number(editData.MinimumNodeCount)) * zoneCount;
      const expectedMax = (Number(defaultPool.MaximumNodeCount) + Number(editData.MaximumNodeCount)) * zoneCount;
      await machinePoolsPage.verifyOverviewMinMaxNodeCount('Min:', expectedMin);
      await machinePoolsPage.verifyOverviewMinMaxNodeCount('Max:', expectedMax);
    });

    test('Delete created machine pool', async ({
      clusterDetailsPage,
      machinePoolsPage,
    }) => {
      await clusterDetailsPage.overviewTab().waitFor({ state: 'visible' });
      await machinePoolsPage.goToMachinePoolsTab();
      await machinePoolsPage.deleteMachinePool(workerName);
    });

    test.afterAll(async ({ machinePoolsPage }) => {
      const row = machinePoolsPage.getMachinePoolRow(workerName);
      const isVisible = await row
        .waitFor({ state: 'visible', timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      if (isVisible) {
        await machinePoolsPage.deleteMachinePool(workerName);
      }
    });
  },
);
