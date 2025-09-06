import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  Icon,
  Label,
  Popover,
  PopoverPosition,
  Skeleton,
} from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import {
  ActionsColumn,
  SortByDirection,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

import { Link } from '~/common/routing';
import supportLinks from '~/common/supportLinks.mjs';
import AIClusterStatus from '~/components/AIComponents/AIClusterStatus';
import { useToggleSubscriptionReleased } from '~/queries/ClusterActionsQueries/useToggleSubscriptionReleased';
import { AUTO_CLUSTER_TRANSFER_OWNERSHIP } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { findRegionalInstance } from '~/queries/helpers';
import { useFetchGetAvailableRegionalInstances } from '~/queries/RosaWizardQueries/useFetchGetAvailableRegionalInstances';
import { useGlobalState } from '~/redux/hooks';

import getClusterName, { UNNAMED_CLUSTER } from '../../../../common/getClusterName';
import { isAISubscriptionWithoutMetrics } from '../../../../common/isAssistedInstallerCluster';
import { actionResolver as multiRegionActionResolver } from '../../common/ClusterActionsDropdown/ClusterActionsDropdownItems';
import { ClusterLocationLabel } from '../../common/ClusterLocationLabel';
import ClusterStateIcon from '../../common/ClusterStateIcon';
import clusterStates, {
  getClusterStateAndDescription,
  isOSDGCPWaitingForRolesOnHostProject,
  isWaitingForOIDCProviderOrOperatorRolesMode,
  isWaitingROSAManualMode,
} from '../../common/clusterStates';
import ClusterTypeLabel from '../../common/ClusterTypeLabel';
import ClusterUpdateLink from '../../common/ClusterUpdateLink';
import { canSubscribeOCPListFromClusters } from '../../common/EditSubscriptionSettingsDialog/canSubscribeOCPListSelector';
import getClusterVersion from '../../common/getClusterVersion';
import { useCanHibernateClusterListFromClusters } from '../../common/HibernateClusterModal/HibernateClusterModalSelectors';
import ActionRequiredLink from '../../common/InstallProgress/ActionRequiredLink';
import ProgressList from '../../common/InstallProgress/ProgressList';
import { canTransferClusterOwnershipListFromClusters } from '../../common/TransferClusterOwnershipDialog/utils/transferClusterOwnershipDialogSelectors';

import ClusterCreatedIndicator from './ClusterCreatedIndicator';

const skeletonRows = () =>
  [...Array(10).keys()].map((index) => (
    <Tr key={index} data-testid="skeleton">
      <Td colSpan={7}>
        <Skeleton screenreaderText="loading cluster" />
      </Td>
    </Tr>
  ));

export const sortColumns = {
  Name: 'display_name',
  Created: 'created_at',
  Status: 'status',
  Type: 'type',
  Provider: 'provider',
  Version: 'version',
};

const hiddenOnMdOrSmaller = ['visibleOnLg', 'hiddenOnMd', 'hiddenOnSm'];

// exported only for testing purposes
// The order here is the same as the column order
export const columns = {
  name: { title: 'Name', width: 30, sortIndex: sortColumns.Name, apiSortOption: true },
  status: { title: 'Status', width: 15, sortIndex: sortColumns.Status },
  type: { title: 'Type', width: 10, sortIndex: sortColumns.Type },
  created: {
    title: 'Created',
    visibility: hiddenOnMdOrSmaller,
    sortIndex: sortColumns.Created,
    apiSortOption: true,
  },
  version: { title: 'Version', visibility: hiddenOnMdOrSmaller, sortIndex: sortColumns.Version },
  provider: {
    title: 'Provider (Region)',
    visibility: hiddenOnMdOrSmaller,
    sortIndex: sortColumns.Provider,
  },
  actions: { title: '', screenReaderText: 'cluster actions' },
};

function ClusterListTable(props) {
  const {
    clusters,
    openModal,
    isPending,
    activeSortIndex,
    activeSortDirection,
    setSort,
    refreshFunc,
    isClustersDataPending,
  } = props;

  const addNotification = useAddNotification();
  const canSubscribeOCPList = canSubscribeOCPListFromClusters(clusters);
  const canTransferClusterOwnershipList = canTransferClusterOwnershipListFromClusters(clusters);
  const canHibernateClusterList = useCanHibernateClusterListFromClusters(clusters);

  const { mutate: toggleSubscriptionReleasedMultiRegion } = useToggleSubscriptionReleased();

  const { data: availableRegionalInstances } = useFetchGetAvailableRegionalInstances(true);
  const isAutoClusterTransferOwnershipEnabled = useFeatureGate(AUTO_CLUSTER_TRANSFER_OWNERSHIP);
  const username = useGlobalState((state) => state.userProfile.keycloakProfile.username);

  const getSortParams = (columnIndex) => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: SortByDirection.asc,
    },
    onSort: (_event, index, direction) => {
      setSort(index, direction);
    },
    columnIndex,
  });

  if (!isPending && (!clusters || clusters.length === 0)) {
    return (
      <EmptyState headingLevel="h4" icon={SearchIcon} titleText="No clusters found.">
        <EmptyStateBody>
          This filter criteria matches no clusters.
          <br />
          Try changing your filter settings.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  const columnCells = Object.keys(columns).map((column, index) => {
    const columnOptions = columns[column];

    const sort =
      columnOptions.sortIndex && columnOptions.apiSortOption
        ? getSortParams(columnOptions.sortIndex)
        : undefined;

    return (
      <Th
        width={columnOptions.width}
        visibility={columnOptions.visibility}
        sort={sort}
        // eslint-disable-next-line react/no-array-index-key
        key={index}
      >
        {columnOptions.screenReaderText ? (
          <span className="pf-v6-screen-reader">{columnOptions.screenReaderText}</span>
        ) : null}
        {columnOptions.title}
      </Th>
    );
  });

  const linkToClusterDetails = (cluster, children) => (
    <Link to={`/details/s/${cluster.subscription.id}`}>{children}</Link>
  );

  const clusterRow = (cluster) => {
    const provider = get(cluster, 'cloud_provider.id', 'N/A');

    const clusterNameText = getClusterName(cluster);
    const clusterName =
      isClustersDataPending && clusterNameText === UNNAMED_CLUSTER ? (
        <Skeleton screenreaderText="loading cluster name" />
      ) : (
        linkToClusterDetails(cluster, clusterNameText)
      );

    const clusterStatus = () => {
      if (isClustersDataPending) {
        // cluster status may not be loaded.
        return <Skeleton screenreaderText="loading cluster status" />;
      }
      if (isAISubscriptionWithoutMetrics(cluster.subscription)) {
        return <AIClusterStatus status={cluster.state} className="clusterstate" />;
      }

      const hasLimitedSupport = cluster.status?.limited_support_reason_count > 0;

      const { state, description } = getClusterStateAndDescription(cluster);
      const icon = (
        <ClusterStateIcon
          clusterState={state || ''}
          animated={false}
          limitedSupport={hasLimitedSupport}
        />
      );

      const regionalInstance = findRegionalInstance(
        cluster?.region?.id,
        availableRegionalInstances,
      );

      if (state === clusterStates.error) {
        return (
          <span>
            <Popover
              position={PopoverPosition.top}
              bodyContent={
                <>
                  Your cluster is in error state.{' '}
                  <a href={supportLinks.SUPPORT_CASE_NEW} target="_blank" rel="noopener noreferrer">
                    Contact Red Hat Support
                  </a>{' '}
                  for further assistance.
                </>
              }
              aria-label="Status: Error"
            >
              <Button className="cluster-status-string" variant="link" isInline icon={icon}>
                {description}
              </Button>
            </Popover>
          </span>
        );
      }

      if (
        isWaitingROSAManualMode(cluster) ||
        isWaitingForOIDCProviderOrOperatorRolesMode(cluster) ||
        isOSDGCPWaitingForRolesOnHostProject(cluster)
      ) {
        // Show a popover for manual creation of ROSA operator roles and OIDC provider and for
        // OSD GCP service accounts roles
        return (
          <ActionRequiredLink
            cluster={cluster}
            icon={
              <Icon status="warning">
                <ExclamationTriangleIcon />
              </Icon>
            }
            regionalInstance={regionalInstance}
          />
        );
      }
      if (
        state === clusterStates.waiting ||
        state === clusterStates.pending ||
        state === clusterStates.validating ||
        state === clusterStates.installing
      ) {
        return (
          <Popover
            headerContent={<div>Installation status</div>}
            position={PopoverPosition.top}
            bodyContent={<ProgressList cluster={cluster} />}
            aria-label="Status: installing"
            maxWidth="38rem"
          >
            <Button
              className="cluster-status-string status-installing"
              variant="link"
              isInline
              icon={icon}
            >
              {description}
            </Button>
          </Popover>
        );
      }
      return (
        <span className="cluster-status-string">
          {icon}
          {description}
          {hasLimitedSupport
            ? linkToClusterDetails(
                cluster,
                <Label color="red" className="pf-v6-u-ml-xs">
                  Limited support
                </Label>,
              )
            : null}
        </span>
      );
    };

    // Note: hideOSDUpdates is set because we can't know if an update was already scheduled
    const clusterVersion = (
      <span>
        {getClusterVersion(cluster)}
        <ClusterUpdateLink cluster={cluster} openModal={openModal} hideOSDUpdates />
      </span>
    );
    const isClusterOwner = cluster.subscription?.creator?.username === username;

    return (
      <Tr key={cluster.id}>
        <Td dataLabel={columns.name.title} visibility={columns.name.visibility}>
          {clusterName}
        </Td>
        <Td dataLabel={columns.status.title} visibility={columns.status.visibility}>
          {clusterStatus()}
        </Td>
        <Td dataLabel={columns.type.title} visibility={columns.type.visibility}>
          <ClusterTypeLabel cluster={cluster} />
        </Td>
        <Td dataLabel={columns.created.title} visibility={columns.created.visibility}>
          <ClusterCreatedIndicator cluster={cluster} />
        </Td>
        <Td dataLabel={columns.version.title} visibility={columns.version.visibility}>
          {clusterVersion}
        </Td>
        <Td dataLabel={columns.provider.title} visibility={columns.provider.visibility}>
          <ClusterLocationLabel
            regionID={get(cluster, 'region.id', 'N/A')}
            cloudProviderID={provider}
          />
        </Td>
        <Td isActionCell>
          {!isPending && cluster ? (
            <ActionsColumn
              items={multiRegionActionResolver(
                cluster,
                true,
                openModal,
                canSubscribeOCPList[cluster.id] || false,
                canHibernateClusterList[cluster.id] || false,
                canTransferClusterOwnershipList[cluster.id] || false,
                isAutoClusterTransferOwnershipEnabled,
                isClusterOwner,
                toggleSubscriptionReleasedMultiRegion,
                refreshFunc,
                true,
                addNotification,
              )}
            />
          ) : null}
        </Td>
      </Tr>
    );
  };

  return (
    <Table aria-label="Cluster List">
      <Thead>
        <Tr>{columnCells}</Tr>
      </Thead>
      <Tbody data-testid="clusterListTableBody">
        {isPending ? skeletonRows() : clusters.map((cluster) => clusterRow(cluster))}
      </Tbody>
    </Table>
  );
}

ClusterListTable.propTypes = {
  openModal: PropTypes.func.isRequired,
  clusters: PropTypes.array.isRequired,
  activeSortIndex: PropTypes.string,
  activeSortDirection: PropTypes.string,
  setSort: PropTypes.func,
  isPending: PropTypes.bool,
  refreshFunc: PropTypes.func.isRequired,
  isClustersDataPending: PropTypes.bool,
};

export default ClusterListTable;
