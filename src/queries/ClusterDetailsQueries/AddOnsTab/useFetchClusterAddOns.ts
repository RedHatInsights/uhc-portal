import { get } from 'lodash';

import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import { AddOn } from '~/types/clusters_mgmt.v1';

export const refetchClusterAddOns = () => {
  queryClient.invalidateQueries({
    queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY, 'clusterAddOns'],
  });
};

export const useFetchClusterAddOns = (
  clusterID: string,
  region?: string,
  isHypershift?: boolean,
) => {
  const { data, isError, error, isLoading } = useQuery({
    queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY, 'clusterAddOns', clusterID],
    queryFn: async () => {
      if (region) {
        const clusterService = getClusterServiceForRegion(region);
        const response = clusterService.getClusterAddOns(clusterID).then((res) => {
          const items: AddOn[] = get(res, 'data.items', []);

          return {
            clusterID,
            items,
          };
        });
        return response;
      }
      const response = clusterService.getClusterAddOns(clusterID).then((res) => {
        const items: AddOn[] = get(res, 'data.items', []);
        return {
          clusterID,
          items,
        };
      });
      return response;
    },
    enabled: !!clusterID && !isHypershift,
  });

  if (isError) {
    const formattedError = formatErrorData(isLoading, isError, error);

    return {
      data: undefined,
      isError,
      isLoading,
      error: formattedError.error,
    };
  }

  return {
    data,
    isLoading,
    isError,
    error,
  };
};
