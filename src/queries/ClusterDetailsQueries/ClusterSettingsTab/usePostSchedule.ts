import { useMutation } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import { getClusterService, getClusterServiceForRegion } from '~/services/clusterService';
import { UpgradePolicy } from '~/types/clusters_mgmt.v1';

import { refetchSchedules } from './useGetSchedules';

export const usePostSchedule = (clusterID: string, isHypershift: boolean, region?: string) => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationKey: ['postSchedule'],
    mutationFn: async (schedule: UpgradePolicy) => {
      const clusterService = region ? getClusterServiceForRegion(region) : getClusterService();
      const requestPost = isHypershift
        ? clusterService.postControlPlaneUpgradeSchedule
        : clusterService.postUpgradeSchedule;

      const response = requestPost(clusterID, schedule);

      return response;
    },
    onSuccess: () => {
      refetchSchedules();
    },
  });

  if (isError) {
    const formattedError = formatErrorData(isPending, isError, error);
    return {
      data,
      isPending,
      isError,
      error: formattedError.error,
      mutate,
    };
  }

  return {
    data,
    isPending,
    isSuccess,
    isError,
    error,
    mutate,
  };
};
