import { expect, test } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';
import { clearQuotaCostMock, mockEmptyQuotaCost } from '../../support/quota-mock-helper';

const day1Profile = require('../../fixtures/osd-gcp/osd-ondemand-gcp-wif-public-advanced-cluster-creation.spec.json');

const clusterName = process.env.CLUSTER_NAME || `${day1Profile.ClusterName}-${getUsernameSuffix()}`;

test.describe.serial(
  'OSD On-Demand GCP WIF public advanced - Machine pools quota bypass',
  {
    tag: ['@day2', '@osd', '@gcp', '@wif', '@ondemand', '@public', '@advanced', '@machine-pool'],
  },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
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

    test('Add machine pool node count is capped by the technical max, not by org quota', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await machinePoolsPage.machinePoolIdInput().fill(`mp-${getUsernameSuffix()}`);
      await machinePoolsPage.selectInstanceType(day1Profile.MachinePools[0].InstanceType);
      await expect(machinePoolsPage.nodeCountInput()).toBeVisible();

      await machinePoolsPage.nodeCountInput().fill('50');
      await machinePoolsPage.nodeCountInput().blur();
      await expect(machinePoolsPage.getByText(/Input cannot be more than \d+\./)).toBeHidden();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeEnabled();

      await machinePoolsPage.nodeCountInput().fill('100000');
      await machinePoolsPage.nodeCountInput().blur();
      await expect(machinePoolsPage.getByText(/Input cannot be more than \d+\./)).toBeVisible();
      await expect(machinePoolsPage.addMachinePoolSubmitButton()).toBeDisabled();

      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden();
    });

    test.afterAll(async ({ page }) => {
      await clearQuotaCostMock(page);
    });
  },
);
