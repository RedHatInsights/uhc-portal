import React from 'react';
import { useDispatch } from 'react-redux';

import { Form } from '@patternfly/react-core';

import supportLinks from '~/common/supportLinks.mjs';
import { useArchiveCluster } from '~/queries/ClusterActionsQueries/useArchiveCluster';
import { useGlobalState } from '~/redux/hooks';

import ErrorBox from '../../../common/ErrorBox';
import Modal from '../../../common/Modal/Modal';
import { closeModal } from '../../../common/Modal/ModalActions';
import modals from '../../../common/Modal/modals';

const ArchiveClusterDialog = ({ onClose }: { onClose: () => void }) => {
  const modalData = useGlobalState((state) => state.modal.data) as {
    subscriptionID: string;
    name: string;
    shouldDisplayClusterName: boolean;
  };
  const subscriptionID = modalData?.subscriptionID || '';
  const displayName = modalData?.name || '';
  const shouldDisplayClusterName = !!modalData?.shouldDisplayClusterName;

  const dispatch = useDispatch();
  const closeArchiveModal = () => {
    dispatch(closeModal());
  };

  const {
    isSuccess,
    error,
    isError,
    isPending,
    mutate,
    reset: resetResponse,
  } = useArchiveCluster();

  if (isSuccess) {
    resetResponse();
    onClose();
    closeArchiveModal();
  }

  const cancelEdit = () => {
    resetResponse();
    closeArchiveModal();
  };

  const submit = () => mutate({ subscriptionID, displayName });

  return (
    <Modal
      title="Archive cluster"
      secondaryTitle={shouldDisplayClusterName ? displayName : undefined}
      data-testid="archive-cluster-dialog"
      onClose={cancelEdit}
      primaryText="Archive cluster"
      onPrimaryClick={() => {
        submit();
      }}
      isPending={isPending}
      onSecondaryClick={cancelEdit}
    >
      <>
        {isError ? <ErrorBox message="Error archiving cluster" response={error || {}} /> : null}

        <Form onSubmit={() => submit()}>
          <p>
            Archiving a cluster will remove it from the cluster list and remove the cluster from
            subscription management.
          </p>
          <p>
            This action will not delete the cluster, only remove it from OpenShift Cluster
            Manager.&nbsp;
            <a href={supportLinks.ARCHIVE_CLUSTER_KB} target="_blank" rel="noreferrer noopener">
              Instructions
            </a>
            &nbsp;for deleting a cluster may be found in the knowledge base.
          </p>
        </Form>
      </>
    </Modal>
  );
};

ArchiveClusterDialog.modalName = modals.ARCHIVE_CLUSTER;

export default ArchiveClusterDialog;
