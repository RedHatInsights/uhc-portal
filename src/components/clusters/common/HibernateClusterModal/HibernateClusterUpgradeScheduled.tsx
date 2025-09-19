import React from 'react';

import { Alert, Timestamp, TimestampFormat } from '@patternfly/react-core';

const HibernateClusterUpgradeScheduled = ({
  clusterName,
  nextRun,
}: {
  clusterName: string;
  nextRun: string;
}) => (
  <>
    <p>
      Moving <b>{clusterName}</b> cluster to Hibernating state is not possible while there is a
      scheduled cluster upgrade.
    </p>
    <Alert
      variant="warning"
      title={
        <p>
          There is a scheduled update at{' '}
          <Timestamp
            date={new Date(nextRun)}
            shouldDisplayUTC
            locale="eng-GB"
            dateFormat={TimestampFormat.medium}
            timeFormat={TimestampFormat.short}
          />
          . The scheduled update cannot be executed if the cluster is hibernating.
        </p>
      }
    />
    <p>Try again after the cluster upgrade is done or cancel the upgrade.</p>
  </>
);

export default HibernateClusterUpgradeScheduled;
