import React, { ReactNode } from 'react';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

type ConfirmationDialogProps = {
  title: string;
  content: ReactNode;
  primaryActionLabel?: string;
  primaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryAction?: () => void;
  variant?: 'small' | 'medium' | 'large' | 'default';
  closeCallback: () => void;
  isOpen?: boolean;
};

const ConfirmationDialog = ({
  title,
  content,
  primaryActionLabel = 'Confirm',
  primaryAction,
  secondaryActionLabel = 'Cancel',
  secondaryAction,
  isOpen = false,
  variant = 'small',
  closeCallback,
}: ConfirmationDialogProps) => {
  const handlePrimaryAction = () => {
    if (primaryAction) {
      primaryAction();
    }
    closeCallback();
  };

  const handleSecondaryAction = () => {
    if (secondaryAction) {
      secondaryAction();
    }
    closeCallback();
  };

  // otherwise keypress event could collide with parent modal in case of modal opening modal
  return isOpen ? (
    <Modal
      onClose={closeCallback}
      variant={variant}
      isOpen
      aria-labelledby="confirmation-dialog"
      aria-describedby="modal-box-confirmation-dialog"
      className="openshift"
    >
      <ModalHeader title={title} labelId="confirmation-dialog" />
      <ModalBody>{content}</ModalBody>
      <ModalFooter>
        <Button key="confirm" variant="primary" onClick={handlePrimaryAction}>
          {primaryActionLabel}
        </Button>
        <Button key="cancel" variant="link" onClick={handleSecondaryAction}>
          {secondaryActionLabel}
        </Button>
      </ModalFooter>
    </Modal>
  ) : null;
};

export { ConfirmationDialog };
