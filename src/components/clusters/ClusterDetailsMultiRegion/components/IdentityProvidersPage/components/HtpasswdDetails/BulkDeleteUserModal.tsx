import React from 'react';
import { useDispatch } from 'react-redux';

import { Content, ContentVariants, Spinner, Stack, StackItem } from '@patternfly/react-core';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

import ErrorBox from '~/components/common/ErrorBox';
import Modal from '~/components/common/Modal/Modal';
import { closeModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useBulkDeleteHtpasswdUser } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useBulkDeleteHtpasswdUser';
import { BulkDeleteHtpasswdUserError } from '~/queries/types';
import { useGlobalState } from '~/redux/hooks';
import { HtPasswdUser } from '~/types/clusters_mgmt.v1';

const BulkDeleteUserModal = ({
  onSuccess,
  refreshHtpasswdUsers,
}: {
  onSuccess: () => void;
  refreshHtpasswdUsers: () => void;
}) => {
  const { clusterId, idpId, region, idpName, selectedUsers } = useGlobalState(
    (state) => state.modal.data,
  ) as {
    idpName: string;
    clusterId: string;
    idpId: string;
    region: string;
    user: HtPasswdUser;
    selectedUsers: HtPasswdUser[];
  };

  const { isPending, mutate, reset, failedDeletions } = useBulkDeleteHtpasswdUser(
    clusterId,
    idpId,
    region,
  );
  const hasFailedDeletions = failedDeletions?.length > 0;

  const dispatch = useDispatch();
  const addNotification = useAddNotification();

  const closeBulkDeleteUserModal = React.useCallback(() => {
    reset();
    dispatch(closeModal());
  }, [dispatch, reset]);

  const remainingUsers = selectedUsers?.length > 5 ? selectedUsers.length - 5 : undefined;

  return (
    <Modal
      title="Delete htpasswd users"
      secondaryTitle={undefined}
      onClose={closeBulkDeleteUserModal}
      primaryText="Delete users"
      primaryVariant="danger"
      onPrimaryClick={() =>
        mutate(selectedUsers, {
          onSuccess: () => {
            if (failedDeletions.length === 0) {
              closeBulkDeleteUserModal();
              refreshHtpasswdUsers();
              onSuccess();

              addNotification({
                variant: 'success',
                title: `Successfully deleted ${selectedUsers.length} users`,
                dismissable: true,
              });
            }
          },
        })
      }
      isPending={isPending}
      onSecondaryClick={closeBulkDeleteUserModal}
      isPrimaryDisabled={hasFailedDeletions}
    >
      <>
        {hasFailedDeletions
          ? failedDeletions.map((err: BulkDeleteHtpasswdUserError) => (
              <ErrorBox
                message={`A problem occurred while deleting htpasswd user "${err.username}"`}
                response={err.error}
              />
            ))
          : null}
        {isPending ? (
          <Spinner size="xl" aria-label="Deleting users" />
        ) : (
          <Stack hasGutter>
            <StackItem>
              <Content>
                <Content component={ContentVariants.p}>
                  You are about to delete <strong>{selectedUsers.length} users</strong> from the
                  identity provider <strong>{idpName}</strong>.
                </Content>
              </Content>
            </StackItem>
            <StackItem>
              <ul className="pf-v6-u-mb-md" style={{ wordBreak: 'break-word' }}>
                {selectedUsers.slice(0, 5).map((user) => (
                  <li key={user.id}>* {user.username}</li>
                ))}
                {remainingUsers ? <li> ({remainingUsers} more) </li> : null}
              </ul>
            </StackItem>
            <StackItem>
              <Content>
                <Content component={ContentVariants.p}>
                  These users will lose access to this cluster.
                </Content>
              </Content>
            </StackItem>
          </Stack>
        )}
      </>
    </Modal>
  );
};

BulkDeleteUserModal.modalName = modals.BULK_DELETE_HTPASSWD_USER;

export default BulkDeleteUserModal;
