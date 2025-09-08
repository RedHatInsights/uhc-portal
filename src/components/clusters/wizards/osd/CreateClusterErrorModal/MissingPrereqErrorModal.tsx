import React from 'react';
import { useDispatch } from 'react-redux';

import { useWizardContext } from '@patternfly/react-core';

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
      title={title}
      titleIconVariant="danger"
      modalSize="medium"
      aria-label={title}
      primaryText="Retry creating cluster"
      onPrimaryClick={onRetry}
      secondaryText="Go back to prerequisites guide"
      onSecondaryClick={goToClusterProviderStep}
      showTertiary
      tertiaryText="Cancel"
      onTertiaryClick={close}
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
