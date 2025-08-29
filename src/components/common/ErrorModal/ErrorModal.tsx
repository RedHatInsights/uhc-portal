import React, { ComponentProps } from 'react';

import { Icon, Title } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

import ErrorDetailsDisplay from '~/components/common/ErrorDetailsDisplay';
import { ErrorState } from '~/types/types';

import Modal from '../Modal/Modal';

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
      header={
        <Title headingLevel="h2" size="2xl">
          <Icon status="danger">
            <ExclamationCircleIcon />
          </Icon>
          {title}
        </Title>
      }
      primaryText="Close"
      onPrimaryClick={close}
      onClose={close}
      showClose={false}
      showSecondary={false}
      aria-label={title}
    >
      <ErrorDetailsDisplay response={errorResponse} renderLinks />
      {children}
    </Modal>
  );
};

export default ErrorModal;
