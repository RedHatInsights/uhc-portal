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
  Flex,
  FlexItem,
  PageSection,
  Spinner,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';

import { ONLY_MY_CLUSTERS_TOGGLE_CLUSTERS_LIST } from '~/common/localStorageConstants';
import { AppPage } from '~/components/App/AppPage';
import { TransferOwnerPendingAlert } from '~/components/clusters/ClusterTransfer/TransferOwnerPendingAlert';
import { useGetAccessProtection } from '~/queries/AccessRequest/useGetAccessProtection';
import { useGetOrganizationalPendingRequests } from '~/queries/AccessRequest/useGetOrganizationalPendingRequests';
import {
  refetchClusterTransferDetail,
  useFetchClusterTransferDetail,
} from '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails';
import { useFetchClusters } from '~/queries/ClusterListQueries/useFetchClusters';
import { clustersActions } from '~/redux/actions';
import {
  onListFlagsSet,
  onPageInput,
  onPerPageSelect,
  onSetTotalClusters,
  viewActions,
} from '~/redux/actions/viewOptionsActions';
import { CLUSTERS_VIEW } from '~/redux/constants/viewConstants';
import { useGlobalState } from '~/redux/hooks';
import { isRestrictedEnv } from '~/restrictedEnv';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';

import helpers from '../../../common/helpers';
import { getQueryParam } from '../../../common/queryHelpers';
import { normalizedProducts, productFilterOptions } from '../../../common/subscriptionTypes';
import { viewConstants } from '../../../redux/constants';
import ErrorBox from '../../common/ErrorBox';
import Unavailable from '../../common/Unavailable';
import AccessRequestPendingAlert from '../ClusterDetailsMultiRegion/components/AccessRequest/components/AccessRequestPendingAlert';
import ClusterListFilter from '../common/ClusterListFilter';
import { ClusterListFilterHook } from '../common/ClusterListFilterHook';
import CommonClusterModals from '../common/CommonClusterModals';
import ErrorTriangle from '../common/ErrorTriangle';
import GlobalErrorBox from '../common/GlobalErrorBox/GlobalErrorBox';
import ReadOnlyBanner from '../common/ReadOnlyBanner';

import ClusterListActions from './components/ClusterListActions';
import ClusterListEmptyState from './components/ClusterListEmptyState';
import ClusterListFilterChipGroup from './components/ClusterListFilterChipGroup/ClusterListFilterChipGroup';
import ClusterListFilterDropdown from './components/ClusterListFilterDropdown';
import ClusterListTable from './components/ClusterListTable';
import { PaginationRow } from './components/PaginationRow';
import { RefreshButton } from './components/RefreshButton';
import ViewOnlyMyClustersToggle from './components/ViewOnlyMyClustersToggle';

import './ClusterList.scss';

const PAGE_TITLE = 'Cluster List | Red Hat OpenShift Cluster Manager';

const ClusterListPageHeader = ({ someReadOnly, showSpinner, error, refresh }) => (
  <>
    <ReadOnlyBanner someReadOnly={someReadOnly} />
    <PageSection hasBodyWrapper={false}>
      <Flex>
        <FlexItem grow={{ default: 'grow' }}>
          <Title headingLevel="h1">Cluster List</Title>
        </FlexItem>
        <Toolbar id="cluster-list-refresh-toolbar" isFullHeight inset={{ default: 'insetNone' }}>
          <ToolbarContent>
            <ToolbarGroup
              variant="action-group-plain"
              align={{ default: 'alignEnd' }}
              gap={{ default: 'gapNone', md: 'gapNone' }}
            >
              {showSpinner && (
                <ToolbarItem>
                  <Spinner
                    size="lg"
                    className="cluster-list-spinner"
                    aria-label="Loading cluster list data"
                  />
                </ToolbarItem>
              )}
              {error && (
                <ToolbarItem>
                  <ErrorTriangle className="cluster-list-warning" item="clusters" />
                </ToolbarItem>
              )}
              <ToolbarItem gap={{ default: 'gapNone' }}>
                <RefreshButton isDisabled={showSpinner} refreshFunc={refresh} />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </Flex>
    </PageSection>
  </>
);
ClusterListPageHeader.propTypes = {
  someReadOnly: PropTypes.bool,
  showSpinner: PropTypes.bool,
  error: PropTypes.bool,
  refresh: PropTypes.func,
};

