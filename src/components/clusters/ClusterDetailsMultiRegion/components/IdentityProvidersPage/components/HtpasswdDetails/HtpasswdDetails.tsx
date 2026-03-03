import React from 'react';
import { useDispatch } from 'react-redux';

import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Pagination,
  PaginationVariant,
  SearchInput,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ActionsColumn, Table, Tbody, Td, Th, Thead, ThProps, Tr } from '@patternfly/react-table';

import ErrorBox from '~/components/common/ErrorBox';
import ConnectedModal from '~/components/common/Modal/ConnectedModal';
import { modalActions, openModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useFetchHtpasswdUsers } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchHtpasswdUsers';
import { HtPasswdUser } from '~/types/clusters_mgmt.v1';

import AddUserModal from './AddUserModal';
import BulkDeleteUserModal from './BulkDeleteUserModal';
import DeleteHtpasswdUserDialog from './DeleteHtpasswdUserDialog';
import EditUserModal from './EditUserModal';
import EmptyState from './EmptyState';

type Props = {
  idpName: string;
  idpId: string;
  clusterId: string;
  idpActions?: {
    [action: string]: boolean;
  };
  region?: string;
  isSingleUserHtpasswd?: boolean;
};

const HtpasswdDetails = ({
  idpId,
  clusterId,
  region,
  idpName,
  idpActions,
  isSingleUserHtpasswd,
}: Props) => {
  const dispatch = useDispatch();
  const { isLoading, users, isError, error, isFetching, refetch } = useFetchHtpasswdUsers(
    clusterId,
    idpId,
    region,
  );

  const [activeSortIndex, setActiveSortIndex] = React.useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);
  const [searchValue, setSearchValue] = React.useState('');

  const [filteredUsers, setFilteredUsers] = React.useState<HtPasswdUser[]>(users);
  const [userToBeDeletedId, setUserToBeDeletedId] = React.useState<string | undefined>('');

  const isSearching = !!searchValue.length;

  const refreshHtpasswdUsers = () => {
    if (!isLoading && !isError) {
      refetch();
    }
  };

  // Pagination
  const onSetPage = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const onPerPageSelect = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPerPage: number,
    newPage: number,
  ) => {
    setPerPage(newPerPage);
    setPage(newPage < 1 ? 1 : newPage);
  };

  // Sorting
  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc', // starting sort direction when first sorting a column. Defaults to 'asc'
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  // Ensure that the order in the array matches the order of the headers
  const getSortableUserValues = (user: HtPasswdUser) => [user.username];

  const sortUsers = React.useCallback(
    (a: HtPasswdUser, b: HtPasswdUser) => {
      const aValue = getSortableUserValues(a)[activeSortIndex];
      const bValue = getSortableUserValues(b)[activeSortIndex];

      // String sort
      if (activeSortDirection === 'asc') {
        return (aValue as string).localeCompare(bValue as string);
      }
      return (bValue as string).localeCompare(aValue as string);
    },
    [activeSortDirection, activeSortIndex],
  );

  // Filtering
  React.useEffect(() => {
    if (users.length > 0) {
      if (searchValue !== '') {
        setFilteredUsers(
          users.filter((user) => user.username?.includes(searchValue)).sort(sortUsers),
        );
      } else {
        setFilteredUsers([...users.sort(sortUsers)]);
      }

      // if current page no longer exists - then go to the last available page
      if (filteredUsers.length <= (page - 1) * perPage) {
        setPage(Math.floor(filteredUsers.length / perPage) || 1);
      }
    } else if (filteredUsers.length !== 0) {
      setFilteredUsers([]);
    }
  }, [filteredUsers.length, page, perPage, searchValue, sortUsers, users, activeSortDirection]);

  // Selecting
  const selectableUsers = filteredUsers;

  const [selectedUsers, setSelectedUsers] = React.useState<HtPasswdUser[]>([]);
  const selectableUserIds = selectableUsers.map((user) => user.id);
  const selectedUserIds = selectedUsers.map((user) => user.id);

  const setUserSelected = (user: HtPasswdUser, isSelecting = true) =>
    setSelectedUsers((prevSelected: HtPasswdUser[]) => {
      const otherSelectedUsers = prevSelected.filter((u) => u.id !== user.id);
      return isSelecting ? [...otherSelectedUsers, user] : otherSelectedUsers;
    });

  const selectAllUsers = (isSelecting = true) =>
    setSelectedUsers(isSelecting ? selectableUsers.map((user: HtPasswdUser) => user) : []);

  const areAllUsersSelected = selectedUserIds.length === selectableUserIds.length;
  const isUserSelected = (user: HtPasswdUser) => selectedUserIds.includes(user.id);

  const onSelectUser = (user: HtPasswdUser, isSelecting: boolean) => {
    setUserSelected(user, isSelecting);
  };

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;

  const currentPageUsers = filteredUsers.slice(startIndex, endIndex);

  const deleteableUsers = !isSearching
    ? selectedUsers
    : currentPageUsers.filter((user) => selectedUserIds.includes(user.id));

  const deleteableUserIds = deleteableUsers.map((user) => user.id);

  const headers = [{ name: 'Username', sortable: true }];

  const headerRow = (
    <Thead>
      <Tr>
        {idpActions?.update && filteredUsers.length > 0 ? (
          <Th
            select={{
              onSelect: (_event, isSelecting) => selectAllUsers(isSelecting),
              isSelected: areAllUsersSelected,
            }}
            aria-label="Row select"
          />
        ) : null}
        {headers.map((header, index) => (
          <Th key={header.name} sort={header.sortable ? getSortParams(index) : undefined}>
            {header.name}
          </Th>
        ))}
        <Th screenReaderText="User actions" />
      </Tr>
    </Thead>
  );

  const userRow = (user: HtPasswdUser, rowIndex: any) => {
    const actions = [
      {
        title: 'Change password',
        onClick: () => {
          dispatch(openModal(modals.EDIT_HTPASSWD_USER, { clusterId, idpId, user, region }));
        },
      },
      {
        title: 'Delete',
        onClick: () => {
          dispatch(
            modalActions.openModal(modals.DELETE_HTPASSWD_USER, {
              clusterId,
              idpId,
              idpName,
              htpasswdUserName: user.username,
              htpasswdUserId: user.id,
              region,
            }),
          );
          setUserToBeDeletedId(user.id);
        },
      },
    ];
    return (
      <Tr key={user.id}>
        {idpActions?.update && filteredUsers.length > 0 ? (
          <Td
            select={{
              rowIndex,
              onSelect: (_event, isSelecting) => onSelectUser(user, isSelecting),
              isSelected: isUserSelected(user),
            }}
          />
        ) : null}
        <Td className="pf-v6-u-text-break-word">{user.username}</Td>
        <Td isActionCell>
          {actions && idpActions?.update && !isSingleUserHtpasswd ? (
            <ActionsColumn items={actions} />
          ) : null}
        </Td>
      </Tr>
    );
  };

  if (isLoading || isFetching) {
    return (
      <Card>
        <CardBody>
          <Spinner className="pf-v6-u-text-align-center" />
        </CardBody>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody>
          <ErrorBox
            message="A problem occurred while retrieving htpasswd users"
            response={{
              errorMessage: error?.errorMessage,
              operationID: error?.operationID,
            }}
          />
        </CardBody>
      </Card>
    );
  }

  const paginationProps = {
    itemCount: filteredUsers.length,
    perPage,
    page,
    onSetPage,
    onPerPageSelect,
  };

  return (
    <Card>
      <CardBody>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                placeholder="Filter by username"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
                aria-label="Filter by username"
              />
            </ToolbarItem>
            {idpActions?.update && !isSingleUserHtpasswd ? (
              <>
                <ToolbarItem>
                  <Button
                    variant={ButtonVariant.secondary}
                    onClick={() => {
                      dispatch(
                        openModal(modals.BULK_DELETE_HTPASSWD_USER, {
                          idpName,
                          clusterId,
                          idpId,
                          region,
                          selectedUsers: deleteableUsers,
                        }),
                      );
                    }}
                    isDisabled={deleteableUsers?.length === 0}
                  >
                    Delete
                  </Button>
                </ToolbarItem>
                <ToolbarItem>
                  <Button
                    variant={ButtonVariant.secondary}
                    onClick={() => {
                      dispatch(
                        openModal(modals.ADD_HTPASSWD_USER, {
                          idpName,
                          clusterId,
                          idpId,
                          region,
                        }),
                      );
                    }}
                  >
                    Add user
                  </Button>
                </ToolbarItem>
              </>
            ) : null}
            <ToolbarItem align={{ default: 'alignEnd' }} variant="pagination">
              <Pagination {...paginationProps} isCompact aria-label="Pagination top" />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        <Table>
          {headerRow}
          <Tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers
                .slice(startIndex, endIndex)
                .map((user: HtPasswdUser, rowIndex) => userRow(user, rowIndex))
            ) : (
              <Tr>
                <Td colSpan={headers.length + 1}>
                  <EmptyState showClearFilterButton={!!searchValue} resetFilters={setSearchValue} />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
        <Pagination
          {...paginationProps}
          variant={PaginationVariant.bottom}
          titles={{ paginationAriaLabel: 'Pagination bottom' }}
        />
      </CardBody>

      <ConnectedModal
        // @ts-ignore
        ModalComponent={AddUserModal}
        onSuccess={() => {
          setSearchValue('');
          refetch();
        }}
      />

      <ConnectedModal
        // @ts-ignore
        ModalComponent={EditUserModal}
        onSuccess={() => {
          refetch();
        }}
      />

      <ConnectedModal
        // @ts-ignore
        ModalComponent={BulkDeleteUserModal}
        onSuccess={() => {
          setSelectedUsers(selectedUsers.filter((user) => !deleteableUserIds.includes(user.id)));
          refetch();
        }}
        refreshHtpasswdUsers={refreshHtpasswdUsers}
      />

      <ConnectedModal
        // @ts-ignore
        ModalComponent={DeleteHtpasswdUserDialog}
        onSuccess={() => {
          setSelectedUsers(selectedUsers.filter((user) => user.id !== userToBeDeletedId));
          setUserToBeDeletedId('');
        }}
        refreshHtpasswdUsers={refreshHtpasswdUsers}
      />
    </Card>
  );
};

export default HtpasswdDetails;
