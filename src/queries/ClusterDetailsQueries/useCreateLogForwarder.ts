import { useMutation } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';

import { invalidateLogForwarder } from './invalidateLogForwarder';

export function useCreateLogForwarder(clusterID: string, region?: string) {
  const { data, isPending, isError, error, mutate, reset, isSuccess } = useMutation({
    mutationKey: ['createLogForwarder', clusterID],
    mutationFn: async (body: LogForwarder) => {
      const svc = region ? getClusterServiceForRegion(region) : clusterService;
      return svc.postClusterControlPlaneLogForwarder(clusterID, body);
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
