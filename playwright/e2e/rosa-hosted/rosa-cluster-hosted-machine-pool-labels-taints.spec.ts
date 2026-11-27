import { expect, test } from '../../fixtures/pages';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const machinePoolFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-machine-pool-labels-taints.spec.json');
const clusterProperties = clusterProfiles['rosa-hosted-public-advanced']['day1-profile'];
const { MinimumNodeCount, MaximumNodeCount } = machinePoolFixture.Autoscaling;
const labelsAndTaints = machinePoolFixture.LabelsAndTaints;
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
  'ROSA HCP Machine Pool - Labels, taints, and AWS tags',
  {
    tag: ['@day2', '@advanced', '@rosa', '@rosa-hosted', '@machine-pool', '@hcp', '@labels-taints'],
  },
  () => {
    // HCP node pool names are limited to 15 characters.
    const machinePoolId = `mp-lt-${Math.random().toString(36).slice(2, 7)}`;
    const [firstLabel, secondLabel] = labelsAndTaints.NodeLabels;
    const [firstTaint, secondTaint] = labelsAndTaints.Taints;
    const awsTag = labelsAndTaints.AwsTag;

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

    test('Create a machine pool with labels, taints, and an AWS tag', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.fillHostedMachinePoolBasics(
        machinePoolId,
        privateSubnetName,
        MinimumNodeCount,
        MaximumNodeCount,
      );
      await machinePoolsPage.openTaintsSection();
      await expect(machinePoolsPage.addLabelButton()).toBeEnabled();
      await expect(machinePoolsPage.addTaintButton()).toBeEnabled();
      await expect(machinePoolsPage.addAwsTagButton()).toBeEnabled();

      await machinePoolsPage.setLabel(0, firstLabel.Key, firstLabel.Value);
      await machinePoolsPage.addLabelButton().click();
      await machinePoolsPage.setLabel(1, secondLabel.Key, secondLabel.Value);

      await machinePoolsPage.setTaint(0, firstTaint.Key, firstTaint.Value, firstTaint.Effect);
      await machinePoolsPage.addTaintButton().click();
      await machinePoolsPage.setTaint(1, secondTaint.Key, secondTaint.Value, secondTaint.Effect);

      await machinePoolsPage.setAwsTag(0, awsTag.Key, awsTag.Value);

      const body = await machinePoolsPage.submitNewNodePool();

      expect(body.id).toBe(machinePoolId);
      expect(body.labels).toMatchObject({
        [firstLabel.Key]: firstLabel.Value,
        [secondLabel.Key]: secondLabel.Value,
      });
      expect(body.taints).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: firstTaint.Key,
            value: firstTaint.Value,
            effect: firstTaint.Effect,
          }),
          expect.objectContaining({
            key: secondTaint.Key,
            value: secondTaint.Value,
            effect: secondTaint.Effect,
          }),
        ]),
      );
      expect(body.aws_node_pool?.tags).toMatchObject({ [awsTag.Key]: awsTag.Value });

      await expect(machinePoolsPage.getMachinePoolRow(machinePoolId)).toBeVisible({
        timeout: 60000,
      });
    });

    test('Verify created labels, taints, and AWS tags', async ({ machinePoolsPage }) => {
      await machinePoolsPage.expandMachinePoolRow(machinePoolId);
      await machinePoolsPage.verifyLabels(machinePoolId, firstLabel.Key, firstLabel.Value);
      await machinePoolsPage.verifyLabels(machinePoolId, secondLabel.Key, secondLabel.Value);
      await machinePoolsPage.verifyTaints(
        machinePoolId,
        firstTaint.Key,
        firstTaint.Value,
        firstTaint.Effect,
      );
      await machinePoolsPage.verifyTaints(
        machinePoolId,
        secondTaint.Key,
        secondTaint.Value,
        secondTaint.Effect,
      );
      await machinePoolsPage.verifyAwsTag(machinePoolId, awsTag.Key, awsTag.Value);
    });

    test('Edit a label and confirm AWS tags stay fixed', async ({ machinePoolsPage }) => {
      await machinePoolsPage.editMachinePool(machinePoolId);
      await machinePoolsPage.openTaintsSection();

      const zoneLabelRow = await machinePoolsPage.labelRowIndex(firstLabel.Key);
      const secondLabelRow = await machinePoolsPage.labelRowIndex(secondLabel.Key);
      await expect(machinePoolsPage.labelKeyInput(zoneLabelRow)).toHaveValue(firstLabel.Key);
      await expect(machinePoolsPage.labelValueInput(zoneLabelRow)).toHaveValue(firstLabel.Value);
      await expect(machinePoolsPage.labelKeyInput(secondLabelRow)).toHaveValue(secondLabel.Key);
      await expect(machinePoolsPage.labelValueInput(secondLabelRow)).toHaveValue(secondLabel.Value);
      await expect(machinePoolsPage.taintKeyInput(0)).toHaveValue(firstTaint.Key);
      await expect(machinePoolsPage.taintValueInput(0)).toHaveValue(firstTaint.Value);
      await expect(machinePoolsPage.taintKeyInput(1)).toHaveValue(secondTaint.Key);
      await expect(machinePoolsPage.taintValueInput(1)).toHaveValue(secondTaint.Value);
      const awsTagRow = await machinePoolsPage.awsTagRowIndex(awsTag.Key);
      await expect(machinePoolsPage.awsTagKeyInput(awsTagRow)).toHaveValue(awsTag.Key);
      await expect(machinePoolsPage.awsTagValueInput(awsTagRow)).toHaveValue(awsTag.Value);
      await expect(machinePoolsPage.awsTagKeyInput(awsTagRow)).not.toBeEditable();
      await expect(machinePoolsPage.awsTagValueInput(awsTagRow)).not.toBeEditable();
      await expect(machinePoolsPage.awsTagsImmutableAlert()).toBeVisible();
      await expect(machinePoolsPage.addAwsTagButton()).toHaveAttribute('aria-disabled', 'true');
      await expect(machinePoolsPage.labelKeyInput(zoneLabelRow)).toBeEditable();

      await machinePoolsPage.setLabel(
        zoneLabelRow,
        labelsAndTaints.EditedNodeLabel.Key,
        labelsAndTaints.EditedNodeLabel.Value,
      );
      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });
    });

    test('Verify the edited label, taints, and AWS tag', async ({ machinePoolsPage }) => {
      await machinePoolsPage.expandMachinePoolRow(machinePoolId);
      await machinePoolsPage.verifyLabels(
        machinePoolId,
        labelsAndTaints.EditedNodeLabel.Key,
        labelsAndTaints.EditedNodeLabel.Value,
      );
      await machinePoolsPage.verifyLabels(machinePoolId, secondLabel.Key, secondLabel.Value);
      await machinePoolsPage.verifyTaints(
        machinePoolId,
        firstTaint.Key,
        firstTaint.Value,
        firstTaint.Effect,
      );
      await machinePoolsPage.verifyAwsTag(machinePoolId, awsTag.Key, awsTag.Value);
    });

    test('Delete the labels and taints machine pool', async ({ machinePoolsPage }) => {
      await machinePoolsPage.deleteMachinePool(machinePoolId);
    });

    test.afterAll(async ({ machinePoolsPage }) => {
      try {
        await machinePoolsPage.dismissMachinePoolModalIfOpen();
      } catch {
        console.error('afterAll: failed to dismiss machine pool modal');
      }
      try {
        await machinePoolsPage.goToMachinePoolsTab();
        if (await machinePoolsPage.getMachinePoolRow(machinePoolId).isVisible()) {
          await machinePoolsPage.deleteMachinePool(machinePoolId);
        }
      } catch {
        console.error(`Failed to delete machine pool ${machinePoolId} or already deleted`);
      }
    });
  },
);
