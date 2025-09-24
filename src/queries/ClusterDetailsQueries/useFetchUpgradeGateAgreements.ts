import { useQuery } from '@tanstack/react-query';

import { clusterService } from '~/services';
import { getClusterServiceForRegion } from '~/services/clusterService';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import { queryConstants } from '../queriesConstants';
import { SubscriptionResponseType } from '../types';

/**
 * Query for fetching feature gates based on region
 * @param clusterID id of the cluster
 * @param subscription axios subscription response, needed for query enablement
 * @param mainQueryKey used for refetch
 * @returns array of feature gates
 */
export const useFetchUpgradeGateAgreements = (
  clusterID: string,
  subscription: SubscriptionResponseType | undefined,
  mainQueryKey: string,
) => {
  const { isLoading, data } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      mainQueryKey,
      'upgradeGates',
      'clusterService',
      clusterID,
      subscription,
    ],
    queryFn: async () => {
      if (subscription?.subscription.rh_region_id) {
        const clusterService = getClusterServiceForRegion(subscription?.subscription.rh_region_id);
        const response = await clusterService.getClusterGateAgreements(clusterID);
        return response;
      }
      const response = await clusterService.getClusterGateAgreements(clusterID);
      return response;
    },
    enabled:
      !!subscription &&
      subscription.subscription.status !== SubscriptionCommonFieldsStatus.Deprovisioned &&
      (subscription.subscription.managed || subscription.isAROCluster),
  });
  return {
    isLoading,
    data,
  };
};
