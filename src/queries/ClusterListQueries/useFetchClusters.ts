import React from 'react';
import { shallowEqual } from 'react-redux';

import { useQueries, UseQueryOptions } from '@tanstack/react-query';

import { ARCHIVED_CLUSTERS_VIEW, CLUSTERS_VIEW } from '~/redux/constants/viewConstants';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { type Subscription } from '~/types/accounts_mgmt.v1';
import { Cluster } from '~/types/clusters_mgmt.v1';
import { ClusterWithPermissions } from '~/types/types';

import {
  createResponseForFetchClusters,
  ErrorResponse,
  formatClusterListError,
} from './helpers/createResponseForFetchCluster';
import { fetchAIClusters, fetchManagedClusters } from './helpers/fetchClusters';
import { useFetchCanEditDelete } from './helpers/useFetchCanEditDelete';
import {
  buildSearchClusterQuery,
  clearQueries,
  combineClusterQueries,
  createQueryKey,
  FetchClusterQueryResults,
  isExistingQuery,
  useRefetchClusterList,
} from './helpers/useFetchClustersHelpers';
import { useFetchSubscriptions } from './helpers/useFetchSubscriptions';

const REGION_ID = 'rh_region_id';

export const useFetchClusters = (isArchived = false, useManagedEndpoints = true) => {
  const viewOptionsType = isArchived ? ARCHIVED_CLUSTERS_VIEW : CLUSTERS_VIEW;

  const [queries, setQueries] = React.useState<UseQueryOptions[]>([]);

  /* *****  Refetch data (aka auto refresh) **** */
  const { refetch, setRefetchSchedule } = useRefetchClusterList(isArchived);

  /* ***** Reset refresh timer on Filtering / Sorting / Pagination Change  **** */
  const userName = useGlobalState((state) => state.userProfile.keycloakProfile.username);
  const viewOptions = useGlobalState(
    (state) => ({
      ...state.viewOptions[viewOptionsType],
      // total is required by the type but isn't used in this code
      totalCount: 0, // Set to 0 in order to prevent a reload when that total is returned with the subscription api call
    }),
    shallowEqual,
  );

  const plans = viewOptions.flags?.subscriptionFilter?.plan_id?.toString();
  React.useEffect(() => {
    clearQueries(setQueries, setRefetchSchedule, isArchived);
    // NOTE: Refetch only on sort/filter/pagination change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    viewOptions.currentPage,
    viewOptions.pageSize,
    viewOptions.filter,
    viewOptions.sorting.sortField,
    viewOptions.sorting.isAscending,
    plans,
    viewOptions.flags.showMyClustersOnly,
  ]);

  /* **** Get subscriptions **** */

  const {
    data: subscriptionsData,
    isLoading: isSubscriptionsLoading,
    isFetching: isSubscriptionsFetching,
    isFetched: isSubscriptionsFetched,
    isError: isSubscriptionsError,
    error: rawSubscriptionsError,
  } = useFetchSubscriptions({
    viewOptions,
    isArchived,
    userName,
  });

  /* **** Process subscriptions data **** */
  const subscriptionIds = subscriptionsData?.subscriptionIds;
  const subscriptionMap = subscriptionsData?.subscriptionMap;
  const managedSubscriptions = subscriptionsData?.managedSubscriptions;
  const total = subscriptionsData?.total || 0;

  const subscriptionsError = rawSubscriptionsError
    ? [
        formatClusterListError({
          error: rawSubscriptionsError as ErrorResponse | null,
        }),
      ]
    : [];

  /* **** Create AI Clusters Query **** */
  const aiQueryKey = createQueryKey({
    type: 'clusters',
    clusterTypeOrRegion: 'aiClusters',
    viewOptions,
    other: subscriptionIds || [],
    isArchived,
  });

  const doesAIQueryExist = isExistingQuery(queries, aiQueryKey);

  if (subscriptionIds && subscriptionIds.length > 0 && !doesAIQueryExist) {
    setQueries((currentQueries) => [
      ...currentQueries,
      {
        queryKey: aiQueryKey,
        queryFn: () => fetchAIClusters(subscriptionIds),
      },
    ]);
  }
  /* **** Create Managed Clusters Queries  **** */
  // Separate managed clusters by global and regional endpoints
  const managedClusters: { global: Subscription[]; [key: string]: Subscription[] } = {
    global: [],
  };
  managedSubscriptions?.forEach((subscription) => {
    const regionIdValue = subscription[REGION_ID];
    if (regionIdValue) {
      if (useManagedEndpoints) {
        if (!managedClusters[regionIdValue]) {
          managedClusters[regionIdValue] = [];
        }

        managedClusters[regionIdValue].push(subscription);
      }
    } else {
      managedClusters.global.push(subscription);
    }
  });

  // Create queries for each managed clusters endpoint
  const managedClustersQueries = Object.keys(managedClusters).reduce((managedQueries, region) => {
    const searchQuery = buildSearchClusterQuery(managedClusters[region], 'cluster_id');
    const regionQueryKey = createQueryKey({
      type: 'clusters',
      clusterTypeOrRegion: region,
      viewOptions,
      other: [searchQuery],
      isArchived,
    });
    if (isExistingQuery(queries, regionQueryKey) || managedClusters[region].length === 0) {
      return managedQueries;
    }

    return [
      ...managedQueries,
      {
        queryKey: regionQueryKey,
        queryFn: async () => fetchManagedClusters(managedClusters[region], region),
      },
    ];
  }, [] as any);

  if (managedClustersQueries.length > 0) {
    setQueries((currentQueries) => [...currentQueries, ...managedClustersQueries]);
  }

  /* **** Get Cluster Data  **** */
  const {
    isLoading: isClustersLoading,
    data,
    isError: isClustersError,
    errors: clustersError,
    isFetching: isClustersFetching,
    isFetched: isClustersFetched,
    isPending: isClustersDataPending,
  } = useQueries({
    queries,
    // @ts-ignore
    combine: React.useCallback(
      (results: FetchClusterQueryResults[]) => {
        const returnSubscriptionMap = new Map(subscriptionMap);

        let aiClusters: Cluster[] = [];
        let managedClusters: Cluster[] = [];

        results?.forEach((result) => {
          if (result.data?.aiClusters) {
            aiClusters = result.data?.aiClusters;
          } else if (result.data && result.data.managedClusters) {
            managedClusters = [...managedClusters, ...result.data.managedClusters];
          }
        });

        if (aiClusters) {
          aiClusters.forEach((aiCluster) => {
            if (aiCluster.id) {
              const entry: any = returnSubscriptionMap.get(aiCluster.id);
              if (entry) {
                entry.aiCluster = aiCluster;
              }
            }
          });
        }

        if (managedClusters) {
          managedClusters.forEach((cluster) => {
            if (cluster.id) {
              const entry: any = returnSubscriptionMap.get(cluster.id);
              if (entry !== undefined) {
                entry.cluster = cluster;
              }
            }
          });
        }

        const clusters = createResponseForFetchClusters(returnSubscriptionMap);

        const errors = results
          ?.filter((result) => !!result.error)
          .map((response) =>
            formatClusterListError(response as unknown as { error: ErrorResponse }),
          );

        return {
          isLoading: results.some((result) => result.isLoading),
          isFetching: results.some((result) => result.isFetching),
          isFetched: results.every((result) => result.isFetched),
          isPending: results.some((result) => result.isPending),
          isError: results.some((result) => result.isError),
          data: {
            clusters,
            clusterTotal: total,
          },
          errors,
        };
      },
      [subscriptionMap, total],
    ),
  });

  /* ***** Get Can Update/Delete clusters list **** */
  const {
    isLoading: isCanUpdateDeleteLoading,
    isFetching: isCanUpdateDeleteFetching,
    canEdit,
    canDelete,
    isError: isCanUpdateDeleteError,
    errors: canEditDeleteErrors,
    isFetched: isCanUpdateDeleteFetched,
  } = useFetchCanEditDelete({});

  // Modify cluster data with results from canUpdate/Edit and canDelete
  const clustersWithEditDelete = combineClusterQueries(
    data?.clusters as ClusterWithPermissions[],
    canEdit,
    canDelete,
  );

  return {
    isLoading: isCanUpdateDeleteLoading || isSubscriptionsLoading || isClustersLoading,
    isFetching: isCanUpdateDeleteFetching || isSubscriptionsFetching || isClustersFetching,
    data: { items: clustersWithEditDelete || [], itemsCount: data?.clusterTotal },
    isFetched: isCanUpdateDeleteFetched && isSubscriptionsFetched && isClustersFetched,
    isError: isCanUpdateDeleteError || isSubscriptionsError || isClustersError,
    errors: [...canEditDeleteErrors, ...subscriptionsError, ...clustersError],
    refetch,
    isClustersDataPending,
  };
};

export default useFetchClusters;
