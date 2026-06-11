import { keyBy } from 'lodash';

import { useQuery } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import { MachineType } from '~/types/clusters_mgmt.v1';

import { groupByCloudProvider } from './utils';

const mapMachineTypesById = (types: { [id: string]: MachineType[] }) =>
  keyBy([...(types.aws ?? []), ...(types.gcp ?? [])], 'id');

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
        const groupedByCloudProvider = groupByCloudProvider(response.data.items);
        const typesByID = mapMachineTypesById(groupedByCloudProvider);
        return { groupedByCloudProvider, typesByID };
      }

      const response = await clusterService.getMachineTypes();
      const groupedByCloudProvider = groupByCloudProvider(response.data.items);
      const typesByID = mapMachineTypesById(groupedByCloudProvider);
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
