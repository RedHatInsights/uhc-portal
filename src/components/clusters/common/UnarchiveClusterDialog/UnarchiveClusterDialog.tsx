import React from 'react';
import { useDispatch } from 'react-redux';

import { Form } from '@patternfly/react-core';

import Modal from '~/components/common/Modal/Modal';
import { useUnArchiveCluster } from '~/queries/ClusterActionsQueries/useUnArchiveCluster';
import { useGlobalState } from '~/redux/hooks';

import ErrorBox from '../../../common/ErrorBox';
import { closeModal } from '../../../common/Modal/ModalActions';
import modals from '../../../common/Modal/modals';

const UnarchiveClusterDialog = ({ onClose }: { onClose: () => void }) => {
  const modalData = useGlobalState((state) => state.modal.data) as {
    subscriptionID: string;
    name: string;
    shouldDisplayClusterName: boolean;
  };
  const subscriptionID = modalData?.subscriptionID || '';
  const displayName = modalData?.name || '';
  const shouldDisplayClusterName = !!modalData?.shouldDisplayClusterName;

  const dispatch = useDispatch();
  const closeUnArchiveModal = () => {
    dispatch(closeModal());
  };

  const {
    isSuccess,
    error,
    isError,
    isPending,
    mutate,
    reset: resetResponse,
  } = useUnArchiveCluster();

  if (isSuccess) {
    resetResponse();
    onClose();
    closeUnArchiveModal();
  }

  const cancelEdit = () => {
    resetResponse();
    closeUnArchiveModal();
  };

  const submit = () => mutate({ subscriptionID, displayName });

  return (
    <Modal
      title="Unarchive cluster"
      secondaryTitle={shouldDisplayClusterName ? displayName : undefined}
      data-testid="unarchive-cluster-dialog"
      onClose={cancelEdit}
      primaryText="Unarchive cluster"
      onPrimaryClick={() => submit()}
      isPending={isPending}
      onSecondaryClick={cancelEdit}
    >
      <>
        {isError ? (
          <ErrorBox
            message="Error un-archiving cluster"
            // @ts-ignore
            response={error || {}}
          />
        ) : null}
        <Form onSubmit={() => submit()}>
          <p>
            Un-archiving a cluster will make it visible in the active (default) cluster list. You
            may need to manage subscriptions if the cluster is active.
          </p>
        </Form>
      </>
    </Modal>
  );
};

UnarchiveClusterDialog.modalName = modals.UNARCHIVE_CLUSTER;

export default UnarchiveClusterDialog;
