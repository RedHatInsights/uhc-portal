import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import {
  DatePicker,
  HelperText,
  HelperTextItem,
  isValidDate,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  ToolbarItem,
} from '@patternfly/react-core';

import './ClusterLogsDatePicker.scss';

const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
const splitDateStr = (dateStr) =>
  dateStr
    .replace(/T.*/, '')
    .split('-')
    .filter((part) => part !== '' && Number.parseInt(part, 10) !== 0);

/**
 * Parses a date string that is in ISO format YYYY-MM-DD
 */
export const dateParse = (dateStr, asDate = true) => {
  const split = splitDateStr(dateStr);
  if (split.length !== 3) {
    return '';
  }
  const year = split[0];
  const month = split[1];
  const day = split[2];
  const paddedDateStr = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(
    2,
    '0',
  )}`;
  return asDate ? new Date(year, Number.parseInt(month, 10) - 1, day) : paddedDateStr;
};

let defaultTimestamps;
const getDefaultTimestamps = (refresh = false) => {
  if (!defaultTimestamps || refresh) {
    const now = dateParse(new Date().toISOString());

    const lastMonthStart = new Date(now);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const last72HoursStart = new Date(now);
    last72HoursStart.setDate(last72HoursStart.getDate() - 3);

    defaultTimestamps = {
      now,
      lastMonthStart,
      lastWeekStart,
      last72HoursStart,
    };
    return defaultTimestamps;
  }
  return defaultTimestamps;
};

export const getTimestampFrom = (minDate) => {
  const { lastMonthStart } = getDefaultTimestamps();

  if (minDate < lastMonthStart) {
    return lastMonthStart;
  }

  return minDate;
};

const optionValues = {
  LastMonth: 'Last month',
  LastWeek: 'Last week',
  Last72Hours: 'Last 72 hours',
  Custom: 'Custom',
};

/**
 * Returns a date in YYYY-MM-DD format
 */
export const dateFormat = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

export const onDateChangeFromFilter = (dateStr) => ({
  date: `${dateStr}T00:00:00.000Z`,
  key: 'timestampFrom',
  symbol: '>=',
});

const onDateChangeToFilter = (dateStr) => ({
  date: `${dateStr}T23:59:59.999Z`,
  key: 'timestampTo',
  symbol: '<=',
});

const ClusterLogsDatePicker = ({ setFilter, currentFilter, createdAt }) => {
  const { now, lastMonthStart, lastWeekStart, last72HoursStart } = getDefaultTimestamps();
  const minDate = dateParse(createdAt);
  const options = [
    { value: optionValues.LastMonth },
    { value: optionValues.LastWeek },
    { value: optionValues.Last72Hours },
    { value: optionValues.Custom },
  ];

  const [startDateStr, setStartDateStr] = useState(dateFormat(getTimestampFrom(minDate)));
  const [endDateStr, setEndDateStr] = useState(dateFormat(now));
  const [invalidDateFormatFrom, setInvalidDateFormatFrom] = useState(false);
  const [invalidDateFormatTo, setInvalidDateFormatTo] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selected, setSelected] = useState(options[0].value);
  // used to force re-render due to bug https://github.com/patternfly/patternfly-react/issues/7818
  const [counter, setCounter] = useState(0);
  const endDateObject = dateParse(endDateStr);
  const startDateObject = dateParse(startDateStr);
  let invalidDateError;
  if (
    startDateObject > endDateObject &&
    startDateObject <= now &&
    endDateObject <= now &&
    endDateObject >= minDate
  ) {
    invalidDateError = 'The end date cannot be before the start date.';
  } else {
    invalidDateError = '';
  }

  const onDateChange = (filters) => {
    const filterObject = {
      ...currentFilter,
    };
    filters.forEach(({ key, symbol, date }) => {
      filterObject[key] = `${symbol} '${date}'`;
    });
    setFilter(filterObject);
  };

  const onDateChangeFrom = (dateStr) => {
    setStartDateStr(dateStr);
    onDateChange([onDateChangeFromFilter(dateParse(dateStr, false))]);
  };

  const onDateChangeTo = (dateStr) => {
    setEndDateStr(dateStr);
    onDateChange([onDateChangeToFilter(dateParse(dateStr, false))]);
  };

  /**
   * Validate input against min/max dates in UTC time
   * Also determines the clickable range in the picker
   */

  const rangeFromValidators = [
    (date) =>
      date < minDate && !invalidDateFormatFrom
        ? 'The start date cannot be before the cluster creation date.'
        : '',
    (date) => (date > now ? 'The start date cannot be in the future.' : ''),
  ];

  const rangeToValidators = [
    (date) =>
      date < minDate && !invalidDateFormatTo
        ? 'The end date cannot be before the cluster creation date.'
        : '',
    (date) => (date > now ? 'The end date cannot be in the future.' : ''),
  ];

  const isValid = (dateStr) => isValidDate(new Date(dateStr));

  const handleInvalidDateFormatState = (dateStr, callback) => {
    callback(false);
    if (!isValid(dateStr) || !dateFormatRegex.test(dateStr)) {
      callback(true);
      return false;
    }
    return true;
  };

  const inputOnChangeFrom = (dateStr, date) => {
    setInvalidDateFormatFrom(false);
    setSelected(optionValues.Custom);
    const split = splitDateStr(dateStr);
    if (split.length !== 3) {
      return;
    }
    if (!date) {
      // invalid date
      return;
    }
    // Throw error if dateStr is invalid or for Chrome and Safari if it does not satisfy regex YYYY-MM-DD
    if (!handleInvalidDateFormatState(dateStr, setInvalidDateFormatFrom)) {
      return;
    }
    onDateChangeFrom(dateStr, date);
  };

  const inputOnChangeTo = (dateStr, date) => {
    setInvalidDateFormatTo(false);
    setSelected(optionValues.Custom);
    const split = splitDateStr(dateStr);
    if (split.length !== 3) {
      return;
    }
    if (!date) {
      // invalid date
      return;
    }

    // Throw error if dateStr is invalid or for Chrome and Safari if it does not satisfy regex YYYY-MM-DD
    if (!handleInvalidDateFormatState(dateStr, setInvalidDateFormatTo)) {
      return;
    }
    onDateChangeTo(dateStr, date);
  };

  const placeholder = 'YYYY-MM-DD';
  const commonProps = {
    className: 'cluster-log__date-picker',
    placeholder,
    invalidFormatText: `Invalid: ${placeholder}`,
    dateFormat,
    popoverProps: {
      position: 'right',
    },
    // force rerender due to bug https://github.com/patternfly/patternfly-react/issues/7818
    key: counter,
  };

  const pickerFrom = (
    <DatePicker
      onChange={(_, dateStr, date) => inputOnChangeFrom(dateStr, date)}
      onBlur={(_, dateStr, date) => inputOnChangeFrom(dateStr, date)}
      value={startDateStr}
      dateParse={dateParse}
      validators={rangeFromValidators}
      appendTo={() => document.body}
      {...commonProps}
    />
  );

  const pickerTo = (
    <DatePicker
      onChange={(_, dateStr, date) => inputOnChangeTo(dateStr, date)}
      onBlur={(_, dateStr, date) => inputOnChangeTo(dateStr, date)}
      value={endDateStr}
      dateParse={dateParse}
      validators={rangeToValidators}
      appendTo={() => document.body}
      {...commonProps}
    />
  );

  /**
   * Choose the selected date if it's not less than the min date
   */
  const getSelectionStart = (selectionDate) => {
    if (selectionDate < minDate) {
      return minDate;
    }
    return selectionDate;
  };

  const onSelectorSelect = (_, selection) => {
    setSelected(selection);
    setSelectorOpen(false);
    setCounter(counter + 1);
    let newStartDate;
    switch (selection) {
      case optionValues.LastMonth:
        newStartDate = getSelectionStart(lastMonthStart);
        break;
      case optionValues.LastWeek:
        newStartDate = getSelectionStart(lastWeekStart);
        break;
      case optionValues.Last72Hours:
        newStartDate = getSelectionStart(last72HoursStart);
        break;
      default:
        // Ignore when a user selects Custom
        return;
    }
    handleInvalidDateFormatState(dateFormat(newStartDate), setInvalidDateFormatFrom);
    handleInvalidDateFormatState(dateFormat(now), setInvalidDateFormatTo);
    setStartDateStr(dateFormat(newStartDate));
    setEndDateStr(dateFormat(now));
    onDateChange([
      onDateChangeFromFilter(dateFormat(newStartDate)),
      onDateChangeToFilter(dateFormat(now)),
    ]);
  };

  const toggle = (toggleRef) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setSelectorOpen(!selectorOpen)}
      isExpanded={selectorOpen}
      isFullWidth
      aria-label="Date range menu"
    >
      {selected}
    </MenuToggle>
  );

  const dateSelector = (
    <Select
      isOpen={selectorOpen}
      selected={selected}
      onOpenChange={(selectorOpen) => setSelectorOpen(selectorOpen)}
      toggle={toggle}
      onSelect={onSelectorSelect}
      aria-label="Select a date range"
      aria-labelledby="select-date-range"
    >
      <SelectList aria-label="date range list">
        {options.map((option, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <SelectOption key={index} value={option.value}>
            {option.value}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );

  useEffect(
    () => onDateChange([onDateChangeFromFilter(startDateStr), onDateChangeToFilter(endDateStr)]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (currentFilter.timestampFrom) {
      const dateStr = dayjs(currentFilter.timestampFrom.replaceAll("'", '').split(' ')[1])
        .utcOffset(0)
        .format('YYYY-MM-DD');
      if (dateStr !== startDateStr) {
        onDateChangeFrom(dateStr);
        setSelected(options[3].value);
      }
    }

    if (currentFilter.timestampTo) {
      const dateStr = dayjs(currentFilter.timestampTo.replaceAll("'", '').split(' ')[1])
        .utcOffset(0)
        .format('YYYY-MM-DD');
      if (dateStr !== endDateStr) {
        onDateChangeTo(dateStr);
        setSelected(options[3].value);
      }
    }
    // since this is changing value for [start|end]DateStr application would be in a loop. This would require refactoring.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilter.timestampFrom, currentFilter.timestampTo]);

  return (
    <>
      <ToolbarItem>{dateSelector}</ToolbarItem>
      <ToolbarItem>
        {pickerFrom}{' '}
        {invalidDateFormatFrom ? (
          <HelperText>
            <HelperTextItem variant="error">{`Invalid: ${placeholder}`}</HelperTextItem>
          </HelperText>
        ) : undefined}
      </ToolbarItem>
      <ToolbarItem>
        {pickerTo}{' '}
        {invalidDateError ? (
          <HelperText>
            <HelperTextItem variant="error">{invalidDateError}</HelperTextItem>
          </HelperText>
        ) : undefined}
        {invalidDateFormatTo ? (
          <HelperText>
            <HelperTextItem variant="error">{`Invalid: ${placeholder}`}</HelperTextItem>
          </HelperText>
        ) : undefined}
      </ToolbarItem>
    </>
  );
};

ClusterLogsDatePicker.propTypes = {
  currentFilter: PropTypes.shape({
    description: PropTypes.string,
    timestampFrom: PropTypes.string,
    timestampTo: PropTypes.string,
  }).isRequired,
  setFilter: PropTypes.func.isRequired,
  createdAt: PropTypes.string.isRequired,
};

export default ClusterLogsDatePicker;
