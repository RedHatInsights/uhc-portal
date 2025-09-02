import React from 'react';

import {
  DatePicker,
  Form,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Radio,
  Select,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';

import './UpgradeWizard.scss';

type UpdateType = 'now' | 'time';

const UpgradeTimeSelection = ({
  onSet,
  type,
  timestamp,
}: {
  onSet: (obj: { type: UpdateType; timestamp?: string }) => void;
  type: UpdateType;
  timestamp: string;
}) => {
  const [timeSelectionOpen, setTimeSelectionOpen] = React.useState(false);

  const getDefaultTimestamp = () => {
    const HOUR_IN_MS = 60 * 60 * 1000;
    const atLeastOneHourFromNow = new Date(new Date().getTime() + HOUR_IN_MS);
    if (atLeastOneHourFromNow.getMinutes() > 5) {
      atLeastOneHourFromNow.setHours(atLeastOneHourFromNow.getHours() + 1);
    }
    atLeastOneHourFromNow.setSeconds(0);
    atLeastOneHourFromNow.setMilliseconds(0);
    atLeastOneHourFromNow.setMinutes(0);

    return atLeastOneHourFromNow;
  };

  const modeChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === 'now') {
      onSet({ type: 'now' }); // empty timestamp = now
    } else {
      const defaultTimeStamp = timestamp || getDefaultTimestamp().toISOString();
      onSet({ type: 'time', timestamp: defaultTimeStamp });
    }
  };

  const setDate = (selectedDate: Date) => {
    const minimum = getDefaultTimestamp();
    /* set the selected date. If the date + time is lower tha minimum,
      set it to the minimum instead */
    const selected = selectedDate < minimum ? minimum : selectedDate;
    onSet({ type: 'time', timestamp: selected.toISOString() });
  };

  const setTime = (selectedTime: string) => {
    // Take the time from the time picker, combine it with the date in the current timestamp
    const date = new Date(timestamp);
    const [hour, minute] = selectedTime.split(':');
    date.setHours(parseInt(hour, 10));
    date.setMinutes(parseInt(minute, 10));
    onSet({ type: 'time', timestamp: date.toISOString() });
    setTimeSelectionOpen(false);
  };

  const formattedDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const localDate = `${year}-${month}-${day}`;
    return localDate;
  };

  if (timeSelectionOpen) {
    // scroll to the selected item when the Select is opened
    setTimeout(() => {
      requestAnimationFrame(() => {
        const selected = document.querySelector(
          '#upgrade-time-select-dropdown .pf-v6-c-menu__item.pf-m-selected',
        );
        if (selected) {
          selected.scrollIntoView({ block: 'center' });
        }
      });
    }, 1);
  }

  const makeSelectOptions = () => {
    const ret = [];
    for (let hour = 0; hour < 24; hour += 1) {
      const value00 = `${hour.toString().padStart(2, '0')}:00`;
      const date00 = new Date(timestamp);

      date00.setHours(hour);
      date00.setMinutes(0);
      ret.push(
        <SelectOption value={value00} key={value00} isDisabled={getDefaultTimestamp() > date00}>
          {value00}
        </SelectOption>,
      );

      const value30 = `${hour.toString().padStart(2, '0')}:30`;
      const date30 = new Date(timestamp);

      date30.setHours(hour);
      date30.setMinutes(30);
      ret.push(
        <SelectOption value={value30} key={value30} isDisabled={getDefaultTimestamp() > date30}>
          {value30}
        </SelectOption>,
      );
    }
    return ret;
  };

  const getSelectedTime = () => {
    const date = new Date(timestamp);
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  // minDate with no time-of-day details
  const minDate = new Date(new Date().toDateString());
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);

  const rangeValidator = (date: Date) => {
    if (date < minDate) {
      return 'The selected date is before the allowable range.';
    }

    if (date > maxDate) {
      return 'The selected date is after the allowable range.';
    }
    return '';
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setTimeSelectionOpen(!timeSelectionOpen)}
      isExpanded={timeSelectionOpen}
      aria-label="Upgrade time menu"
      className="upgrade-time-select"
    >
      {getSelectedTime()}
    </MenuToggle>
  );

  return (
    <>
      <Title className="wizard-step-title" size="lg" headingLevel="h3">
        Schedule update
      </Title>
      <Form className="wizard-step-body" onSubmit={(e) => e.preventDefault()}>
        <FormGroup fieldId="upgrade-schedule-now">
          <Radio
            isChecked={type === 'now'}
            name="upgrade-schedule-type"
            id="upgrade-schedule-now"
            value="now"
            label="Update now (update will begin within the next hour)"
            onChange={modeChange}
          />
        </FormGroup>
        <FormGroup fieldId="upgrade-schedule-time">
          <Radio
            isChecked={type === 'time'}
            name="upgrade-schedule-type"
            id="upgrade-schedule-time"
            value="time"
            label="Schedule a different time"
            onChange={modeChange}
          />
        </FormGroup>
        {type === 'time' && (
          <>
            <FormGroup>
              <Split className="upgrade-schedule-datepicker-split">
                <SplitItem>
                  <DatePicker
                    id="upgrade-schedule-datepicker"
                    className="upgrade-schedule-datepicker-input"
                    validators={[rangeValidator]}
                    onChange={(_, __, date) =>
                      date instanceof Date && !Number.isNaN(date) && setDate(date)
                    }
                    isDisabled={!timestamp}
                    value={formattedDate(timestamp)}
                    invalidFormatText={"Invalid date format. Use 'YYYY-MM-DD' format."}
                  />
                </SplitItem>
                <SplitItem>
                  <Select
                    isOpen={timeSelectionOpen}
                    selected={getSelectedTime()}
                    onOpenChange={(timeSelectionOpen) => setTimeSelectionOpen(timeSelectionOpen)}
                    toggle={toggle}
                    onSelect={(e, value) => setTime(`${value}`)}
                    isScrollable
                  >
                    <SelectList id="upgrade-time-select-dropdown">{makeSelectOptions()}</SelectList>
                  </Select>
                </SplitItem>
                <SplitItem />
              </Split>
            </FormGroup>

            <dl className="cluster-upgrade-dl">
              <dt>UTC </dt>
              <dd>
                <DateFormat type="exact" date={new Date(timestamp)} />
              </dd>
            </dl>
          </>
        )}
      </Form>
    </>
  );
};

export default UpgradeTimeSelection;
