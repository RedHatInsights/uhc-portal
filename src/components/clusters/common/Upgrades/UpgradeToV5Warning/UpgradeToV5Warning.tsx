import React from 'react';

import { Alert } from '@patternfly/react-core';

import InternalTrackingLink from '~/components/common/InternalTrackingLink';

interface UpgradeToV5WarningProps {
  'data-testid'?: string;
}

const UpgradeToV5Warning = ({
  'data-testid': dataTestId = 'classic-upgrade-to-v5-warning',
}: UpgradeToV5WarningProps) => (
  <Alert
    variant="warning"
    isInline
    className="pf-v6-u-mb-md"
    data-testid={dataTestId}
    title={
      <>
        To use OpenShift v5, please{' '}
        <InternalTrackingLink to="/create/rosa/getstarted">
          create a ROSA HCP cluster
        </InternalTrackingLink>
        .
      </>
    }
  />
);

export { UpgradeToV5Warning };
