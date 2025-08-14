import { normalizeProductID } from '~/common/normalize';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { MachineTypesResponse } from '~/queries/types';
import { GlobalState } from '~/redux/state';
import { Cluster, MachinePool, NodePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { asArray } from '../../../../../common/helpers';
import { isMultiAZ } from '../../clusterDetailsHelper';

const NON_CCS_DEFAULT_POOL = 'worker';

const minReplicasNeededText =
  'There needs to be at least 2 nodes without taints across all machine pools';

const isDeleteDisabled = (
  canDelete: boolean,
  machinePools: MachinePool[],
  isEnforcedDefaultMP: boolean,
  isMinimumCountWithoutTaints: boolean,
) => {
  const permissionsReason = !canDelete && 'You do not have permissions to delete machine pools';
  const lastNodePoolReason = machinePools.length === 1 && 'The last machine pool cannot be deleted';
  const enforcedDefaultMPReason = isEnforcedDefaultMP && 'Machine pool ineligible for deletion';
  const minimumCountReason = !isMinimumCountWithoutTaints && minReplicasNeededText;
  return (
    permissionsReason ||
    lastNodePoolReason ||
    enforcedDefaultMPReason ||
    minimumCountReason ||
    undefined
  );
};

/**
 * Used to determine the minimum nodes allowed during cluster creation,
 * and after when adding new machine pools or editing cluster counts.
 *
 * @param {boolean} isDefaultMachinePool True if it's the default MP
 * @param {boolean} isByoc True if BYOC/CCS cluster, true for ROSA clusters
 * @param {boolean} isMultiAz True if multi-zone
 * @returns number | undefined
 */
const getMinNodesRequiredNonHypershift = (
  isDefaultMachinePool?: boolean,
  isByoc?: boolean,
  isMultiAz?: boolean,
) => {
  if (isDefaultMachinePool) {
    // Default machine pool
    if (isByoc) {
      return isMultiAz ? 3 : 2;
    }
    return isMultiAz ? 9 : 4;
  }

  // Custom machine pool
  return 0;
};

/**
 * Minimum is 2, and if more than 1 node pool, then minimum is num of pools
 * @param {number | undefined=} numMachinePools
 * @returns number
 */
const getMinNodesRequiredHypershift = (numMachinePools?: number) => {
  if (numMachinePools === undefined) {
    // day 2 operation (Add/Edit)
    return 1;
  }
  if (numMachinePools === 1) {
    return 2;
  }
  return numMachinePools || 0;
};

/**
 * getMinNodesRequired hypershift agnostic
 *
 * @param isHypershiftCluster
 *
 * @param hypershiftProps
 * @param nonHypershiftProps
 * @returns
 */
const getMinNodesRequired = (
  isHypershiftCluster: boolean,
  hypershiftProps?: { numMachinePools?: number },
  nonHypershiftProps?: { isDefaultMachinePool: boolean; isByoc: boolean; isMultiAz: boolean },
) =>
  isHypershiftCluster
    ? getMinNodesRequiredHypershift(hypershiftProps?.numMachinePools)
    : getMinNodesRequiredNonHypershift(
        nonHypershiftProps?.isDefaultMachinePool,
        nonHypershiftProps?.isByoc,
        nonHypershiftProps?.isMultiAz,
      );

const isEnforcedDefaultMachinePool = (
  currentMachinePoolId: string | undefined,
  machinePools: MachinePool[],
  machineTypes: MachineTypesResponse,
  cluster: ClusterFromSubscription,
) => {
  if (isHypershiftCluster(cluster)) {
    return false;
  }

  if (!cluster.ccs?.enabled) {
    return currentMachinePoolId === NON_CCS_DEFAULT_POOL;
  }
  const minimalMachineType = machineTypes.types?.aws?.find((mt) => mt.id === 'm5.xlarge');
  const minReplicas = getMinNodesRequiredNonHypershift(
    true,
    cluster?.ccs?.enabled,
    isMultiAZ(cluster),
  );

  const providerMachineTypes =
    cluster.cloud_provider?.id === 'aws' ? machineTypes.types?.aws : machineTypes.types?.gcp;

  return !machinePools
    .filter((mp) => mp.id !== currentMachinePoolId)
    .some((mp: NodePool | MachinePool) => {
      const instanceType =
        mp.kind === 'NodePool'
          ? (mp as NodePool).aws_node_pool?.instance_type
          : (mp as MachinePool).instance_type;

      const machineType = providerMachineTypes?.find((mt) => mt.id === instanceType);

      return (
        machineType &&
        !mp.taints &&
        ((mp.replicas && mp.replicas >= minReplicas) ||
          ((mp as any).autoscaling?.min_replicas &&
            (mp as any).autoscaling?.min_replicas >= minReplicas)) &&
        (machineType?.cpu?.value ?? 0) >= (minimalMachineType?.cpu?.value ?? 0) &&
        (machineType?.memory?.value ?? 0) >= (minimalMachineType?.memory?.value ?? 0)
      );
    });
};

const isMinimumCountWithoutTaints = ({
  currentMachinePoolId,
  machinePools,
  cluster,
}: {
  currentMachinePoolId?: string;
  machinePools: MachinePool[];
  cluster: ClusterFromSubscription;
}) => {
  if (!isHypershiftCluster(cluster)) {
    return true; // This only applies to HCP clusters
  }

  const numberReplicas = machinePools?.reduce((count, pool) => {
    if (pool.id !== currentMachinePoolId) {
      if (!pool.taints?.length) {
        return count + (pool.autoscaling?.min_replicas ?? pool.replicas ?? 0);
      }
    }
    return count;
  }, 0);

  return numberReplicas >= 2;
};

const actionResolver = ({
  machinePool,
  onClickEdit,
  onClickDelete,
  onClickUpdate,
  canDelete,
  cluster,
  machinePools,
  machineTypes,
}: {
  machinePool: any;
  onClickEdit: (...args: any[]) => any;
  onClickDelete: (...args: any[]) => any;
  onClickUpdate: (...args: any[]) => any;
  canDelete: boolean;
  cluster: ClusterFromSubscription;
  machinePools: MachinePool[];
  machineTypes: GlobalState['machineTypes'];
}) => {
  // hide actions kebab for expandable rows
  if (!machinePool) {
    return [];
  }

  const isEnforcedDefaultMP = isEnforcedDefaultMachinePool(
    machinePool.id,
    machinePools,
    machineTypes,
    cluster,
  );

  const hasMinimumCount = isMinimumCountWithoutTaints({
    currentMachinePoolId: machinePool.id,
    machinePools,
    cluster,
  });

  const deleteDisabledReason = isDeleteDisabled(
    canDelete,
    machinePools,
    isEnforcedDefaultMP,
    hasMinimumCount,
  );

  const editAction = {
    title: 'Edit',
    onClick: (_: any) => onClickEdit(_, machinePool.id, machinePool),
    className: 'hand-pointer',
  };

  const deleteAction = {
    title: 'Delete',
    onClick: (_: any) => onClickDelete(_, machinePool.id, machinePool),
    className: 'hand-pointer',
    isAriaDisabled: !!deleteDisabledReason,
    ...(!!deleteDisabledReason && {
      tooltipProps: {
        content: deleteDisabledReason,
      },
    }),
  };

  const updateAction = {
    title: 'Update version',
    onClick: () => onClickUpdate(machinePool),
    className: 'hand-pointer',
  };

  return [editAction, deleteAction, ...(onClickUpdate !== undefined ? [updateAction] : [])];
};

// Takes a node_pool format (singular min/max replica) and converts machine pool style of data (plural min/max replicas)
const normalizeNodePool = (nodePool: NodePool) => {
  const normalizedNodePool = { ...nodePool, instance_type: nodePool.aws_node_pool?.instance_type };
  if (nodePool.autoscaling) {
    normalizedNodePool.autoscaling = { ...nodePool.autoscaling };
    if (nodePool.autoscaling?.min_replica && nodePool.autoscaling?.min_replica > 0) {
      (normalizedNodePool as any).autoscaling.min_replicas = nodePool.autoscaling.min_replica;
      delete normalizedNodePool.autoscaling.min_replica;
    }
    if (nodePool.autoscaling?.max_replica && nodePool.autoscaling?.max_replica > 0) {
      (normalizedNodePool as any).autoscaling.max_replicas = nodePool.autoscaling.max_replica;
      delete normalizedNodePool.autoscaling.max_replica;
    }
  }
  return normalizedNodePool;
};

const getSubnetIds = (machinePoolOrNodePool: MachinePool | NodePool) => {
  // NodePools have "subnet", MachinePools have "subnets"
  const { subnet, subnets } = machinePoolOrNodePool as any;
  return asArray(subnet || subnets || []);
};

const hasSubnets = (machinePoolOrNodePool: MachinePool | NodePool) =>
  getSubnetIds(machinePoolOrNodePool).length > 0;

const getClusterMinNodes = ({
  cluster,
  machineTypesResponse,
  machinePool,
  machinePools,
}: {
  cluster: ClusterFromSubscription;
  machineTypesResponse: MachineTypesResponse;
  machinePool: MachinePool | undefined;
  machinePools: MachinePool[];
}) => {
  if (isHypershiftCluster(cluster)) {
    return isMinimumCountWithoutTaints({
      currentMachinePoolId: machinePool?.id,
      cluster,
      machinePools,
    })
      ? 1
      : 2;
  }
  const isMultiAz = isMultiAZ(cluster);

  const isEnforcedDefaultMP =
    !!machinePool &&
    isEnforcedDefaultMachinePool(machinePool.id, machinePools, machineTypesResponse, cluster);

  return getMinNodesRequiredNonHypershift(isEnforcedDefaultMP, !!cluster?.ccs?.enabled, isMultiAz);
};

/**
 * Node increment
 * MultiAz requires nodes to be a multiple of 3
 * @param {boolean} isMultiAz
 * @returns number
 */
const getNodeIncrement = (isMultiAz: boolean) => (isMultiAz ? 3 : 1);

/**
 * Node increment for Hypershift machine pools
 * @returns number
 */
const getNodeIncrementHypershift = (numMachinePools?: number) => numMachinePools ?? 1;

const hasExplicitAutoscalingMachinePool = (machinePools: MachinePool[], excludeId?: string) =>
  (machinePools || []).some((mp) => !!mp.autoscaling && (!excludeId || excludeId !== mp.id));

const hasDefaultOrExplicitAutoscalingMachinePool = (
  cluster: Cluster,
  machinePools: MachinePool[],
  excludeId?: string,
) =>
  cluster?.nodes?.autoscale_compute
    ? true
    : hasExplicitAutoscalingMachinePool(machinePools, excludeId);

const canUseSpotInstances = (cluster: ClusterFromSubscription) => {
  const cloudProviderID = cluster.cloud_provider?.id;
  const product = normalizeProductID(cluster.product?.id);
  return (
    cloudProviderID === 'aws' &&
    !isHypershiftCluster(cluster) &&
    (product === normalizedProducts.ROSA ||
      (product === normalizedProducts.OSD && cluster.ccs?.enabled))
  );
};

export {
  actionResolver,
  canUseSpotInstances,
  getClusterMinNodes,
  getMinNodesRequired,
  getNodeIncrement,
  getNodeIncrementHypershift,
  getSubnetIds,
  hasDefaultOrExplicitAutoscalingMachinePool,
  hasExplicitAutoscalingMachinePool,
  hasSubnets,
  isEnforcedDefaultMachinePool,
  isMinimumCountWithoutTaints,
  normalizeNodePool,
};
