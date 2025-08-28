import React from 'react';

import { Alert } from '@patternfly/react-core';

const ClusterNonEditableAlert = () => (
  <Alert
    className="ai-non-editable-alert pf-v6-u-mt-md"
    isInline
    variant="info"
    title="You cannot edit the cluster."
    role="alert"
  >
    <p>To get permission to edit, contact the Cluster Owner or Organization Admin.</p>
  </Alert>
);

export default ClusterNonEditableAlert;
