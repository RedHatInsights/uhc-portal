import { MAX_NODES } from '../../../src/components/clusters/common/machinePools/constants';
import { expect, test } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';
import { CLUSTER_LIST_ROUTE, DEFAULT_NAVIGATION_TIMEOUT } from '../../support/playwright-constants';
import { clearQuotaCostMock, mockEmptyQuotaCost } from '../../support/quota-mock-helper';

const day1Profile = require('../../fixtures/osd-gcp/osd-ondemand-gcp-wif-public-advanced-cluster-creation.spec.json');

const clusterName = process.env.CLUSTER_NAME || `${day1Profile.ClusterName}-${getUsernameSuffix()}`;

let newMachinePoolId: string;

test.describe.serial(
  'OSD On-Demand GCP WIF public advanced - Machine pools quota bypass',
  {
    tag: [
      '@day2',
      '@osd',
      '@gcp',
      '@wif',
      '@ondemand',
      '@public',
      '@advanced',
      '@machine-pool',
      '@quota',
    ],
  },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      newMachinePoolId = `mp-quota-${getUsernameSuffix()}${Math.random().toString(36).slice(2, 6)}`;

      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test('navigates to cluster and opens the Machine pools tab', async ({
      clusterListPage,
      clusterDetailsPage,
      machinePoolsPage,
    }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName, 'startsWith');
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await clusterDetailsPage.isClusterDetailsPage(clusterName);
      await machinePoolsPage.goToMachinePoolsTab();
    });

    test('Add machine pool button is enabled despite empty org quota', async ({
      clusterDetailsPage,
      machinePoolsPage,
      page,
    }) => {
      await mockEmptyQuotaCost(page);
      await clusterDetailsPage.clusterDetailsPageRefresh();
      await machinePoolsPage.goToMachinePoolsTab();

      await expect(machinePoolsPage.addMachinePoolButton()).toBeVisible();
      await expect(machinePoolsPage.addMachinePoolButton()).not.toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    test('Add machine pool modal allows selecting an instance type with empty org quota', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();

      await machinePoolsPage.selectInstanceType(day1Profile.MachinePools[0].InstanceType);
      await expect(machinePoolsPage.instanceTypeSelectButton()).toContainText(
        day1Profile.MachinePools[0].InstanceType,
      );

      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test('Add machine pool with autoscaling enabled is capped by the technical max, not by org quota', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.machinePoolIdInput().fill(`mp-${getUsernameSuffix()}`);
      await machinePoolsPage.selectInstanceType(day1Profile.MachinePools[0].InstanceType);

      await machinePoolsPage.autoscalingCheckbox().check();
      await expect(machinePoolsPage.autoscaleMaxInput()).toBeVisible();

      await machinePoolsPage.verifyMaxNodeCount(machinePoolsPage.autoscaleMaxInput(), MAX_NODES);

      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test('Add machine pool node count is capped by the technical max, not by org quota', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.machinePoolIdInput().fill(`mp-${getUsernameSuffix()}`);
      await machinePoolsPage.selectInstanceType(day1Profile.MachinePools[0].InstanceType);
      await expect(machinePoolsPage.nodeCountInput()).toBeVisible();

      await machinePoolsPage.verifyMaxNodeCount(machinePoolsPage.nodeCountInput(), MAX_NODES);

      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test('Edit machine pool node count is capped by the technical max, not by org quota', async ({
      machinePoolsPage,
    }) => {
      const existingPoolId = await machinePoolsPage.firstExistingMachinePoolId();
      await machinePoolsPage.editMachinePool(existingPoolId);
      await machinePoolsPage.autoscalingCheckbox().uncheck();
      await expect(machinePoolsPage.nodeCountInput()).toBeVisible();

      await machinePoolsPage.verifyMaxNodeCount(machinePoolsPage.nodeCountInput(), MAX_NODES);

      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test('Add machine pool completes successfully despite empty org quota', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.machinePoolIdInput().fill(newMachinePoolId);
      await machinePoolsPage.selectInstanceType(day1Profile.MachinePools[0].InstanceType);
      await machinePoolsPage.nodeCountInput().fill('2');

      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({
        timeout: DEFAULT_NAVIGATION_TIMEOUT,
      });
      await expect(machinePoolsPage.getMachinePoolRow(newMachinePoolId)).toBeVisible({
        timeout: DEFAULT_NAVIGATION_TIMEOUT,
      });
    });

    test('Edit machine pool completes successfully despite empty org quota', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(newMachinePoolId);
      await expect(machinePoolsPage.nodeCountInput()).toBeVisible({
        timeout: DEFAULT_NAVIGATION_TIMEOUT,
      });
      await machinePoolsPage.nodeCountInput().fill('3');

      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({
        timeout: DEFAULT_NAVIGATION_TIMEOUT,
      });
      await expect(
        machinePoolsPage.getMachinePoolRow(newMachinePoolId).getByText('3', { exact: true }),
      ).toBeVisible();
    });

    test.afterAll(async ({ page, machinePoolsPage }) => {
      try {
        await machinePoolsPage.dismissMachinePoolModalIfOpen();
        const row = machinePoolsPage.getMachinePoolRow(newMachinePoolId);
        const wasCreated = await row
          .waitFor({ state: 'visible', timeout: DEFAULT_NAVIGATION_TIMEOUT })
          .then(() => true)
          .catch(() => false);
        if (wasCreated) {
          await machinePoolsPage.deleteMachinePool(newMachinePoolId);
        }
      } catch (error) {
        console.error('afterAll: failed to restore Day 1 cluster state', error);
      } finally {
        await clearQuotaCostMock(page);
      }
    });
  },
);
