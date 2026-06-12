import { useMutation } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';

import { invalidateLogForwarder } from './invalidateLogForwarder';

type EditLogForwarderInput = {
  logForwarderID: string;
  body: LogForwarder;
};

export function useEditLogForwarder(clusterID: string, region?: string) {
  const { data, isPending, isError, error, mutate, reset, isSuccess } = useMutation({
    mutationKey: ['editLogForwarder', clusterID],
    mutationFn: async ({ logForwarderID, body }: EditLogForwarderInput) => {
      const svc = region ? getClusterServiceForRegion(region) : clusterService;
      return svc.patchClusterControlPlaneLogForwarder(clusterID, logForwarderID, body);
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
