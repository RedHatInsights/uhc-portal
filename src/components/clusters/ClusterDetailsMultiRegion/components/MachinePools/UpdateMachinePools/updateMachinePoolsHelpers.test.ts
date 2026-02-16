import { GlobalState } from '~/redux/stateTypes';
import clusterService from '~/services/clusterService';

import { NodePoolWithUpgradePolicies } from '../machinePoolCustomTypes';

import {
  canMachinePoolBeUpgradedSelector,
  isControlPlaneValidForMachinePool,
  isMachinePoolScheduleError,
  isMachinePoolUpgrading,
  updateAllMachinePools,
} from './updateMachinePoolsHelpers';

jest.mock('~/services/clusterService');
clusterService.patchNodePool = jest.fn();
clusterService.postNodePoolUpgradeSchedule = jest.fn();

describe('updateMachinePoolsHelpers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateAllMachinePools', () => {
    const machinePools = [{ id: 'myPool1' }, { id: 'myPool2' }];
    const clusterId = 'myCluster';
    const toBeVersion = '4.14.1';

    it('calls postNodePoolUpgradeSchedule ', async () => {
      expect(clusterService.postNodePoolUpgradeSchedule).not.toHaveBeenCalled();
      await updateAllMachinePools(machinePools, clusterId, toBeVersion);

      expect(clusterService.patchNodePool).not.toHaveBeenCalled();
      expect(clusterService.postNodePoolUpgradeSchedule).toHaveBeenCalledTimes(2);

      const nodePoolPostMock = clusterService.postNodePoolUpgradeSchedule as jest.Mock;

      const callForPool1 = nodePoolPostMock.mock.calls[0];
      const callForPool2 = nodePoolPostMock.mock.calls[1];

      expect(callForPool1).toEqual([
        'myCluster',
        'myPool1',
        {
          next_run: expect.anything(),
          node_pool_id: 'myPool1',
          schedule_type: 'manual',
          upgrade_type: 'NodePool',
          version: '4.14.1',
        },
      ]);
      expect(callForPool2).toEqual([
        'myCluster',
        'myPool2',
        {
          next_run: expect.anything(),
          node_pool_id: 'myPool2',
          schedule_type: 'manual',
          upgrade_type: 'NodePool',
          version: '4.14.1',
        },
      ]);
    });
  });

  describe('isControlPlaneValidForMachinePool', () => {
    const controlPlaneVersion = '4.14.1';

    it('returns true if available versions are not known', () => {
      const machinePool = { id: 'myPool1', version: { available_upgrades: undefined } };
      expect(isControlPlaneValidForMachinePool(machinePool, controlPlaneVersion)).toBeTruthy();
    });

    it('returns true if control plane version is in available versions', () => {
      const machinePool = {
        id: 'myPool1',
        version: { available_upgrades: ['4.14.0', '4.14.1'] },
      };
      expect(isControlPlaneValidForMachinePool(machinePool, controlPlaneVersion)).toBeTruthy();
    });

    it('returns false if control plane version is not in available versions', () => {
      const machinePool = { id: 'myPool1', version: { available_upgrades: ['4.14.0'] } };
      expect(isControlPlaneValidForMachinePool(machinePool, controlPlaneVersion)).toBeFalsy();
    });

    it('returns false if there are not any available versions', () => {
      const machinePool = { id: 'myPool1', version: { available_upgrades: [] } };
      expect(isControlPlaneValidForMachinePool(machinePool, controlPlaneVersion)).toBeFalsy();
    });
  });

  describe('isMachinePoolUpgrading', () => {
    it('returns true if machine pool has upgrading policies', () => {
      const machinePool = {
        id: 'myPool1',
        upgradePolicies: { items: ['I am an upgrade object'] },
      } as NodePoolWithUpgradePolicies;
      expect(isMachinePoolUpgrading(machinePool)).toBeTruthy();
    });

    it('returns false if machine pool does not have upgradePolicy object - used useNodePoolUpgradePolicies gate is false', () => {
      const machinePool = { id: 'myPool1' } as NodePoolWithUpgradePolicies;
      expect(isMachinePoolUpgrading(machinePool)).toBeFalsy();
    });

    it('returns false when the number of upgrade policies is 0', () => {
      const machinePool = {
        id: 'myPool1',
        upgradePolicies: { items: [] },
      } as NodePoolWithUpgradePolicies;
      expect(isMachinePoolUpgrading(machinePool)).toBeFalsy();
    });
  });

  describe('isMachinePoolScheduleError', () => {
    it('returns false if error message is empty', () => {
      const machinePool = { id: 'myPool1', upgradePolicies: { errorMessage: '', items: [] } };
      expect(isMachinePoolScheduleError(machinePool)).toBeFalsy();
    });

    it('returns false if error message does not exist', () => {
      const machinePool = { id: 'myPool1' };
      expect(isMachinePoolScheduleError(machinePool)).toBeFalsy();
    });

    it('returns true if error message is present', () => {
      const machinePool = {
        id: 'myPool1',
        upgradePolicies: { errorMessage: 'I am an error!', items: [] },
      };
      expect(isMachinePoolScheduleError(machinePool)).toBeTruthy();
    });
  });
  describe('canMachinePoolBeUpgradedSelector', () => {
    const machinePool = {
      upgradePolicies: { errorMessage: '', items: [] },
      version: { id: '4.14.0', raw_id: '4.14.0', available_upgrades: ['4.14.1'] },
    };

    const state = {
      clusters: {
        details: {
          cluster: { hypershift: { enabled: true }, version: { id: '4.14.1', raw_id: '4.14.1' } },
        },
      },
      machinePools: { getMachinePools: { data: 'machinePoolData', fulfilled: true, error: false } },
      clusterUpgrades: {
        schedules: {
          items: [],
        },
      },
    } as unknown as GlobalState;

    it('returns false when control plane is updating', () => {
      const newState: GlobalState = {
        ...state,
        clusterUpgrades: {
          schedules: {
            // @ts-ignore
            items: [{ upgrade_type: 'OSD', schedule_type: 'manual', state: { value: 'started' } }],
          },
        },
      };
      expect(
        canMachinePoolBeUpgradedSelector(
          newState.clusterUpgrades.schedules,
          '',
          machinePool,
          false,
          true,
        ),
      ).toBeFalsy();
    });

    it('returns false when the machine pool version is the same as the control plane', () => {
      const controlPlaneVersion = state?.clusters?.details?.cluster?.version?.id || '';
      const newMachinePool = {
        ...machinePool,
        version: { ...machinePool.version, id: controlPlaneVersion },
      };
      const schedules = {
        items: [],
        fulfilled: true,
        error: true,
        pending: false,
      };

      expect(
        canMachinePoolBeUpgradedSelector(
          schedules,
          controlPlaneVersion,
          newMachinePool,
          false,
          true,
        ),
      ).toBeFalsy();
    });

    it('returns false when there is an error getting machine pool update schedules', () => {
      const newMachinePool = {
        ...machinePool,
        upgradePolicies: { errorMessage: 'There was an error', items: [] },
      };
      const controlPlaneVersion = '';
      const schedules = {
        items: [],
        fulfilled: true,
        error: true,
        pending: false,
      };
      expect(
        canMachinePoolBeUpgradedSelector(
          schedules,
          controlPlaneVersion,
          newMachinePool,
          false,
          true,
        ),
      ).toBeFalsy();
    });

    it('returns false when the control plane version is not a valid upgrade version', () => {
      const controlPlaneVersion = state?.clusters?.details?.cluster?.version?.id;
      const newMachinePool = {
        ...machinePool,
        version: { ...machinePool.version, id: '1.1.1', available_upgrades: ['2.2.2'] },
      };
      const schedules = {
        items: [],
        fulfilled: true,
        error: true,
        pending: false,
      };
      expect(controlPlaneVersion).not.toEqual('2.2.2');

      expect(
        canMachinePoolBeUpgradedSelector(schedules, '', newMachinePool, false, true),
      ).toBeFalsy();
    });

    it('returns false when the machine pool is scheduled to be upgraded', () => {
      const newMachinePool = {
        ...machinePool,
        upgradePolicies: { errorMessage: 'There was an error', items: ['I am an upgrade policy'] },
      } as NodePoolWithUpgradePolicies;
      const schedules = {
        items: [],
        fulfilled: true,
        error: true,
        pending: false,
      };
      expect(
        canMachinePoolBeUpgradedSelector(schedules, '', newMachinePool, false, true),
      ).toBeFalsy();
    });

    it('returns true when machine pool can be upgraded', () => {
      const controlPlaneVersion = state?.clusters?.details?.cluster?.version?.id || '';
      const controlPlaneRawVersion = state?.clusters?.details?.cluster?.version?.raw_id || '';

      const schedules = {
        items: [],
        fulfilled: true,
        error: true,
        pending: false,
      };
      expect(
        canMachinePoolBeUpgradedSelector(
          schedules,
          controlPlaneVersion,
          machinePool,
          false,
          true,
          controlPlaneRawVersion,
        ),
      ).toBeTruthy();
    });
  });
});
