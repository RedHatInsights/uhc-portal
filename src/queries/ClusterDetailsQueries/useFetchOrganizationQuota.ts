import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { accountsService } from '~/services';

import { formatErrorData } from '../helpers';
import { queryConstants } from '../queriesConstants';

export const refetchOrganizationQuota = (organizationID: string) => {
  queryClient.invalidateQueries({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'accountsService',
      'getOrganizationQuota',
      organizationID,
    ],
  });
};
/**
 * Query for fetching organization quota
 * @param organizationID this ID comes from user profile in redux
 * @returns org quota details
 */
export const useFetchOrganizationQuota = (organizationID: string) => {
  const { isLoading, data, isError, error, isFetching, refetch } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'accountsService',
      'getOrganizationQuota',
      organizationID,
    ],
    queryFn: async () => {
      const organizationQuota = await accountsService.getOrganizationQuota(organizationID);

      return {
        organizationQuota: organizationQuota.data,
      };
    },
    enabled: !!organizationID,
  });

  return isError
    ? {
        isLoading,
        data,
        isError,
        error: formatErrorData(isLoading, isError, error),
        rawError: error,
      }
    : { isLoading, data, isError, error, isFetching, refetch, rawError: error };
};
