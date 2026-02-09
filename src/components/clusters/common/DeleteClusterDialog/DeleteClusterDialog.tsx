import React from 'react';
import { useDispatch } from 'react-redux';

import { Flex, Form, TextInput } from '@patternfly/react-core';

import Modal from '~/components/common/Modal/Modal';
import { closeModal } from '~/components/common/Modal/ModalActions';
import { useDeleteCluster } from '~/queries/ClusterActionsQueries/useDeleteCluster';
import { useGlobalState } from '~/redux/hooks';

import ErrorBox from '../../../common/ErrorBox';
import modals from '../../../common/Modal/modals';

type DeleteClusterDialogProps = {
  onClose: (clusterDeleted?: boolean) => void;
  textContent?: string;
  title?: string;
};

type ModalData = {
  clusterName: string;
  clusterID: string;
  shouldDisplayClusterName: boolean | undefined;
  region: string | undefined;
};

const DeleteClusterDialog = ({ onClose, textContent, title }: DeleteClusterDialogProps) => {
  const [clusterNameInput, setClusterNameInput] = React.useState<string>('');
  const modalData = useGlobalState((state) => state.modal.data) as ModalData;

  const { clusterID, clusterName, shouldDisplayClusterName, region } = modalData;

  const dispatch = useDispatch();

  const closeDeleteModal = () => {
    dispatch(closeModal());
  };

  const {
    isSuccess,
    error: deleteClusterError,
    isError,
    isPending,
    mutate,
    reset: resetResponse,
  } = useDeleteCluster();

  const error = deleteClusterError;

  if (isSuccess) {
    resetResponse();
    onClose(true);
    closeDeleteModal();
  }

  const cancelEdit = () => {
    resetResponse();
    closeDeleteModal();
  };

  const errorContainer = isError && (
    <ErrorBox
      message="Error deleting cluster"
      response={{
        errorMessage: error.errorMessage,
        operationID: error.operationID,
      }}
    />
  );

  const isValid = clusterNameInput === clusterName;

  const submit = () => {
    if (isValid && !isPending) {
      mutate({
        clusterID,
        region,
      });
    }
  };

  return (
    <Modal
      title={title || 'Delete cluster'}
      secondaryTitle={shouldDisplayClusterName ? clusterName : undefined}
      onClose={cancelEdit}
      primaryText="Delete"
      onPrimaryClick={() => {
        submit();
      }}
      onSecondaryClick={cancelEdit}
      isPrimaryDisabled={!isValid}
      isPending={isPending}
      primaryVariant="danger"
      data-testid="delete-cluster-dialog"
    >
      <Flex direction={{ default: 'column' }}>
        {errorContainer}
        <p>
          {textContent ||
            'This action cannot be undone. It will uninstall the cluster, and all data will be deleted.'}
        </p>
        <p>
          {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
          Confirm deletion by typing <strong>{clusterName}</strong> below:
        </p>
        <Form onSubmit={() => submit()}>
          <TextInput
            type="text"
            value={clusterNameInput}
            placeholder="Enter name"
            onChange={(_event, newInput) => setClusterNameInput(newInput)}
            aria-label="cluster name"
          />
        </Form>
      </Flex>
    </Modal>
  );
};

DeleteClusterDialog.modalName = modals.DELETE_CLUSTER;

export default DeleteClusterDialog;
