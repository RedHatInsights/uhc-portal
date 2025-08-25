import { GlobalState } from '~/redux/stateTypes';
import { ClusterFromSubscription, ClusterWithPermissions } from '~/types/types';

import {
  hasCapability,
  subscriptionCapabilities,
} from '../../../../../common/subscriptionCapabilities';

const canTransferClusterOwnershipSelector = (state: GlobalState) =>
  hasCapability(
    state.clusters?.details?.cluster?.subscription,
    subscriptionCapabilities.RELEASE_OCP_CLUSTERS,
  );

/**
 * Different approach of getting data requires similar function
 * @param cluster Accepts cluster as parameter instead of redux state
 * @returns list of capabbilities
 */
const canTransferClusterOwnershipMultiRegion = (cluster: ClusterFromSubscription) =>
  hasCapability(cluster?.subscription, subscriptionCapabilities.RELEASE_OCP_CLUSTERS);

const canTransferClusterOwnershipListFromClusters = (clusters: ClusterWithPermissions[] = []) =>
  clusters.reduce(
    (acc, cluster) => ({
      ...acc,
      [`${cluster.id}`]: hasCapability(
        cluster.subscription,
        subscriptionCapabilities.RELEASE_OCP_CLUSTERS,
      ),
    }),
    {},
  );

export {
  canTransferClusterOwnershipMultiRegion,
  canTransferClusterOwnershipSelector,
  canTransferClusterOwnershipListFromClusters,
};
