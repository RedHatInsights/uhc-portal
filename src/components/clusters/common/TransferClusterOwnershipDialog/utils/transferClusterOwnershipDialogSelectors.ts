import { GlobalState } from '~/redux/stateTypes';
import { ClusterFromSubscription, ClusterWithPermissions } from '~/types/types';

import {
  clusterCapabilities,
  hasCapabilityValue,
  haveCapabilities,
} from '../../../../../common/capabilities';

const canTransferClusterOwnershipSelector = (state: GlobalState) =>
  hasCapabilityValue(
    state.clusters?.details?.cluster?.subscription?.capabilities,
    clusterCapabilities.RELEASE_OCP_CLUSTERS,
  );

/**
 * Different approach of getting data requires similar function
 * @param cluster Accepts cluster as parameter instead of redux state
 * @returns list of capabbilities
 */
const canTransferClusterOwnershipMultiRegion = (cluster: ClusterFromSubscription) =>
  hasCapabilityValue(cluster?.subscription?.capabilities, clusterCapabilities.RELEASE_OCP_CLUSTERS);

const canTransferClusterOwnershipListFromClusters = (clusters: ClusterWithPermissions[] = []) =>
  haveCapabilities(clusters, clusterCapabilities.RELEASE_OCP_CLUSTERS);

export {
  canTransferClusterOwnershipMultiRegion,
  canTransferClusterOwnershipSelector,
  canTransferClusterOwnershipListFromClusters,
};
