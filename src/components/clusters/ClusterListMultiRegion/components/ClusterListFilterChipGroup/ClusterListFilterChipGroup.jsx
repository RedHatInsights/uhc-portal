import React from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Label, LabelGroup, Split, SplitItem } from '@patternfly/react-core';

import { useNavigate } from '~/common/routing';
import { onListFlagsSet } from '~/redux/actions/viewOptionsActions';
import { ARCHIVED_CLUSTERS_VIEW, CLUSTERS_VIEW } from '~/redux/constants/viewConstants';

import helpers from '../../../../../common/helpers';
import { buildFilterURLParams } from '../../../../../common/queryHelpers';
import { productFilterOptions } from '../../../../../common/subscriptionTypes';

function ClusterListFilterChipGroup({ archive }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const view = archive ? ARCHIVED_CLUSTERS_VIEW : CLUSTERS_VIEW;

  const currentFilters =
    useSelector((state) => state.viewOptions[view].flags.subscriptionFilter) || {};

  const setFilter = (filter) => dispatch(onListFlagsSet('subscriptionFilter', filter, view));

  if (helpers.nestedIsEmpty(currentFilters)) {
    return null;
  }

  // TODO extract this to an action.
  const setFilterAndQueryParams = (filter) => {
    navigate(
      {
        search: buildFilterURLParams(filter),
      },
      { replace: true },
    );
    setFilter(filter);
  };

  const groups = [
    {
      key: 'plan_id',
      label: 'Cluster type',
      options: productFilterOptions,
    },
  ];

  return (
    <Split data-testid="cluster-list-filter-chipgroup">
      <SplitItem>
        <LabelGroup>
          {groups
            .map((group) => {
              const currentFilter = currentFilters[group.key] || [];
              if (isEmpty(currentFilter)) {
                return null;
              }
              return (
                <LabelGroup key={`chipgroup-${group.key}`} categoryName={group.label}>
                  {currentFilter.map((key) => {
                    const { label } = group.options.find((opt) => opt.key === key);
                    const deleteItem = () => {
                      setFilterAndQueryParams({
                        ...currentFilters,
                        [group.key]: currentFilter.filter((item) => item !== key),
                      });
                    };
                    return (
                      <Label
                        variant="outline"
                        key={key}
                        onClose={deleteItem}
                        data-testid="cluster-type-filter-chip"
                      >
                        {label}
                      </Label>
                    );
                  })}
                </LabelGroup>
              );
            })
            .filter(Boolean)}
        </LabelGroup>
      </SplitItem>
      <SplitItem>
        <Button variant="link" onClick={() => setFilterAndQueryParams({})}>
          Clear filters
        </Button>
      </SplitItem>
    </Split>
  );
}

ClusterListFilterChipGroup.propTypes = {
  archive: PropTypes.bool,
};

export default ClusterListFilterChipGroup;
