import React from 'react';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';

import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import getClusterName from '~/common/getClusterName';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import Modal from '~/components/common/Modal/Modal';
import { useEditClusterName } from '~/queries/ClusterActionsQueries/useEditClusterName';
import { useGlobalState } from '~/redux/hooks';
import { Subscription } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { checkClusterDisplayName } from '../../../../common/validators';
import ErrorBox from '../../../common/ErrorBox';
import { closeModal } from '../../../common/Modal/ModalActions';
import modals from '../../../common/Modal/modals';

type ModalData = {
  subscription: Subscription;
  shouldDisplayClusterName?: boolean;
};

type EditDisplayNameDialogProps = {
  onClose: () => void;
};

const EditDisplayNameDialog = ({ onClose }: EditDisplayNameDialogProps) => {
  const dispatch = useDispatch();

  const closeNameModal = () => dispatch(closeModal());

  const {
    isSuccess,
    error,
    isError,
    isPending,
    mutate,
    reset: resetResponse,
  } = useEditClusterName();

  const modalData = useGlobalState((state) => state.modal.data) as ModalData;
  const subscriptionID = get(modalData, 'subscription.id') || '';
  const displayName = getClusterName(modalData as ClusterFromSubscription);
  const shouldDisplayClusterName = modalData.shouldDisplayClusterName || false;

  const [currentDisplayName, setCurrentDisplayName] = React.useState(displayName);

  if (isSuccess) {
    resetResponse();
    closeNameModal();
    onClose();
  }

  const cancelEdit = () => {
    resetResponse();
    closeNameModal();
  };

  const validationMessage = checkClusterDisplayName(currentDisplayName);
  const handleSubmit = () => {
    if (!validationMessage) {
      if (currentDisplayName === '') {
        mutate({ subscriptionID, displayName });
      } else {
        mutate({ subscriptionID, displayName: currentDisplayName });
      }
    }
  };

  return (
    <Modal
      title="Edit display name"
      secondaryTitle={shouldDisplayClusterName ? displayName : undefined}
      data-testid="edit-displayname-modal"
      onClose={cancelEdit}
      primaryText="Edit"
      secondaryText="Cancel"
      onPrimaryClick={handleSubmit}
      onSecondaryClick={cancelEdit}
      isPrimaryDisabled={!!validationMessage || currentDisplayName === displayName}
      isPending={isPending}
    >
      <>
        {isError ? <ErrorBox message="Error changing display name" response={error || {}} /> : null}

        <Form
          onSubmit={(e) => {
            handleSubmit();
            e.preventDefault();
          }}
        >
          <FormGroup fieldId="edit-display-name-input">
            <TextInput
              type="text"
              validated={!validationMessage ? 'default' : 'error'}
              value={currentDisplayName}
              placeholder="Enter display name"
              onChange={(_event, newValue) =>
                currentDisplayName === ''
                  ? setCurrentDisplayName(newValue.trim())
                  : setCurrentDisplayName(newValue)
              }
              aria-label="Edit display name"
              id="edit-display-name-input"
            />

            <FormGroupHelperText touched error={validationMessage} />
          </FormGroup>
        </Form>
      </>
    </Modal>
  );
};

EditDisplayNameDialog.modalName = modals.EDIT_DISPLAY_NAME;

export default EditDisplayNameDialog;
