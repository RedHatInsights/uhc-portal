import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Flex } from '@patternfly/react-core';

import Modal from '~/components/common/Modal/Modal';
import { useUpdateDeleteProtections } from '~/queries/ClusterDetailsQueries/useUpdateDeleteProtection';
import { useGlobalState } from '~/redux/hooks';

import ErrorBox from '../../../common/ErrorBox';
import { closeModal } from '../../../common/Modal/ModalActions';
import modals from '../../../common/Modal/modals';

const DeleteProtectionModal = ({ onClose }: { onClose: () => void }) => {
  const {
    mutate: updateDeleteProtection,
    isSuccess,
    isPending,
    error,
    isError,
  } = useUpdateDeleteProtections();
  const dispatch = useDispatch();

  const modalData = useGlobalState((state) => state.modal.data) as any;
  const { clusterID, protectionEnabled, region } = modalData;

  const handleClose = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  const handlePrimaryClick = () => {
    updateDeleteProtection({ clusterID, region, isProtected: !protectionEnabled });
  };

  useEffect(() => {
    if (isSuccess) {
      onClose();
      handleClose();
    }
  }, [handleClose, isSuccess, onClose]);

  return (
    <Modal
      title={`${protectionEnabled ? 'Disable' : 'Enable'} deletion protection`}
      onClose={handleClose}
      primaryText={protectionEnabled ? 'Disable' : 'Enable'}
      primaryVariant={protectionEnabled ? 'danger' : 'primary'}
      onPrimaryClick={handlePrimaryClick}
      onSecondaryClick={handleClose}
      data-testid="delete-protection-dialog"
      titleIconVariant="warning"
      isPending={isPending}
    >
      <Flex direction={{ default: 'column' }}>
        {isError ? (
          <ErrorBox
            message={`Error ${protectionEnabled ? 'disabling' : 'enabling'} Delete Protection`}
            response={error || {}}
          />
        ) : null}
        <p>
          {protectionEnabled
            ? 'Disabling the Deletion Protection will allow you to delete this cluster. Cluster deletion can result in data loss or service disruption.'
            : 'The cluster cannot be deleted if the Deletion Protection is enabled to safeguard from accidental deletion. You can disable the Deletion Protection at any time.'}
        </p>
        <br />
        <p>
          <b>{`${protectionEnabled ? 'Disable' : 'Enable'} Deletion Protection for this cluster?`}</b>
        </p>
      </Flex>
    </Modal>
  );
};

DeleteProtectionModal.modalName = modals.DELETE_PROTECTION;

export default DeleteProtectionModal;
