import { test, expect } from '../../fixtures/pages';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const clusterProperties = clusterProfiles['rosa-hosted-public-advanced']['day1-profile'];
const costSavings =
  clusterProfiles['rosa-hosted-public-advanced']['day2-profile'].MachinePools.CostSavings;
const validationFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-wizard-validation.spec.json');
const spot = validationFixture.ClusterSettings.Machinepool.SpotInterruption;
const clusterName = process.env.CLUSTER_NAME || clusterProperties.ClusterName;
const region = clusterProperties.Region.split(',')[0];
const qeInfrastructure = JSON.parse(process.env.QE_INFRA_REGIONS || '{}')[region]?.[0] || {};
const zones = qeInfrastructure.SUBNETS?.ZONES;
const firstZone = Object.keys(zones || {})[0];
const privateSubnetName = zones?.[firstZone]?.PRIVATE_SUBNET_NAME;
const spotInterruptionQueueUrl = process.env.QE_SPOT_INTERRUPTION_QUEUE_URL || '';
const withRegion = (value: string, urlRegion: string = region) =>
  value.replace(/\{region\}/g, urlRegion);
const mismatchRegion = region === spot.MismatchRegion ? 'us-west-2' : spot.MismatchRegion;
const mismatchQueueUrl = `https://sqs.${mismatchRegion}.amazonaws.com/${spot.AccountId}/${spot.ValidQueueName}`;
const tooLongQueueUrl = `https://sqs.${region}.amazonaws.com/${spot.AccountId}/${'a'.repeat(
  spot.QueueNameMaxLength + 1,
)}`;

