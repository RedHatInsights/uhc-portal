import React from 'react';

import { EmptyState, EmptyStateBody, Skeleton } from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { SortByDirection, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';

import { Link } from '~/common/routing';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';
import { ClusterWithPermissions, ViewSorting } from '~/types/types';

import getClusterName from '../../../../../common/getClusterName';
import ButtonWithTooltip from '../../../../common/ButtonWithTooltip';
import modals from '../../../../common/Modal/modals';
import { ClusterLocationLabel } from '../../../common/ClusterLocationLabel';
import { getClusterStateAndDescription } from '../../../common/clusterStates';
import ClusterTypeLabel from '../../../common/ClusterTypeLabel';

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
  Status: 'status',
  Type: 'type',
  Provider: 'provider',
};

const hiddenOnMdOrSmaller = ['visibleOnLg', 'hiddenOnMd', 'hiddenOnSm'];

export const columns = {
  name: { title: 'Name', width: 30, sortIndex: sortColumns.Name, apiSortOption: true },
  type: { title: 'Type', sortIndex: sortColumns.Type },
  status: { title: 'Status', sortIndex: sortColumns.Status, apiSortOption: true },
  provider: {
    title: 'Provider (Location)',
    visibility: hiddenOnMdOrSmaller,
    sortIndex: sortColumns.Provider,
  },

  actions: { title: '', screenReaderText: 'cluster actions' },
};

type ArchivedClusterListTableProps = {
  clusters: ClusterWithPermissions[];
  openModal: (modalName: string, data?: unknown) => void;
  setSort: (sorting: ViewSorting) => void;
  activeSortIndex: string;
  activeSortDirection: SortByDirection;
  isPending: boolean;
};

const ArchivedClusterListTable = ({
  setSort,
  clusters,
  openModal,
  activeSortDirection,
  activeSortIndex,
  isPending,
}: ArchivedClusterListTableProps) => {
  const clusterRow = (cluster: ClusterWithPermissions) => {
    const provider = cluster.cloud_provider?.id ?? 'N/A';
    const name = getClusterName(cluster);

    const clusterName = <Link to={`/details/s/${cluster.subscription?.id}`}>{name}</Link>;

    const clusterStatus = getClusterStateAndDescription(cluster).description;

    const openUnarchiveModal = () =>
      openModal(modals.UNARCHIVE_CLUSTER, {
        subscriptionID: cluster.subscription ? cluster.subscription.id : '',
        name,
        shouldDisplayClusterName: true,
      });

    const canNotEditReason =
      !cluster.canEdit && 'You do not have permissions to unarchive this cluster';

    const unarchiveBtn = (
      <ButtonWithTooltip
        variant="secondary"
        onClick={openUnarchiveModal}
        disableReason={canNotEditReason}
      >
        Unarchive
      </ButtonWithTooltip>
    );
    const unarchiveBtnCondition =
      cluster.subscription?.status !== SubscriptionCommonFieldsStatus.Deprovisioned
        ? unarchiveBtn
        : null;

    return (
      <Tr key={cluster.id}>
        <Td dataLabel={columns.name.title}>{clusterName}</Td>
        <Td dataLabel={columns.type.title}>
          <ClusterTypeLabel cluster={cluster} />
        </Td>
        <Td dataLabel={columns.status.title}>
          <span className="cluster-status-string">{clusterStatus}</span>
        </Td>
        {/* @ts-ignore */}
        <Td dataLabel={columns.provider.title} visibility={columns.provider.visibility}>
          <ClusterLocationLabel regionID={cluster.region?.id ?? 'N/A'} cloudProviderID={provider} />
        </Td>
        <Td isActionCell>{unarchiveBtnCondition}</Td>
      </Tr>
    );
  };

  const getSortParams = (columnIndex: number): ThSortType => ({
    sortBy: {
      // @ts-ignore  Index can be a string
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: SortByDirection.asc,
    },
    onSort: (_event, index, direction) => {
      // @ts-ignore
      setSort(index, direction);
    },
    columnIndex,
  });

  const columnCells = Object.keys(columns).map((column, index) => {
    // @ts-ignore
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

  if (!isPending && (!clusters || clusters.length === 0)) {
    return (
      <EmptyState headingLevel="h4" icon={SearchIcon} titleText="No archived clusters found.">
        <EmptyStateBody>
          This filter criteria matches no clusters.
          <br />
          Try changing your filter settings.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Table aria-label="Archived clusters">
      <Thead>
        <Tr>{columnCells}</Tr>
      </Thead>
      <Tbody>{isPending ? skeletonRows() : clusters.map((cluster) => clusterRow(cluster))}</Tbody>
    </Table>
  );
};

export default ArchivedClusterListTable;
