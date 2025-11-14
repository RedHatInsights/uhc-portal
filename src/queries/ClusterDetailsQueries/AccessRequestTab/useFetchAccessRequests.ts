import { useMemo } from 'react';

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

  const clusterIds = useMemo(
    () => accessRequestItems?.map((request) => `'${request.cluster_id}'`).join(',') || '',
    [accessRequestItems],
  );

  const {
    data: clusterData,
    isLoading: isClusterDataLoading,
    isFetching: isClusterDataFetching,
  } = useFetchClusterById(clusterIds);

  const clusterMap = useMemo(
    () => new Map(clusterData?.items?.map((cluster) => [cluster.id, cluster]) || []),
    [clusterData?.items],
  );

  const hasAccessRequests = !!accessRequestItems?.length;
  const hasClusterIds = !!clusterIds;
  const hasClusterData = !!clusterData?.items;

  // We need cluster data if we have access requests with cluster IDs
  const needsClusterData = hasAccessRequests && hasClusterIds && !hasClusterData;

  // Check if we're in a loading state
  const combinedIsLoading =
    isLoading || isClusterDataLoading || isClusterDataFetching || needsClusterData;

  // Only build the joined data if we have cluster data or if there are no cluster IDs to fetch
  const accessRequestsWithClusterData = useMemo(() => {
    if (!hasAccessRequests || combinedIsLoading) {
      // Return undefined while loading or if there are no access requests
      return undefined;
    }

    if (hasClusterIds && hasClusterData) {
      // We have both access requests and cluster data, join them
      return accessRequestItems
        .map((request) => {
          const cluster = clusterMap.get(request.cluster_id);
          return cluster ? { ...request, name: cluster.name } : null;
        })
        .filter((item): item is AccessRequest & { name: string } => item !== null);
    }

    if (!hasClusterIds) {
      // No cluster IDs needed, return access requests as-is (this shouldn't happen in normal flow)
      return accessRequestItems as (AccessRequest & { name: string })[];
    }

    return undefined;
  }, [
    hasAccessRequests,
    combinedIsLoading,
    hasClusterIds,
    hasClusterData,
    accessRequestItems,
    clusterMap,
  ]);

  return {
    data: accessRequestsWithClusterData,
    isLoading: combinedIsLoading,
    isError,
    error: isError ? formatErrorData(isLoading, isError, error) : error,
    isSuccess,
  };
};
