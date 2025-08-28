import { useQuery } from '@tanstack/react-query';

import { getClusterServiceForRegion } from '~/services/clusterService';
import { HtPasswdUser } from '~/types/clusters_mgmt.v1';

import { formatErrorData } from '../../../helpers';

// NOTE - while the API docs say that results are pagination, they are not
// all users are always returned regardless of the page param, perPage param, or number of results
export const useFetchHtpasswdUsers = (clusterID: string, idpID: string, region?: string) => {
  const { isLoading, data, isError, error, isSuccess, isFetching, refetch } = useQuery({
    queryKey: [
      'clusterIdentityProviders',
      'clusterService',
      'htpasswdUsers',
      clusterID,
      region,
      idpID,
    ],
    queryFn: async () => {
      const clusterService = getClusterServiceForRegion(region);
      return clusterService.getHtpasswdUsers(clusterID, idpID);
    },
    enabled: !!clusterID && !!idpID,
  });

  type APIResponse = {
    page: number;
    size: number;
    total: number;
    items: HtPasswdUser[];
  };

  const returnData = data?.data as APIResponse;

  return {
    isLoading,
    users: returnData?.items || [],
    isError,
    error: formatErrorData(isLoading, isError, error)?.error,
    isSuccess,
    isFetching,
    refetch,
  };
};
