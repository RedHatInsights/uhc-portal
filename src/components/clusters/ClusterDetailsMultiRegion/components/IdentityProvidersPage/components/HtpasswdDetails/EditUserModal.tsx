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
import { HtPasswdUser } from '~/types/clusters_mgmt.v1';

import {
  IdentityProvidersPageFormInitialValues,
  IdentityProvidersPageValidationSchema,
} from '../IdentityProvidersPageFormikHelpers';
import HTPasswdForm from '../ProvidersForms/HTPasswdForm';

const EditUserForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { clusterId, idpId, region, user } = useGlobalState((state) => state.modal.data) as {
    idpName: string;
    clusterId: string;
    idpId: string;
    region: string;
    user: HtPasswdUser;
  };

  const {
    isPending,
    isError,
    error,
    isSuccess,
    reset,
    mutate: editUser,
  } = useCreateEditHtpasswdUser(clusterId, idpId, region);

  const dispatch = useDispatch();
  const addNotification = useAddNotification();

  const closeAddUserModal = React.useCallback(() => {
    reset();
    dispatch(closeModal());
  }, [dispatch, reset]);

  const { values, isValid } = useFormState();

  const { username, id } = user;

  React.useEffect(() => {
    if (isSuccess) {
      onSuccess();
      closeAddUserModal();

      addNotification({
        variant: 'success',
        title: `Successfully edited user ${username}`,
        dismissable: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeAddUserModal, isSuccess, onSuccess]);

  return (
    <Modal
      title="Edit user"
      secondaryTitle={undefined}
      onClose={closeAddUserModal}
      primaryText="Edit user"
      onPrimaryClick={() => {
        const { password } = values.users[0];

        editUser({ username: username || '', password, userID: id });
      }}
      isPending={isPending}
      onSecondaryClick={closeAddUserModal}
      isPrimaryDisabled={!isValid}
    >
      <Form>
        <p>
          Change password for <strong>{username}</strong>
        </p>

        {isError ? (
          <ErrorBox
            message={`A problem occurred while editing htpasswd user ${username}`}
            response={{
              errorMessage: error?.errorMessage,
              operationID: error?.operationID,
            }}
          />
        ) : null}
        <HTPasswdForm onlySingleItem isEdit user={user} />
      </Form>
    </Modal>
  );
};

const EditUserModal = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useGlobalState((state) => state.modal.data) as {
    user: HtPasswdUser;
  };
  const selectedIDP = 'HTPasswdIdentityProvider';

  const initialValues = {
    ...IdentityProvidersPageFormInitialValues(selectedIDP),
    users: [{ username: user.username }],
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={IdentityProvidersPageValidationSchema(selectedIDP)}
      onSubmit={
        async (/* values */) => {
          // NOTE - API call is made using the primary button on the modal
        }
      }
    >
      {(formik) => <EditUserForm onSuccess={onSuccess} />}
    </Formik>
  );
};

EditUserModal.modalName = modals.EDIT_HTPASSWD_USER;

export default EditUserModal;
