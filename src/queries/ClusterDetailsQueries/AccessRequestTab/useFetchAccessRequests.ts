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
  isAccessProtectionLoading = false,
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
  const accessRequestItems = data?.data?.items;
  const clusterIds =
    accessRequestItems?.map((request) => `'${request.cluster_id}'`).join(',') || '';
  const {
    data: clusterData,
    isLoading: isClusterDataLoading,
    isFetching: isClusterDataFetching,
  } = useFetchClusterById(clusterIds);

  const hasAccessRequests = !!accessRequestItems?.length;
  const hasClusterIds = !!clusterIds;
  const hasClusterData = !!clusterData?.items;

  // We need cluster data if we have access requests with cluster IDs
  const needsClusterData = hasAccessRequests && hasClusterIds && !hasClusterData;

  // Check if we're in a loading state
  const combinedIsLoading =
    isLoading ||
    isAccessProtectionLoading ||
    isClusterDataLoading ||
    isClusterDataFetching ||
    needsClusterData;

  // Only build the joined data if we have cluster data or if there are no cluster IDs to fetch
  let accessRequestsWithClusterData: (AccessRequest & { name: string })[] | undefined;

  if (!hasAccessRequests || combinedIsLoading) {
    // Return undefined while loading or if there are no access requests
    accessRequestsWithClusterData = undefined;
  } else if (hasClusterIds && hasClusterData) {
    // We have both access requests and cluster data, join them
    accessRequestsWithClusterData = accessRequestItems.flatMap(
      (request): (AccessRequest & { name: string })[] => {
        const cluster = clusterData.items?.find((cluster) => cluster.id === request.cluster_id);
        return cluster
          ? [
              {
                ...request,
                name: cluster.name,
              } as AccessRequest & { name: string },
            ]
          : [];
      },
    );
  } else if (!hasClusterIds) {
    // No cluster IDs needed, return access requests as-is (this shouldn't happen in normal flow)
    accessRequestsWithClusterData = accessRequestItems as (AccessRequest & { name: string })[];
  }

  return {
    data: accessRequestsWithClusterData,
    isLoading: combinedIsLoading,
    isError,
    error: isError ? formatErrorData(isLoading, isError, error) : error,
    isSuccess,
  };
};
