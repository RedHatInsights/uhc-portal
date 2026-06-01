import { useQuery } from '@tanstack/react-query';

import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import { Subscription, SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

/**
 * Query to fetch cluster details based on subscription
 * @param clusterID clusterID from subscription
 * @param subscription result of subscription query
 * @param isAROCluster boolean to check for enabled
 * @param mainQueryKey query key for invalidation
 * @returns query states. Loading, error and cluster
 */
export const useFetchCluster = (
  clusterID: string,
  subscription: Subscription | undefined,
  isAROCluster: boolean | undefined,
  mainQueryKey: string,
) => {
  const { isLoading, data, isError, error, isFetching } = useQuery({
    queryKey: [mainQueryKey, 'clusterService', clusterID, subscription],
    queryFn: async () => {
      if (subscription?.rh_region_id) {
        const clusterService = getClusterServiceForRegion(subscription?.rh_region_id);
        const response = await clusterService.getClusterDetails(clusterID);
        return response;
      }
      const response = await clusterService.getClusterDetails(clusterID);
      return response;
    },
    retry: false,
    enabled:
      !!subscription &&
      subscription.status !== SubscriptionCommonFieldsStatus.Deprovisioned &&
      (subscription.managed || isAROCluster),
  });
  return {
    isLoading,
    data,
    isError,
    error,
    isFetching,
  };
};
