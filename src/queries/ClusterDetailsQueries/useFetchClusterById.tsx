import { useQuery } from '@tanstack/react-query';

import clusterService from '~/services/clusterService';

import { formatErrorData } from '../helpers';
import { queryConstants } from '../queriesConstants';

/**
 * Query to fetch cluster detail based on clusterIDs
 * @param clusterIds clusterIDs from cluster
 * @returns query states. Loading, error and cluster
 */
export const useFetchClusterById = (clusterIds: string) => {
  const searchString = `id in (${clusterIds})`;

  const { isLoading, data, isError, error, isFetching } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'clusterService',
      'clusterId',
      clusterIds,
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
    enabled: !!clusterIds,
  });
  if (isError) {
    const formattedError = formatErrorData(isLoading, isError, error);
    return {
      data: data?.data,
      isLoading,
      isError,
      error: formattedError,
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
