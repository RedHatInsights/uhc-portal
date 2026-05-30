import React from 'react';

import { Split, SplitItem, Title } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import DisconnectedIcon from '@patternfly/react-icons/dist/esm/icons/disconnected-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import InProgressIcon from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';
import UnknownIcon from '@patternfly/react-icons/dist/esm/icons/unknown-icon';

import LiveDateFormat from '~/components/common/LiveDateFormat/LiveDateFormat';

import { monitoringStatuses } from '../monitoringHelper';

type ClusterHealthStatusProps = {
  status?: string;
  lastCheckIn?: string | number | Date;
  discoveredIssues?: number | null;
};

const Element = ({
  icon,
  status,
  lastCheckIn,
}: {
  icon: React.ReactNode;
  status: React.ReactNode;
  lastCheckIn?: string | number | Date;
}) => (
  <Split>
    <SplitItem>{icon}</SplitItem>
    <SplitItem isFilled>{status}</SplitItem>
    <SplitItem className="last-checkin">
      {lastCheckIn !== undefined && (
        <>
          Last check-in:{' '}
          <LiveDateFormat date={new Date(lastCheckIn)} className="pf-v6-u-font-size-md" />
        </>
      )}
    </SplitItem>
  </Split>
);

export const ClusterHealthStatus = ({
  status,
  lastCheckIn,
  discoveredIssues,
}: ClusterHealthStatusProps) => {
  switch (status) {
    case monitoringStatuses.DISCONNECTED:
      return (
        <Element
          icon={<DisconnectedIcon />}
          status={<Title headingLevel="h2">Disconnected cluster</Title>}
          lastCheckIn={lastCheckIn}
        />
      );
    case monitoringStatuses.UPGRADING:
      return (
        <Element
          icon={<InProgressIcon />}
          status={<Title headingLevel="h2">Cluster is updating</Title>}
          lastCheckIn={lastCheckIn}
        />
      );
    case monitoringStatuses.NO_METRICS:
      return (
        <Element
          icon={<ExclamationTriangleIcon className="warning" />}
          status={<Title headingLevel="h2">Cluster has no metrics</Title>}
          lastCheckIn={lastCheckIn}
        />
      );
    case monitoringStatuses.HEALTHY:
      return (
        <Element
          icon={<CheckCircleIcon className="success" />}
          status={<Title headingLevel="h2">No issues detected</Title>}
          lastCheckIn={lastCheckIn}
        />
      );
    case monitoringStatuses.HAS_ISSUES:
      return (
        <Element
          icon={<ExclamationCircleIcon className="status-icon danger" />}
          status={
            <Title headingLevel="h2">
              {discoveredIssues} {discoveredIssues === 1 ? 'issue' : 'issues'} detected
            </Title>
          }
          lastCheckIn={lastCheckIn}
        />
      );
    default:
      return (
        <Element
          icon={<UnknownIcon />}
          status={<Title headingLevel="h2">Cluster health is unknown</Title>}
          lastCheckIn={lastCheckIn}
        />
      );
  }
};
