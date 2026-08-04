import { useMutation } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';

import { invalidateLogForwarder } from './invalidateLogForwarder';

export function useDeleteLogForwarder(clusterID: string, region?: string) {
  const { data, isPending, isError, error, mutate, reset, isSuccess } = useMutation({
    mutationKey: ['deleteLogForwarder', clusterID],
    mutationFn: async (logForwarderID: string) => {
      const svc = region ? getClusterServiceForRegion(region) : clusterService;
      return svc.deleteClusterControlPlaneLogForwarder(clusterID, logForwarderID);
    },
    onSuccess: () => {
      invalidateLogForwarder(clusterID, region);
    },
  });

  if (isError) {
    const formattedError = formatErrorData(isPending, isError, error);
    return {
      data,
      isPending,
      isError,
      error: formattedError,
      mutate,
      reset,
      isSuccess,
    };
  }

  return {
    data,
    isPending,
    isError,
    error,
    mutate,
    reset,
    isSuccess,
  };
}
