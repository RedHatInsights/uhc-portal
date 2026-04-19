import { ClusterFromSubscription } from '~/types/types';

import {
  countReplicasWithoutTaints,
  getClusterMinNodes,
  isMinimumCountWithoutTaints,
} from './machinePoolsHelper';

const hcpCluster = {
  product: { id: 'ROSA' },
  cloud_provider: { id: 'aws' },
  hypershift: { enabled: true },
} as ClusterFromSubscription;

describe('machinePoolsHelper', () => {
  describe('countReplicasWithoutTaints', () => {
    it('returns 0 for empty array', () => {
      expect(countReplicasWithoutTaints([])).toBe(0);
    });

    it('counts replicas from untainted pools', () => {
      const pools = [
        { id: 'pool-1', replicas: 3 },
        { id: 'pool-2', replicas: 5 },
      ];

      expect(countReplicasWithoutTaints(pools)).toBe(8);
    });

    it('ignores tainted pools', () => {
      const pools = [
        { id: 'pool-1', replicas: 3 },
        {
          id: 'pool-2',
          replicas: 5,
          taints: [{ key: 'test', value: 'true', effect: 'NoSchedule' }],
        },
      ];

      expect(countReplicasWithoutTaints(pools)).toBe(3);
    });

    it('excludes pool by id when excludePoolId is provided', () => {
      const pools = [
        { id: 'pool-1', replicas: 3 },
        { id: 'pool-2', replicas: 5 },
      ];

      expect(countReplicasWithoutTaints(pools, 'pool-1')).toBe(5);
    });

    it('uses autoscaling max_replicas when available', () => {
      const pools = [
        { id: 'pool-1', autoscaling: { min_replicas: 2, max_replicas: 10 } },
        { id: 'pool-2', replicas: 3 },
      ];

      expect(countReplicasWithoutTaints(pools)).toBe(13);
    });

    it('handles mixed tainted and untainted pools with exclusion', () => {
      const pools = [
        { id: 'pool-1', replicas: 2 },
        {
          id: 'pool-2',
          replicas: 3,
          taints: [{ key: 'test', value: 'true', effect: 'NoSchedule' }],
        },
        { id: 'pool-3', replicas: 4 },
        { id: 'pool-4', autoscaling: { min_replicas: 1, max_replicas: 5 } },
      ];

      expect(countReplicasWithoutTaints(pools, 'pool-1')).toBe(9); // pool-3 (4) + pool-4 (5)
    });

    it('ignores pools with empty taints array', () => {
      const pools = [
        { id: 'pool-1', replicas: 3, taints: [] },
        { id: 'pool-2', replicas: 5 },
      ];

      expect(countReplicasWithoutTaints(pools)).toBe(8);
    });

    it('returns 0 when pool has no replicas and no autoscaling', () => {
      const pools = [{ id: 'pool-1' }];

      expect(countReplicasWithoutTaints(pools)).toBe(0);
    });
  });

  describe('isMinimumCountWithoutTaints', () => {
    const cluster = {
      hypershift: { enabled: true },
    } as ClusterFromSubscription;

    it('returns true when other autoscaled pools have max_replicas >= 2', () => {
      const machinePoolsScaled = [
        {
          id: 'mp-with-taints',
          taints: [{ key: 'hello', value: 'world', effect: 'NoSchedule' }],
          autoscaling: { min_replicas: 2, max_replicas: 3 },
        },
        {
          id: 'mp1',
          autoscaling: { min_replicas: 1, max_replicas: 3 },
        },
        {
          id: 'mp-no-taints',
          autoscaling: { min_replicas: 1, max_replicas: 3 },
        },
      ];

      expect(
        isMinimumCountWithoutTaints({
          cluster,
          machinePools: machinePoolsScaled,
          currentMachinePoolId: 'mp-no-taints',
        }),
      ).toBeTruthy();
    });

    it('returns false when other autoscaled pools have total max_replicas < 2', () => {
      const poolsWithLowMax = [
        {
          id: 'mp-no-taints',
          autoscaling: { min_replicas: 0, max_replicas: 1 },
        },
        {
          id: 'mp-other',
          autoscaling: { min_replicas: 0, max_replicas: 1 },
        },
      ];

      expect(
        isMinimumCountWithoutTaints({
          cluster,
          machinePools: poolsWithLowMax,
          currentMachinePoolId: 'mp-no-taints',
        }),
      ).toBeFalsy();
    });

    it('includes autoscaling max_replicas of current pool when includeCurrentMachinePool is true', () => {
      const pools = [
        {
          id: 'autoscale-pool',
          autoscaling: { min_replicas: 1, max_replicas: 3 },
        },
      ];

      expect(
        isMinimumCountWithoutTaints({
          cluster,
          machinePools: pools,
          currentMachinePoolId: 'autoscale-pool',
          includeCurrentMachinePool: true,
        }),
      ).toBeTruthy();
    });

    it('does not add replicas for tainted current pool when includeCurrentMachinePool is true', () => {
      const pools = [
        {
          id: 'tainted-current',
          replicas: 5,
          taints: [{ key: 'k', value: 'v', effect: 'NoSchedule' }],
        },
        {
          id: 'other',
          replicas: 1,
        },
      ];

      expect(
        isMinimumCountWithoutTaints({
          cluster,
          machinePools: pools,
          currentMachinePoolId: 'tainted-current',
          includeCurrentMachinePool: true,
        }),
      ).toBeFalsy();
    });

    it('handles missing current pool gracefully when includeCurrentMachinePool is true', () => {
      const pools = [
        {
          id: 'other',
          replicas: 2,
        },
      ];

      expect(
        isMinimumCountWithoutTaints({
          cluster,
          machinePools: pools,
          currentMachinePoolId: 'non-existent',
          includeCurrentMachinePool: true,
        }),
      ).toBeTruthy();
    });
  });

  describe('getClusterMinNodes', () => {
    describe('HCP clusters', () => {
      it('returns 0 for tainted machine pool', () => {
        const taintedPool = {
          id: 'tainted-pool',
          replicas: 2,
          taints: [{ key: 'test', value: 'true', effect: 'NoSchedule' }],
        };

        const otherPool = {
          id: 'other-pool',
          replicas: 2,
        };

        const result = getClusterMinNodes({
          cluster: hcpCluster,
          machineTypesResponse: {},
          machinePool: taintedPool,
          machinePools: [otherPool, taintedPool],
        });

        expect(result).toBe(0);
      });

      it('returns 0 when other pools have 2+ untainted nodes', () => {
        const currentPool = {
          id: 'current-pool',
          replicas: 1,
        };

        const otherPool = {
          id: 'other-pool',
          replicas: 3,
        };

        const result = getClusterMinNodes({
          cluster: hcpCluster,
          machineTypesResponse: {},
          machinePool: currentPool,
          machinePools: [otherPool, currentPool],
        });

        expect(result).toBe(0);
      });

      it('returns 1 when other pools have 1 untainted node', () => {
        const currentPool = {
          id: 'current-pool',
          replicas: 2,
        };

        const otherPool = {
          id: 'other-pool',
          replicas: 1,
        };

        const result = getClusterMinNodes({
          cluster: hcpCluster,
          machineTypesResponse: {},
          machinePool: currentPool,
          machinePools: [otherPool, currentPool],
        });

        expect(result).toBe(1);
      });

      it('returns 2 when other pools have 0 untainted nodes', () => {
        const currentPool = {
          id: 'current-pool',
          replicas: 2,
        };

        const taintedPool = {
          id: 'tainted-pool',
          replicas: 3,
          taints: [{ key: 'test', value: 'true', effect: 'NoSchedule' }],
        };

        const result = getClusterMinNodes({
          cluster: hcpCluster,
          machineTypesResponse: {},
          machinePool: currentPool,
          machinePools: [taintedPool, currentPool],
        });

        expect(result).toBe(2);
      });

      it('returns 2 when no other pools exist', () => {
        const currentPool = {
          id: 'current-pool',
          replicas: 2,
        };

        const result = getClusterMinNodes({
          cluster: hcpCluster,
          machineTypesResponse: {},
          machinePool: currentPool,
          machinePools: [currentPool],
        });

        expect(result).toBe(2);
      });

      it('counts autoscaling max_replicas when calculating other pools capacity', () => {
        const currentPool = {
          id: 'current-pool',
          replicas: 1,
        };

        const autoscalingPool = {
          id: 'autoscaling-pool',
          autoscaling: {
            min_replicas: 3,
            max_replicas: 10,
          },
        };

        const result = getClusterMinNodes({
          cluster: hcpCluster,
          machineTypesResponse: {},
          machinePool: currentPool,
          machinePools: [autoscalingPool, currentPool],
        });

        expect(result).toBe(0);
      });

      it('ignores tainted pools when counting replicas', () => {
        const currentPool = {
          id: 'current-pool',
          replicas: 1,
        };

        const taintedPool1 = {
          id: 'tainted-pool-1',
          replicas: 5,
          taints: [{ key: 'test', value: 'true', effect: 'NoSchedule' }],
        };

        const taintedPool2 = {
          id: 'tainted-pool-2',
          autoscaling: {
            min_replicas: 3,
            max_replicas: 10,
          },
          taints: [{ key: 'test', value: 'true', effect: 'NoSchedule' }],
        };

        const result = getClusterMinNodes({
          cluster: hcpCluster,
          machineTypesResponse: {},
          machinePool: currentPool,
          machinePools: [taintedPool1, taintedPool2, currentPool],
        });

        // All other pools are tainted, so current pool needs minimum 2
        expect(result).toBe(2);
      });

      it('returns 2 when adding first pool to empty HCP cluster (machinePool undefined)', () => {
        const result = getClusterMinNodes({
          cluster: hcpCluster,
          machineTypesResponse: {},
          machinePool: undefined,
          machinePools: [],
        });

        // First pool being added to empty cluster needs minimum 2
        expect(result).toBe(2);
      });
    });
  });
});
