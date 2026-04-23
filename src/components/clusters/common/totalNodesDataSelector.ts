import { MachinePool, NodePool, NodePoolAutoscaling } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { isHypershiftCluster } from './clusterStates';

type totalNodesData = {
  totalDesiredComputeNodes: number;
  hasMachinePoolWithAutoscaling: boolean;
  totalMinNodesCount: number;
  totalMaxNodesCount: number;
  totalActualNodes: number | boolean;
};

const totalNodesDataSelector = <E extends ClusterFromSubscription>(
  cluster: E,
  machinePools?: NodePool[] | MachinePool[],
): totalNodesData => {
  const isHypershift = isHypershiftCluster(cluster);

  let totalDesiredComputeNodes = 0;
  let hasMachinePoolWithAutoscaling = false;
  let totalMinNodesCount = 0;
  let totalMaxNodesCount = 0;

  const totalActualNodes =
    isHypershift && machinePools?.length
      ? (machinePools as NodePool[])
          .map((e) => e.status?.current_replicas ?? 0)
          .reduce((total, currentReplicas) => total + currentReplicas, 0)
      : cluster.metrics?.nodes.compute ?? false;

  if (machinePools) {
    machinePools.forEach((machinePool) => {
      if (machinePool.autoscaling) {
        hasMachinePoolWithAutoscaling = true;
        const autoscaling = machinePool.autoscaling as NodePoolAutoscaling;
        if (
          isHypershift &&
          (autoscaling?.min_replica || autoscaling?.min_replica === 0 || autoscaling?.max_replica)
        ) {
          // if hypershift then NodePool type
          totalMinNodesCount += autoscaling?.min_replica ?? NaN;
          totalMaxNodesCount +=
            autoscaling?.max_replica ??
            (autoscaling as { max_replicas?: number }).max_replicas ??
            NaN;
        } else {
          // otherwise MachinePool type
          totalMinNodesCount += (machinePool as MachinePool).autoscaling?.min_replicas ?? NaN;
          totalMaxNodesCount += (machinePool as MachinePool).autoscaling?.max_replicas ?? NaN;
        }
      } else {
        totalDesiredComputeNodes += machinePool.replicas ?? NaN;
        totalMinNodesCount += machinePool.replicas ?? NaN;
        totalMaxNodesCount += machinePool.replicas ?? NaN;
      }
    });
  }

  return {
    totalDesiredComputeNodes,
    hasMachinePoolWithAutoscaling,
    totalMinNodesCount,
    totalMaxNodesCount,
    totalActualNodes,
  };
};

export default totalNodesDataSelector;
