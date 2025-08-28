import { useMutation } from '@tanstack/react-query';

import { getClusterServiceForRegion } from '~/services/clusterService';

import { formatErrorData } from '../../../helpers';

export const useCreateEditHtpasswdUser = (clusterID: string, idpID: string, region?: string) => {
  const { isPending, isError, error, mutate, reset, isSuccess } = useMutation({
    mutationKey: ['clusterIdentityProviders', 'clusterService', 'htpasswdUsers', 'add/edit'],
    mutationFn: async ({
      username,
      password,
      userID,
    }: {
      username: string;
      password: string;
      userID?: string;
    }) => {
      const clusterService = getClusterServiceForRegion(region);
      if (userID) {
        return clusterService.editHtpasswdUser(clusterID, idpID, userID, password);
      }
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