test.describe.serial(
  'ROSA HCP Spot interruption handling and machine pool Cost savings tests',
  { tag: ['@day2', '@machine-pool', '@rosa-hosted', '@hcp', '@spot-instances'] },
  () => {
    // HCP node pool names are limited to 15 characters.
    const onDemandMachinePoolId = `mp-od-${Math.random().toString(36).slice(2, 7)}`;
    const maxPriceMachinePoolId = `mp-mx-${Math.random().toString(36).slice(2, 7)}`;
    const createdMachinePoolIds = [onDemandMachinePoolId, maxPriceMachinePoolId];
    let originalSpotMode = '';
    let originalSqsQueueUrl = '';
    let defaultMachinePoolId = '';
    let restoredSpotInterruptionHandling = false;

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      if (!privateSubnetName) {
        throw new Error(
          `SUBNETS.ZONES PRIVATE_SUBNET_NAME is not defined in QE_INFRA_REGIONS for region "${region}"`,
        );
      }
      if (!spotInterruptionQueueUrl) {
        throw new Error('Missing required env var: QE_SPOT_INTERRUPTION_QUEUE_URL');
      }
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
    });

    test('Navigate to HCP cluster Overview page', async ({
      clusterListPage,
      clusterDetailsPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName, 'startsWith');
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await expect(clusterDetailsPage.overviewTab()).toBeVisible();
    });

    test('Verify Spot interruption handling on Overview', async ({ clusterDetailsPage }) => {
      await expect(clusterDetailsPage.spotInterruptionHandlingTerm()).toBeVisible();
      await expect(clusterDetailsPage.overviewSpotInterruptionMode()).toBeVisible();
      originalSpotMode = (
        await clusterDetailsPage.overviewSpotInterruptionMode().innerText()
      ).trim();
      await expect(clusterDetailsPage.overviewSpotInterruptionMode()).toHaveText(
        new RegExp(
          `${costSavings.SpotInterruptionHandlingSimple}|${costSavings.SpotInterruptionHandlingEnhanced}`,
        ),
      );
      await expect(clusterDetailsPage.editSpotInterruptionHandlingButton()).toBeVisible();
      if (originalSpotMode === costSavings.SpotInterruptionHandlingEnhanced) {
        await expect(clusterDetailsPage.overviewSqsQueueUrl()).toBeVisible();
        originalSqsQueueUrl = await clusterDetailsPage.overviewSqsQueueUrlValue();
      } else {
        await expect(clusterDetailsPage.overviewSqsQueueUrl()).toBeHidden();
      }
    });

    test('Validate SQS queue URL and save Enhanced Spot interruption handling', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openEditSpotInterruptionHandlingModal();
      await expect(clusterDetailsPage.simpleSpotInstancesRadio()).toBeVisible();
      await expect(clusterDetailsPage.enhancedSpotInstancesRadio()).toBeVisible();

      await clusterDetailsPage.simpleSpotInstancesRadio().check();
      await expect(clusterDetailsPage.simpleSpotInstancesRadio()).toBeChecked();
      await expect(clusterDetailsPage.sqsQueueUrlInput()).toBeHidden();

      await expect(clusterDetailsPage.enhancedSpotInstancesRadio()).toBeEnabled();
      await clusterDetailsPage.enhancedSpotInstancesRadio().check();
      await expect(clusterDetailsPage.enhancedSpotInstancesRadio()).toBeChecked();
      await expect(clusterDetailsPage.simpleSpotInstancesRadio()).not.toBeChecked();
      await expect(clusterDetailsPage.sqsQueueUrlInput()).toBeVisible();

      await clusterDetailsPage.fillSqsQueueUrl('');
      await clusterDetailsPage.isTextContainsInPage(spot.RequiredError);

      await clusterDetailsPage.fillSqsQueueUrl(spot.InvalidUrlValue);
      await clusterDetailsPage.isTextContainsInPage(spot.HttpsSchemeError);
      await clusterDetailsPage.isTextContainsInPage(spot.RequiredError, false);

      await clusterDetailsPage.fillSqsQueueUrl(withRegion(spot.HttpUrlValue));
      await clusterDetailsPage.isTextContainsInPage(spot.HttpsSchemeError);

      await clusterDetailsPage.fillSqsQueueUrl(spot.NonSqsUrlValue);
      await clusterDetailsPage.isTextContainsInPage(spot.InvalidSqsUrlError);
      await clusterDetailsPage.isTextContainsInPage(spot.HttpsSchemeError, false);

      await clusterDetailsPage.fillSqsQueueUrl(withRegion(spot.IncompletePathValue));
      await clusterDetailsPage.isTextContainsInPage(spot.InvalidSqsUrlError);

      await clusterDetailsPage.fillSqsQueueUrl(withRegion(spot.WhitespaceInNameValue));
      await clusterDetailsPage.isTextContainsInPage(spot.InvalidSqsUrlError);

      await clusterDetailsPage.fillSqsQueueUrl(mismatchQueueUrl);
      await clusterDetailsPage.isTextContainsInPage(withRegion(spot.RegionMismatchError));
      await clusterDetailsPage.isTextContainsInPage(spot.InvalidSqsUrlError, false);

      await clusterDetailsPage.fillSqsQueueUrl(tooLongQueueUrl);
      await clusterDetailsPage.isTextContainsInPage(spot.QueueNameMaxLengthError);
      await clusterDetailsPage.isTextContainsInPage(withRegion(spot.RegionMismatchError), false);

      await clusterDetailsPage.fillSqsQueueUrl(spotInterruptionQueueUrl);
      await clusterDetailsPage.isTextContainsInPage(spot.QueueNameMaxLengthError, false);
      await clusterDetailsPage.isTextContainsInPage(spot.RequiredError, false);
      await clusterDetailsPage.isTextContainsInPage(spot.HttpsSchemeError, false);
      await clusterDetailsPage.isTextContainsInPage(spot.InvalidSqsUrlError, false);
      await clusterDetailsPage.isTextContainsInPage(withRegion(spot.RegionMismatchError), false);
      await clusterDetailsPage.cancelSpotInterruptionHandlingButton().click();
      await expect(clusterDetailsPage.editSpotInterruptionHandlingModal()).toBeHidden();
    });

    test('Save Enhanced Spot interruption handling and verify Overview', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openEditSpotInterruptionHandlingModal();
      await clusterDetailsPage.enhancedSpotInstancesRadio().check();
      await clusterDetailsPage.fillSqsQueueUrl(spotInterruptionQueueUrl);
      if (await clusterDetailsPage.saveSpotInterruptionHandlingButton().isDisabled()) {
        await clusterDetailsPage.simpleSpotInstancesRadio().check();
        await clusterDetailsPage.saveSpotInterruptionHandling();
        await clusterDetailsPage.openEditSpotInterruptionHandlingModal();
        await clusterDetailsPage.enhancedSpotInstancesRadio().check();
        await clusterDetailsPage.fillSqsQueueUrl(spotInterruptionQueueUrl);
      }
      await clusterDetailsPage.saveSpotInterruptionHandling();
      await expect(clusterDetailsPage.overviewSpotInterruptionMode()).toHaveText(
        costSavings.SpotInterruptionHandlingEnhanced,
      );
      await expect(clusterDetailsPage.overviewSqsQueueUrl()).toContainText(
        spotInterruptionQueueUrl,
      );
    });

    test('Switch Spot interruption handling from Enhanced to Simple', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.openEditSpotInterruptionHandlingModal();
      await expect(clusterDetailsPage.enhancedSpotInstancesRadio()).toBeChecked();
      await expect(clusterDetailsPage.sqsQueueUrlInput()).toBeVisible();
      await clusterDetailsPage.simpleSpotInstancesRadio().check();
      await expect(clusterDetailsPage.simpleSpotInstancesRadio()).toBeChecked();
      await expect(clusterDetailsPage.sqsQueueUrlInput()).toBeHidden();
      await clusterDetailsPage.saveSpotInterruptionHandling();
      await expect(clusterDetailsPage.overviewSpotInterruptionMode()).toHaveText(
        costSavings.SpotInterruptionHandlingSimple,
      );
      await expect(clusterDetailsPage.overviewSqsQueueUrl()).toBeHidden();
    });

    test('Navigate to Machine pools tab', async ({ machinePoolsPage }) => {
      await machinePoolsPage.goToMachinePoolsTab();
      defaultMachinePoolId = await machinePoolsPage.firstExistingMachinePoolId();
    });

    test('Check Cost savings tab fields in Add machine pool modal', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await expect(machinePoolsPage.costSavingsTab()).toBeVisible();
      await machinePoolsPage.goToCostSavingsTab();

      await expect(machinePoolsPage.spotInstanceCheckbox()).toBeVisible();
      await expect(machinePoolsPage.spotInstanceCheckbox()).toBeEnabled();
      await expect(machinePoolsPage.spotInstanceCheckbox()).not.toBeChecked();
      await expect(machinePoolsPage.onDemandPriceRadio()).toBeHidden();
      await expect(machinePoolsPage.setMaxPriceRadio()).toBeHidden();
      await expect(machinePoolsPage.spotInterruptionHandlingMode()).toBeHidden();

      await machinePoolsPage.spotInstanceCheckbox().check();
      await expect(machinePoolsPage.spotInstanceCheckbox()).toBeChecked();
      await expect(machinePoolsPage.onDemandPriceRadio()).toBeVisible();
      await expect(machinePoolsPage.onDemandPriceRadio()).toBeChecked();
      await expect(machinePoolsPage.setMaxPriceRadio()).toBeVisible();
      await expect(machinePoolsPage.setMaxPriceRadio()).not.toBeChecked();
      await expect(machinePoolsPage.spotInstanceWarningAlert()).toBeVisible();
      await expect(machinePoolsPage.spotInterruptionHandlingMode()).toBeVisible();
      await expect(machinePoolsPage.spotInterruptionHandlingMode()).toHaveText(
        costSavings.SpotInterruptionHandlingSimple,
      );

      await machinePoolsPage.setMaxPriceRadio().check();
      await expect(machinePoolsPage.maxPriceInput()).toBeVisible();
      await machinePoolsPage.isTextContainsInPage(costSavings.MaxPriceHelper);
      await expect(machinePoolsPage.costSavingsTabValidationError()).toBeHidden();

      await machinePoolsPage.maxPriceInput().clear();
      await machinePoolsPage.maxPriceInput().fill(costSavings.InvalidMaxPrice);
      await machinePoolsPage.maxPriceInput().blur();
      await machinePoolsPage.isTextContainsInPage(costSavings.MaxPriceLimitError);
      await expect(machinePoolsPage.costSavingsTabValidationError()).toBeVisible();

      await machinePoolsPage.maxPriceInput().clear();
      await machinePoolsPage.maxPriceInput().fill(costSavings.SetMaximumPrice);
      await machinePoolsPage.maxPriceInput().blur();
      await machinePoolsPage.isTextContainsInPage(costSavings.MaxPriceHelper);
      await expect(machinePoolsPage.costSavingsTabValidationError()).toBeHidden();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Verify Spot instances and Capacity Reservation cannot both be enabled', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.goToCostSavingsTab();
      await machinePoolsPage.spotInstanceCheckbox().check();

      await machinePoolsPage.goToMachinePoolOverviewTab();
      await expect(machinePoolsPage.capacityReservationPreferenceSelect()).toBeDisabled();
      await machinePoolsPage.hoverCapacityReservationPreference();
      await expect(machinePoolsPage.spotCapacityReservationConflictTooltip()).toBeVisible();

      await machinePoolsPage.goToCostSavingsTab();
      await machinePoolsPage.spotInstanceCheckbox().uncheck();
      await machinePoolsPage.goToMachinePoolOverviewTab();
      await expect(machinePoolsPage.capacityReservationPreferenceSelect()).toBeEnabled();
      await machinePoolsPage.selectCapacityReservationPreference('Open');

      await machinePoolsPage.goToCostSavingsTab();
      await expect(machinePoolsPage.spotInstanceCheckbox()).toBeDisabled();
      await expect(machinePoolsPage.spotInstanceCheckbox()).not.toBeChecked();
      await machinePoolsPage.hoverSpotInstanceCheckbox();
      await expect(machinePoolsPage.spotCapacityReservationConflictTooltip()).toBeVisible();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Verify Cost savings is disabled on a default machine pool', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(defaultMachinePoolId);
      await machinePoolsPage.goToCostSavingsTab();
      await expect(machinePoolsPage.spotInstanceCheckbox()).toBeDisabled();
      await expect(machinePoolsPage.spotInstanceCheckbox()).not.toBeChecked();
      await machinePoolsPage.hoverSpotInstanceCheckbox();
      await expect(machinePoolsPage.spotInstanceImmutableTooltip()).toBeVisible();
      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Create machine pool with On-Demand Spot instances', async ({ machinePoolsPage }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.machinePoolIdInput().fill(onDemandMachinePoolId);
      await machinePoolsPage.selectPrivateSubnet(privateSubnetName);
      await machinePoolsPage.goToCostSavingsTab();
      await machinePoolsPage.spotInstanceCheckbox().check();
      await expect(machinePoolsPage.onDemandPriceRadio()).toBeChecked();
      await machinePoolsPage.clickAddMachinePoolSubmitButton();

      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 30000 });
      await expect(machinePoolsPage.getMachinePoolRow(onDemandMachinePoolId)).toBeVisible({
        timeout: 60000,
      });
      await machinePoolsPage.expandMachinePoolRow(onDemandMachinePoolId);
      await machinePoolsPage.verifySpotOnDemandPricing(onDemandMachinePoolId);
    });

    test('Create machine pool with maximum hourly Spot price', async ({ machinePoolsPage }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.machinePoolIdInput().fill(maxPriceMachinePoolId);
      await machinePoolsPage.selectPrivateSubnet(privateSubnetName);
      await machinePoolsPage.goToCostSavingsTab();
      await machinePoolsPage.spotInstanceCheckbox().check();
      await machinePoolsPage.setMaxPriceRadio().check();
      await machinePoolsPage.maxPriceInput().clear();
      await machinePoolsPage.maxPriceInput().fill(costSavings.SetMaximumPrice);
      await machinePoolsPage.clickAddMachinePoolSubmitButton();

      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 30000 });
      await expect(machinePoolsPage.getMachinePoolRow(maxPriceMachinePoolId)).toBeVisible({
        timeout: 60000,
      });
      await machinePoolsPage.expandMachinePoolRow(maxPriceMachinePoolId);
      await machinePoolsPage.verifySpotInstancePricing(
        maxPriceMachinePoolId,
        costSavings.SetMaximumPrice,
      );
    });

    test('Edit Spot machine pool and verify Cost savings settings are immutable', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(maxPriceMachinePoolId);
      await machinePoolsPage.goToCostSavingsTab();
      await expect(machinePoolsPage.spotInstanceCheckbox()).toBeChecked();
      await expect(machinePoolsPage.spotInstanceCheckbox()).toBeDisabled();
      await expect(machinePoolsPage.setMaxPriceRadio()).toBeChecked();
      await expect(machinePoolsPage.setMaxPriceRadio()).toBeDisabled();
      await expect(machinePoolsPage.maxPriceInput()).toBeDisabled();
      await machinePoolsPage.hoverSpotInstanceCheckbox();
      await expect(machinePoolsPage.spotInstanceImmutableTooltip()).toBeVisible();
      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Delete created Spot machine pools', async ({ machinePoolsPage }) => {
      for (const id of createdMachinePoolIds) {
        await machinePoolsPage.deleteMachinePool(id);
        await expect(machinePoolsPage.getMachinePoolRow(id)).toHaveCount(0, { timeout: 60000 });
      }
    });

    // Put the cluster back to the mode recorded on Overview so later Day 2 runs
    // are not left on a different Simple/Enhanced setting.
    test('Restore original Spot interruption handling', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.restoreSpotInterruptionHandling(
        originalSpotMode,
        costSavings.SpotInterruptionHandlingEnhanced,
        originalSqsQueueUrl || spotInterruptionQueueUrl,
      );
      restoredSpotInterruptionHandling = true;
    });

    test.afterAll(async ({ machinePoolsPage, clusterDetailsPage }) => {
      try {
        await machinePoolsPage.dismissMachinePoolModalIfOpen();
      } catch {
        console.error('afterAll: failed to dismiss machine pool modal');
      }
      if (await clusterDetailsPage.editSpotInterruptionHandlingModal().isVisible()) {
        await clusterDetailsPage.cancelSpotInterruptionHandlingButton().click();
      }

      for (const id of createdMachinePoolIds) {
        try {
          await machinePoolsPage.goToMachinePoolsTab();
          if (await machinePoolsPage.getMachinePoolRow(id).isVisible()) {
            await machinePoolsPage.deleteMachinePool(id);
          }
        } catch {
          console.error(`Failed to delete machine pool ${id} or already deleted`);
        }
      }

      if (restoredSpotInterruptionHandling || !originalSpotMode) {
        return;
      }
      try {
        await clusterDetailsPage.restoreSpotInterruptionHandling(
          originalSpotMode,
          costSavings.SpotInterruptionHandlingEnhanced,
          originalSqsQueueUrl || spotInterruptionQueueUrl,
        );
      } catch (error) {
        console.error('afterAll: failed to restore Spot interruption handling', error);
      }
    });
  },
);
