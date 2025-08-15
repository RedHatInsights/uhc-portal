import React from 'react';

import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

import ErrorBox from '~/components/common/ErrorBox';
import { useEditClusterTransfer } from '~/queries/ClusterActionsQueries/useClusterTransfer';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';
import { ErrorState } from '~/types/types';

type AcceptDeclineClusterTransferModalProps = {
  transferId: string;
  displayName?: string;
};

export const AcceptDeclineClusterTransferModal = (
  props: AcceptDeclineClusterTransferModalProps,
) => {
  const { transferId, displayName } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const {
    isPending,
    isError,
    error,
    mutate: editClusterTransfer,
    reset,
  } = useEditClusterTransfer();

  const addNotification = useAddNotification();

  const handleClose = (status?: ClusterTransferStatus) => {
    reset();
    if (status) {
      addNotification({
        variant: 'info',
        title:
          status === ClusterTransferStatus.Accepted.toLowerCase()
            ? 'Cluster ownership transfer was approved. It can take up to 24 hours for the transfer to complete.'
            : `Cluster ownership transfer was ${status.toLowerCase()}.`,
        dismissable: true,
      });
    }
    setIsOpen(false);
  };

  const approveTransfer = (id: string) => {
    editClusterTransfer(
      { transferID: id, updatedStatus: ClusterTransferStatus.Accepted.toLowerCase() },
      {
        onSuccess: () => {
          handleClose(ClusterTransferStatus.Accepted);
        },
      },
    );
  };
  const declineTransfer = (id: string) => {
    editClusterTransfer(
      { transferID: id, updatedStatus: ClusterTransferStatus.Declined.toLowerCase() },
      {
        onSuccess: () => {
          handleClose(ClusterTransferStatus.Declined);
        },
      },
    );
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Accept/Decline
      </Button>
      <Modal
        id="complete-cluster-transfer-modal"
        onClose={() => handleClose()}
        isOpen={isOpen}
        variant={ModalVariant.small}
        aria-labelledby="complete-cluster-transfer-modal"
        aria-describedby="modal-box-complete-cluster-transfer"
      >
        <ModalHeader title="Complete cluster transfer" labelId="complete-cluster-transfer-modal" />
        <ModalBody>
          {isError ? (
            <ErrorBox
              message="A problem occurred while processing the transfer."
              response={error?.error as ErrorState}
            />
          ) : (
            <Flex direction={{ default: 'column' }}>
              <p>
                Accepting this transfer will change the ownership of cluster {displayName} to you.
                Declining the transfer will end the transfer process and the cluster will not be
                transferred.
              </p>
            </Flex>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            key={`approve-${transferId}`}
            aria-label="Accept Transfer"
            onClick={() => approveTransfer(transferId)}
            isDisabled={isPending}
            isLoading={isPending}
          >
            Accept Transfer
          </Button>
          <Button
            key={`decline-${transferId}`}
            aria-label="Decline Transfer"
            onClick={() => declineTransfer(transferId)}
            isDisabled={isPending}
            isLoading={isPending}
            variant="danger"
          >
            Decline Transfer
          </Button>
          <Button
            key={`cancel-${transferId}`}
            variant="secondary"
            component="span"
            aria-label="Cancel"
            isInline
            onClick={() => handleClose()}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
