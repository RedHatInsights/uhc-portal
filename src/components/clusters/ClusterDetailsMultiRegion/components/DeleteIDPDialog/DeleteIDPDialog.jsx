import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { refetchIdentityProvidersWithHTPUsers } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchIDPsWithHTPUsers';
import { useDeleteIdentityProvider } from '~/queries/ClusterDetailsQueries/IDPPage/useDeleteIdentityProvider';
import { useGlobalState } from '~/redux/hooks';

import ErrorBox from '../../../../common/ErrorBox';
import Modal from '../../../../common/Modal/Modal';
import { modalActions } from '../../../../common/Modal/ModalActions';
import shouldShowModal from '../../../../common/Modal/ModalSelectors';

const DeleteIDPDialog = (props) => {
  const { refreshParent } = props;

  const modalData = useGlobalState((state) => state.modal.data);

  const { clusterID, idpID, idpName, idpType, region } = modalData;

  const dispatch = useDispatch();
  const isOpen = useGlobalState((state) => shouldShowModal(state, 'delete-idp'));

  const {
    isPending: isDeleteIDPPending,
    isError: isDeleteIDPError,
    error: deleteIDPError,
    mutate: deleteIDPMutate,
    isSuccess: isDeleteIDPSuccess,
  } = useDeleteIdentityProvider(clusterID, region);

  const closeDialog = React.useCallback(
    (parentShouldRefresh) => {
      dispatch(modalActions.closeModal()); // Close the dialog.
      if (parentShouldRefresh) {
        refreshParent(); // call the event handler from the parent.
      }
    },
    [dispatch, refreshParent],
  );

  React.useEffect(() => {
    if (isDeleteIDPSuccess && !isDeleteIDPError) {
      closeDialog(true);
    }
  }, [isDeleteIDPSuccess, isDeleteIDPError, closeDialog]);

  const close = () => closeDialog(false);

  const errorContainer = isDeleteIDPError && (
    <ErrorBox message="Error removing identity provider" response={deleteIDPError.error} />
  );

  return (
    isOpen && (
      <Modal
        onClose={close}
        primaryText="Remove"
        primaryVariant="danger"
        onPrimaryClick={() =>
          deleteIDPMutate(idpID, {
            onSuccess: () => {
              refetchIdentityProvidersWithHTPUsers(clusterID, region);
              closeDialog(true);
            },
          })
        }
        onSecondaryClick={close}
        title="Remove identity provider"
        isPending={isDeleteIDPPending}
      >
        {errorContainer}
        <p>
          You&apos;re about to remove the <b>{idpType}</b> identity provider{' '}
          <b>
            &quot;
            {idpName}
            &quot;
          </b>{' '}
          from this cluster.
        </p>
        <p>
          You may lose access to this cluster if you remove this identity provider. At least one
          identity provider is required to access the cluster.
        </p>
      </Modal>
    )
  );
};

DeleteIDPDialog.propTypes = {
  refreshParent: PropTypes.func,
};

export default DeleteIDPDialog;
