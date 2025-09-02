import { useMutation } from '@tanstack/react-query';

import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import { Cluster } from '~/types/clusters_mgmt.v1';

import { formatErrorData } from '../helpers';

export type EditClusterInput = {
  clusterID: string;
  cluster: Cluster;
};

export const useEditCluster = (region?: string) => {
  const { data, isPending, isError, error, isSuccess, mutate, reset } = useMutation({
    mutationKey: ['editCluster'],
    mutationFn: async ({ clusterID, cluster }: EditClusterInput) => {
      if (!clusterID) {
        throw new Error('Cluster ID is required');
      }

      const service = region ? getClusterServiceForRegion(region) : clusterService;
      return service.editCluster(clusterID, cluster);
    },
  });

  return {
    data,
    isPending,
    isError,
    error: isError ? formatErrorData(isPending, isError, error).error : null,
    mutate,
    isSuccess,
    reset,
  };
};
