import { expect, test } from '../../fixtures/pages';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const machinePoolFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-machine-pool-definitions.spec.json');
const clusterProperties = clusterProfiles['rosa-hosted-public-advanced']['day1-profile'];
const { MinimumNodeCount, MaximumNodeCount } = machinePoolFixture.Autoscaling;
const definitions = machinePoolFixture.Definitions;
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
  'ROSA HCP Machine Pool - IMDS, labels, taints, AWS tags, and maintenance',
  {
    tag: [
      '@day2',
      '@advanced',
      '@rosa',
      '@rosa-hosted',
      '@machine-pool',
      '@hcp',
      '@machine-pool-definitions',
    ],
  },
  () => {
    // HCP node pool names are limited to 15 characters.
    const machinePoolId = `mp-df-${Math.random().toString(36).slice(2, 7)}`;
    const [firstLabel, secondLabel] = definitions.NodeLabels;
    const [firstTaint, secondTaint] = definitions.Taints;
    const awsTag = definitions.AwsTag;

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

    test('Configure IMDS, maintenance, labels, and create the machine pool', async ({
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
      await expect(machinePoolsPage.getByText(definitions.ImdsV2Description)).toBeVisible();
      await expect(machinePoolsPage.getByText(definitions.ImdsV1AndV2Description)).toBeVisible();

      await machinePoolsPage.imdsV1AndV2Radio().check();
      await expect(machinePoolsPage.imdsV1AndV2Radio()).toBeChecked();
      await expect(machinePoolsPage.imdsV2OnlyRadio()).not.toBeChecked();

      await machinePoolsPage.goToMaintenanceTab();
      await expect(machinePoolsPage.autoRepairCheckbox()).toBeChecked();
      await expect(machinePoolsPage.getByText(definitions.AutoRepairDescription)).toBeVisible();
      await expect(machinePoolsPage.getByText(definitions.UpgradeDescription)).toBeVisible();
      await expect(machinePoolsPage.maxSurgeInput()).toHaveValue(definitions.DefaultMaxSurge);
      await expect(machinePoolsPage.maxUnavailableInput()).toHaveValue(
        definitions.DefaultMaxUnavailable,
      );
      await expect(machinePoolsPage.nodeDrainTimeoutInput()).toHaveValue(
        definitions.DefaultNodeDrainTimeout,
      );

      await machinePoolsPage.maxSurgeHintButton().click();
      await expect(machinePoolsPage.helpPopover(definitions.MaxSurgeHint)).toContainText(
        definitions.MaxSurgeHint,
      );
      await machinePoolsPage.closeHelpPopover();

      await machinePoolsPage.maxUnavailableHintButton().click();
      await expect(machinePoolsPage.helpPopover(definitions.MaxUnavailableHint)).toContainText(
        definitions.MaxUnavailableHint,
      );
      await machinePoolsPage.closeHelpPopover();

      await machinePoolsPage.nodeDrainTimeoutHintButton().click();
      await expect(machinePoolsPage.helpPopover(definitions.NodeDrainTimeoutHint)).toContainText(
        definitions.NodeDrainTimeoutHint,
      );
      await machinePoolsPage.closeHelpPopover();

      await machinePoolsPage.maxSurgeInput().fill(definitions.BothZeroValue);
      await machinePoolsPage.maxSurgeInput().blur();
      // Helper text stays hidden until the field is touched. blur() does not fire
      // unless the input is focused, and this value is already the default.
      await machinePoolsPage.maxUnavailableInput().focus();
      await machinePoolsPage.maxUnavailableInput().blur();
      await expect(machinePoolsPage.getByText(definitions.BothZeroSurgeError)).toBeVisible();
      await expect(machinePoolsPage.getByText(definitions.BothZeroUnavailableError)).toBeVisible();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();

      await machinePoolsPage.maxSurgeInput().fill(definitions.MaxSurge);
      await machinePoolsPage.maxUnavailableInput().fill(definitions.MaxUnavailable);
      await machinePoolsPage.nodeDrainTimeoutInput().fill(definitions.NodeDrainAboveMax);
      await machinePoolsPage.nodeDrainTimeoutInput().blur();
      await expect(machinePoolsPage.getByText(definitions.NodeDrainMaxError)).toBeVisible();
      await expect(machinePoolsPage.getByText(definitions.BothZeroSurgeError)).toBeHidden();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();

      await machinePoolsPage.nodeDrainTimeoutInput().fill(definitions.NodeDrainTimeout);
      await machinePoolsPage.nodeDrainTimeoutInput().blur();
      await expect(machinePoolsPage.getByText(definitions.NodeDrainMaxError)).toBeHidden();
      await machinePoolsPage.autoRepairCheckbox().uncheck();
      await expect(machinePoolsPage.autoRepairCheckbox()).not.toBeChecked();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeEnabled();

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

      // IMDS is collected only when the pool is created, so the create request is the check.
      const body = await machinePoolsPage.submitNewNodePool();

      expect(body.id).toBe(machinePoolId);
      expect(body.aws_node_pool?.ec2_metadata_http_tokens).toBe(definitions.ImdsV1AndV2Value);
      expect(body.auto_repair).toBe(false);
      expect(body.management_upgrade).toMatchObject({
        max_surge: definitions.MaxSurge,
        max_unavailable: definitions.MaxUnavailable,
      });
      expect(String(body.node_drain_grace_period?.value)).toBe(definitions.NodeDrainTimeout);
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

    test('Verify created labels, taints, AWS tags, and AutoRepair', async ({
      machinePoolsPage,
    }) => {
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
      await machinePoolsPage.verifyAutoRepair(machinePoolId, 'Disabled');
    });

    test('Edit labels and maintenance and verify AWS tags and IMDS stay fixed', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(machinePoolId);

      await expect(machinePoolsPage.imdsV2OnlyRadio()).toHaveCount(0);
      await expect(machinePoolsPage.imdsV1AndV2Radio()).toHaveCount(0);

      await machinePoolsPage.goToMaintenanceTab();
      await expect(machinePoolsPage.autoRepairCheckbox()).not.toBeChecked();
      await expect(machinePoolsPage.maxSurgeInput()).toHaveValue(definitions.MaxSurge);
      await expect(machinePoolsPage.maxUnavailableInput()).toHaveValue(definitions.MaxUnavailable);
      await expect(machinePoolsPage.nodeDrainTimeoutInput()).toHaveValue(
        definitions.NodeDrainTimeout,
      );
      await machinePoolsPage.autoRepairCheckbox().check();
      await machinePoolsPage.maxSurgeInput().fill(definitions.EditedMaxSurge);

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
        definitions.EditedNodeLabel.Key,
        definitions.EditedNodeLabel.Value,
      );
      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });
    });

    test('Verify the edited label, AutoRepair, and maintenance values', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.expandMachinePoolRow(machinePoolId);
      await machinePoolsPage.verifyLabels(
        machinePoolId,
        definitions.EditedNodeLabel.Key,
        definitions.EditedNodeLabel.Value,
      );
      await machinePoolsPage.verifyLabels(machinePoolId, secondLabel.Key, secondLabel.Value);
      await machinePoolsPage.verifyTaints(
        machinePoolId,
        firstTaint.Key,
        firstTaint.Value,
        firstTaint.Effect,
      );
      await machinePoolsPage.verifyAwsTag(machinePoolId, awsTag.Key, awsTag.Value);
      await machinePoolsPage.verifyAutoRepair(machinePoolId, 'Enabled');

      await machinePoolsPage.editMachinePool(machinePoolId);
      await machinePoolsPage.goToMaintenanceTab();
      await expect(machinePoolsPage.autoRepairCheckbox()).toBeChecked();
      await expect(machinePoolsPage.maxSurgeInput()).toHaveValue(definitions.EditedMaxSurge);
      await expect(machinePoolsPage.maxUnavailableInput()).toHaveValue(definitions.MaxUnavailable);
      await expect(machinePoolsPage.nodeDrainTimeoutInput()).toHaveValue(
        definitions.NodeDrainTimeout,
      );
      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test('Delete the definitions machine pool', async ({ machinePoolsPage }) => {
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
