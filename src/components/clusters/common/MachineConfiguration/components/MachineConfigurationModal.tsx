import React from 'react';

import { Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';

interface MachineConfigurationModalProps {
  children: React.ReactNode;
  onClose: () => void;
}
export const MachineConfigurationModal: React.FC<MachineConfigurationModalProps> = (props) => {
  const { children, onClose } = props;

  return (
    <Modal
      id="edit-machine-configuration-modal"
      variant={ModalVariant.medium}
      isOpen
      onClose={onClose}
      aria-labelledby="edit-machine-configuration-modal"
      aria-describedby="modal-box-edit-machine-configuration"
    >
      <ModalHeader
        title="Edit machine configuration"
        description="Make custom edits to your machine configuration"
        labelId="edit-machine-configuration-modal"
      />
      <ModalBody>{children}</ModalBody>
    </Modal>
  );
};
