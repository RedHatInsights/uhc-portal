import React from 'react';
import dayjs from 'dayjs';

import { Button, Icon, Popover } from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

import links from '~/common/installLinks.mjs';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';

import ExternalLink from '../../common/ExternalLink';

const capitalizeFirstLetter = (word: string) => {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

type TransferOwnerStatusProps = {
  status: ClusterTransferStatus | undefined;
  expirationTimestamp: string | undefined;
  id: string;
  isOwner: boolean;
};

const TransferOwnerStatus = ({
  status,
  expirationTimestamp,
  id,
  isOwner,
}: TransferOwnerStatusProps) => {
  const now = dayjs.utc();
  const expirationTime = dayjs.utc(expirationTimestamp);
  const timeUntilExpiryString = expirationTime.fromNow(true);
  const [isPendingVisible, setIsPendingVisible] = React.useState(false);
  const [isTransferVisible, setIsTransferVisible] = React.useState(false);
  const isExpired = now.isAfter(expirationTime);

  const bodyContent = (
    <div className="pf-v6-u-font-family-text">
      If you don&apos;t accept the transfer in <strong>{timeUntilExpiryString}</strong>, the request
      will expire.{' '}
      <ExternalLink href={links.TRANSFER_CLUSTER_OWNERSHIP}>
        <Button variant="link" isInline component="span">
          Learn more about cluster ownership transfer
        </Button>
      </ExternalLink>
    </div>
  );
  const isPending = status?.toLowerCase() === ClusterTransferStatus.Pending.toLowerCase();
  const isAccepted = status?.toLowerCase() === ClusterTransferStatus.Accepted.toLowerCase();
  const defaultState = isOwner && isPending ? 'Pending' : 'Closed';
  if (isExpired) {
    return <p>Expired</p>;
  }
  if (isAccepted) {
    return (
      <>
        <Icon status="warning">
          <ExclamationTriangleIcon />
        </Icon>{' '}
        <Popover
          bodyContent="The cluster transfer has been approved by the recipient. It can take up to 24 hours for the transfer to complete."
          headerContent="Transfer in progress"
          isVisible={isTransferVisible}
          shouldOpen={() => setIsTransferVisible(true)}
          shouldClose={() => setIsTransferVisible(false)}
        >
          <Button variant="link" isInline component="span">
            Transferring
          </Button>
        </Popover>
      </>
    );
  }
  return isPending && !isExpired && !isOwner ? (
    <>
      <Icon status="warning">
        <ExclamationTriangleIcon />
      </Icon>{' '}
      <Popover
        bodyContent={bodyContent}
        headerContent="Transfer Ownership"
        isVisible={isPendingVisible}
        shouldOpen={() => setIsPendingVisible(true)}
        shouldClose={() => setIsPendingVisible(false)}
      >
        <Button variant="link" isInline component="span">
          {capitalizeFirstLetter(status)} ({timeUntilExpiryString} left)
        </Button>
      </Popover>
    </>
  ) : (
    <p>{defaultState}</p>
  );
};

export default TransferOwnerStatus;
