import { useQuery } from '@tanstack/react-query';

import { sqlString } from '~/common/queryHelpers';
import { queryClient } from '~/components/App/queryClient';
import { getClusterServiceForRegion } from '~/services/clusterService';

import { clusterService } from '../../services';
import { queryConstants } from '../queriesConstants';

export const refetchSearchClusterName = (search: string, region?: string | undefined) => {
  queryClient.invalidateQueries({
    queryKey: [queryConstants.FETCH_SEARCH_CLUSTER_NAME, search, region],
    exact: true,
  });
};

export const useFetchSearchClusterName = (search: string, region?: string | undefined) => {
  const { data, isError, error, isFetching } = useQuery({
    queryKey: [queryConstants.FETCH_SEARCH_CLUSTER_NAME, search, region],
    queryFn: async () => {
      const service = region ? getClusterServiceForRegion(region) : clusterService;
      const searchValue = `name = ${sqlString(search)}`;
      const response = await service.searchClusters(searchValue, 1);

      return !!response?.data?.items?.length;
    },
    retry: false,
    enabled: !!search,
  });

  return {
    data,
    isError,
    error,
    isFetching,
  };
};
