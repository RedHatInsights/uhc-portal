import { get } from 'lodash';

import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import { AddOn } from '~/types/clusters_mgmt.v1';

export const refetchAddOns = () => {
  queryClient.invalidateQueries({ queryKey: ['addOns'] });
};

export const useFetchAddOns = (clusterID: string, region?: string, isHypershift?: boolean) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY, 'addOns'],
    queryFn: async () => {
      if (region) {
        const clusterService = getClusterServiceForRegion(region);
        const response = clusterService.getEnabledAddOns(clusterID).then((res) => {
          const items: AddOn[] = get(res, 'data.items', []);
          return {
            items,
            resourceNames: items.map((addOn) => addOn.resource_name),
          };
        });

        return response;
      }

      const response = clusterService.getEnabledAddOns(clusterID).then((res) => {
        const items: any = get(res, 'data.items', []);
        return {
          items,
          resourceNames: items.map((addOn: any) => addOn.resource_name),
        };
      });

      return response;
    },
    enabled: !!clusterID && !isHypershift,
  });

  if (isError) {
    const formattedData = formatErrorData(isLoading, isError, error);
    return {
      isError,
      data: undefined,
      error: formattedData.error,
      isLoading,
    };
  }

  return {
    data,
    isError,
    isLoading,
    error,
  };
};
