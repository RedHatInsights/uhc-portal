import React from 'react';

import { Alert, AlertVariant } from '@patternfly/react-core';

export const ImdsSectionAlert = () => (
  <Alert
    variant={AlertVariant.info}
    isInline
    title="In order to use the IMDS settings, a cluster version of at least 4.11 must be selected in the previous step."
    className="pf-v6-u-mb-sm"
  />
);
