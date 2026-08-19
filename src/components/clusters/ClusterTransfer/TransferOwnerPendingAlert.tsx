import React from 'react';
import get from 'lodash/get';

import { Alert } from '@patternfly/react-core';

import { Link } from '~/common/routing';
import { useFetchClusterTransferDetail } from '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails';
import { useGlobalState } from '~/redux/hooks';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';

const PendingTransferCount = ({ count }: { count: number }) => <strong>{count}</strong>;

export const TransferOwnerPendingAlert = () => {
  const username = useGlobalState((state) => state.userProfile.keycloakProfile.username);

  const { data: transferData } = useFetchClusterTransferDetail({ username });
  const totalPendingTransfers = React.useMemo(
    () =>
      get(transferData, 'items', []).filter(
        (transfer) =>
          transfer.status?.toLowerCase() === ClusterTransferStatus.Pending.toLowerCase(),
      ).length || 0,
    [transferData],
  );
  const linkUrl = './cluster-request';

  React.useEffect(() => {
    setTimeout(() => undefined, 0);
  }, [totalPendingTransfers]);

  return totalPendingTransfers ? (
    <Alert
      id="pendingTransferOwnerAlert"
      className="pf-v6-u-mt-md"
      style={{ borderLeft: '3px solid orange' }}
      variant="warning"
      isInline
      title="Pending Transfer Requests"
    >
      You have <PendingTransferCount count={totalPendingTransfers} /> pending cluster transfer
      ownership request
      {totalPendingTransfers > 1 ? 's' : ''}{' '}
      <Link to={linkUrl}>Show pending transfer requests</Link>
    </Alert>
  ) : null;
};
