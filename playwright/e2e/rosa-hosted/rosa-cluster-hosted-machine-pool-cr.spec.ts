import { test, expect } from '../../fixtures/pages';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const clusterProperties = clusterProfiles['rosa-hosted-public-advanced']['day1-profile'];
const clusterName = clusterProperties.ClusterName;
const region = clusterProperties.Region.split(',')[0];
const qeInfrastructure = JSON.parse(process.env.QE_INFRA_REGIONS || '{}')[region]?.[0] || {};

test.describe.serial(
  'ROSA HCP Machine Pool - Capacity Reservation (CR) tests',
  { tag: ['@day2', '@machine-pool', '@rosa-hosted', '@hcp', '@capacity-reservation'] },
  () => {
    const testMachinePools = [
      {
        id: `mp-none-${Math.random().toString(36).slice(2, 7)}`,
        preference: 'None',
        reservationId: 'N/A',
      },
      {
        id: `mp-open-${Math.random().toString(36).slice(2, 7)}`,
        preference: 'Open',
        reservationId: 'N/A',
      },
      {
        id: `mp-cronly-${Math.random().toString(36).slice(2, 7)}`,
        preference: 'CR only',
        reservationId: 'N/A',
      },
      {
        id: `mp-crid-${Math.random().toString(36).slice(2, 7)}`,
        preference: 'CR only',
        reservationId: qeInfrastructure.CAPACITY_RESERVATION?.ID,
      },
    ];

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      if (
        !qeInfrastructure.CAPACITY_RESERVATION?.AvailabilityZone ||
        !qeInfrastructure.CAPACITY_RESERVATION?.ID
      ) {
        throw new Error(
          `CAPACITY_RESERVATION.AvailabilityZone/ID is not defined in QE_INFRA_REGIONS for region "${region}"`,
        );
      }
      const az = qeInfrastructure.CAPACITY_RESERVATION.AvailabilityZone;
      if (!qeInfrastructure.SUBNETS?.ZONES?.[az]?.PRIVATE_SUBNET_NAME) {
        throw new Error(
          `The PRIVATE_SUBNET_NAME is not defined in QE_INFRA_REGIONS for region "${region}"`,
        );
      }
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
    });

    test('Navigate to HCP cluster and go to Machine pools tab', async ({
      clusterListPage,
      machinePoolsPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      // Filter for the specific cluster and open it
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await machinePoolsPage.goToMachinePoolsTab();
    });

    test('Check Capacity Reservation feature and fields in Add machine pool modal', async ({
      machinePoolsPage,
    }) => {
      await machinePoolsPage.openAddMachinePoolModal();

      // Check tooltip/hint
      await expect(machinePoolsPage.capacityReservationHintButton()).toBeVisible();
      await machinePoolsPage.capacityReservationHintButton().click();
      await expect(machinePoolsPage.capacityReservationHintPopover()).toBeVisible();
      await expect(machinePoolsPage.capacityReservationHintPopover()).toContainText(
        'Capacity Reservations allow you to reserve compute capacity',
      );
      await machinePoolsPage.capacityReservationHintButton().click();

      // Check preference fields
      await expect(machinePoolsPage.capacityReservationPreferenceSelect()).toBeVisible();
      await expect(machinePoolsPage.capacityReservationPreferenceSelect()).toContainText('None');

      // Check preference options
      await machinePoolsPage.capacityReservationPreferenceSelect().click();
      await expect(machinePoolsPage.capacityReservationPreferenceOption('None')).toBeVisible();
      await expect(machinePoolsPage.capacityReservationPreferenceOption('Open')).toBeVisible();
      await expect(machinePoolsPage.capacityReservationPreferenceOption('CR only')).toBeVisible();

      // Select CR only and check for ID field
      await machinePoolsPage.capacityReservationPreferenceOption('CR only').click();
      await expect(machinePoolsPage.capacityReservationIdInput()).toBeVisible();

      // Select None and check ID field is gone
      await machinePoolsPage.selectCapacityReservationPreference('None');
      await expect(machinePoolsPage.capacityReservationIdInput()).not.toBeVisible();

      // Select Open and check ID field is gone
      await machinePoolsPage.selectCapacityReservationPreference('Open');
      await expect(machinePoolsPage.capacityReservationIdInput()).not.toBeVisible();

      // Cancel modal
      await machinePoolsPage.cancelMachinePoolModalButton().click();
    });

    for (const mp of testMachinePools) {
      test(`Create machine pool with ${mp.preference} preference and ${mp.reservationId} reservation ID`, async ({
        machinePoolsPage,
      }) => {
        await machinePoolsPage.openAddMachinePoolModal();
        await machinePoolsPage.machinePoolIdInput().fill(mp.id);
        await machinePoolsPage.selectPrivateSubnet(
          qeInfrastructure.SUBNETS.ZONES[qeInfrastructure.CAPACITY_RESERVATION.AvailabilityZone]
            .PRIVATE_SUBNET_NAME,
        );
        await machinePoolsPage.selectCapacityReservationPreference(mp.preference);
        if (mp.preference === 'CR only' && mp.reservationId !== 'N/A') {
          await machinePoolsPage.fillCapacityReservationId(mp.reservationId);
        }

        await machinePoolsPage.clickAddMachinePoolSubmitButton();

        // Wait for modal to close
        await expect(machinePoolsPage.machinePoolModal()).toBeHidden({ timeout: 30000 });

        // Verify in the list
        await expect(machinePoolsPage.getByText(mp.id)).toBeVisible({ timeout: 60000 });

        // Check details
        await machinePoolsPage.verifyCapacityReservationDetail(
          mp.id,
          mp.preference,
          mp.reservationId,
        );
        await machinePoolsPage.deleteMachinePool(mp.id);
      });
    }

    test.afterAll(async ({ machinePoolsPage }) => {
      for (const mp of testMachinePools) {
        try {
          await machinePoolsPage.deleteMachinePool(mp.id);
        } catch {
          console.error(`Failed to delete machine pool ${mp.id} or already deleted`);
        }
      }
    });
  },
);
