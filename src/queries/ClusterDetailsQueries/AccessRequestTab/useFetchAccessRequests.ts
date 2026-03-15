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
  accessProtection?: { enabled?: boolean };
}) => {
  const viewType = viewConstants.ACCESS_REQUESTS_VIEW;
  const viewOptions = useGlobalState((state) => state.viewOptions[viewType]);

  const dispatch = useDispatch();

  const hasValidId = !!subscriptionId || !!organizationId;
  const isAccessProtectionResolved =
    !isAccessProtectionLoading && accessProtection?.enabled !== undefined;
  const queryEnabled =
    isAccessProtectionResolved && accessProtection?.enabled === true && hasValidId;

  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'fetchAccessRequests',
      params,
      subscriptionId || organizationId,
    ],
    queryFn: async () => {
      let search: string | undefined;
      if (subscriptionId) {
        search = `subscription_id='${subscriptionId}'`;
      } else if (organizationId) {
        search = `organization_id='${organizationId}' and status.state in ('Denied', 'Pending', 'Approved')`;
      }

      const response = await accessRequestService.getAccessRequests({
        page: params.currentPage,
        size: params.pageSize,
        search,
        orderBy: params.sorting.sortField
          ? `${params.sorting.sortField} ${params.sorting.isAscending ? 'asc' : 'desc'}`
          : undefined,
      });

      return response;
    },
    enabled: queryEnabled,
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
    isError: isClusterDataError,
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

  // We still need cluster data if we have access requests with cluster IDs,
  // unless the cluster query already settled with an error.
  const needsClusterData =
    hasAccessRequests && hasClusterIds && !hasClusterData && !isClusterDataError;

  // Treat as unresolved while access protection hasn't settled (still loading
  // or enabled is undefined). Once resolved, cover the render gap between
  // access protection resolving and React Query's isLoading becoming true.
  // Stop once the query itself has settled (success or error) so callers can
  // see isError.
  const querySettled = isSuccess || isError;
  const waitingForQuery =
    (hasValidId && !isAccessProtectionResolved) || (queryEnabled && !querySettled && !data);
  // Only block on cluster data when we have access requests that need it; otherwise empty
  // results would stay "loading" and we'd show an empty table instead of the empty state.
  const clusterDataLoading =
    hasAccessRequests && (isClusterDataLoading || isClusterDataFetching || needsClusterData);
  const combinedIsLoading = waitingForQuery || isLoading || clusterDataLoading;

  // Only build the joined data if we have cluster data or if there are no cluster IDs to fetch
  const accessRequestsWithClusterData = useMemo(() => {
    if (combinedIsLoading) {
      // Return undefined while loading so we don't show empty state
      return undefined;
    }
    if (!hasAccessRequests) {
      return [];
    }

    if (hasClusterIds && (hasClusterData || isClusterDataError)) {
      // Join with cluster names when available; fall back to cluster_id if the lookup failed
      return accessRequestItems
        .map((request) => {
          const clusterName = clusterMap.get(request.cluster_id) ?? request.cluster_id;
          return { ...request, name: clusterName };
        })
        .filter((item): item is AccessRequest & { name: string } => item !== null);
    }

    if (!hasClusterIds) {
      return accessRequestItems as (AccessRequest & { name: string })[];
    }

    return undefined;
  }, [
    combinedIsLoading,
    hasAccessRequests,
    hasClusterIds,
    hasClusterData,
    isClusterDataError,
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
