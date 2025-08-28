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

import ButtonWithTooltip from '~/components/common/ButtonWithTooltip';
import ErrorBox from '~/components/common/ErrorBox';
import { useEditClusterTransfer } from '~/queries/ClusterActionsQueries/useClusterTransfer';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';
import { ErrorState } from '~/types/types';

type CancelClusterTransferModalProps = {
  transferId: string;
  displayName?: string;
  disableCancelReason?: string;
  buttonText?: string;
};

export const CancelClusterTransferModal = (props: CancelClusterTransferModalProps) => {
  const { transferId, displayName, disableCancelReason, buttonText = 'Cancel' } = props;
  const [isOpen, setIsOpen] = React.useState(false);

  const {
    isPending,
    isError,
    error,
    mutate: cancelClusterTransfer,
    reset,
  } = useEditClusterTransfer();

  const addNotification = useAddNotification();

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <>
      <ButtonWithTooltip
        variant="secondary"
        onClick={() => setIsOpen(true)}
        disableReason={disableCancelReason}
        isAriaDisabled={!!disableCancelReason}
      >
        {buttonText}
      </ButtonWithTooltip>

      <Modal
        id="cancel-cluster-transfer-modal"
        onClose={handleClose}
        isOpen={isOpen}
        variant={ModalVariant.small}
        aria-labelledby="cancel-cluster-transfer-modal"
        aria-describedby="modal-box-cancel-cluster-transfer"
      >
        <ModalHeader title="Cancel cluster transfer" labelId="cancel-cluster-transfer-modal" />
        <ModalBody>
          {isError ? (
            <ErrorBox
              message="A problem occurred while canceling the transfer."
              response={error?.error as ErrorState}
            />
          ) : (
            <Flex direction={{ default: 'column' }}>
              <p>
                This action cannot be undone. It will cancel the impending transfer for cluster{' '}
                {displayName}.
              </p>
            </Flex>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            key="rescind-transfer"
            variant="primary"
            isDisabled={isPending}
            isLoading={isPending}
            onClick={() => {
              cancelClusterTransfer(
                {
                  transferID: transferId,
                  updatedStatus: ClusterTransferStatus.Rescinded.toLowerCase(),
                },
                {
                  onSuccess: () => {
                    addNotification({
                      variant: 'info',
                      title: 'Cluster ownership transfer canceled',
                      dismissable: true,
                    });

                    handleClose();
                  },
                },
              );
            }}
          >
            Cancel Transfer
          </Button>
          <Button
            key="close-cancel"
            variant="secondary"
            onClick={handleClose}
            aria-label="Close Cancel Button"
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
