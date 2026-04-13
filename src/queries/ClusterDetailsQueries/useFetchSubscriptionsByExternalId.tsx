import { useQuery } from '@tanstack/react-query';

import accountsService from '~/services/accountsService';

import { formatErrorData } from '../helpers';
import { queryConstants } from '../queriesConstants';

/**
 * Query to fetch subscriptions based on external IDs
 * @param externalIds comma-separated external IDs wrapped in single quotes (e.g., "'id1','id2','id3'")
 * @returns query states. Loading, error and subscription data
 */
export const useFetchSubscriptionsByExternalId = (externalIds: string) => {
  const subscriptionSearchString = `external_cluster_id in (${externalIds})`;

  const { isLoading, data, isError, error, isFetching } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'accountsService',
      'subscription',
      externalIds,
    ],
    queryFn: async () => {
      const response = await accountsService.getSubscriptions({
        filter: subscriptionSearchString,
        page: 1,
        page_size: queryConstants.API_PAGE_SIZE,
      });
      return response;
    },
    retry: false,
    enabled: !!externalIds,
  });

  const formattedError = isError ? formatErrorData(isLoading, isError, error) : undefined;
  const finalError = isError ? formattedError : error;

  return {
    data: data?.data,
    isLoading,
    isError,
    error: finalError,
    isFetching,
  };
};
