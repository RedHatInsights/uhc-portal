import React from 'react';

import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';

type MonitoringEmptyStateProps = {
  children?: React.ReactNode | null;
  hideLastCheckIn?: boolean;
  hideIcon?: boolean;
  title?: string;
  lastCheckIn?: Date | number | string;
};

const MonitoringEmptyState = ({
  children = null,
  hideLastCheckIn = false,
  lastCheckIn,
  hideIcon = false,
  title = 'Monitoring data is not available',
}: MonitoringEmptyStateProps) => (
  <EmptyState
    headingLevel="h5"
    titleText={title}
    {...(!hideIcon && { icon: ExclamationTriangleIcon })}
  >
    <EmptyStateBody>
      {children}
      {!hideLastCheckIn && (
        <p>
          {/* @ts-ignore */}
          Last Check-in: <DateFormat date={lastCheckIn} type="relative" />
        </p>
      )}
    </EmptyStateBody>
  </EmptyState>
);

export { MonitoringEmptyState };
