import { useMutation } from '@tanstack/react-query';

import { getClusterServiceForRegion } from '~/services/clusterService';

import { formatErrorData } from '../../../helpers';

export const useCreateHtpasswdUser = (clusterID: string, idpID: string, region?: string) => {
  const { isPending, isError, error, mutate, reset, isSuccess } = useMutation({
    mutationKey: ['clusterIdentityProviders', 'clusterService', 'htpasswdUsers', 'addUser'],
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const clusterService = getClusterServiceForRegion(region);
      return clusterService.createHtpasswdUser(clusterID, idpID, username, password);
    },
  });

  return {
    isPending,
    isError,
    error: formatErrorData(isPending, isError, error)?.error,
    isSuccess,
    reset,
    mutate,
  };
};
