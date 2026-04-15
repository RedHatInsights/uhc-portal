import { ClusterFromSubscription } from '~/types/types';

import { countReplicasWithoutTaints, getClusterMinNodes } from './machinePoolsHelper';

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

    it('uses autoscaling min_replicas when available', () => {
      const pools = [
        { id: 'pool-1', autoscaling: { min_replicas: 2, max_replicas: 10 } },
        { id: 'pool-2', replicas: 3 },
      ];

      expect(countReplicasWithoutTaints(pools)).toBe(5);
    });

    it('prefers autoscaling min_replicas over replicas', () => {
      const pools = [
        { id: 'pool-1', replicas: 10, autoscaling: { min_replicas: 2, max_replicas: 10 } },
      ];

      expect(countReplicasWithoutTaints(pools)).toBe(2);
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

      expect(countReplicasWithoutTaints(pools, 'pool-1')).toBe(5); // pool-3 (4) + pool-4 (1)
    });

    it('ignores pools with empty taints array', () => {
      const pools = [
        { id: 'pool-1', replicas: 3, taints: [] },
        { id: 'pool-2', replicas: 5 },
      ];

      expect(countReplicasWithoutTaints(pools)).toBe(8);
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

      it('counts autoscaling min_replicas when calculating other pools', () => {
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
