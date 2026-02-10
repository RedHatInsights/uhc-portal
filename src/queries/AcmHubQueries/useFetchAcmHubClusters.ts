import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ACM_HUB_PROPERTY_KEY, ACM_HUB_PROPERTY_VALUE } from '~/common/acmHubConstants';
import { onSetTotalClusters } from '~/redux/actions/viewOptionsActions';

import { useFetchClusters } from '../ClusterListQueries/useFetchClusters';

const ACM_HUB_CLUSTERS_VIEW = 'ACM_HUB_CLUSTERS_VIEW';

/**
 * Fetch ACM Hub Clusters by filtering for clusters with the ACM Hub property
 */
export const useFetchAcmHubClusters = () => {
  const dispatch = useDispatch();

  // Use the standard cluster fetching hook but we'll filter the results
  const {
    isLoading,
    data,
    refetch,
    isError,
    errors,
    isFetching,
    isFetched,
    isClustersDataPending,
  } = useFetchClusters(false, true);

  // Filter clusters to only include those with ACM Hub property
  const filteredData = React.useMemo(() => {
    if (!data?.items) {
      return { items: [], itemsCount: 0 };
    }

    const acmHubClusters = data.items.filter((cluster: any) => {
      const properties = cluster?.managed ? cluster.properties : cluster.cluster_id_properties;

      return properties?.[ACM_HUB_PROPERTY_KEY] === ACM_HUB_PROPERTY_VALUE;
    });

    return {
      items: acmHubClusters,
      itemsCount: acmHubClusters.length,
    };
  }, [data]);

  const clustersTotal = useSelector(
    (state: any) => state.viewOptions[ACM_HUB_CLUSTERS_VIEW]?.totalCount,
  );

  React.useEffect(() => {
    if (
      !isLoading &&
      filteredData?.itemsCount !== undefined &&
      filteredData.itemsCount !== clustersTotal
    ) {
      dispatch(onSetTotalClusters(filteredData?.itemsCount, ACM_HUB_CLUSTERS_VIEW));
    }
  }, [clustersTotal, filteredData?.itemsCount, dispatch, isLoading]);

  return {
    isLoading,
    data: filteredData,
    refetch,
    isError,
    errors,
    isFetching,
    isFetched,
    isClustersDataPending,
  };
};

export { ACM_HUB_CLUSTERS_VIEW };
