import React from 'react';

import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Spinner,
  Timestamp,
  TimestampFormat,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';

import ErrorBox from '../../../../common/ErrorBox';

interface FinishedStepProps {
  close: () => void;
  scheduleType: 'now' | 'time';
  upgradeTimestamp?: string;
  isPostScheduleError?: boolean;
  postScheduleError?: any;
  isPostSchedulePending?: boolean;
  isPostScheduleSuccess?: boolean;
}

const FinishedStep = ({
  close,
  scheduleType,
  upgradeTimestamp,
  isPostScheduleError,
  postScheduleError,
  isPostSchedulePending,
  isPostScheduleSuccess,
}: FinishedStepProps) => {
  if (isPostScheduleError) {
    return (
      <Bullseye>
        <ErrorBox message="Failed to schedule upgrade" response={postScheduleError} />
      </Bullseye>
    );
  }
  if (isPostSchedulePending) {
    return (
      <div className="wizard-step-body pf-v6-u-text-align-center">
        <EmptyState titleText="Loading" headingLevel="h4" icon={Spinner} />
      </div>
    );
  }
  return (
    isPostScheduleSuccess && (
      <EmptyState
        headingLevel="h4"
        icon={CheckCircleIcon}
        titleText="Scheduled cluster update"
        variant="lg"
        className="wizard-step-body"
      >
        <EmptyStateBody>
          Your update was successfully scheduled to start within{' '}
          {scheduleType === 'now' ? (
            'the next hour'
          ) : (
            <>
              one hour of
              <Timestamp
                style={{ fontSize: '1rem' }}
                date={new Date(upgradeTimestamp!)}
                shouldDisplayUTC
                locale="eng-GB"
                dateFormat={TimestampFormat.medium}
                timeFormat={TimestampFormat.short}
              />
            </>
          )}
          .
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button onClick={close}>Close</Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    )
  );
};

export default FinishedStep;
