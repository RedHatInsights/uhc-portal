import React from 'react';
import { useDispatch } from 'react-redux';

import { Spinner } from '@patternfly/react-core';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

import ErrorBox from '~/components/common/ErrorBox';
import Modal from '~/components/common/Modal/Modal';
import { modalActions } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useDeleteHtpasswdUser } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useDeleteHtpasswdUser';
import { useGlobalState } from '~/redux/hooks';

type DeleteHtpasswdUserDialogProps = {
  onSuccess: () => void;
  refreshHtpasswdUsers: () => void;
};

type ModalData = {
  clusterId: string;
  idpId: string;
  idpName: string;
  htpasswdUserId: string;
  htpasswdUserName: string;
  region: string | undefined;
};

const DeleteHtpasswdUserDialog = ({
  onSuccess,
  refreshHtpasswdUsers,
}: DeleteHtpasswdUserDialogProps) => {
  const modalData = useGlobalState((state) => state.modal.data) as ModalData;

  const { clusterId, idpId, idpName, htpasswdUserId, htpasswdUserName, region } = modalData;

  const dispatch = useDispatch();
  const addNotification = useAddNotification();

  const {
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
    reset: resetResponse,
  } = useDeleteHtpasswdUser(clusterId, idpId, region);

  const closeModal = () => {
    if (resetResponse) {
      resetResponse();
    }
    dispatch(modalActions.closeModal());
  };

  if (isSuccess) {
    resetResponse();
    refreshHtpasswdUsers();
    closeModal();
  }

  const errorContainer = isError && (
    <ErrorBox message="Error removing identity provider" response={error.error} />
  );

  return (
    <Modal
      onClose={closeModal}
      primaryText="Delete user"
      primaryVariant="danger"
      onPrimaryClick={() =>
        mutate(htpasswdUserId, {
          onSuccess: () => {
            closeModal();
            refreshHtpasswdUsers();
            onSuccess();

            addNotification({
              variant: 'success',
              title: `Successfully deleted user ${htpasswdUserName}`,
              dismissable: true,
            });
          },
        })
      }
      onSecondaryClick={closeModal}
      title="Delete htpasswd user"
      isPending={isPending}
      data-testid="delete-htpasswd-user-dialog"
    >
      {errorContainer}
      {isPending ? (
        <Spinner size="xl" aria-label="Deleting user" />
      ) : (
        <>
          <p>
            You are about to delete <strong>{htpasswdUserName}</strong> from the identity provider{' '}
            <strong>{idpName}</strong>.
          </p>
          <p>This user will lose access to this cluster.</p>
        </>
      )}
    </Modal>
  );
};

DeleteHtpasswdUserDialog.modalName = modals.DELETE_HTPASSWD_USER;

export default DeleteHtpasswdUserDialog;
