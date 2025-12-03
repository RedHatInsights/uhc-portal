import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import { onSetTotal } from '~/redux/actions/viewOptionsActions';
import { viewConstants } from '~/redux/constants';
import { useGlobalState } from '~/redux/hooks';
import accessRequestService from '~/services/accessTransparency/accessRequestService';
import { AccessRequest } from '~/types/access_transparency.v1';
import { ViewOptions } from '~/types/types';

import { useFetchSubscriptionsByClusterId } from '../useFetchSubscriptionsByClusterId';

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
  const viewType = viewConstants.ACCESS_REQUESTS_VIEW;
  const viewOptions = useGlobalState((state) => state.viewOptions[viewType]);

  const dispatch = useDispatch();

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
          : `organization_id='${organizationId}' and status.state in ('Denied', 'Pending', 'Approved')`,
        orderBy: params.sorting.sortField
          ? `${params.sorting.sortField} ${params.sorting.isAscending ? 'asc' : 'desc'}`
          : undefined,
      });

      return response;
    },
    enabled: !isAccessProtectionLoading && accessProtection?.enabled,
  });
  const accessRequestItems = data?.data?.items;

  // Recalculate totalPages when pageSize changes
  useEffect(() => {
    if (data?.data?.total !== undefined) {
      dispatch(onSetTotal(data.data.total, viewType));
    }
  }, [viewOptions.pageSize, data?.data?.total, dispatch, viewType]);

  const clusterIds = useMemo(() => {
    if (!accessRequestItems || subscriptionId) return '';
    const uniqueIds = Array.from(new Set(accessRequestItems.map((request) => request.cluster_id)));
    return uniqueIds.map((id) => `'${id}'`).join(',');
  }, [accessRequestItems, subscriptionId]);

  const {
    data: clusterData,
    isLoading: isClusterDataLoading,
    isFetching: isClusterDataFetching,
  } = useFetchSubscriptionsByClusterId(clusterIds);

  const clusterMap = useMemo(
    () =>
      new Map(
        clusterData?.items?.map((subscription) => [
          subscription.cluster_id,
          subscription.display_name ?? '',
        ]) || [],
      ),
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
    if (combinedIsLoading) {
      // Return undefined while loading so we don't show empty state
      return undefined;
    }
    if (!hasAccessRequests) {
      return [];
    }

    if (hasClusterIds && hasClusterData) {
      // We have both access requests and cluster data, join them
      return accessRequestItems
        .map((request) => {
          const clusterName = clusterMap.get(request.cluster_id) ?? request.cluster_id;
          return { ...request, name: clusterName };
        })
        .filter((item): item is AccessRequest & { name: string } => item !== null);
    }

    if (!hasClusterIds) {
      // No cluster IDs needed, return access requests as-is (this shouldn't happen in normal flow)
      return accessRequestItems as (AccessRequest & { name: string })[];
    }

    return undefined;
  }, [
    combinedIsLoading,
    hasAccessRequests,
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
