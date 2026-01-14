import { useQuery } from '@tanstack/react-query';

import accountsService from '~/services/accountsService';

import { formatErrorData } from '../helpers';
import { queryConstants } from '../queriesConstants';

/**
 * Query to fetch subscriptions based on cluster IDs
 * @param clusterIds comma-separated subscription IDs wrapped in single quotes (e.g., "'id1','id2','id3'")
 * @returns query states. Loading, error and subscription data
 */
export const useFetchSubscriptionsByClusterId = (clusterIds: string) => {
  const subscriptionSearchString = `cluster_id in (${clusterIds})`;

  const { isLoading, data, isError, error, isFetching } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'accountsService',
      'subscription',
      clusterIds,
    ],
    queryFn: async () => {
      const response = await accountsService.getSubscriptions({
        filter: subscriptionSearchString,
        page: 1,
        page_size: 500,
        fields: 'cluster_id,display_name',
      });
      return response;
    },
    retry: false,
    enabled: !!clusterIds,
  });

  if (isError) {
    const formattedError = formatErrorData(isLoading, isError, error);
    return {
      data: data?.data,
      isLoading,
      isError,
      error: formattedError,
      isFetching,
    };
  }

  return {
    data: data?.data,
    isLoading,
    isError,
    error,
    isFetching,
  };
};
