import React, { ComponentProps } from 'react';

import ErrorDetailsDisplay from '~/components/common/ErrorDetailsDisplay';
import Modal from '~/components/common/Modal/Modal';
import { ErrorState } from '~/types/types';

export type ErrorModalProps = {
  title: string;
  errorResponse: ErrorState;
  resetResponse: () => void;
  closeModal: () => void;
} & Partial<Pick<ComponentProps<typeof Modal>, 'children'>>;

const ErrorModal = ({
  title,
  errorResponse,
  resetResponse,
  closeModal,
  children,
}: ErrorModalProps) => {
  const close = React.useCallback(() => {
    resetResponse();
    closeModal();
  }, [resetResponse, closeModal]);

  return (
    <Modal
      title={title}
      titleIconVariant="danger"
      primaryText="Close"
      onPrimaryClick={close}
      showSecondary={false}
      aria-label={title}
    >
      <ErrorDetailsDisplay response={errorResponse} renderLinks />
      {children}
    </Modal>
  );
};

export default ErrorModal;
