import { useMutation } from '@tanstack/react-query';
import { clusterService } from '~/services';
import { formatErrorData } from '../helpers';

export const useMutateChannelGroup = () => {
  const { data, isError, isPending, isSuccess, mutate, mutateAsync, error, status } = useMutation({
    mutationKey: ['clusterService', 'editChannelGroup'],
    mutationFn: async ({
      clusterID,
      channelGroup,
    }: {
      clusterID: string;
      channelGroup: string;
    }) => {
      const response = await clusterService.editCluster(clusterID, {
        version: {
          channel_group: channelGroup,
        },
      });

      return response;
    },
  });

  return {
    data,
    isError,
    error: formatErrorData(isPending, isError, error),
    isSuccess,
    mutate,
    mutateAsync,
    status,
  };
};