const ClusterList = ({
  getCloudProviders,
  cloudProviders,
  getOrganizationAndQuota,
  organization,
  getMachineTypes,
  machineTypes,
  closeModal,
  clearGlobalError,
  openModal,
  getMultiRegion,
}) => {
  const dispatch = useDispatch();
  const viewType = viewConstants.CLUSTERS_VIEW;

  /* Get Access Request / Protection Data */
  const { enabled: isOrganizationAccessProtectionEnabled } = useGetAccessProtection(
    {
      organizationId: organization?.details?.id,
    },
    isRestrictedEnv(),
  );

  /* Get Pending Access Requests */

  const { total: pendingRequestsTotal, items: pendingRequestsItems } =
    useGetOrganizationalPendingRequests(
      organization?.details?.id,
      isOrganizationAccessProtectionEnabled,
    );
  const username = useGlobalState((state) => state.userProfile.keycloakProfile.username);
  const { data: transferData } = useFetchClusterTransferDetail({ username });
  const totalPendingTransfers = React.useMemo(
    () =>
      transferData?.items?.filter(
        (transfer) =>
          transfer.status?.toLowerCase() === ClusterTransferStatus.Pending.toLowerCase(),
      ).length || 0,
    [transferData],
  );
  /* Get Cluster Data */
  const isArchived = false;
  const {
    isLoading,
    data,
    refetch,
    isError,
    errors,
    isFetching,
    isFetched,
    isClustersDataPending,
  } = useFetchClusters(isArchived, getMultiRegion);

  const clusters = data?.items;
  const clustersTotal = useSelector((state) => state.viewOptions[viewType]?.totalCount);

  /* Set total clusters in Redux */
  React.useEffect(() => {
    if (!isLoading && data?.itemsCount !== undefined && data.itemsCount !== clustersTotal) {
      dispatch(onSetTotalClusters(data?.itemsCount, viewType));
    }
  }, [clustersTotal, data?.itemsCount, dispatch, isLoading, viewType]);

  /* Format error details */
  const errorDetails = (errors || []).reduce((errorArray, error) => {
    if (!error.reason) {
      return errorArray;
    }
    return [
      ...errorArray,
      `${error.reason}.${error.region ? ` While getting clusters for ${error.region.region}.` : ''}${error.operation_id ? ` (Operation ID: ${error.operation_id})` : ''}`,
    ];
  }, []);

  /* onMount and willUnmount */
  React.useEffect(() => {
    // Items not needed for this list except for organization, but may be needed elsewhere in the app
    // Load these items "in the background" so they can be added to redux
    // Eventually as items are converted to React Query these items can be removed

    // Waiting until fetched to prevent immediate rerender causing
    // a double load of subscriptions
    if (isFetched) {
      if (!cloudProviders.fulfilled && !cloudProviders.pending) {
        getCloudProviders();
      }

      if (!machineTypes.fulfilled && !machineTypes.pending) {
        getMachineTypes();
      }

      if (!organization.fulfilled && !organization.pending) {
        getOrganizationAndQuota();
      }
    }
  }, [
    cloudProviders.fulfilled,
    cloudProviders.pending,
    getCloudProviders,
    getMachineTypes,
    getOrganizationAndQuota,
    isFetched,
    machineTypes.fulfilled,
    machineTypes.pending,
    organization.fulfilled,
    organization.pending,
  ]);

  React.useEffect(() => {
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
    // This dispatch can  be removed once the multiRegion version cluster details is the default version
    dispatch(clustersActions.clearClusterDetails());

    const planIDFilter = getQueryParam('plan_id') || '';
    const savedClusterTypes = sessionStorage.getItem('clusterListSelectedTypes');

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
    } else if (savedClusterTypes && savedClusterTypes !== '[]') {
      const planId = JSON.parse(savedClusterTypes);
      if (Array.isArray(planId) && planId.length > 0) {
        dispatch(
          onListFlagsSet(
            'subscriptionFilter',
            {
              plan_id: planId,
            },
            viewType,
          ),
        );
      }
    }

    // componentWillUnmount
    return () => {
      closeModal();
      dispatch(clustersActions.clearClusterDetails());
      clearGlobalError('clusterList');
      clearGlobalError('clusterDetails');
    };
    // Run only on mount and unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Pagination */

  const currentPage = useSelector((state) => state.viewOptions[viewType]?.currentPage);
  const pageSize = useSelector((state) => state.viewOptions[viewType]?.pageSize);

  const itemsStart =
    currentPage && pageSize && clustersTotal > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const itemsEnd = currentPage && pageSize ? Math.min(currentPage * pageSize, clustersTotal) : 0;

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

  const viewOptions = useSelector((state) => state.viewOptions.CLUSTERS_VIEW);
  const { showMyClustersOnly, subscriptionFilter } = viewOptions.flags;

  React.useEffect(() => {
    if (subscriptionFilter?.plan_id) {
      sessionStorage.setItem(
        'clusterListSelectedTypes',
        JSON.stringify(subscriptionFilter.plan_id),
      );
    } else {
      sessionStorage.removeItem('clusterListSelectedTypes');
    }
  }, [subscriptionFilter?.plan_id]);

  const hasNoFilters =
    helpers.nestedIsEmpty(subscriptionFilter) && !showMyClustersOnly && !viewOptions.filter;

  const isPendingNoData = !size(clusters) && (isLoading || !isFetched); // Show skeletons

  const showSpinner = isFetching || isLoading;

  // The empty state asserts as a fact that you have no clusters;
  // not appropriate when results are indeterminate or empty due to filtering.
  const showEmptyState = !showSpinner && !isError && !size(clusters) && hasNoFilters;

  const someReadOnly =
    clusters && clusters.map((c) => c?.status?.configuration_mode).includes('read_only');

  // This signals to end-to-end tests that page has completed loading.
  // For now deliberately ignoring in-place reloads with a spinner;
  // tests that modify clusters (e.g. create or scale a cluster) should wait
  // for concrete data they expect to see.
  const dataReady = !isPendingNoData;

  ClusterListFilterHook(subscriptionFilter);

  if (showEmptyState) {
    return (
      <AppPage title={PAGE_TITLE}>
        <PageSection hasBodyWrapper={false}>
          <GlobalErrorBox />
          <div data-ready>
            <ClusterListEmptyState />
          </div>
        </PageSection>
      </AppPage>
    );
  }

  return (
    <AppPage title={PAGE_TITLE}>
      <ClusterListPageHeader
        someReadOnly={someReadOnly}
        showSpinner={showSpinner}
        error={isError}
        errorDetails={errorDetails}
        isPendingNoData={isPendingNoData}
        refresh={() => {
          refetch();
          refetchClusterTransferDetail();
        }}
      />
      <PageSection hasBodyWrapper={false}>
        <div className="cluster-list" data-ready={dataReady}>
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
                  view={CLUSTERS_VIEW}
                />
              </ToolbarItem>
              {isRestrictedEnv() ? null : (
                <ToolbarItem
                  className="ocm-c-toolbar__item-cluster-list-filter-dropdown"
                  data-testid="cluster-list-filter-dropdown"
                >
                  {/* Cluster type */}
                  <ClusterListFilterDropdown
                    view={CLUSTERS_VIEW}
                    isDisabled={isLoading || isFetching}
                  />
                </ToolbarItem>
              )}
              <ClusterListActions />
              <ViewOnlyMyClustersToggle
                view={CLUSTERS_VIEW}
                bodyContent="Show only the clusters you previously created, or all clusters in your organization."
                localStorageKey={ONLY_MY_CLUSTERS_TOGGLE_CLUSTERS_LIST}
              />

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
                />
              </ToolbarItem>
              {isRestrictedEnv() ? null : (
                <ToolbarItem>
                  <ClusterListFilterChipGroup />
                </ToolbarItem>
              )}
            </ToolbarContent>
          </Toolbar>
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
            <>
              <AccessRequestPendingAlert
                total={pendingRequestsTotal}
                accessRequests={pendingRequestsItems}
              />
              <TransferOwnerPendingAlert total={totalPendingTransfers} />
              <ClusterListTable
                openModal={openModal}
                clusters={clusters || []}
                isPending={isPendingNoData}
                isClustersDataPending={isClustersDataPending}
                activeSortIndex={activeSortIndex}
                activeSortDirection={activeSortDirection}
                setSort={(index, direction) => {
                  const sorting = {
                    isAscending: direction === SortByDirection.asc,
                    sortField: index,
                  };

                  dispatch(viewActions.onListSortBy(sorting, viewType));
                }}
                refreshFunc={refetch}
              />
            </>
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
          />
          <CommonClusterModals onClose={() => refetch()} clearMachinePools />
        </div>
      </PageSection>
    </AppPage>
  );
};

ClusterList.propTypes = {
  getCloudProviders: PropTypes.func.isRequired,
  getMachineTypes: PropTypes.func.isRequired,
  getOrganizationAndQuota: PropTypes.func.isRequired,
  organization: PropTypes.object.isRequired,
  cloudProviders: PropTypes.object.isRequired,
  machineTypes: PropTypes.object.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,

  queryParams: PropTypes.shape({
    has_filters: PropTypes.bool,
  }),

  clearGlobalError: PropTypes.func.isRequired,
  getMultiRegion: PropTypes.bool,
};
ClusterList.defaultProps = {
  getMultiRegion: true,
};

export default ClusterList;
