import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';

export const refetchGetClusterRouters = () => {
  queryClient.invalidateQueries({ queryKey: ['clusterRouters'] });
};

export const useGetClusterRouters = (clusterID: string, region?: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY, 'clusterRouters'],
    queryFn: async () => {
      if (region) {
        const clusterService = getClusterServiceForRegion(region);
        const response = clusterService.getIngresses(clusterID);
        return response;
      }

      const response = clusterService.getIngresses(clusterID);
      return response;
    },
    enabled: !!clusterID,
  });

  if (isError) {
    const formattedError = formatErrorData(isLoading, isError, error);
    return {
      data: data?.data.items,
      isLoading,
      isError,
      error: formattedError.error,
    };
  }

  return {
    data: data?.data.items,
    isLoading,
    isError,
    error,
  };
};
