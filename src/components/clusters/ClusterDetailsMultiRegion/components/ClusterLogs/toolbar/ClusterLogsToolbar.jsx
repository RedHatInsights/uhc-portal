import React from 'react';
import PropTypes from 'prop-types';

import {
  PaginationVariant,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { viewConstants } from '../../../../../../redux/constants';
import ClusterLogsPagination from '../ClusterLogsPagination';

import ClusterLogsConditionalFilter from './ClusterLogsConditionalFilter';
import ClusterLogsDatePicker from './ClusterLogsDatePicker';
import ClusterLogsDownload from './ClusterLogsDownload';
import ClusterLogsFilterChipGroup from './ClusterLogsFilterChipGroup';

const ClusterLogsToolbar = ({
  viewOptions,
  setFlags,
  setFilter,
  externalClusterID,
  currentFilter,
  currentFlags,
  clearFiltersAndFlags,
  isPendingNoData,
  createdAt,
  clusterID,
  logs,
  itemCount,
  page,
  perPage,
  itemsStart,
  itemsEnd,
  onSetPage,
  onPerPageSelect,
  region,
}) => (
  <>
    <Toolbar className="cluster-log__toolbar" data-testid="cluster-history-toolbar">
      <ToolbarContent>
        <ToolbarGroup variant="filter-group">
          <ClusterLogsDatePicker
            currentFilter={currentFilter}
            currentFlags={currentFlags}
            setFilter={setFilter}
            setFlags={setFlags}
            createdAt={createdAt}
          />
        </ToolbarGroup>
        <ToolbarItem>
          <ClusterLogsConditionalFilter
            currentFilter={currentFilter}
            currentFlags={currentFlags}
            setFilter={setFilter}
            setFlags={setFlags}
          />
        </ToolbarItem>
        <ToolbarItem>
          <ClusterLogsDownload
            externalClusterID={externalClusterID}
            clusterID={clusterID}
            viewOptions={viewOptions}
            logs={logs}
            region={region}
          />
        </ToolbarItem>
        <ToolbarItem align={{ default: 'alignEnd' }} variant="pagination">
          <ClusterLogsPagination
            itemCount={itemCount}
            isDisabled={isPendingNoData}
            page={page}
            perPage={perPage}
            itemsStart={itemsStart}
            itemsEnd={itemsEnd}
            variant={PaginationVariant.top}
            onSetPage={onSetPage}
            onPerPageSelect={onPerPageSelect}
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
    <ClusterLogsFilterChipGroup
      view={viewConstants.CLUSTER_LOGS_VIEW}
      currentFilter={currentFilter}
      currentFlags={currentFlags}
      setFilter={setFilter}
      setFlags={setFlags}
      clearFiltersAndFlags={clearFiltersAndFlags}
    />
  </>
);

ClusterLogsToolbar.propTypes = {
  setFilter: PropTypes.func.isRequired,
  currentFilter: PropTypes.shape({
    description: PropTypes.string,
    timestampFrom: PropTypes.string,
    timestampTo: PropTypes.string,
  }).isRequired,
  setFlags: PropTypes.func.isRequired,
  currentFlags: PropTypes.shape({
    severityTypes: PropTypes.arrayOf(PropTypes.string),
    logTypes: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  clearFiltersAndFlags: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  externalClusterID: PropTypes.string.isRequired,
  viewOptions: PropTypes.object.isRequired,
  isPendingNoData: PropTypes.bool.isRequired,
  createdAt: PropTypes.string.isRequired,
  clusterID: PropTypes.string.isRequired,
  logs: PropTypes.number.isRequired,
  itemCount: PropTypes.number,
  page: PropTypes.number,
  perPage: PropTypes.number,
  itemsStart: PropTypes.number,
  itemsEnd: PropTypes.number,
  onSetPage: PropTypes.func,
  onPerPageSelect: PropTypes.func,
  region: PropTypes.string,
};

export default ClusterLogsToolbar;
