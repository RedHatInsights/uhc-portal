import range from 'lodash/range';

import { splitVersion } from '~/common/versionHelpers';
import {
  isMPoolAz,
  isMultiAZ,
} from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { availableQuota } from '~/components/clusters/common/quotaSelectors';
import { MachineTypesResponse } from '~/queries/types';
import { GlobalState } from '~/redux/state';
import { QuotaCostList } from '~/types/accounts_mgmt.v1';
import {
  CloudProvider,
  Cluster,
  MachinePool,
  MachineType,
  Product,
} from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { clusterBillingModelToRelatedResource } from '../billingModelMapper';
import { QuotaParams, QuotaTypes } from '../quotaModel';

import {
  MAX_NODES,
  MAX_NODES_HCP as MAX_NODES_HCP_DEFAULT,
  MAX_NODES_HCP_INSUFFICIEN_VERSION,
  MAX_NODES_INSUFFICIEN_VERSION as MAX_NODES_180,
  MAX_NODES_INSUFFICIEN_VERSION,
  workerNodeVolumeSizeMinGiB,
  workerNodeVolumeSizeMinGiBHcp,
} from './constants';

// OSD and ROSA classic - minimal version to allow 249 worker nodes - 4.14.14
export const getMaxWorkerNodes = (clusterVersionRawId: string | undefined) => {
  if (clusterVersionRawId) {
    const majorMinor = parseFloat(clusterVersionRawId);
    const versionPatch = Number(clusterVersionRawId.split('.')[2]);

    if (majorMinor > 4.14 || (majorMinor === 4.14 && versionPatch >= 14)) {
      return MAX_NODES;
    }
  }
  return MAX_NODES_INSUFFICIEN_VERSION;
};

export const getMaxNodesTotalDefaultAutoscaler = (
  clusterVersionRawId: string | undefined,
  isMultiAz: boolean,
) => {
  const MASTER_NODES = 3;
  const infraNodes = isMultiAz ? 3 : 2;
  return getMaxWorkerNodes(clusterVersionRawId) + MASTER_NODES + infraNodes;
};

// HCP - Minimal versions to allow more then 90 nodes - 4.15.15, 4.14.28
const isOcpVersionSufficient = (ocpVersion: string) => {
  const majorMinor = parseFloat(ocpVersion);
  const versionPatch = Number(ocpVersion.split('.')[2]);
  if (majorMinor >= 4.16) {
    return true;
  }
  if (majorMinor <= 4.13) {
    return false;
  }
  if (majorMinor === 4.14) {
    return versionPatch >= 28;
  }
  if (majorMinor === 4.15) {
    return versionPatch >= 15;
  }
  return true;
};

export const getMaxNodesHCP = (ocpVersion?: string) => {
  if (ocpVersion && !isOcpVersionSufficient(ocpVersion)) {
    return MAX_NODES_HCP_INSUFFICIEN_VERSION;
  }
  return MAX_NODES_HCP_DEFAULT;
};

export const getIncludedNodes = ({
  isMultiAz,
  isHypershift,
}: {
  isMultiAz: boolean;
  isHypershift: boolean;
}) => {
  if (!isHypershift) {
    return 0;
  }
  return isMultiAz ? 9 : 4;
};

export const buildOptions = ({
  included,
  available,
  isEditingCluster,
  currentNodeCount,
  minNodes,
  increment,
  isHypershift,
  clusterVersion,
  allow249NodesOSDCCSROSA,
}: {
  available: number;
  isEditingCluster: boolean;
  currentNodeCount: number;
  minNodes: number;
  increment: number;
  included: number;
  isHypershift?: boolean;
  clusterVersion: string | undefined;
  allow249NodesOSDCCSROSA?: boolean;
}) => {
  const maxNodesHCP = getMaxNodesHCP(clusterVersion);
  // no extra node quota = only base cluster size is available
  const optionsAvailable = available > 0 || isEditingCluster;
  let maxValue = isEditingCluster ? available + currentNodeCount : available + included;

  // eslint-disable-next-line no-nested-ternary
  const maxNumberOfNodes = isHypershift
    ? maxNodesHCP
    : allow249NodesOSDCCSROSA
      ? getMaxWorkerNodes(clusterVersion)
      : MAX_NODES_180;
  if (maxValue > maxNumberOfNodes) {
    maxValue = maxNumberOfNodes;
  }

  if (isHypershift && isEditingCluster && maxValue > maxNodesHCP - currentNodeCount) {
    maxValue = maxNodesHCP - currentNodeCount;
  }

  return optionsAvailable ? range(minNodes, maxValue + 1, increment) : [minNodes];
};

