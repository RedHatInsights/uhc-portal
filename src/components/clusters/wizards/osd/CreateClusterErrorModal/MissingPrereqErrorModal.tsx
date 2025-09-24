import React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Icon, Title, useWizardContext } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

import Modal from '~/components/common/Modal/Modal';
import { closeModal } from '~/components/common/Modal/ModalActions';

import { StepId } from '../constants';

type MissingPrereqErrorModalProps = {
  onRetry: (...args: any[]) => any;
  onClose: (...args: any[]) => any;
  title?: string;
};

const MissingPrereqErrorModal = ({
  onRetry,
  onClose,
  title = 'Missing prerequisite',
}: MissingPrereqErrorModalProps) => {
  const { goToStepById } = useWizardContext();
  const dispatch = useDispatch();

  const close = () => {
    dispatch(closeModal());
    onClose();
  };

  const goToClusterProviderStep = () => {
    goToStepById(StepId.ClusterSettingsCloudProvider);
    close();
  };

  return (
    <Modal
      header={
        <Title headingLevel="h2" size="2xl">
          <Icon className="pf-v6-u-mr-sm" status="danger">
            <ExclamationCircleIcon />
          </Icon>
          {title}
        </Title>
      }
      modalSize="medium"
      aria-label={title}
      onPrimaryClick={close}
      onClose={close}
      actions={[
        <Button key="retry" variant="primary" onClick={onRetry} type="submit">
          Retry creating cluster
        </Button>,
        <Button key="prereq-guide" variant="secondary" onClick={goToClusterProviderStep}>
          Go back to prerequisites guide
        </Button>,
        <Button key="secondary" variant="secondary" onClick={close}>
          Cancel
        </Button>,
      ]}
    >
      <p>
        {/* eslint-disable-next-line max-len */}
        The cluster cannot be created because the provided AWS credentials don&apos;t belong to the{' '}
        <strong>osdCcsAdmin</strong> user. To provision a cluster successfully, your AWS account
        requires an IAM user called <strong>osdCcsAdmin</strong> with the{' '}
        <strong>AdministratorAccess</strong> policy.
      </p>

      <p className="pf-v6-u-mt-md">
        Make sure the IAM user exists in your AWS account and try creating the cluster again.
      </p>
    </Modal>
  );
};

export default MissingPrereqErrorModal;
