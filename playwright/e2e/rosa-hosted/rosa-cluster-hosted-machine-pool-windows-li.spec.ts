import { test, expect } from '../../fixtures/pages';

const clusterProfile = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const day1Profile = clusterProfile['rosa-hosted-public-advanced']['day1-profile'];
const day2Profile = clusterProfile['rosa-hosted-public-advanced']['day2-profile'];
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
  'ROSA Hosted (Hypershift) cluster - Windows License Included feature validation',
  { tag: ['@day2', '@rosa-hosted', '@rosa', '@windows-license', '@advanced'] },
  () => {
    const clusterName = process.env.CLUSTER_NAME || day1Profile.ClusterName;
    const machinePoolName = `win-li-${Math.random().toString(36).slice(2, 7)}`;

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      if (!zones || Object.keys(zones).length === 0) {
        throw new Error(`SUBNETS.ZONES is not defined in QE_INFRA_REGIONS for region "${region}"`);
      }
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
    });

    test('Navigate to the ROSA hosted cluster Machine pools tab', async ({
      clusterListPage,
      machinePoolsPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await machinePoolsPage.goToMachinePoolsTab();
    });

    test('Open Add machine pool modal and verify Windows License Included checkbox is visible', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      await expect(machinePoolsPage.windowsLicenseIncludedLabel()).toBeVisible();
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).toBeVisible();
    });

    test('Verify Windows License Included checkbox is disabled for incompatible instance types', async ({
      machinePoolsPage,
    }) => {
      // Select an instance type that is not Windows LI compatible
      await machinePoolsPage.selectInstanceType(
        day2Profile.MachinePools.WindowsLicense.IncompatibleInstanceType,
      );
      // Verify the checkbox is disabled
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).toBeDisabled();
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).not.toBeChecked();
      // Hover over the disabled checkbox to trigger the tooltip
      await machinePoolsPage.hoverWindowsLicenseCheckbox();
      // Verify the tooltip text is displayed
      await expect(machinePoolsPage.windowsLicenseDisabledTooltip()).toBeVisible();
    });

    test('Verify Windows License Included checkbox becomes enabled for compatible instance types', async ({
      machinePoolsPage,
    }) => {
      // Select a Windows LI compatible instance type
      await machinePoolsPage.selectInstanceType(
        day2Profile.MachinePools.WindowsLicense.CompatibleInstanceType,
      );
      // Verify the checkbox is now enabled and unchecked by default
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).toBeEnabled();
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).not.toBeChecked();
    });

    test('Verify Windows License Included checkbox can be checked and unchecked', async ({
      machinePoolsPage,
    }) => {
      // Check the Windows License Included checkbox
      await machinePoolsPage.windowsLicenseIncludedCheckbox().check();
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).toBeChecked();

      // Uncheck the Windows License Included checkbox
      await machinePoolsPage.windowsLicenseIncludedCheckbox().uncheck();
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).not.toBeChecked();
    });

    test('Verify Windows License Included resets when switching to incompatible instance type', async ({
      machinePoolsPage,
    }) => {
      // First, select a compatible instance type and enable Windows LI
      await machinePoolsPage.selectInstanceType(
        day2Profile.MachinePools.WindowsLicense.CompatibleInstanceType,
      );
      await machinePoolsPage.windowsLicenseIncludedCheckbox().check();
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).toBeChecked();
      // Switch to an incompatible instance type
      await machinePoolsPage.selectInstanceType(
        day2Profile.MachinePools.WindowsLicense.IncompatibleInstanceType,
      );
      // Verify checkbox is disabled and unchecked
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).toBeDisabled();
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).not.toBeChecked();
      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    test('Create a machine pool with Windows License Included enabled', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();
      // Set machine pool name
      await machinePoolsPage.machinePoolIdInput().fill(machinePoolName);
      const firstZone = Object.keys(zones || {})[0];
      await machinePoolsPage.selectPrivateSubnet(zones[firstZone].PRIVATE_SUBNET_NAME);
      // Select a Windows LI compatible instance type
      await machinePoolsPage.selectInstanceType(
        day2Profile.MachinePools.WindowsLicense.CompatibleInstanceType,
      );

      // Enable Windows License Included
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).toBeEnabled();
      await machinePoolsPage.windowsLicenseIncludedCheckbox().check();
      await expect(machinePoolsPage.windowsLicenseIncludedCheckbox()).toBeChecked();
      // Submit the machine pool
      await machinePoolsPage.clickAddMachinePoolSubmitButton();
      // Wait for the modal to close and the machine pool row to appear
      await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 60000 });
      await expect(machinePoolsPage.getMachinePoolRow(machinePoolName)).toBeVisible({
        timeout: 60000,
      });
    });

    test('Edit the machine pool and verify Windows License Included is configured', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.editMachinePool(machinePoolName);
      // Verify the Windows LI enabled text is shown in edit mode
      await expect(machinePoolsPage.windowsLicenseEnabledText()).toBeVisible();
      await machinePoolsPage.cancelMachinePoolModalButton().click();
      await machinePoolsPage.deleteMachinePool(machinePoolName);
      await expect(machinePoolsPage.getMachinePoolRow(machinePoolName)).toBeHidden({
        timeout: 60000,
      });
    });

    test.afterAll(async ({ machinePoolsPage }) => {
      const row = machinePoolsPage.getMachinePoolRow(machinePoolName);
      const isVisible = await row
        .waitFor({ state: 'visible', timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      if (isVisible) {
        await machinePoolsPage.deleteMachinePool(machinePoolName);
      }
    });
  },
);
