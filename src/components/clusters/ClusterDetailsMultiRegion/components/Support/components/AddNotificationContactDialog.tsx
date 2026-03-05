import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import Modal from '~/components/common/Modal/Modal';
import shouldShowModal from '~/components/common/Modal/ModalSelectors';
import { invalidateNotificationContacts } from '~/queries/ClusterDetailsQueries/ClusterSupportTab/useFetchNotificationContacts';
import { useGlobalState } from '~/redux/hooks';
import { AugmentedCluster } from '~/types/types';

import { validateRHITUsername } from '../../../../../../common/validators';
import { closeModal } from '../../../../../common/Modal/ModalActions';

type AddNotificationContactDialogProps = {
  cluster: AugmentedCluster;
  addNotificationMutation: (userName: string) => void;
  isAddNotificationContactSuccess: boolean;
  isAddNotificationContactPending: boolean;
  addNotificationContactError?: string;
};

const AddNotificationContactDialog = ({
  cluster,
  isAddNotificationContactPending,
  isAddNotificationContactSuccess,
  addNotificationMutation,
  addNotificationContactError,
}: AddNotificationContactDialogProps) => {
  const initialState = {
    userName: '',
    userNameTouched: false,
  };

  const isModalOpen = useGlobalState((state) => shouldShowModal(state, 'add-notification-contact'));
  const [userName, setUserName] = useState<string>(initialState.userName);
  const [userNameTouched, setUserNameTouched] = useState<boolean>(initialState.userNameTouched);
  const dispatch = useDispatch();
  const setInitialState = useCallback(() => {
    dispatch(closeModal());
    setUserName(initialState.userName);
    setUserNameTouched(initialState.userNameTouched);
  }, [dispatch, initialState.userName, initialState.userNameTouched]);

  useEffect(() => {
    if (isAddNotificationContactSuccess) {
      invalidateNotificationContacts();
      setInitialState();
    }
  }, [isAddNotificationContactSuccess, setInitialState]);

  const setUserNameValue = (userName: string) => {
    setUserName(userName);
    setUserNameTouched(true);
  };

  const validationMessage = userNameTouched
    ? validateRHITUsername(userName)
    : addNotificationContactError;

  const handleSubmit = async () => {
    if (!validationMessage && cluster?.subscription?.id) {
      setUserNameTouched(false);
      addNotificationMutation(userName);
    }
  };

  return isModalOpen ? (
    <Modal
      title="Add notification contact"
      onClose={setInitialState}
      primaryText="Add contact"
      secondaryText="Cancel"
      onPrimaryClick={handleSubmit}
      onSecondaryClick={setInitialState}
      isPrimaryDisabled={!!validationMessage || userName === ''}
      isPending={isAddNotificationContactPending}
    >
      <p className="pf-v6-u-mb-xl">
        Identify the user to be added as notification contact. These users will be contacted in the
        event of notifications about this cluster.
      </p>
      <Form
        className="control-form-cursor"
        onSubmit={(e) => {
          handleSubmit();
          e.preventDefault();
        }}
      >
        <FormGroup label="Red Hat username or email" isRequired fieldId="username">
          <TextInput
            value={userName}
            isRequired
            id="username"
            type="text"
            validated={!validationMessage ? 'default' : 'error'}
            onChange={(_event, userNameValue) => setUserNameValue(userNameValue)}
            aria-label="user name"
          />

          <FormGroupHelperText touched error={validationMessage} />
        </FormGroup>
      </Form>
    </Modal>
  ) : null;
};

export default AddNotificationContactDialog;
