import React from 'react';

import { ACM_HUB_PROPERTY_KEY, ACM_HUB_PROPERTY_VALUE } from '~/common/acmHubConstants';
import type { PaginationOptions } from '~/types/types';

import { useFetchClusters } from '../ClusterListQueries/useFetchClusters';

const ACM_HUB_CLUSTERS_VIEW = 'ACM_HUB_CLUSTERS_VIEW';

const SORT_FIELD_TO_CLUSTER_PROPERTY: Record<string, string> = {
  created_at: 'creation_timestamp',
};

/**
 * Fetch ACM Hub Clusters by filtering for clusters with the ACM Hub property
 */
export const useFetchAcmHubClusters = (paginationOptions?: PaginationOptions) => {
  const {
    isLoading,
    data,
    refetch,
    isError,
    errors,
    isFetching,
    isFetched,
    isClustersDataPending,
  } = useFetchClusters({ isArchived: false, useManagedEndpoints: true });

  const filteredData = React.useMemo(() => {
    if (!data?.items) {
      return { items: [], itemsCount: 0 };
    }

    const acmHubClusters = data.items.filter((cluster: any) => {
      const properties = cluster?.managed ? cluster.properties : cluster.cluster_id_properties;
      return properties?.[ACM_HUB_PROPERTY_KEY] === ACM_HUB_PROPERTY_VALUE;
    });

    if (!paginationOptions) {
      return { items: acmHubClusters, itemsCount: acmHubClusters.length };
    }

    const { currentPage, pageSize, sorting } = paginationOptions;

    const sortedClusters = [...acmHubClusters].sort((a: any, b: any) => {
      const { sortField, isAscending } = sorting;
      const clusterProperty = SORT_FIELD_TO_CLUSTER_PROPERTY[sortField] ?? sortField;
      const aValue = a[clusterProperty] ?? '';
      const bValue = b[clusterProperty] ?? '';
      const comparison = String(aValue).localeCompare(String(bValue), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return isAscending ? comparison : -comparison;
    });

    const start = (currentPage - 1) * pageSize;
    const paginatedClusters = sortedClusters.slice(start, start + pageSize);

    return {
      items: paginatedClusters,
      itemsCount: acmHubClusters.length,
    };
  }, [data, paginationOptions]);

  return {
    isLoading,
    data: filteredData,
    refetch,
    isError,
    errors,
    isFetching,
    isFetched,
    isClustersDataPending,
    totalCount: filteredData.itemsCount,
  };
};

export { ACM_HUB_CLUSTERS_VIEW };
