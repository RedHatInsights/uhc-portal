import { useMutation } from '@tanstack/react-query';

import { getClusterServiceForRegion } from '~/services/clusterService';

import { formatErrorData } from '../helpers';

export const useEditChannelOnCluster = () => {
  const { data, isError, isPending, isSuccess, mutate, mutateAsync, error, status } = useMutation({
    mutationKey: ['clusterService', 'editChannel'],
    mutationFn: async ({
      clusterID,
      channel,
      region,
    }: {
      clusterID: string;
      channel: string;
      region?: string;
    }) => {
      const clusterService = getClusterServiceForRegion(region);

      return clusterService.editCluster(clusterID, {
        channel,
      });
    },
  });

  return {
    data,
    isError,
    error: formatErrorData(isPending, isError, error),
    isSuccess,
    isPending,
    mutate,
    mutateAsync,
    status,
  };
};
