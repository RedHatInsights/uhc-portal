import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import accessRequestService from '~/services/accessTransparency/accessRequestService';
import { AccessRequest } from '~/types/access_transparency.v1';
import { ViewOptions } from '~/types/types';

import { useFetchClusterById } from '../useFetchClusterById';

export const refetchAccessRequests = () => {
  queryClient.invalidateQueries({
    queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY, 'fetchAccessRequests'],
  });
};

export const useFetchAccessRequests = ({
  subscriptionId,
  organizationId,
  params,
  isAccessProtectionLoading,
  accessProtection,
}: {
  subscriptionId?: string;
  organizationId?: string;
  params: ViewOptions;
  isAccessProtectionLoading?: boolean;
  accessProtection?: { enabled: boolean };
}) => {
  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'fetchAccessRequests',
      params,
      isAccessProtectionLoading,
      accessProtection,
      subscriptionId || organizationId,
    ],
    queryFn: async () => {
      const response = await accessRequestService.getAccessRequests({
        page: params.currentPage,
        size: params.pageSize,
        search: subscriptionId
          ? `subscription_id='${subscriptionId}'`
          : `organization_id='${organizationId}'`,
        orderBy: params.sorting.sortField
          ? `${params.sorting.sortField} ${params.sorting.isAscending ? 'asc' : 'desc'}`
          : undefined,
      });

      return response;
    },
    enabled: !isAccessProtectionLoading && accessProtection?.enabled,
  });
  const clusterIds = data?.data?.items?.map((request) => `'${request.cluster_id}'`).join(',') || '';
  const { data: clusterData } = useFetchClusterById(clusterIds);

  const accessRequestsWithClusterData: (AccessRequest & { name: string })[] | undefined =
    data?.data?.items?.flatMap((request): (AccessRequest & { name: string })[] => {
      const cluster = clusterData?.items?.find((cluster) => cluster.id === request.cluster_id);
      return cluster
        ? [
            {
              ...request,
              name: cluster.name,
            } as AccessRequest & { name: string },
          ]
        : [];
    });

  return {
    data: accessRequestsWithClusterData,
    isLoading,
    isError,
    error: isError ? formatErrorData(isLoading, isError, error) : error,
    isSuccess,
  };
};
