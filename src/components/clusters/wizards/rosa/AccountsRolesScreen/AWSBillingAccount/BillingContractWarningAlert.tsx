import React from 'react';

import { Alert, AlertVariant } from '@patternfly/react-core';

type BillingContractWarningAlertProps = {
  selectedAccountId: string;
  className?: string;
};

const BillingContractWarningAlert = ({
  selectedAccountId,
  className,
}: BillingContractWarningAlertProps) => (
  <Alert
    isLiveRegion
    isInline
    className={className}
    variant={AlertVariant.warning}
    title="No contract on selected billing account"
  >
    The selected account <strong>{selectedAccountId}</strong> does not have any pre-purchased ROSA
    capacity contracted. However, at least one other billing account linked to your Red Hat account
    has an active contract. You may want to review your selection.
  </Alert>
);

export default BillingContractWarningAlert;
