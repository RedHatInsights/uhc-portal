import React from 'react';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';

import { Form } from '@patternfly/react-core';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

import { useFormState } from '~/components/clusters/wizards/hooks';
import ErrorBox from '~/components/common/ErrorBox';
import Modal from '~/components/common/Modal/Modal';
import { closeModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useCreateEditHtpasswdUser } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useCreateEditHtpasswdUser';
import { useGlobalState } from '~/redux/hooks';

import {
  IdentityProvidersPageFormInitialValues,
  IdentityProvidersPageValidationSchema,
} from '../IdentityProvidersPageFormikHelpers';
import HTPasswdForm from '../ProvidersForms/HTPasswdForm';

const AddUserForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { idpName, clusterId, idpId, region } = useGlobalState((state) => state.modal.data) as {
    idpName: string;
    clusterId: string;
    idpId: string;
    region: string;
  };

  const {
    isPending,
    isError,
    error,
    isSuccess,
    reset,
    mutate: addUser,
  } = useCreateEditHtpasswdUser(clusterId, idpId, region);

  const dispatch = useDispatch();
  const addNotification = useAddNotification();

  const closeAddUserModal = React.useCallback(() => {
    reset();
    dispatch(closeModal());
  }, [dispatch, reset]);

  const { values, isValid } = useFormState();

  React.useEffect(() => {
    if (isSuccess) {
      onSuccess();
      closeAddUserModal();

      addNotification({
        variant: 'success',
        title: `Successfully added user ${values.users[0].username}`,
        dismissable: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeAddUserModal, isSuccess, onSuccess]);

  return (
    <Modal
      title="Add user"
      secondaryTitle={undefined}
      onClose={closeAddUserModal}
      primaryText="Add user"
      onPrimaryClick={() => {
        const { username, password } = values.users[0];
        addUser({ username, password });
      }}
      isPending={isPending}
      onSecondaryClick={closeAddUserModal}
      isPrimaryDisabled={!isValid}
    >
      <Form>
        <p>
          Provide a new user for identity provider <strong>{idpName}</strong>
        </p>

        {isError ? (
          <ErrorBox
            message="A problem occurred while adding htpasswd user"
            response={{
              errorMessage: error?.errorMessage,
              operationID: error?.operationID,
            }}
          />
        ) : null}
        <HTPasswdForm onlySingleItem />
      </Form>
    </Modal>
  );
};

const AddUserModal = ({ onSuccess }: { onSuccess: () => void }) => {
  const selectedIDP = 'HTPasswdIdentityProvider';
  return (
    <Formik
      enableReinitialize
      initialValues={{
        ...IdentityProvidersPageFormInitialValues(selectedIDP),
      }}
      validationSchema={IdentityProvidersPageValidationSchema(selectedIDP)}
      onSubmit={
        async (/* values */) => {
          // NOTE - API call is made using the primary button on the modal
        }
      }
    >
      {(formik) => <AddUserForm onSuccess={onSuccess} />}
    </Formik>
  );
};

AddUserModal.modalName = modals.ADD_HTPASSWD_USER;

export default AddUserModal;
