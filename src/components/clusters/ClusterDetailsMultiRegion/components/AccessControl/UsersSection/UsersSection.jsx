import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  Button,
  EmptyState,
  Icon,
  Popover,
  PopoverPosition,
  Skeleton,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons/dist/esm/icons/help-icon';
import {
  ActionsColumn,
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

import { ConfirmationDialog } from '~/common/modals/ConfirmationDialog';
import { LoadingSkeletonCard } from '~/components/clusters/common/LoadingSkeletonCard/LoadingSkeletonCard';
import shouldShowModal from '~/components/common/Modal/ModalSelectors';
import { useAddUser } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useAddUser';
import { useDeleteUser } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useDeleteUser';
import {
  refetchUsers,
  useFetchUsers,
} from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchUsers';
import { useGlobalState } from '~/redux/hooks';

import links from '../../../../../../common/installLinks.mjs';
import ButtonWithTooltip from '../../../../../common/ButtonWithTooltip';
import ErrorBox from '../../../../../common/ErrorBox';
import ExternalLink from '../../../../../common/ExternalLink';
import { modalActions } from '../../../../../common/Modal/ModalActions';

import AddUserDialog from './AddUserDialog';
import canAllowAdminHelper from './UsersHelper';

const UsersSection = (props) => {
  const { cluster, clusterHibernating, isReadOnly, region, isROSA } = props;

  const dispatch = useDispatch();

  const {
    data: users,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
    isSuccess: isUsersSuccess,
    isRefetching: isUsersRefetching,
  } = useFetchUsers(cluster.id, region);
  const {
    isPending: isAddUserPending,
    isError: isAddUserError,
    error: addUserError,
    mutate: addUserMutate,
    isSuccess: isAddUserSuccess,
    reset: resetAddUserMutate,
  } = useAddUser(cluster.id, region);
  const {
    isError: isDeleteUserError,
    error: deleteUserError,
    mutate: deleteUserMutate,
  } = useDeleteUser(cluster.id, region);

  const isAddUserModalOpen = useGlobalState((state) => shouldShowModal(state, 'add-user'));

  const canAddClusterAdmin = canAllowAdminHelper(cluster);
  const clusterGroupUsers = users;
  const hasUsers = users?.users?.length > 0;
  const [deletedRowIndex, setDeletedRowIndex] = React.useState(null);
  const [pendingDeletion, setPendingDeletion] = React.useState(null);

  React.useEffect(() => {
    if (clusterGroupUsers.clusterID !== cluster.id || !isUsersLoading) {
      refetchUsers();
    }
    // component did mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (isUsersRefetching && isUsersSuccess && deletedRowIndex !== null) {
      setDeletedRowIndex(null);
    }
  }, [isUsersRefetching, isUsersSuccess, deletedRowIndex]);

  if (!hasUsers && isUsersError) {
    return (
      <EmptyState>
        <ErrorBox message="Error getting cluster users" response={usersError.error} />
      </EmptyState>
    );
  }

  const showSkeleton = !hasUsers && isUsersRefetching;

  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const hibernatingReason =
    clusterHibernating && 'This operation is not available while cluster is hibernating';
  const canNotEditReason =
    !cluster.canEdit &&
    'You do not have permission to add a user. Only cluster owners, cluster editors, and Organization Administrators can add users.';
  const disableReason = readOnlyReason || hibernatingReason || canNotEditReason;

  const addUserBtn = (
    <ButtonWithTooltip
      onClick={() => {
        setTimeout(() => dispatch(modalActions.openModal('add-user')), 0);
      }}
      variant="secondary"
      className="access-control-add"
      disableReason={disableReason}
    >
      Add user
    </ButtonWithTooltip>
  );

  const columnNames = {
    userId: 'User ID',
    group: 'Group',
  };

  const userIdHeading = (
    <>
      {columnNames.userId}
      <Popover
        position={PopoverPosition.top}
        aria-label="User IDs"
        bodyContent={<p>User IDs are matched by the cluster&apos;s identity providers.</p>}
      >
        <Button
          icon={
            <Icon size="md">
              <HelpIcon />
            </Icon>
          }
          variant="plain"
          isInline
          aria-label="Help"
        />
      </Popover>
    </>
  );

  const groupHeading = (
    <>
      {columnNames.group}
      <Popover
        position={PopoverPosition.top}
        aria-label="Groups"
        bodyContent={
          <p>
            Groups are mapped to role bindings on the cluster. For more information check the{' '}
            <ExternalLink href={links.UNDERSTANDING_AUTHENTICATION}>
              OpenShift 4 documentation
            </ExternalLink>
          </p>
        }
      >
        <Button
          icon={
            <Icon size="md">
              <HelpIcon />
            </Icon>
          }
          variant="plain"
          isInline
          aria-label="Help"
        />
      </Popover>
    </>
  );

  const handleDeleteConfirm = () => {
    if (pendingDeletion) {
      const { user, index } = pendingDeletion;
      setDeletedRowIndex(index);
      deleteUserMutate(
        { groupID: user.group, userID: user.id },
        {
          onSuccess: () => {
            refetchUsers();
          },
        },
      );
      setPendingDeletion(null);
    }
  };

  const userRow = (user, index) =>
    deletedRowIndex === index ? (
      <Tr key={user.id}>
        <Td dataLabel={columnNames.userId}>
          <Skeleton fontSize="md" screenreaderText="Loading..." />
        </Td>
        <Td dataLabel={columnNames.group}>
          <Skeleton fontSize="md" screenreaderText="Loading..." />
        </Td>
        <Td isActionCell />
      </Tr>
    ) : (
      <Tr key={user.id}>
        <Td dataLabel={columnNames.userId} modifier="truncate">
          {user.id}
        </Td>
        <Td dataLabel={columnNames.group}>{user.group}</Td>
        <Td isActionCell>
          <ActionsColumn
            items={[
              {
                title: 'Delete',
                onClick: () => {
                  setPendingDeletion({ user, index });
                },
              },
            ]}
            isDisabled={!!disableReason}
          />
        </Td>
      </Tr>
    );

  return showSkeleton ? (
    <LoadingSkeletonCard />
  ) : (
    <>
      <Stack hasGutter>
        <StackItem>
          {isUsersError && (
            <ErrorBox message="Error getting cluster users" response={usersError.error} />
          )}
        </StackItem>
        <StackItem>
          <Title className="card-title" headingLevel="h3" size="lg">
            Cluster administrative users
          </Title>
        </StackItem>
        <StackItem>
          <p>
            <ExternalLink
              href={isROSA ? links.ROSA_AWS_IAM_OPERATOR_ROLES : links.OSD_DEDICATED_ADMIN_ROLE}
            >
              Learn more.
            </ExternalLink>
          </p>
        </StackItem>
        <StackItem>
          {isDeleteUserError && (
            <ErrorBox message="Error deleting user" response={deleteUserError.error} />
          )}
        </StackItem>
        <StackItem>
          {hasUsers && (
            <Table aria-label="Users" variant={TableVariant.compact}>
              <Thead>
                <Tr>
                  <Th>{userIdHeading}</Th>
                  <Th>{groupHeading}</Th>
                  <Th screenReaderText="User action" />
                </Tr>
              </Thead>
              <Tbody>{users?.users?.map(userRow)}</Tbody>
            </Table>
          )}
        </StackItem>
        <StackItem>{addUserBtn}</StackItem>
      </Stack>
      <AddUserDialog
        addUserMutate={addUserMutate}
        resetAddUserMutate={resetAddUserMutate}
        isAddUserSuccess={isAddUserSuccess}
        isAddUserPending={isAddUserPending}
        isAddUserError={isAddUserError}
        addUserError={addUserError}
        isOpen={isAddUserModalOpen}
        clusterID={cluster.id}
        canAddClusterAdmin={canAddClusterAdmin}
        isROSA={isROSA}
      />
      <ConfirmationDialog
        title="Are you sure you want to delete this user?"
        content="The user will be permanently removed from the cluster."
        primaryActionLabel="Delete"
        primaryAction={handleDeleteConfirm}
        secondaryActionLabel="Cancel"
        isOpen={pendingDeletion !== null}
        closeCallback={() => setPendingDeletion(null)}
      />
    </>
  );
};

UsersSection.propTypes = {
  region: PropTypes.string,
  cluster: PropTypes.object.isRequired,
  clusterHibernating: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool.isRequired,
  isROSA: PropTypes.bool.isRequired,
};

export default UsersSection;
