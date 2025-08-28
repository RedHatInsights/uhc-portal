import { useQuery } from '@tanstack/react-query';

import accountsService from '~/services/accountsService';
import clusterService from '~/services/clusterService';
import { Subscription } from '~/types/accounts_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { queryConstants } from '../queriesConstants';

/**
 * Query to fetch cluster detail based on externalID
 * @param externalId externalID from cluster
 * @param mainQueryKey query key for invalidation
 * @returns query states. Loading, error and cluster
 */
export const useFetchClusterByExternalId = (externalIds: string) => {
  const searchString = `external_id in (${externalIds})`;

  const { isLoading, data, isError, error, isFetching } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'clusterService',
      'externalId',
      externalIds,
    ],
    queryFn: async () => {
      const response = await clusterService.getClusters({
        search: searchString,
        page: 1,
        size: 500,
      });
      return response;
    },
    retry: false,
    enabled: !!externalIds,
  });
  const subIds: string[] = [];
  data?.data?.items?.forEach((cluster) => {
    const subscription = cluster?.subscription;
    if (subscription?.id) {
      subIds.push(subscription.id);
    }
  });

  const uniqueSubIds = [...new Set(subIds)];
  // before joining, each id is wrapped in single quotes
  uniqueSubIds.forEach((id, index) => {
    uniqueSubIds[index] = `'${id}'`;
  });
  const subscriptionIds = uniqueSubIds.join(',');
  const subscriptionSearchString = `id in (${subscriptionIds})`;
  const {
    isLoading: isSubLoading,
    data: subscriptionData,
    isError: isSubError,
    error: subError,
    isFetching: isSubFetching,
  } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'clusterService',
      'subscription',
      subscriptionIds,
    ],
    queryFn: async () => {
      const response = await accountsService.getSubscriptions({
        filter: subscriptionSearchString,
        page: 1,
        page_size: 500,
      });
      return response;
    },
    retry: false,
    enabled: !!subscriptionIds,
  });

  const clusters: Partial<ClusterFromSubscription>[] = [];
  data?.data?.items?.forEach((cluster) => {
    const subscription = cluster?.subscription;
    if (subscription) {
      const subscriptionDetails = subscriptionData?.data?.items?.find(
        (sub: Subscription) => sub.id === subscription.id,
      );
      clusters.push({
        ...cluster,
        subscription: {
          ...subscription,
          ...subscriptionDetails,
          managed: subscriptionDetails?.managed ?? false,
        },
      });
    }
  });

  return {
    isLoading: isLoading || isSubLoading,
    data: clusters,
    isError: isError || isSubError,
    error: isError ? error : subError,
    isFetching: isFetching || isSubFetching,
  };
};
