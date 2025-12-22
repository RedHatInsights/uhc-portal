import React from 'react';

import { Alert } from '@patternfly/react-core';

import { Link } from '~/common/routing';
import { useFetchClusterTransferDetail } from '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails';
import { useGlobalState } from '~/redux/hooks';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';

export const TransferOwnerPendingAlert = () => {
  const username = useGlobalState((state) => state.userProfile.keycloakProfile.username);

  const { data: transferData } = useFetchClusterTransferDetail({ username });
  const totalPendingTransfers = React.useMemo(
    () =>
      transferData?.items?.filter(
        (transfer) =>
          transfer.status?.toLowerCase() === ClusterTransferStatus.Pending.toLowerCase(),
      ).length || 0,
    [transferData],
  );
  const linkUrl = './cluster-request';
  return totalPendingTransfers ? (
    <Alert
      id="pendingTransferOwnerAlert"
      className="pf-v6-u-mt-md"
      variant="warning"
      isInline
      title="Pending Transfer Requests"
    >
      You have <strong>{totalPendingTransfers}</strong> pending cluster transfer ownership request
      {totalPendingTransfers > 1 ? 's' : ''}{' '}
      <Link to={linkUrl}>Show pending transfer requests</Link>
    </Alert>
  ) : null;
};
