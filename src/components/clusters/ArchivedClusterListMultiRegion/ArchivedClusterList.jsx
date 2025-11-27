/*
Copyright (c) 2018 Red Hat, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import size from 'lodash/size';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import {
  PageSection,
  Spinner,
  Split,
  SplitItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';

import { ONLY_MY_CLUSTERS_TOGGLE_CLUSTER_ARCHIVES_LIST } from '~/common/localStorageConstants';
import { Link } from '~/common/routing';
import { AppPage } from '~/components/App/AppPage';
import { useFetchClusters } from '~/queries/ClusterListQueries/useFetchClusters';
import {
  onListFlagsSet,
  onPageInput,
  onPerPageSelect,
  onSetTotalClusters,
  viewActions,
} from '~/redux/actions/viewOptionsActions';
import { ARCHIVED_CLUSTERS_VIEW } from '~/redux/constants/viewConstants';
import { isRestrictedEnv } from '~/restrictedEnv';

import helpers from '../../../common/helpers';
import { getQueryParam } from '../../../common/queryHelpers';
import { normalizedProducts, productFilterOptions } from '../../../common/subscriptionTypes';
import { viewConstants } from '../../../redux/constants';
import Breadcrumbs from '../../common/Breadcrumbs';
import ErrorBox from '../../common/ErrorBox';
import ConnectedModal from '../../common/Modal/ConnectedModal';
import Unavailable from '../../common/Unavailable';
import ClusterListFilterChipGroup from '../ClusterListMultiRegion/components/ClusterListFilterChipGroup/ClusterListFilterChipGroup';
import ClusterListFilterDropdown from '../ClusterListMultiRegion/components/ClusterListFilterDropdown';
import { PaginationRow } from '../ClusterListMultiRegion/components/PaginationRow';
import { RefreshButton } from '../ClusterListMultiRegion/components/RefreshButton';
import ViewOnlyMyClustersToggle from '../ClusterListMultiRegion/components/ViewOnlyMyClustersToggle';
import ClusterListFilter from '../common/ClusterListFilter';
import { ClusterListFilterHook } from '../common/ClusterListFilterHook';
import ErrorTriangle from '../common/ErrorTriangle';
import GlobalErrorBox from '../common/GlobalErrorBox/GlobalErrorBox';
import ReadOnlyBanner from '../common/ReadOnlyBanner';
import UnarchiveClusterDialog from '../common/UnarchiveClusterDialog';

import ArchivedClusterListTable from './components/ArchiveClusterListTable/ArchivedClusterListTable';

import './ArchivedClusterList.scss';

const PAGE_TITLE = 'Cluster Archives | Red Hat OpenShift Cluster Manager';

const breadCrumbs = (
  <Breadcrumbs path={[{ label: 'Cluster List' }, { label: 'Cluster Archives' }]} />
);

const ClusterListPageHeader = () => (
  <>
    <ReadOnlyBanner />
    <PageSection hasBodyWrapper={false}>
      <Split>
        <SplitItem className="pf-v6-u-pb-md">{breadCrumbs}</SplitItem>
      </Split>
      <Split>
        <SplitItem>
          <Title headingLevel="h1">Cluster Archives</Title>
        </SplitItem>
      </Split>
    </PageSection>
  </>
);
ClusterListPageHeader.propTypes = {};

const ClusterList = ({
  getCloudProviders,
  cloudProviders,
  closeModal,
  clearGlobalError,
  openModal,
  getMultiRegion,
}) => {
  const dispatch = useDispatch();

  const viewType = viewConstants.ARCHIVED_CLUSTERS_VIEW;
  const isArchived = true;
  const { isLoading, data, refetch, isError, errors, isFetching, isFetched } = useFetchClusters(
    isArchived,
    getMultiRegion,
  );

  const clusters = data?.items;
  const clustersTotal = useSelector((state) => state.viewOptions[viewType]?.totalCount);

  React.useEffect(() => {
    if (!isLoading || data?.itemsCount > 0) {
      dispatch(onSetTotalClusters(data?.itemsCount, viewType));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.itemsCount]);

  const errorDetails = (errors || []).reduce((errorArray, error) => {
    if (!error.reason) {
      return errorArray;
    }
    return [
      ...errorArray,
      `${error.reason}.${error.region ? ` While getting clusters for ${error.region.region}.` : ''}${error.operation_id ? ` (Operation ID: ${error.operation_id})` : ''}`,
    ];
  }, []);

  const currentPage = useSelector((state) => state.viewOptions[viewType]?.currentPage);
  const pageSize = useSelector((state) => state.viewOptions[viewType]?.pageSize);

  const itemsStart =
    currentPage && pageSize && clustersTotal > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const itemsEnd = currentPage && pageSize ? Math.min(currentPage * pageSize, clustersTotal) : 0;

  const preLoadRedux = React.useCallback(() => {
    // Items not needed for this list, but may be needed elsewhere in the app
    // Load these items "in the background" so they can be added to redux
    // Eventually as items are converted to React Query these items can be removed

    // Waiting until fetched to prevent immediate rerender causing
    // a double load of subscriptions
    if (!cloudProviders.fulfilled && !cloudProviders.pending && isFetched) {
      getCloudProviders();
    }
  }, [cloudProviders.fulfilled, cloudProviders.pending, getCloudProviders, isFetched]);

  /* Pagination */
  const onPageChange = React.useCallback(
    (_event, page) => {
      dispatch(onPageInput(page, viewType));
    },
    [dispatch, viewType],
  );

  React.useEffect(() => {
    if (clusters && clustersTotal < itemsStart && !isLoading) {
      // The user was on a page that no longer exists
      const newPage = Math.ceil(clustersTotal / pageSize);
      onPageChange(undefined, newPage);
    }
  }, [clusters, itemsStart, currentPage, pageSize, onPageChange, clustersTotal, isLoading]);

  const onPerPageChange = (_event, newPerPage, newPage /* startIdx, endIdx */) => {
    dispatch(onPageInput(newPage, viewType));
    dispatch(onPerPageSelect(newPerPage, viewType, true));
  };

  const sortOptions = useSelector((state) => state.viewOptions[viewType]?.sorting);

  const activeSortIndex = sortOptions.sortField;
  const activeSortDirection = sortOptions.isAscending ? SortByDirection.asc : SortByDirection.desc;

  // onMount and willUnmount
  React.useEffect(() => {
    preLoadRedux();

    if (isRestrictedEnv()) {
      dispatch(
        onListFlagsSet(
          'subscriptionFilter',
          {
            plan_id: [normalizedProducts.ROSA],
          },
          viewType,
        ),
      );
    }

    const planIDFilter = getQueryParam('plan_id') || '';

    if (!isEmpty(planIDFilter)) {
      const allowedProducts = {};
      productFilterOptions.forEach((option) => {
        allowedProducts[option.key] = true;
      });
      const sanitizedFilter = planIDFilter.split(',').filter((value) => allowedProducts[value]);

      dispatch(
        onListFlagsSet(
          'subscriptionFilter',
          {
            plan_id: sanitizedFilter,
          },
          viewType,
        ),
      );
    }

    // componentWillUnmount
    return () => {
      closeModal();
      // dispatch(clustersActions.clearClusterDetails());
      clearGlobalError('archivedClusterList');
    };
    // Run only on mount and unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewOptions = useSelector((state) => state.viewOptions.ARCHIVED_CLUSTERS_VIEW);
  const { showMyClustersOnly, subscriptionFilter } = viewOptions.flags;

  const hasNoFilters =
    helpers.nestedIsEmpty(subscriptionFilter) && !showMyClustersOnly && !viewOptions.filter;

  const isPendingNoData = !size(clusters) && (isLoading || !isFetched); // Show skeletons

  const showSpinner = isFetching || isLoading;

  ClusterListFilterHook(subscriptionFilter);

  return (
    <AppPage title={PAGE_TITLE}>
      <ClusterListPageHeader
        showSpinner={showSpinner}
        error={isError}
        errorDetails={errorDetails}
        isPendingNoData={isPendingNoData}
        refresh={refetch}
      />
      <PageSection hasBodyWrapper={false}>
        <div className="cluster-list">
          <GlobalErrorBox />
          {isError && clusters.length > 0 && (
            <ErrorBox
              variant="warning"
              message="Some operations are unavailable, try again later"
              response={{
                errorDetails: [{ items: errorDetails }],
              }}
              isExpandable
              hideOperationID
              forceAsAlert
            />
          )}

          <Toolbar id="cluster-list-toolbar">
            <ToolbarContent>
              <ToolbarItem className="ocm-c-toolbar__item-cluster-filter-list">
                <ClusterListFilter
                  isDisabled={isPendingNoData && hasNoFilters}
                  view={ARCHIVED_CLUSTERS_VIEW}
                />
              </ToolbarItem>
              {isRestrictedEnv() ? null : (
                <ToolbarItem
                  className="ocm-c-toolbar__item-cluster-list-filter-dropdown"
                  data-testid="cluster-list-filter-dropdown"
                >
                  {/* Cluster type */}
                  <ClusterListFilterDropdown
                    view={ARCHIVED_CLUSTERS_VIEW}
                    isDisabled={isLoading || isFetching}
                  />
                </ToolbarItem>
              )}
              {/* <ClusterListActions /> */}
              <ViewOnlyMyClustersToggle
                view={ARCHIVED_CLUSTERS_VIEW}
                bodyContent="Show only the clusters you previously archived, or all archived clusters in your organization."
                localStorageKey={ONLY_MY_CLUSTERS_TOGGLE_CLUSTER_ARCHIVES_LIST}
              />
              <ToolbarItem className="pf-v6-l-split__item split-margin-left">
                <div className="show-active-clusters-link">
                  <Link to="/cluster-list">Show active clusters</Link>
                </div>
              </ToolbarItem>
              <ToolbarItem>
                {showSpinner && (
                  <Spinner
                    size="lg"
                    className="cluster-list-spinner"
                    aria-label="Loading cluster list data"
                  />
                )}
                {isError && <ErrorTriangle className="cluster-list-warning" item="clusters" />}
              </ToolbarItem>

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
                  onPerPageSelect={onPerPageChange}
                  onPageChange={onPageChange}
                  ariaLabel="Pagination compact"
                />
              </ToolbarItem>

              <ToolbarItem gap={{ default: 'gapNone' }}>
                <RefreshButton isDisabled={showSpinner} refreshFunc={refetch} />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          {isRestrictedEnv() ? null : <ClusterListFilterChipGroup archive />}
          {isError && !size(clusters) && isFetched ? (
            <Unavailable
              message="Error retrieving clusters"
              response={{
                errorMessage: '',
                operationID: '',
                errorCode: '',
                errorDetails,
              }}
            />
          ) : (
            <ArchivedClusterListTable
              openModal={openModal}
              clusters={clusters || []}
              isPending={isPendingNoData}
              activeSortIndex={activeSortIndex}
              activeSortDirection={activeSortDirection}
              setSort={(index, direction) => {
                const sorting = {
                  isAscending: direction === SortByDirection.asc,
                  sortField: index,
                };

                dispatch(viewActions.onListSortBy(sorting, viewType));
              }}
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
            onPerPageSelect={onPerPageChange}
            onPageChange={onPageChange}
            ariaLabel="Pagination full"
          />
          <ConnectedModal
            ModalComponent={UnarchiveClusterDialog}
            onClose={() => {
              refetch();
            }}
          />
        </div>
      </PageSection>
    </AppPage>
  );
};

ClusterList.propTypes = {
  getCloudProviders: PropTypes.func.isRequired,
  cloudProviders: PropTypes.object.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  getMultiRegion: PropTypes.bool,

  queryParams: PropTypes.shape({
    has_filters: PropTypes.bool,
  }),

  clearGlobalError: PropTypes.func.isRequired,
};

export default ClusterList;
