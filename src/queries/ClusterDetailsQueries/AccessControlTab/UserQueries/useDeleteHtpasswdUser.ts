import { useMutation } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import { getClusterServiceForRegion } from '~/services/clusterService';

export const useDeleteHtpasswdUser = (clusterID: string, idpID: string, region?: string) => {
  const { isPending, isError, error, isSuccess, mutate, reset } = useMutation({
    mutationKey: ['deleteHtpasswdUser'],
    mutationFn: async (htpasswdUserID: string) => {
      const clusterService = getClusterServiceForRegion(region);
      const response = await clusterService.deleteHtpasswdUser(clusterID, idpID, htpasswdUserID);
      return response;
    },
  });

  if (isError) {
    const formattedError = formatErrorData(isPending, isError, error);
    return {
      isPending,
      isError,
      error: formattedError,
      isSuccess,
      mutate,
      reset,
    };
  }

  return {
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
    reset,
  };
};
