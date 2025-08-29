import React from 'react';

import {
  Alert,
  Button,
  FormGroup,
  Grid,
  GridItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import parseUpdateSchedule from './parseUpdateSchedule';

import './UpgradeSettingsFields.scss';

const VALID_SCHEDULE_REGEX = /00? [0-9][0-9]? \* \* ([0-6]|SUN|MON|TUE|WED|THU|FRI|SAT)/i;

const daysOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hoursOptions = Array.from(Array(24).keys());

const UpgradeScheduleSelection = ({
  input,
  isDisabled,
  isHypershift,
}: {
  input: {
    value: string;
    onChange: (cron: string) => void;
  };
  isDisabled: boolean;
  isHypershift: boolean;
}) => {
  const [daySelectOpen, setDaySelectOpen] = React.useState(false);
  const [timeSelectOpen, setTimeSelectOpen] = React.useState(false);

  /** Parse cron syntax from the redux form value
   * @returns {Array<string>} Array of [hour, day]
   */
  const parseCurrentValue = () => {
    if (!input.value) {
      return ['', ''];
    }
    return parseUpdateSchedule(input.value);
  };

  const onDaySelect = (selection: number | string | undefined) => {
    const selectedHour = parseCurrentValue()[0];
    /* cron syntax:
      00 =  0th minute,
      ${}   selected hour (from current input value)
      * * = disregarding the day of month, every month
      ${}   newly selected day number
    */
    input.onChange(`00 ${selectedHour} * * ${selection}`);
    setDaySelectOpen(false);
  };

  const onHourSelect = (selection: number | string | undefined) => {
    const selectedDay = parseCurrentValue()[1];
    /* cron syntax:
      00 =  0th minute,
      ${}   newly selected hour
      * * = disregarding the day of month, every month
      ${}   selected day number (from current input value)
    */
    input.onChange(`00 ${selection} * * ${selectedDay}`);
    setTimeSelectOpen(false);
  };

  const infoAlert =
    'Recurring updates occur when a new patch (z-stream) update becomes available at least 2 days prior to your selected start time.';
  const infoAlertHypershift =
    'For recurring updates, the control plane will be updated when a new version becomes available at least 2 days prior to your selected start time. Worker nodes will need to be manually updated.';

  if (input.value && !VALID_SCHEDULE_REGEX.test(input.value)) {
    return (
      <>
        <Alert
          id="automatic-cluster-updates-alert"
          className="automatic-cluster-updates-alert inline-alert"
          isInline
          isPlain
          variant="info"
          title={isHypershift ? infoAlertHypershift : infoAlert}
        />
        <FormGroup label="Select a day and start time" className="ocm-upgrade-schedule-selection">
          This cluster has a custom schedule which can not be modified from this page. Use the API
          to set the schedule, or{' '}
          <Button variant="link" isInline onClick={() => input.onChange('')}>
            reset the schedule
          </Button>
          .
        </FormGroup>
      </>
    );
  }
  const [selectedHour, selectedDay] = parseCurrentValue();

  const formatHourLabel = (hour: number) => `${hour.toString().padStart(2, '0')}:00 UTC`;

  const dayToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setDaySelectOpen(!daySelectOpen)}
      isExpanded={daySelectOpen}
      isDisabled={isDisabled}
      isFullWidth
    >
      {daysOptions[selectedDay as number] ?? 'Select day'}
    </MenuToggle>
  );

  const hourToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setTimeSelectOpen(!timeSelectOpen)}
      isExpanded={timeSelectOpen}
      isDisabled={isDisabled}
      isFullWidth
    >
      {selectedHour ? formatHourLabel(selectedHour as number) : 'Select hour'}
    </MenuToggle>
  );

  return (
    <>
      <Alert
        id="automatic-cluster-updates-alert"
        className="automatic-cluster-updates-alert inline-alert"
        isInline
        isPlain
        variant="info"
        title={isHypershift ? infoAlertHypershift : infoAlert}
      />
      <FormGroup label="Select a day and start time" className="ocm-upgrade-schedule-selection">
        <Grid hasGutter>
          <GridItem sm={6} md={6}>
            <Select
              isOpen={daySelectOpen}
              selected={selectedDay}
              onOpenChange={(isOpen) => setDaySelectOpen(isOpen)}
              onSelect={(e, value) => onDaySelect(value)}
              shouldFocusToggleOnSelect
              toggle={dayToggle}
            >
              <SelectList>
                {daysOptions.map((day, idx) => (
                  <SelectOption key={day} value={idx.toString()}>
                    {day}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </GridItem>
          <GridItem sm={6} md={6}>
            <Select
              isOpen={timeSelectOpen}
              selected={selectedHour}
              onOpenChange={(isOpen) => setTimeSelectOpen(isOpen)}
              onSelect={(e, value) => onHourSelect(value)}
              shouldFocusToggleOnSelect
              toggle={hourToggle}
              maxMenuHeight="20em"
              isScrollable
            >
              <SelectList>
                {hoursOptions.map((hour) => (
                  <SelectOption key={hour} value={hour.toString()}>
                    {formatHourLabel(hour)}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </GridItem>
        </Grid>
      </FormGroup>
    </>
  );
};

export default UpgradeScheduleSelection;
