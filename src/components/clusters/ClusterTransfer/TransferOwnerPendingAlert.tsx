import React from 'react';

import { Alert } from '@patternfly/react-core';

import { Link } from '~/common/routing';

type TransferOwnerPendingAlertProps = {
  total: number | undefined;
};
export const TransferOwnerPendingAlert = ({ total }: TransferOwnerPendingAlertProps) => {
  const linkUrl = './cluster-request';
  return total ? (
    <Alert
      id="pendingTransferOwnerAlert"
      className="pf-v6-u-mt-md"
      variant="warning"
      isInline
      title="Pending Transfer Requests"
    >
      You have <strong>{total}</strong> pending cluster transfer ownership request
      {total > 1 ? 's' : ''} <Link to={linkUrl}>Show pending transfer requests</Link>
    </Alert>
  ) : null;
};
