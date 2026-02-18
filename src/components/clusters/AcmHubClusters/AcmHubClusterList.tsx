import React, { useCallback, useState } from 'react';
import size from 'lodash/size';
import { useDispatch, useSelector } from 'react-redux';

import { PageSection, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';

import helpers from '~/common/helpers';
import { ONLY_MY_CLUSTERS_TOGGLE_CLUSTERS_LIST } from '~/common/localStorageConstants';
import { AppPage } from '~/components/App/AppPage';
import ClusterListActions from '~/components/clusters/ClusterListMultiRegion/components/ClusterListActions';
import ClusterListFilterChipGroup from '~/components/clusters/ClusterListMultiRegion/components/ClusterListFilterChipGroup/ClusterListFilterChipGroup';
import ClusterListFilterDropdown from '~/components/clusters/ClusterListMultiRegion/components/ClusterListFilterDropdown';
import ClusterListTable from '~/components/clusters/ClusterListMultiRegion/components/ClusterListTable';
import { PaginationRow } from '~/components/clusters/ClusterListMultiRegion/components/PaginationRow';
import ViewOnlyMyClustersToggle from '~/components/clusters/ClusterListMultiRegion/components/ViewOnlyMyClustersToggle';
import ClusterListFilter from '~/components/clusters/common/ClusterListFilter';
import GlobalErrorBox from '~/components/clusters/common/GlobalErrorBox/GlobalErrorBox';
import ErrorBox from '~/components/common/ErrorBox';
import { modalActions } from '~/components/common/Modal/ModalActions';
import Unavailable from '~/components/common/Unavailable';
import { useFetchAcmHubClusters } from '~/queries/AcmHubQueries/useFetchAcmHubClusters';
import { CLUSTERS_VIEW } from '~/redux/constants/viewConstants';
import { isRestrictedEnv } from '~/restrictedEnv';

import CommonClusterModals from '../common/CommonClusterModals';

import AcmHubEmptyState from './AcmHubEmptyState';
import { ClusterTagModal } from './ClusterTagModal';

import './AcmHubClusterList.scss';

const PAGE_TITLE = 'ACM Hub Clusters';

const AcmHubClusterList: React.FC = () => {
  const dispatch = useDispatch();
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState({
    sortField: 'display_name',
    isAscending: true,
  });

  const openModal = useCallback(
    (modalName: string, data: unknown) => {
      dispatch(modalActions.openModal(modalName, data));
    },
    [dispatch],
  );

  const clusterViewOptions = useSelector((state: any) => state.viewOptions[CLUSTERS_VIEW]) || {};
  const { showMyClustersOnly, subscriptionFilter } = clusterViewOptions.flags || {};

  const {
    isLoading,
    data,
    refetch,
    isError,
    errors,
    isFetching,
    isFetched,
    isClustersDataPending,
    totalCount: clustersTotal,
  } = useFetchAcmHubClusters({
    currentPage,
    pageSize,
    sorting,
    filter: clusterViewOptions.filter,
    flags: { showMyClustersOnly, subscriptionFilter },
  });

  const clusters = data?.items;

  const itemsStart =
    currentPage && pageSize && clustersTotal > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const itemsEnd = currentPage && pageSize ? Math.min(currentPage * pageSize, clustersTotal) : 0;

  const onPageChange = useCallback((_event: any, page: number) => {
    setCurrentPage(page);
  }, []);

  React.useEffect(() => {
    if (clusters && clustersTotal < itemsStart && !isLoading) {
      const newPage = Math.ceil(clustersTotal / pageSize);
      setCurrentPage(newPage);
    }
  }, [clusters, itemsStart, pageSize, clustersTotal, isLoading]);

  const onPerPageChange = useCallback((_event: any, newPerPage: number, newPage: number) => {
    setCurrentPage(newPage);
    setPageSize(newPerPage);
  }, []);

  const activeSortIndex = sorting.sortField;
  const activeSortDirection = sorting.isAscending ? SortByDirection.asc : SortByDirection.desc;

  const hasNoFilters =
    helpers.nestedIsEmpty(subscriptionFilter) && !showMyClustersOnly && !clusterViewOptions.filter;

  const isPendingNoData = !size(clusters) && (isLoading || !isFetched || isClustersDataPending);
  const showSpinner = isFetching || isLoading || isClustersDataPending;
  const showEmptyState = !showSpinner && !isError && !size(clusters) && hasNoFilters && isFetched;

  const errorDetails = (errors || []).reduce((errorArray: string[], error: any) => {
    if (!error.reason) {
      return errorArray;
    }
    return [
      ...errorArray,
      `${error.reason}.${error.region ? ` While getting clusters for ${error.region.region}.` : ''}${error.operation_id ? ` (Operation ID: ${error.operation_id})` : ''}`,
    ];
  }, []);

  const dataReady = !isLoading && !isError;

  return (
    <AppPage title={PAGE_TITLE}>
      {isTagModalOpen ? <ClusterTagModal closeModal={() => setIsTagModalOpen(false)} /> : null}
      <PageSection hasBodyWrapper={false}>
        <div className="acm-hub-cluster-list" data-ready={dataReady}>
          <GlobalErrorBox />
          {isError && clusters && clusters.length > 0 ? (
            <ErrorBox
              variant="warning"
              message="Some operations are unavailable, try again later"
              response={{
                errorDetails: errorDetails as any,
              }}
              isExpandable
              hideOperationID
              forceAsAlert
            />
          ) : null}

          {showEmptyState ? (
            <AcmHubEmptyState onStartTagging={() => setIsTagModalOpen(true)} />
          ) : (
            <>
              <Toolbar id="acm-hub-cluster-list-toolbar">
                <ToolbarContent>
                  <ToolbarItem className="ocm-c-toolbar__item-cluster-filter-list">
                    <ClusterListFilter
                      isDisabled={isPendingNoData && hasNoFilters}
                      view={CLUSTERS_VIEW}
                    />
                  </ToolbarItem>
                  {isRestrictedEnv() ? null : (
                    <ToolbarItem
                      className="ocm-c-toolbar__item-cluster-list-filter-dropdown"
                      data-testid="cluster-list-filter-dropdown"
                    >
                      <ClusterListFilterDropdown
                        view={CLUSTERS_VIEW}
                        isDisabled={isLoading || isFetching}
                      />
                    </ToolbarItem>
                  )}
                  <ClusterListActions showTabbedView />
                  <ViewOnlyMyClustersToggle
                    view={CLUSTERS_VIEW}
                    bodyContent="Show only the clusters you previously created, or all clusters in your organization."
                    localStorageKey={ONLY_MY_CLUSTERS_TOGGLE_CLUSTERS_LIST}
                  />
                  {isRestrictedEnv() ? null : (
                    <ToolbarItem>
                      <ClusterListFilterChipGroup />
                    </ToolbarItem>
                  )}
                  <ToolbarItem
                    align={{ default: 'alignEnd' }}
                    variant="pagination"
                    className="pf-m-hidden visible-on-lgplus"
                  >
                    <PaginationRow
                      currentPage={currentPage}
                      pageSize={pageSize}
                      itemCount={clustersTotal}
                      variant="top"
                      isDisabled={isPendingNoData}
                      itemsStart={itemsStart}
                      itemsEnd={itemsEnd}
                      onPerPageSelect={onPerPageChange as any}
                      onPageChange={onPageChange}
                    />
                  </ToolbarItem>
                </ToolbarContent>
              </Toolbar>

              {isError && !size(clusters) && isFetched ? (
                <Unavailable
                  message="Error retrieving ACM Hub clusters"
                  response={
                    {
                      errorMessage: '',
                      operationID: '',
                      errorCode: 0,
                      errorDetails: [],
                      pending: false,
                      fulfilled: false,
                      error: null,
                    } as any
                  }
                />
              ) : (
                <ClusterListTable
                  openModal={openModal}
                  clusters={clusters || []}
                  isPending={isPendingNoData}
                  isClustersDataPending={isClustersDataPending}
                  activeSortIndex={activeSortIndex}
                  activeSortDirection={activeSortDirection}
                  setSort={(index: string, direction: 'asc' | 'desc') => {
                    setSorting({
                      isAscending: direction === SortByDirection.asc,
                      sortField: index,
                    });
                  }}
                  refreshFunc={refetch}
                />
              )}

              <PaginationRow
                currentPage={currentPage}
                pageSize={pageSize}
                itemCount={clustersTotal}
                variant="bottom"
                isDisabled={isPendingNoData}
                itemsStart={itemsStart}
                itemsEnd={itemsEnd}
                onPerPageSelect={onPerPageChange as any}
                onPageChange={onPageChange}
              />
            </>
          )}
          <CommonClusterModals onClose={() => refetch()} />
        </div>
      </PageSection>
    </AppPage>
  );
};

export default AcmHubClusterList;
