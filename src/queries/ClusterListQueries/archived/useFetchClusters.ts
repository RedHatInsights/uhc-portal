import React from 'react';
import { useSelector } from 'react-redux';
import { ErrorResponse } from 'react-router-dom';

import { useQueries } from '@tanstack/react-query';

import { GlobalState } from '~/redux/state';

import { queryConstants } from '../../queriesConstants';
import { useFetchCanEditDelete } from '../helpers/useFetchCanEditDelete';

import {
  clearQueries,
  combineClusterQueries,
  createQuery,
  FetchClusterQueryResults,
  isExistingQuery,
  nextAPIPageQueries,
  UseFetchClustersQuery,
  useRefetchClusterList,
} from './helpers/useFetchClustersHelpers';
import { Region } from './types/types';
import { useFetchRegions } from './useFetchRegions';

const PAGE_SIZE = 500;

export const useFetchClusters = (
  getMultiRegion = true, // fetch regions and regional clusters
  useClientSortPaging = true, // use client side sorting and filtering (and not the API based sorting and filtering)
) => {
  // If using multiRegion, there must be client side sorting and paging
  const isClientSortPaging = getMultiRegion ? true : useClientSortPaging;

  const [queries, setQueries] = React.useState<UseFetchClustersQuery[]>([]);

  /* ***** Get Can Update/Delete clusters list **** */
  const {
    isLoading: isCanUpdateDeleteLoading,
    isFetching: isCanUpdateDeleteFetching,
    canEdit,
    canDelete,
    isError: isCanUpdateDeleteError,
    errors: canEditDeleteErrors,
    isFetched: isCanUpdateDeleteFetched,
  } = useFetchCanEditDelete({
    queryKey: [queryConstants.FETCH_CLUSTERS_QUERY_KEY],
  });

  /* ***** Fetch regions (can be removed if multiRegion endpoints are not used) **** */
  const {
    isLoading: isRegionsLoading,
    isFetching: isRegionsFetching,
    data: regions,
    isError: isRegionsError,
    errors: regionErrors,
    isFetched: isRegionsFetched,
  } = useFetchRegions({
    mainQueryKey: queryConstants.FETCH_CLUSTERS_QUERY_KEY,
    returnAll: false,
    getMultiRegion,
  });

  /* *****  Refetch data (aka auto refresh) **** */
  const { refetch, setRefetchSchedule, clearRefetch } = useRefetchClusterList();
  setRefetchSchedule();

  /* ***** Filtering (always API based) **** */
  const userName = useSelector((state: GlobalState) => state.userProfile.keycloakProfile.username);
  const flags = useSelector((state: GlobalState) => state.viewOptions.CLUSTERS_VIEW?.flags || {});
  const nameFilter = useSelector(
    (state: GlobalState) => state.viewOptions.CLUSTERS_VIEW?.filter || '',
  );

  React.useEffect(
    () => {
      clearQueries(setQueries, clearRefetch);
    },
    // Only run this on filter change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flags, nameFilter],
  );

  /* *****  Sorting **** */
  const sorting = useSelector((state: GlobalState) => state.viewOptions.CLUSTERS_VIEW.sorting);

  React.useEffect(
    () => {
      if (!isClientSortPaging) {
        clearQueries(setQueries, clearRefetch);
      }
    },
    // Only run on sorting change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorting.isAscending, sorting.sortField, sorting.sortIndex],
  );

  /* *****  Pagination (note local pagination logic is in ClusterList.jsx) **** */
  const { currentPage, pageSize: userSelectedPageSize } = useSelector(
    (state: GlobalState) => state.viewOptions.CLUSTERS_VIEW,
  );

  const pageSize = useClientSortPaging ? PAGE_SIZE : userSelectedPageSize;

  React.useEffect(
    () => {
      if (!isClientSortPaging) {
        clearQueries(setQueries, clearRefetch);
      }
    },
    // Only run on pagination change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPage, pageSize],
  );

  /* **** Get initial queries ( first API page of global and regional clusters) **** */
  if (!isCanUpdateDeleteLoading && isCanUpdateDeleteFetched) {
    const page = useClientSortPaging ? 1 : currentPage; // If not client side pagination - use page from redux

    const initialQueryCommonProps = {
      page,
      flags,
      nameFilter,
      userName,
      sorting,
      pageSize,
      useClientSortPaging,
    };

    // Set first global query
    if (!isExistingQuery({ queries, page })) {
      const globalPage1Query = createQuery({ ...initialQueryCommonProps, getMultiRegion });
      setQueries((prev) => [...prev, globalPage1Query]);
    }

    // Set first regional query
    if (regions?.length > 0 && getMultiRegion) {
      const initialRegionQueryList: UseFetchClustersQuery[] = regions.reduce(
        (initialRegionList: UseFetchClustersQuery[], region) => {
          if (!isExistingQuery({ queries, page, region })) {
            return [...initialRegionList, createQuery({ ...initialQueryCommonProps, region })];
          }
          return initialRegionList;
        },
        [],
      );

      if (initialRegionQueryList.length > 0) {
        setQueries((prev) => [...prev, ...initialRegionQueryList]);
      }
    }
  }

  /* **** React Redux useQueries **** */
  const {
    isLoading,
    data,
    isError,
    errors,
    isFetching,
    isFetched: isClustersFetched,
  } = useQueries({
    queries,

    // @ts-ignore
    combine: React.useCallback(
      (results: FetchClusterQueryResults[]) => {
        /* **** Combine results from queries **** */

        // NOTE: all items needing pagesFetched can be removed if multiRegion endpoints are not used
        // It is used to trace what regions/pages have already been fetched
        const pagesFetched: { total: number; page: number; region: Region }[] = [];

        if (useClientSortPaging) {
          results.forEach((result) => {
            if (result.data) {
              const newPage = {
                total: result.data.total,
                page: result.data.page,
                region: result.data.region,
              };
              pagesFetched.push(newPage);
            }
          });
        }

        // Modify cluster data with results from canUpdate/Edit and canDelete
        const clustersWithEditDelete = combineClusterQueries(results, canEdit, canDelete);

        // Capture any errors returned
        const clusterErrors = results?.reduce((errorArray, result) => {
          const resultErrors = result.data?.errors;
          if (resultErrors && resultErrors.length > 0) {
            return [...errorArray, ...resultErrors];
          }
          return errorArray;
        }, [] as ErrorResponse[]);

        // Calculate total number of clusters the user has (across API pages)
        let clusterTotal = clustersWithEditDelete?.length;

        if (!useClientSortPaging) {
          clusterTotal = results.reduce(
            (total, result) => (result.data?.total ? total + Number(result.data?.total) : total),
            0,
          );
        }

        return {
          isLoading: results.some((result) => result.isLoading),
          isFetching: results.some((result) => result.isFetching),
          isFetched: results.every((result) => result.isFetched),
          isError: results.some((result) => result.isError || result.data?.isError),
          errors: [...clusterErrors, ...canEditDeleteErrors, ...regionErrors],
          data: { pagesFetched, clusters: clustersWithEditDelete, clusterTotal },
        };
      },
      [canDelete, canEdit, canEditDeleteErrors, regionErrors, useClientSortPaging],
    ),
  });

  /* **** Set queries to load additional API pages (if needed) **** */

  if (useClientSortPaging) {
    const nextQueries = nextAPIPageQueries({
      fetchedPages: data?.pagesFetched,
      currentQueries: queries,
      useClientSortPaging,
      flags,
      nameFilter,
      userName,
    });
    if (nextQueries.length > 0) {
      setQueries((prev) => [...prev, ...nextQueries]);
    }
  }

  /* *** Remove any queries that are no longer needed *** */
  // TODO filter out queries that are no longer needed for multi-cluster work

  /*  **** Items returned from the useFetchClusters hook **** */

  return {
    isLoading:
      isLoading ||
      isCanUpdateDeleteLoading ||
      isRegionsLoading ||
      (data.clusters === undefined && !isError && !isCanUpdateDeleteError && !isRegionsError),

    isFetching:
      isFetching ||
      isCanUpdateDeleteFetching ||
      isRegionsFetching ||
      (data.clusters === undefined && !isError && !isCanUpdateDeleteError && !isRegionsError),

    data: { items: data?.clusters || [], itemsCount: data?.clusterTotal },

    isFetched:
      isCanUpdateDeleteFetched &&
      isRegionsFetched &&
      isClustersFetched &&
      data.clusters !== undefined,

    isError: isError || isCanUpdateDeleteError || isRegionsError,
    errors,
    refetch,
  };
};

export default useFetchClusters;
