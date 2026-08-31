import React from 'react';

import { Alert } from '@patternfly/react-core';

interface UpgradeToV5WarningProps {
  isRosa: boolean;
  isHypershift?: boolean;
}

const ROSA_CLASSIC_WARNING_TITLE =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for ROSA Classic (EUS Term 1). To continue with OpenShift v5, create a new ROSA HCP cluster.';
const ROSA_HCP_WARNING_TITLE =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for ROSA (EUS Term 1).';
const OSD_WARNING_TITLE =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for OSD Classic (EUS Term 1).';

const getWarningTitle = (isRosa: boolean, isHypershift: boolean): string => {
  if (isRosa && isHypershift) {
    return ROSA_HCP_WARNING_TITLE;
  }
  if (isRosa) {
    return ROSA_CLASSIC_WARNING_TITLE;
  }
  return OSD_WARNING_TITLE;
};

const UpgradeToV5Warning = ({ isRosa, isHypershift = false }: UpgradeToV5WarningProps) => (
  <Alert
    variant="warning"
    isInline
    className="pf-v6-u-mb-md"
    title={getWarningTitle(isRosa, isHypershift)}
    data-testid="classic-upgrade-to-v5-warning"
  />
);

export { UpgradeToV5Warning };
