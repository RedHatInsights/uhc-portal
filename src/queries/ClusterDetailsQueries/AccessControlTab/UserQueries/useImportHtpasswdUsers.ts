import { useMutation } from '@tanstack/react-query';

import { getClusterServiceForRegion } from '~/services/clusterService';

import { formatErrorData } from '../../../helpers';

export const useImportHtpasswdUsers = (clusterID: string, idpID: string, region?: string) => {
  const { isPending, isError, error, mutate, reset, isSuccess } = useMutation({
    mutationKey: ['clusterIdentityProviders', 'clusterService', 'htpasswdUsers', 'import'],
    mutationFn: async (users: { username: string; hashed_password: string }[]) => {
      const clusterService = getClusterServiceForRegion(region);
      return clusterService.createHtpasswdUserFromFile(clusterID, idpID, users);
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