export const getAvailableQuota = ({
  quota,
  isByoc,
  isMultiAz,
  machineTypeId,
  machineTypes,
  cloudProviderID,
  product,
  billingModel,
}: {
  machineTypes: MachineTypesResponse;
  machineTypeId: MachineType['id'];
  isByoc: boolean;
  isMultiAz: boolean;
  quota: GlobalState['userProfile']['organization']['quotaList'];
  cloudProviderID: CloudProvider['id'];
  product: Product['id'];
  billingModel: Cluster['billing_model'];
}) => {
  if (!machineTypeId) {
    return 0;
  }
  const machineTypeResource = machineTypes.typesByID?.[machineTypeId];
  if (!machineTypeResource) {
    return 0;
  }
  const resourceName = machineTypeResource.generic_name;

  const quotaParams: QuotaParams = {
    product,
    cloudProviderID,
    isBYOC: isByoc,
    isMultiAz,
    resourceName,
    billingModel: clusterBillingModelToRelatedResource(billingModel),
  };
  return availableQuota(quota as QuotaCostList, {
    ...quotaParams,
    resourceType: QuotaTypes.NODE,
  });
};

/**
 * Function to calculate the amount of all the
 * nodes on machine pools for the cluster
 * @param machinePools List of machine pools
 * @param isHypershift Boolean if it is a hypershift cluster
 * @param editMachinePoolId Id of the machine pool being edited
 * @param machineTypeId Id of the machine pool type
 * @returns Total node count on machine pools for the cluster
 */
export const getNodeCount = (
  machinePools: MachinePool[],
  isHypershift: boolean,
  editMachinePoolId: string | undefined,
  machineTypeId: string | undefined,
): number =>
  machinePools.reduce((totalCount: number, mp: MachinePool) => {
    const mpReplicas = (mp.autoscaling ? mp.autoscaling.max_replicas : mp.replicas) || 0;

    if (
      (isHypershift && mp.id !== editMachinePoolId) ||
      (!isHypershift && mp.instance_type === machineTypeId)
    ) {
      return totalCount + mpReplicas;
    }
    return totalCount;
  }, 0);

export type getNodeOptionsType = {
  cluster: ClusterFromSubscription;
  quota: GlobalState['userProfile']['organization']['quotaList'];
  machineTypes: MachineTypesResponse;
  machineTypeId: string | undefined;
  machinePools: MachinePool[];
  machinePool: MachinePool | undefined;
  minNodes: number;
  editMachinePoolId?: string;
  allow249NodesOSDCCSROSA?: boolean;
};
export const getNodeOptions = ({
  cluster,
  quota,
  machineTypes,
  machineTypeId,
  machinePools,
  machinePool,
  minNodes,
  editMachinePoolId,
  allow249NodesOSDCCSROSA,
}: getNodeOptionsType) => {
  const isMultiAz = isMultiAZ(cluster);

  const isMPoolAZ = isMPoolAz(cluster, machinePool?.availability_zones?.length);

  const available = getAvailableQuota({
    quota,
    machineTypes,
    machineTypeId,
    isMultiAz,
    isByoc: !!cluster.ccs?.enabled,
    cloudProviderID: cluster.cloud_provider?.id,
    billingModel:
      (cluster as Cluster).billing_model ??
      ((cluster as ClusterFromSubscription).subscription
        ?.cluster_billing_model as Cluster['billing_model']),
    product: cluster.product?.id,
  });

  const isHypershift = isHypershiftCluster(cluster);

  const included = getIncludedNodes({
    isHypershift,
    isMultiAz,
  });

  const currentNodeCount = getNodeCount(
    machinePools,
    isHypershift,
    editMachinePoolId,
    machineTypeId,
  );

  return buildOptions({
    available,
    isEditingCluster: true,
    included,
    currentNodeCount,
    minNodes,
    increment: isMPoolAZ ? 3 : 1,
    isHypershift: isHypershiftCluster(cluster),
    clusterVersion: cluster.version?.raw_id,
    allow249NodesOSDCCSROSA,
  });
};

export const getWorkerNodeVolumeSizeMinGiB = (isHypershift: boolean): number =>
  isHypershift ? workerNodeVolumeSizeMinGiBHcp : workerNodeVolumeSizeMinGiB;

/**
 * Returns ROSA/AWS OSD max worker node volume size, varies per cluster version.
 * In GiB.
 */
export const getWorkerNodeVolumeSizeMaxGiB = (clusterVersionRawId: string): number => {
  const [major, minor] = splitVersion(clusterVersionRawId);
  return (major > 4 || (major === 4 && minor >= 14) ? 16 : 1) * 1024;
};
