import { useQuery } from '@tanstack/react-query';

import { sqlString } from '~/common/queryHelpers';
import { queryClient } from '~/components/App/queryClient';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';

import { queryConstants } from '../queriesConstants';

export const refetchSearchDomainPrefix = (search: string, region?: string | undefined) => {
  queryClient.invalidateQueries({
    queryKey: [queryConstants.FETCH_SEARCH_DOMAIN_PREFIX, search, region],
    exact: true,
  });
};

export const useFetchSearchDomainPrefix = (search: string, region?: string | undefined) => {
  const { data, isError, error, isFetching } = useQuery({
    queryKey: [queryConstants.FETCH_SEARCH_DOMAIN_PREFIX, search, region],
    queryFn: async () => {
      const service = region ? getClusterServiceForRegion(region) : clusterService;

      const searchValue = `domain_prefix = ${sqlString(search)}`;
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
