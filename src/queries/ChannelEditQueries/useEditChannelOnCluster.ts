import { useMutation } from '@tanstack/react-query';

import { clusterService } from '~/services';

import { formatErrorData } from '../helpers';

export const useEditChannelOnCluster = () => {
  const { data, isError, isPending, isSuccess, mutate, mutateAsync, error, status } = useMutation({
    mutationKey: ['clusterService', 'editChannel'],
    mutationFn: async ({ clusterID, channel }: { clusterID: string; channel: string }) => {
      const response = await clusterService.editCluster(clusterID, {
        channel,
      });

      return response;
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
