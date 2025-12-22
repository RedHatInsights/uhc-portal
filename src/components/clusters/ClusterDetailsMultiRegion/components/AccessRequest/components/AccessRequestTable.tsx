import React, { useCallback } from 'react';

import {
  Button,
  EmptyState,
  PageSection,
  Skeleton,
  Timestamp,
  TimestampFormat,
} from '@patternfly/react-core';
import { EyeIcon } from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { ISortBy, SortByDirection, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';

import { Link } from '~/common/routing';
import { AccessRequest } from '~/types/access_transparency.v1';
import { ViewSorting } from '~/types/types';

import AccessRequestStateIcon from './AccessRequestStateIcon';

const skeletonRows = () =>
  [...Array(10).keys()].map((index) => (
    <Tr key={index} data-testid="skeleton">
      <Td colSpan={7}>
        <Skeleton screenreaderText="loading cluster" />
      </Td>
    </Tr>
  ));

export const sortColumns = {
  state: 'status.state',
  id: 'id',
  created_at: 'created_at',
  name: 'name',
};

export const columnsNames = {
  state: { title: 'Status', sortIndex: sortColumns.state },
  id: { title: 'Request ID', sortIndex: sortColumns.id },
  created_at: { title: 'Created at', sortIndex: sortColumns.created_at },
  actions: { title: 'Actions', screenReaderText: 'access request actions' },
};
const columnWithClusterName = {
  name: { title: 'Cluster Name', sortIndex: sortColumns.name },
};
type AccessRequestTableProps = {
  accessRequestItems?: Array<AccessRequest & { name?: string }>;
  sortBy: ISortBy;
  setSorting: (sort: ViewSorting) => void;
  openDetailsAction: (accessRequestElement?: AccessRequest) => void;
  isPending?: boolean;
  showClusterName?: boolean;
};

const AccessRequestTable = ({
  accessRequestItems,
  setSorting,
  openDetailsAction,
  sortBy,
  isPending,
  showClusterName = false,
}: AccessRequestTableProps) => {
  const accessRequestItemRow = (accessRequestItem: AccessRequest & { name?: string }) => {
    const clusterName = accessRequestItem?.name ?? '';
    const clusterNameLink = accessRequestItem.subscription_id ? (
      <Link to={`/details/s/${accessRequestItem.subscription_id}#accessRequest`}>
        {clusterName}
      </Link>
    ) : (
      clusterName
    );

    return (
      <Tr key={accessRequestItem.id}>
        {showClusterName && <Td dataLabel={columnWithClusterName.name.title}>{clusterNameLink}</Td>}
        <Td dataLabel={columnsNames.state.title}>
          <AccessRequestStateIcon accessRequest={accessRequestItem} />
        </Td>
        <Td dataLabel={columnsNames.id.title}>{accessRequestItem.id}</Td>
        <Td dataLabel={columnsNames.created_at.title}>
          <Timestamp
            date={new Date(accessRequestItem.created_at || '')}
            dateFormat={TimestampFormat.short}
            timeFormat={TimestampFormat.long}
            shouldDisplayUTC
            is12Hour={false}
            locale="en-CA"
          />
        </Td>
        <Td dataLabel={columnsNames.actions.title} isActionCell>
          <Button
            variant="secondary"
            icon={<EyeIcon />}
            aria-label="openDetailsAction"
            onClick={() => openDetailsAction(accessRequestItem)}
          >
            Open
          </Button>
        </Td>
      </Tr>
    );
  };

  const onSortToggle = useCallback(
    (_event: object, index: number, direction: string) =>
      setSorting({
        isAscending: direction === SortByDirection.asc,
        sortField: index.toString(),
        sortIndex: index,
      }),
    [setSorting],
  );

  const getSortParams = (columnIndex: number): ThSortType => ({
    sortBy: {
      index: sortBy.index,
      direction: sortBy.direction,
      defaultDirection: sortBy.defaultDirection,
    },
    onSort: (_event, index, direction) => onSortToggle(_event, index, direction),
    columnIndex,
  });

  const columnCells = Object.keys(columnsNames).map((column, index) => {
    // @ts-ignore
    const columnOptions = columnsNames[column];
    const sort = columnOptions.sortIndex ? getSortParams(columnOptions.sortIndex) : undefined;

    return (
      <Th
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

  if (!isPending && accessRequestItems?.length === 0) {
    return (
      <PageSection>
        <EmptyState
          headingLevel="h4"
          icon={SearchIcon}
          titleText="No access request entries found"
        />
      </PageSection>
    );
  }

  return (
    <Table>
      <Thead>
        <Tr>
          {showClusterName && (
            <Th dataLabel={columnWithClusterName.name.title}>{columnWithClusterName.name.title}</Th>
          )}
          {columnCells}
        </Tr>
      </Thead>
      <Tbody>
        {isPending
          ? skeletonRows()
          : accessRequestItems?.map((accessRequestItem) => accessRequestItemRow(accessRequestItem))}
      </Tbody>
    </Table>
  );
};

export default AccessRequestTable;
