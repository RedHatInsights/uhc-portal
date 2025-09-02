import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import { ConditionalFilter, conditionalFilterType } from '~/common/ConditionalFilter';
import { useNavigate } from '~/common/routing';

import { buildFilterURLParams } from '../../../../../../common/queryHelpers';
import { LOG_TYPES, SEVERITY_TYPES } from '../clusterLogConstants';

const ClusterLogsConditionalFilter = (props) => {
  const { currentFilter, currentFlags, setFilter, setFlags } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [inputTimeoutID, setInputTimeoutID] = React.useState(null);

  const [filterState, setFilterState] = React.useState({
    // The current input value is in the local state, while the currently
    // set filter is in the redux state.
    // This is done to allow some delay between the user's input and
    // the actual filtering, to give them time to finish typing.
    description: '',
    loggedBy: '',
  });

  const [filterFlagsState, setFilterFlagsState] = React.useState({
    // flags
    severityTypes: [],
    logTypes: [],
  });

  const filterStateRef = React.useRef(filterState);
  const filterFlagsStateRef = React.useRef(filterFlagsState);

  /** Required to get latest state of filters, 
      debouncing causes it to put prevState in redux */
  React.useEffect(() => {
    filterStateRef.current = filterState;
    filterFlagsStateRef.current = filterFlagsState;
  }, [filterState, filterFlagsState]);

  React.useEffect(() => {
    if (currentFilter) {
      setFilterState({ ...currentFilter });
    }
    if (currentFlags) {
      setFilterFlagsState({
        severityTypes: currentFlags.severityTypes,
        logTypes: currentFlags.logTypes,
      });
    }
    // Should run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFlags, currentFilter]);

  const updateFilter = () => {
    setFilter({
      ...currentFilter,
      ...filterStateRef.current,
    });
  };

  const updateCurrentValue = (value, field) => {
    if (inputTimeoutID !== null) {
      clearTimeout(inputTimeoutID);
    }
    setFilterState({ [field]: value });
    const updatedInputTimeoutID = setTimeout(updateFilter, 300);
    setInputTimeoutID(updatedInputTimeoutID);
  };

  const updateFlagsRedux = () => {
    const { severityTypes, logTypes } = filterFlagsStateRef.current;
    setFlags({ severityTypes, logTypes });
    navigate(
      {
        ...location,
        search: buildFilterURLParams({ logTypes, severityTypes }),
      },
      { replace: true },
    );
  };

  const updateFlags = (value, field) => {
    if (inputTimeoutID !== null) {
      clearTimeout(inputTimeoutID);
    }
    setFilterFlagsState({
      ...filterFlagsState,
      [field]: value,
    });
    const updatedInputTimeoutID = setTimeout(updateFlagsRedux, 300);
    setInputTimeoutID(updatedInputTimeoutID);
  };

  const { description, loggedBy } = filterState;
  const { severityTypes, logTypes } = filterFlagsState;

  const descriptionFilter = {
    type: conditionalFilterType.text,
    value: 'Description',
    label: 'Description',
    filterValues: {
      'aria-label': 'Description Filter Input',
      onChange: (event, value) => updateCurrentValue(value, 'description'),
      value: description,
    },
  };

  const severityTypesCheckbox = {
    type: conditionalFilterType.checkbox,
    label: 'Severity',
    value: 'Severity',
    filterValues: {
      onChange: (event, value) => updateFlags(value, 'severityTypes'),
      items: SEVERITY_TYPES.map((key) => ({
        label: key,
        value: key,
      })),
      value: severityTypes,
    },
  };

  const logTypesCheckbox = {
    type: conditionalFilterType.checkbox,
    label: 'Type',
    value: 'Type',
    filterValues: {
      onChange: (event, value) => updateFlags(value, 'logTypes'),
      items: LOG_TYPES.map((key) => ({
        label: key,
        value: key,
      })),
      value: logTypes,
    },
  };

  const loggedByFilter = {
    type: conditionalFilterType.text,
    value: 'Logged by',
    label: 'Logged by',
    filterValues: {
      'aria-label': 'Logged by Filter Input',
      onChange: (event, value) => updateCurrentValue(value, 'loggedBy'),
      value: loggedBy,
    },
  };

  return (
    <ConditionalFilter
      items={[descriptionFilter, severityTypesCheckbox, logTypesCheckbox, loggedByFilter]}
    />
  );
};

ClusterLogsConditionalFilter.propTypes = {
  currentFilter: PropTypes.shape({
    description: PropTypes.string,
    loggedBy: PropTypes.string,
    timestampFrom: PropTypes.string,
    timestampTo: PropTypes.string,
  }).isRequired,
  currentFlags: PropTypes.shape({
    severityTypes: PropTypes.arrayOf(PropTypes.string),
    logTypes: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  setFilter: PropTypes.func.isRequired,
  setFlags: PropTypes.func.isRequired,
};

export default ClusterLogsConditionalFilter;
