import React from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import { Button, Label, LabelGroup, Split, SplitItem } from '@patternfly/react-core';

import { useNavigate } from '~/common/routing';

import helpers from '../../../../../../common/helpers';
import { buildFilterURLParams, getQueryParam } from '../../../../../../common/queryHelpers';
import { LOG_TYPES, SEVERITY_TYPES } from '../clusterLogConstants';

const mapFilterGroup = (group, currentFilter, setFilter, navigate, location) => {
  const setFilterAndQueryParams = (key, value) => {
    navigate(
      {
        pathname: location.path,
        hash: location.hash,
        search: buildFilterURLParams({ [key]: [value] }),
      },
      { replace: true },
    );
    setFilter(value);
  };

  const { key } = group;
  const filter = currentFilter[key] || [];
  if (isEmpty(filter)) {
    return null;
  }
  const deleteItem = () => {
    setFilterAndQueryParams(key, {
      ...currentFilter,
      [group.key]: '',
    });
  };
  return (
    <LabelGroup key={`chipgroup-${group.key}`} categoryName={group.label}>
      <Label variant="outline" key={key} onClose={deleteItem}>
        {filter}
      </Label>
    </LabelGroup>
  );
};

const mapFlagsGroup = (group, currentFlags, setFlags, navigate, location) => {
  const setFilterAndQueryParams = (flags) => {
    navigate(
      {
        pathname: location.path,
        hash: location.hash,
        search: buildFilterURLParams(flags),
      },
      { replace: true },
    );
    setFlags(flags);
  };

  const currentFlag = currentFlags[group.key] || [];
  if (isEmpty(currentFlag)) {
    return null;
  }
  return (
    <LabelGroup key={`chipgroup-${group.key}`} categoryName={group.label}>
      {currentFlag.map((value) => {
        const label = group.optionLabels[value];
        const deleteItem = () => {
          setFilterAndQueryParams({
            ...currentFlags,
            [group.key]: currentFlag.filter((item) => item !== value),
          });
        };
        return (
          <Label variant="outline" key={value} onClose={deleteItem}>
            {label}
          </Label>
        );
      })}
    </LabelGroup>
  );
};

const clearFilters = (navigate, clearFiltersAndFlags, location) => {
  // time from and time to values are always ketps, since the values from the date picker don't change after clearing
  const timestampFrom = getQueryParam('timestampFrom') || '';
  const timestampTo = getQueryParam('timestampTo') || '';
  navigate(
    {
      hash: location.hash,
      search: buildFilterURLParams({ timestampFrom: [timestampFrom], timestampTo: [timestampTo] }),
    },
    { replace: true },
  );
  clearFiltersAndFlags();
};

const groupFlags = [
  {
    key: 'severityTypes',
    label: 'Severity Type',
    optionLabels: SEVERITY_TYPES.reduce((map, key) => {
      /* eslint-disable-next-line no-param-reassign */
      map[key] = key;
      return map;
    }, {}),
  },
  {
    key: 'logTypes',
    label: 'Type',
    optionLabels: LOG_TYPES.reduce((map, key) => {
      /* eslint-disable-next-line no-param-reassign */
      map[key] = key;
      return map;
    }, {}),
  },
];

function ClusterLogsFilterChipGroup({
  currentFilter,
  setFilter,
  currentFlags,
  setFlags,
  clearFiltersAndFlags,
}) {
  const groupFilters = [
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'loggedBy',
      label: 'Logged by',
    },
  ];

  const location = useLocation();
  const navigate = useNavigate();

  // Do not count the timestamps filters
  const { timestampFrom, timestampTo, ...currentFilterNoTimestamps } = currentFilter;
  if (helpers.nestedIsEmpty(currentFilterNoTimestamps) && helpers.nestedIsEmpty(currentFlags)) {
    return null;
  }
  return (
    <Split>
      <SplitItem>
        {/* Filters */}
        <LabelGroup>
          {groupFilters
            .map((group) => mapFilterGroup(group, currentFilter, setFilter, navigate, location))
            .filter(Boolean)}
        </LabelGroup>
        {/* Flags */}
        <LabelGroup>
          {groupFlags
            .map((group) => mapFlagsGroup(group, currentFlags, setFlags, navigate, location))
            .filter(Boolean)}
        </LabelGroup>
      </SplitItem>
      <SplitItem>
        <Button
          variant="link"
          onClick={() => clearFilters(navigate, clearFiltersAndFlags, location)}
        >
          Clear filters
        </Button>
      </SplitItem>
    </Split>
  );
}

ClusterLogsFilterChipGroup.propTypes = {
  setFilter: PropTypes.func.isRequired,
  currentFilter: PropTypes.shape({
    description: PropTypes.string,
    loggedBy: PropTypes.string,
    timestampFrom: PropTypes.string,
    timestampTo: PropTypes.string,
  }).isRequired,
  setFlags: PropTypes.func.isRequired,
  currentFlags: PropTypes.shape({
    severityTypes: PropTypes.arrayOf(PropTypes.string),
    logTypes: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  clearFiltersAndFlags: PropTypes.func.isRequired,
};

export default ClusterLogsFilterChipGroup;
