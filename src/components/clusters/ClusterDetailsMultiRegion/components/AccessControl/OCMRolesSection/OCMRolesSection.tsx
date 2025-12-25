import React, { ReactNode, useEffect, useState } from 'react';
import get from 'lodash/get';
import map from 'lodash/map';
import { useDispatch } from 'react-redux';

import {
  Button,
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
  IRowCell,
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
import { useDeleteOCMRole } from '~/queries/ClusterDetailsQueries/AccessControlTab/OCMRolesQueries/useDeleteOCMRole';
import {
  refetchOcmRoles,
  useFetchOCMRoles,
} from '~/queries/ClusterDetailsQueries/AccessControlTab/OCMRolesQueries/useFetchOCMRoles';
import { useGrantOCMRole } from '~/queries/ClusterDetailsQueries/AccessControlTab/OCMRolesQueries/useGrantOCMRole';
import { useGlobalState } from '~/redux/hooks';
import { Subscription } from '~/types/accounts_mgmt.v1';

import ButtonWithTooltip from '../../../../../common/ButtonWithTooltip';
import ErrorBox from '../../../../../common/ErrorBox';
import { openModal } from '../../../../../common/Modal/ModalActions';
import modals from '../../../../../common/Modal/modals';
import { eventTypes } from '../../../clusterDetailsHelper';

import { OCMRolesDialog, OCMRolesDialogProps } from './OCMRolesDialog';
import { OCMRolesRow } from './OCMRolesRow';

type OCMRolesSectionProps = {
  subscription: Subscription;
  canEditOCMRoles: boolean;
  canViewOCMRoles: boolean;
  refreshEvent?: object;
};

type PendingDeletion = {
  role: OCMRolesRow;
  rowIndex: number;
} | null;

function OCMRolesSection({
  subscription,
  canEditOCMRoles,
  canViewOCMRoles,
  refreshEvent,
}: OCMRolesSectionProps) {
  const [rows, setRows] = useState<OCMRolesRow[]>([]);
  const [pendingRowIndex, setPendingRowIndex] = useState<number>(-1);
  const [errorBox, setErrorBox] = useState<ReactNode>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [disableReason, setDisableReason] = useState('');
  const { data: modalData } = useGlobalState((state) => state.modal);
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion>(null);

  const subscriptionID = subscription.id;

  const {
    data: ocmRoles,
    isLoading: isOcmRolesLoading,
    isError: isOcmRolesError,
    error: ocmRolesError,
    isSuccess: isFetchOcmRolesSuccess,
  } = useFetchOCMRoles(canEditOCMRoles, canViewOCMRoles, subscriptionID);
  const {
    isPending: isGrantOcmRolePending,
    isError: isGrantOcmRoleError,
    error: grantOcmRoleError,
    isSuccess: isGrantOcmRoleSuccess,
    mutate: grantOcmRoleMutate,
    reset: resetGrantOcmRoleMutation,
  } = useGrantOCMRole(subscriptionID);
  const {
    isPending: isDeleteOcmRolePending,
    isError: isDeleteOcmRoleError,
    error: deleteOcmRoleError,
    isSuccess: isDeleteOcmRoleSuccess,
    mutate: deleteOcmRoleMutate,
  } = useDeleteOCMRole(subscriptionID);

  const productId = subscription?.plan?.id;

  const dispatch = useDispatch();
  // showPendingRow replaces a row by a skeletonRow.
  // it hints the user the row is being modified.
  const showPendingRow = (rowIdx: number) => {
    if (rowIdx !== null && rowIdx >= 0 && rowIdx < rows.length) {
      const updatedRows = rows.slice();
      updatedRows[rowIdx].setIsPending(true);
      setPendingRowIndex(rowIdx);
      setRows(updatedRows);
    }
  };

  // clearPendingRow clears the pending row if it exists.
  const clearPendingRow = () => {
    if (pendingRowIndex >= 0 && pendingRowIndex < rows.length) {
      const pendingRow = rows[pendingRowIndex];
      const updatedRows = rows.slice();
      if (pendingRow.isCreating) {
        // remove the placeholder row for adding
        updatedRows.splice(pendingRowIndex, 1);
      } else {
        // switch back from the skeletonRow
        updatedRows[pendingRowIndex].setIsPending(false);
      }
      setRows(updatedRows);
    }
    setPendingRowIndex(-1);
  };

  // handle mounted and unmounted
  useEffect(() => {
    // fetch roles when mounted.
    if (canViewOCMRoles && subscription.id) {
      setPageLoading(true);
      refetchOcmRoles();
    }

    if (!canViewOCMRoles) {
      setDisableReason(
        "You don't have permission to view user roles in your organization. Only the Cluster Owner, Cluster Editor, and the Organization Admin have the permission.",
      );
    } else if (!canEditOCMRoles) {
      setDisableReason(
        "You don't have permission to configure user roles in your organization. Only the Cluster Owner and the Organization Admin have the permission.",
      );
    } else {
      setDisableReason('');
    }
  }, [canViewOCMRoles, canEditOCMRoles, subscription.id]);

  // handle user clicked refresh
  useEffect(() => {
    if (canViewOCMRoles && get(refreshEvent, 'type') === eventTypes.CLICKED && subscription.id) {
      setPageLoading(true);
      refetchOcmRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshEvent]);

  // GET_OCM_ROLES
  useEffect(() => {
    if (isOcmRolesLoading) {
      setErrorBox(null);
    } else if (!isOcmRolesLoading && !isOcmRolesError) {
      // update the rows
      setPageLoading(false);
      const items = ocmRoles?.items ?? [];
      const updatedRows = map(items, (item, rowIdx) => new OCMRolesRow(item, rowIdx.toString()));
      setRows(updatedRows);
      setErrorBox(null);
    } else if (isOcmRolesError && ocmRolesError.error) {
      // display error
      setPageLoading(false);
      setErrorBox(
        <ErrorBox
          message="Error getting OCM roles and access"
          response={{
            errorMessage: ocmRolesError.error.reason,
            operationID: ocmRolesError.error.errorCode?.toString(),
          }}
        />,
      );
      clearPendingRow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOcmRolesLoading, isOcmRolesError, isFetchOcmRolesSuccess, pageLoading]);

  // GRANT_OCM_ROLE
  useEffect(() => {
    if (isGrantOcmRolePending) {
      setErrorBox(null);
    } else if (isGrantOcmRoleSuccess && subscription.id) {
      // fetch roles again when a role has been added
      refetchOcmRoles();
      setErrorBox(null);
    } else if (isGrantOcmRoleError && grantOcmRoleError.error) {
      clearPendingRow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGrantOcmRolePending, isGrantOcmRoleSuccess, isGrantOcmRoleError]);

  // DELETE_OCM_ROLE
  useEffect(() => {
    if (isDeleteOcmRolePending) {
      setErrorBox(null);
    } else if (isDeleteOcmRoleSuccess && subscription.id) {
      // fetch roles again when a role has been deleted
      refetchOcmRoles();
      setErrorBox(null);
    } else if (isDeleteOcmRoleError && deleteOcmRoleError) {
      // display error
      setErrorBox(
        <ErrorBox
          message="Error removing the role from the user"
          response={deleteOcmRoleError.error}
        />,
      );
      clearPendingRow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeleteOcmRolePending, isDeleteOcmRoleSuccess, isDeleteOcmRoleError, deleteOcmRoleError]);

  const handleGrantRoleButtonClick = () => {
    const rowIdx = rows.length;
    const row = new OCMRolesRow(null, rowIdx.toString());
    setTimeout(() => dispatch(openModal(modals.OCM_ROLES, row)), 0);
  };

  const handleDialogSubmit: OCMRolesDialogProps['onSubmit'] = (row, username, roleID) => {
    clearPendingRow();
    if (row.isCreating && subscription.id) {
      grantOcmRoleMutate(
        { username, roleID },
        {
          onSuccess: () => {
            refetchOcmRoles();
          },
        },
      );
    } else {
      // TODO OCM RBAC phase 2: this could be handled by two APIs - delete then add.
    }
  };

  const columnNames = {
    username: 'Username',
    role: 'Role',
  };

  const usernameHeader = (
    <>
      {columnNames.username}
      <Popover
        position={PopoverPosition.top}
        aria-label="Username"
        id="ocm-roles-section-username"
        bodyContent={
          <p>The username is the Red Hat login that is used to access the Red Hat account.</p>
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
        />
      </Popover>
    </>
  );

  // TODO OCM RBAC phase: add the "learn more" link of links.OCM_DOCS_ROLES_AND_ACCESS
  const roleHeader = (
    <>
      {columnNames.role}
      <Popover
        position={PopoverPosition.top}
        aria-label="Role"
        id="ocm-roles-section-role"
        bodyContent={<p>The OpenShift Cluster Manager role that is granted to this user.</p>}
      >
        <Button
          icon={
            <Icon size="md">
              <HelpIcon />
            </Icon>
          }
          variant="plain"
          isInline
        />
      </Popover>
    </>
  );
  const handleDeleteConfirm = () => {
    if (pendingDeletion) {
      const { role, rowIndex } = pendingDeletion;
      clearPendingRow();
      if (subscription.id && role.id) {
        showPendingRow(rowIndex);
        deleteOcmRoleMutate(role.id, {
          onSuccess: () => {
            refetchOcmRoles();
          },
        });
      }
      setPendingDeletion(null);
    }
  };

  const actions = (role: OCMRolesRow, rowIndex: number) => [
    // TODO OCM RBAC phase 2: may require an Edit to change between editor or viewer
    /*
    {
      title: 'Edit role',
      onClick: (_, rowIdx, row) => { setTimeout(() => dispatch(openModal(modals.OCM_ROLES, row)), 0); },
      className: 'hand-pointer',
      itemKey: 'edit-acton',
      isSeparator: false,
    },
    */
    {
      title: 'Delete',
      onClick: () => {
        setPendingDeletion({ role, rowIndex });
      },
    },
  ];

  const isIRowCell = (row: IRowCell | React.ReactNode): row is IRowCell =>
    (row as IRowCell).title !== undefined;

  const roleRow = (role: OCMRolesRow, index: number) => {
    const rowActions = actions(role, index);
    const { cellsData, usernameValue } = role;
    const username = isIRowCell(cellsData?.[0]) ? cellsData?.[0].title : cellsData?.[0];
    const roleLabel = isIRowCell(cellsData?.[1]) ? cellsData?.[1].title : cellsData?.[1];

    return role.isCreating || role.isPending ? (
      <Tr key={usernameValue}>
        <Td dataLabel={columnNames.username}>
          <Skeleton fontSize="md" screenreaderText="Loading..." />
        </Td>
        <Td dataLabel={columnNames.role}>
          <Skeleton fontSize="md" screenreaderText="Loading..." />
        </Td>
        <Td isActionCell />
      </Tr>
    ) : (
      <Tr key={usernameValue}>
        <Td dataLabel={columnNames.username}>{username as React.ReactNode}</Td>
        <Td dataLabel={columnNames.role}>{roleLabel as React.ReactNode}</Td>
        <Td isActionCell>
          <ActionsColumn items={rowActions} isDisabled={!!disableReason} />
        </Td>
      </Tr>
    );
  };

  return pageLoading ? (
    <LoadingSkeletonCard />
  ) : (
    <Stack>
      <StackItem>
        <Title className="card-title" headingLevel="h3" size="lg">
          OCM Roles and Access
        </Title>
        <p>
          Allow users in your organization to edit clusters. These permissions only apply to cluster
          management in OpenShift Cluster Manager.
        </p>
        <ButtonWithTooltip
          onClick={handleGrantRoleButtonClick}
          variant="secondary"
          className="access-control-add"
          disableReason={disableReason}
          data-testid="grant-role-btn"
        >
          Grant role
        </ButtonWithTooltip>
        {errorBox}
      </StackItem>
      <StackItem>
        <Table aria-label="OCM Roles and Access" variant={TableVariant.compact}>
          <Thead>
            <Tr>
              <Th>{usernameHeader}</Th>
              <Th>{roleHeader}</Th>
              <Th screenReaderText="Role action" />
            </Tr>
          </Thead>
          <Tbody>{rows.map(roleRow)}</Tbody>
        </Table>
        <OCMRolesDialog
          onSubmit={handleDialogSubmit}
          row={modalData as OCMRolesRow}
          productId={productId}
          isGrantOcmRolePending={isGrantOcmRolePending}
          isGrantOcmRoleError={isGrantOcmRoleError}
          grantOcmRoleError={grantOcmRoleError}
          isGrantOcmRoleSuccess={isGrantOcmRoleSuccess}
          resetGrantOcmRoleMutation={resetGrantOcmRoleMutation}
        />
        <ConfirmationDialog
          title="Are you sure you want to delete this role?"
          content="The role will be permanently removed for this user."
          primaryActionLabel="Delete"
          primaryAction={handleDeleteConfirm}
          secondaryActionLabel="Cancel"
          isOpen={pendingDeletion !== null}
          closeCallback={() => setPendingDeletion(null)}
        />
      </StackItem>
    </Stack>
  );
}

export default OCMRolesSection;
