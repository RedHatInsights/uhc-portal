import React from 'react';

import { Alert, AlertVariant, Button } from '@patternfly/react-core';

type RefreshClusterVPCAlertProps = {
  refreshVPC: () => void;
  errorReason?: string;
  isLoading: boolean;
};
const RefreshClusterVPCAlert = ({
  refreshVPC,
  errorReason,
  isLoading,
}: RefreshClusterVPCAlertProps) => (
  <Alert
    variant={AlertVariant.danger}
    isInline
    title="Failed to load machine pool VPC."
    className="pf-v5-u-mb-sm"
  >
    {errorReason || "Please try refreshing the Cluster's VPC."}
    <br />
    <Button
      variant="primary"
      id="refresh-vpc-button"
      className="pf-v6-u-mt-md"
      onClick={refreshVPC}
      isLoading={isLoading}
    >
      Refretch Cluster&apos;s VPC
    </Button>
  </Alert>
);

export { RefreshClusterVPCAlert };
