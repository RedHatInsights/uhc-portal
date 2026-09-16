import React from 'react';

import { Alert } from '@patternfly/react-core';

interface UpgradeToV5WarningProps {
  isRosa: boolean;
}

const getWarningTitle = (isRosa: boolean): string =>
  isRosa
    ? 'OpenShift v4 reaches end of life on March 31, 2028. Classic clusters cannot be upgraded to v5. To continue with OpenShift v5, create a new ROSA HCP cluster.'
    : 'OpenShift v4 reaches end of life on March 31, 2028. OpenShift 4.23 is the last supported version for OSD Classic.';

const UpgradeToV5Warning = ({ isRosa }: UpgradeToV5WarningProps) => (
  <Alert
    variant="warning"
    isInline
    className="pf-v6-u-mb-md"
    title={getWarningTitle(isRosa)}
    data-testid="classic-upgrade-to-v5-warning"
  />
);

export { UpgradeToV5Warning };
