import { useQuery } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';

import { mapMachineTypesItemsToResponse } from './utils';

/**
 * Query to fetch machine types
 * @param region for data sovereignty
 * @returns machineTypes, loading, isError and error
 */
export const useFetchMachineTypes = (region?: string) => {
  const { isLoading, data, isError, error, refetch } = useQuery({
    queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY, 'machineTypes', 'clusterService'],
    queryFn: async () => {
      if (region) {
        const clusterService = getClusterServiceForRegion(region);
        const response = await clusterService.getMachineTypes();
        const { types: groupedByCloudProvider, typesByID } = mapMachineTypesItemsToResponse(
          response.data.items,
        );
        return { groupedByCloudProvider, typesByID };
      }

      const response = await clusterService.getMachineTypes();
      const { types: groupedByCloudProvider, typesByID } = mapMachineTypesItemsToResponse(
        response.data.items,
      );
      return { groupedByCloudProvider, typesByID };
    },
    retry: false,
    refetchOnMount: false,
  });

  const formattedError = formatErrorData(isLoading, isError, error);

  return {
    isLoading,
    data: {
      types: data?.groupedByCloudProvider,
      typesByID: data?.typesByID,
    },
    isError,
    error: formattedError,
    refetch,
  };
};
