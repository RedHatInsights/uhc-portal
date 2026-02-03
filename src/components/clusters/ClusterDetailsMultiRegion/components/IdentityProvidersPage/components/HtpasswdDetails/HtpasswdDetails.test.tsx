import React from 'react';
import * as reactRedux from 'react-redux';

import { useFetchHtpasswdUsers } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchHtpasswdUsers';
import { checkAccessibility, render, screen, waitFor, within } from '~/testUtils';
import { HtPasswdUser } from '~/types/clusters_mgmt.v1';

import HtpasswdDetails from './HtpasswdDetails';

jest.mock(
  '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchHtpasswdUsers',
  () => ({
    useFetchHtpasswdUsers: jest.fn(),
  }),
);

jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
}));

const createUsers = (numberOfUsers: number) => {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const users: HtPasswdUser[] = [];

  let index = 0;
  while (users.length < numberOfUsers) {
    for (let i = 0; i < letters.length; i += 1) {
      const letter = letters[i];
      users.push({ username: `${letter}${index}-user`, id: `${letter}${index}-id` });
    }
    index += 1;
  }
  return users.slice(0, numberOfUsers);
};

const getDataRows = () => {
  const table = screen.getByRole('grid');
  const tbody = within(table).getAllByRole('rowgroup')[1];
  const dataRows = within(tbody).getAllByRole('row');
  return dataRows;
};

const getPaginationToggle = (container: HTMLElement): HTMLElement => {
  const toggle = container.querySelector('#options-menu-bottom-toggle') as HTMLElement;
  expect(toggle).toBeInTheDocument();
  return toggle;
};

const defaultProps = {
  idpName: 'myIdpName',
  idpId: 'myIdpId',
  clusterId: 'myClusterId',
  idpActions: {
    list: true,
    update: true,
    delete: true,
  },
};

describe('<HtpasswdDetails />', () => {
  const useFetchHtpasswdUsersMocked = useFetchHtpasswdUsers as jest.Mock;
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('shows data', () => {
    it('is accessible', async () => {
      const users = createUsers(20);

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const { container } = render(<HtpasswdDetails {...defaultProps} />);

      const dataRows = getDataRows();

      expect(dataRows).toHaveLength(20);

      await checkAccessibility(container);
    });

    it('in table correctly when update is allowed', () => {
      // NOTE this assumes that the items are initially sorted by username asc
      const users = createUsers(20);
      const usersSorted = [...users].sort((a, b) =>
        (a.username as string).localeCompare(b.username as string),
      );

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      render(<HtpasswdDetails {...defaultProps} />);

      const dataRows = getDataRows();

      expect(dataRows).toHaveLength(20);
      dataRows.forEach((row, index) => {
        const userCell = within(row).getAllByRole('cell')[1];
        expect(userCell).toHaveTextContent(usersSorted[index].username || '');
      });
    });

    it('in table correctly when update is not allowed', () => {
      // NOTE this assumes that the items are initially sorted by username asc
      const users = createUsers(20);
      const usersSorted = [...users].sort((a, b) =>
        (a.username as string).localeCompare(b.username as string),
      );

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const newProps = { ...defaultProps, idpActions: { update: false } };

      render(<HtpasswdDetails {...newProps} />);

      const dataRows = getDataRows();

      expect(dataRows).toHaveLength(20);
      dataRows.forEach((row, index) => {
        const userCell = within(row).getAllByRole('cell')[0];
        expect(userCell).toHaveTextContent(usersSorted[index].username || '');
      });
    });

    it('shows a change password action', async () => {
      const users = createUsers(1);
      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });
      const { user } = render(<HtpasswdDetails {...defaultProps} />);
      const dataRows = getDataRows();
      const cells = within(dataRows[0]).getAllByRole('cell');
      const actionCell = cells[cells.length - 1];

      expect(screen.queryByRole('menuitem', { name: 'Change password' })).not.toBeInTheDocument();

      await user.click(within(actionCell).getByRole('button', { name: 'Kebab toggle' }));

      await user.click(screen.getByRole('menuitem', { name: 'Change password' }));

      expect(mockedDispatch.mock.calls[0][0].type).toEqual('OPEN_MODAL');
      expect(mockedDispatch.mock.calls[0][0].payload.name).toEqual('EDIT_HTPASSWD_USER');
      expect(mockedDispatch.mock.calls[0][0].payload.data.user).toEqual({
        username: 'a0-user',
        id: 'a0-id',
      });
    });

    it('shows empty state when no users are received', () => {
      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users: [],
        isError: false,
        error: null,
      });

      render(<HtpasswdDetails {...defaultProps} />);
      const dataRows = getDataRows();
      expect(dataRows).toHaveLength(1);
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('shows loading spinner when loading data', () => {
      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: true,
        users: [],
        isError: false,
        error: null,
      });

      render(<HtpasswdDetails {...defaultProps} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('shows error when an error occurs while loading users', () => {
      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users: [],
        isError: true,
        error: {
          errorMessage: 'I am an error message',
          reason: 'I am an error reason',

          operationID: 'myOperationId',
        },
      });

      render(<HtpasswdDetails {...defaultProps} />);

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(within(errorAlert).getByText('I am an error message')).toBeInTheDocument();
      expect(within(errorAlert).getByText('Operation ID: myOperationId')).toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    it('shows proper number of pages', () => {
      // this assumes the initial per page value is 20
      const users = createUsers(60);
      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const { container } = render(<HtpasswdDetails {...defaultProps} />);

      expect(getPaginationToggle(container)).toHaveTextContent('1 - 20 of 60');

      const pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(1);
      expect(pageTextBox).toHaveAttribute('min', '1');
      expect(pageTextBox).toHaveAttribute('max', '3');
    });

    it('adjusts number of pages when per-page changes', async () => {
      const users = createUsers(60);
      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const { user, container } = render(<HtpasswdDetails {...defaultProps} />);
      await user.click(getPaginationToggle(container));

      await user.click(screen.getByText('10 per page'));
      expect(getPaginationToggle(container)).toHaveTextContent('1 - 10 of 60');

      const pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(1);
      expect(pageTextBox).toHaveAttribute('min', '1');
      expect(pageTextBox).toHaveAttribute('max', '6');
    });

    it('moving between pages adjusts the items shown', async () => {
      const users = createUsers(25);
      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const { user } = render(<HtpasswdDetails {...defaultProps} />);

      expect(screen.getByText('a1-user')).toBeInTheDocument();
      expect(screen.queryByText('h1-user')).not.toBeInTheDocument();

      let pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(1);

      await user.click(screen.getAllByRole('button', { name: 'Go to next page' })[0]);

      expect(screen.queryByText('a1-user')).not.toBeInTheDocument();
      expect(screen.getByText('h1-user')).toBeInTheDocument();

      pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(2);

      await user.click(screen.getAllByRole('button', { name: 'Go to previous page' })[0]);

      expect(screen.getByText('a1-user')).toBeInTheDocument();
      expect(screen.queryByText('h1-user')).not.toBeInTheDocument();

      pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(1);
    });
  });

  describe('sorting', () => {
    it('it sorts correctly when there is 1 page', async () => {
      const users = createUsers(20);
      const usersSorted = [...users].sort((a, b) =>
        (a.username as string).localeCompare(b.username as string),
      );

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const { user } = render(<HtpasswdDetails {...defaultProps} />);

      const dataRows = getDataRows();

      expect(dataRows).toHaveLength(20);
      dataRows.forEach((row, index) => {
        const userCell = within(row).getAllByRole('cell')[1];

        expect(userCell).toHaveTextContent(usersSorted[index].username || '');
      });

      await user.click(screen.getByRole('button', { name: 'Username' }));

      usersSorted.reverse();

      const dataRows2 = getDataRows();
      dataRows2.forEach((row, index) => {
        const userCell = within(row).getAllByRole('cell')[1];

        expect(userCell).toHaveTextContent(usersSorted[index].username || '');
      });
    });

    it('it sorts correctly when there are multiple pages', async () => {
      const users = createUsers(40);
      const usersSorted = [...users].sort((a, b) =>
        (a.username as string).localeCompare(b.username as string),
      );

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const { user } = render(<HtpasswdDetails {...defaultProps} />);

      const dataRows = getDataRows();
      const firstUser = usersSorted[1].username || '';
      const lastUser = usersSorted[usersSorted.length - 1].username || '';

      const userCellInFirstRow = within(dataRows[1]).getAllByRole('cell')[1];
      expect(userCellInFirstRow).toHaveTextContent(firstUser);
      expect(screen.queryByText(lastUser)).not.toBeInTheDocument();

      // Sort
      await user.click(screen.getByRole('button', { name: 'Username' }));

      const dataRows2 = getDataRows();
      const userCellInFirstRow2 = within(dataRows2[0]).getAllByRole('cell')[1];
      expect(userCellInFirstRow2).toHaveTextContent(lastUser);
      expect(screen.queryByText(firstUser)).not.toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    it('it filters when text is entered into the filter box', async () => {
      const users = createUsers(20);
      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const { user } = render(<HtpasswdDetails {...defaultProps} />);
      const dataRowsBefore = getDataRows();
      expect(dataRowsBefore).toHaveLength(20);

      expect(screen.getByText('b0-user')).toBeInTheDocument();
      await user.type(screen.getByLabelText('Filter by username'), 'a');
      const dataRows = getDataRows();
      expect(dataRows).toHaveLength(2);
      expect(screen.queryByText('b0-user')).not.toBeInTheDocument();
    });

    it('shows empty state when there are no filtered results', async () => {
      const users = createUsers(5);

      expect(users.some((user) => user.username === 'zzz')).toBeFalsy();
      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const { user } = render(<HtpasswdDetails {...defaultProps} />);

      await user.type(screen.getByLabelText('Filter by username'), 'zzz');

      expect(screen.getByText('No results found')).toBeInTheDocument();

      const pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(0);
    });

    it('it stays on page when page exists when filtering', async () => {
      const users = createUsers(25);
      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const { user } = render(<HtpasswdDetails {...defaultProps} />);

      await user.click(screen.getAllByRole('button', { name: 'Go to next page' })[0]);

      let pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(2);

      await user.type(screen.getByLabelText('Filter by username'), 'user');

      pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(2);
    });

    it('it goes to last existing page when current page no longer exists after filtering', async () => {
      const users = createUsers(25);
      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const { user } = render(<HtpasswdDetails {...defaultProps} />);

      await user.click(screen.getAllByRole('button', { name: 'Go to next page' })[0]);

      let pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(2);

      await user.type(screen.getByLabelText('Filter by username'), 'a1-user');

      pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(1);
    });

    it('it goes to last existing page when current page no longer exists after filtering so results exactly fits a page', async () => {
      // Create 21 users, go to second page
      // Filter so only 20 user are returned
      // Verify the app is only showing 1 page
      const users = [];
      while (users.length < 20) {
        users.push({ username: `user-1-${users.length}`, id: `user-1-${users.length}` });
      }

      expect(users).toHaveLength(20);

      users.push({ username: `odd-user}`, id: `odd-user` });

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const { user } = render(<HtpasswdDetails {...defaultProps} />);

      await user.click(screen.getAllByRole('button', { name: 'Go to next page' })[0]);

      let pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(2);

      await user.type(screen.getByLabelText('Filter by username'), 'user-1');

      pageTextBox = screen.getByRole('spinbutton', {
        name: 'Current page',
      });
      expect(pageTextBox).toHaveValue(1);
    });
  });

  describe('add user', () => {
    it('button is not shown if user does not have update access', () => {
      const users = createUsers(20);

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const newProps = { ...defaultProps, idpActions: { update: false } };

      render(<HtpasswdDetails {...newProps} />);

      expect(screen.queryByRole('button', { name: 'Add user' })).not.toBeInTheDocument();
    });

    it('modal is opened when user clicks on "add user" button', async () => {
      const users = createUsers(20);

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const newProps = { ...defaultProps, idpActions: { update: true } };

      const { user } = render(<HtpasswdDetails {...newProps} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Add user' }));

      expect(mockedDispatch.mock.calls[0][0].type).toEqual('OPEN_MODAL');
      expect(mockedDispatch.mock.calls[0][0].payload.name).toEqual('ADD_HTPASSWD_USER');
    }, 20000);
  });

  describe('single user htpasswd', () => {
    it('add button is not shown when a single htpasswd', () => {
      const users = createUsers(1);

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const newProps = {
        ...defaultProps,
        idpActions: { update: true },
        isSingleUserHtpasswd: true,
      };

      render(<HtpasswdDetails {...newProps} />);

      expect(screen.queryByRole('button', { name: 'Add user' })).not.toBeInTheDocument();
    });

    it('actions are not shown for user', () => {
      const users = createUsers(1);

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const newProps = {
        ...defaultProps,
        idpActions: { update: true },
        isSingleUserHtpasswd: true,
      };

      render(<HtpasswdDetails {...newProps} />);

      const dataRows = getDataRows();

      expect(dataRows).toHaveLength(1);
      const cells = within(dataRows[0]).getAllByRole('cell');
      const actionsCell = cells[cells.length - 1];
      expect(actionsCell).toBeEmptyDOMElement();
    });
  });

  describe('Delete', () => {
    it('button is not shown if user does not have update access', () => {
      const users = createUsers(20);

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const newProps = { ...defaultProps, idpActions: { update: false } };

      render(<HtpasswdDetails {...newProps} />);

      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('modal is opened when users are select and user clicks on "Delete" button', async () => {
      const users = createUsers(20);

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const newProps = { ...defaultProps, idpActions: { update: true } };

      const { user } = render(<HtpasswdDetails {...newProps} />);
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(deleteButton).toBeDisabled();

      const checkBox = screen.getByRole('checkbox', { name: /Select all rows/i });
      await user.click(checkBox);

      expect(deleteButton).not.toBeDisabled();

      await user.click(deleteButton);
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('OPEN_MODAL');
      expect(mockedDispatch.mock.calls[0][0].payload.name).toEqual('BULK_DELETE_HTPASSWD_USER');
    }, 20000);
  });

  describe('Bulk delete', () => {
    const createNumberedUsers = (numberOfUsers: number) => {
      const users: HtPasswdUser[] = [];
      for (let i = 1; i <= numberOfUsers; i += 1) {
        users.push({ username: `user${i}`, id: `user${i}-id` });
      }
      return users;
    };

    it('includes all users when select all is checked without filter (not just current page)', async () => {
      // Arrange: Create 15 users (user1 through user15)
      const users = createNumberedUsers(15);

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const newProps = { ...defaultProps, idpActions: { update: true } };
      const { user, container } = render(<HtpasswdDetails {...newProps} />);

      // Act: Change pagination to 10 per page
      await user.click(getPaginationToggle(container));
      await user.click(screen.getByText('10 per page'));

      // Verify only 10 users are visible on the current page
      await waitFor(() => {
        expect(getDataRows()).toHaveLength(10);
      });

      // Select all users using the checkbox
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /Select all rows/i });
      await user.click(selectAllCheckbox);

      // Click Delete button
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);

      // Assert: Verify the modal is opened with ALL 15 users (not just the 10 on current page)
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('OPEN_MODAL');
      expect(mockedDispatch.mock.calls[0][0].payload.name).toEqual('BULK_DELETE_HTPASSWD_USER');
      expect(mockedDispatch.mock.calls[0][0].payload.data.selectedUsers).toHaveLength(15);

      // Verify all 15 users are included
      const selectedUsernames = mockedDispatch.mock.calls[0][0].payload.data.selectedUsers.map(
        (u: HtPasswdUser) => u.username,
      );
      for (let i = 1; i <= 15; i += 1) {
        expect(selectedUsernames).toContain(`user${i}`);
      }
    });

    it('includes only filtered users when filter is active and select all is checked', async () => {
      // Arrange: Create 15 users (user1 through user15)
      const users = createNumberedUsers(15);

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const newProps = { ...defaultProps, idpActions: { update: true } };
      const { user, container } = render(<HtpasswdDetails {...newProps} />);

      // Act: Change pagination to 10 per page
      await user.click(getPaginationToggle(container));
      await user.click(screen.getByText('10 per page'));

      // Select all users first
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /Select all rows/i });
      await user.click(selectAllCheckbox);

      // Apply filter for "3" - should match user3 and user13
      await user.type(screen.getByLabelText('Filter by username'), '3');

      // Verify only user3 and user13 are visible in the table
      await waitFor(() => {
        expect(getDataRows()).toHaveLength(2);
      });

      expect(screen.getByText('user3')).toBeInTheDocument();
      expect(screen.getByText('user13')).toBeInTheDocument();

      // Click Delete button
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);

      // Assert: Verify the modal is opened with only the 2 filtered users
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('OPEN_MODAL');
      expect(mockedDispatch.mock.calls[0][0].payload.name).toEqual('BULK_DELETE_HTPASSWD_USER');
      expect(mockedDispatch.mock.calls[0][0].payload.data.selectedUsers).toHaveLength(2);

      // Verify only user3 and user13 are included
      const selectedUsernames = mockedDispatch.mock.calls[0][0].payload.data.selectedUsers.map(
        (u: HtPasswdUser) => u.username,
      );
      expect(selectedUsernames).toContain('user3');
      expect(selectedUsernames).toContain('user13');
      expect(selectedUsernames).not.toContain('user1');
      expect(selectedUsernames).not.toContain('user15');
    });

    it('includes only individually selected filtered users when filter is active', async () => {
      // Arrange: Create 15 users (user1 through user15)
      const users = createNumberedUsers(15);

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const newProps = { ...defaultProps, idpActions: { update: true } };
      const { user, container } = render(<HtpasswdDetails {...newProps} />);

      // Act: Change pagination to 10 per page
      await user.click(getPaginationToggle(container));
      await user.click(screen.getByText('10 per page'));

      // Apply filter for "3" - should match user3 and user13
      await user.type(screen.getByLabelText('Filter by username'), '3');

      // Verify only user3 and user13 are visible in the table
      const dataRows = getDataRows();
      await waitFor(() => {
        expect(dataRows).toHaveLength(2);
      });

      // Select only user3 (first row)
      const firstRowCheckbox = within(dataRows[0]).getByRole('checkbox');
      await user.click(firstRowCheckbox);

      // Click Delete button
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);

      // Assert: Verify the modal is opened with only user3
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('OPEN_MODAL');
      expect(mockedDispatch.mock.calls[0][0].payload.name).toEqual('BULK_DELETE_HTPASSWD_USER');
      expect(mockedDispatch.mock.calls[0][0].payload.data.selectedUsers).toHaveLength(1);

      // Verify only user13 is included (sorted alphabetically, user13 comes before user3)
      const selectedUsernames = mockedDispatch.mock.calls[0][0].payload.data.selectedUsers.map(
        (u: HtPasswdUser) => u.username,
      );
      expect(selectedUsernames).toContain('user13');
    });

    it('retains all selected users across pages when not filtering', async () => {
      // Arrange: Create 15 users (user1 through user15)
      const users = createNumberedUsers(15);

      useFetchHtpasswdUsersMocked.mockReturnValue({
        isLoading: false,
        users,
        isError: false,
        error: null,
      });

      const newProps = { ...defaultProps, idpActions: { update: true } };
      const { user, container } = render(<HtpasswdDetails {...newProps} />);

      // Act: Change pagination to 10 per page
      await user.click(getPaginationToggle(container));
      await user.click(screen.getByText('10 per page'));

      // Select all users on page 1
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /Select all rows/i });
      await user.click(selectAllCheckbox);

      // Navigate to page 2
      await user.click(screen.getAllByRole('button', { name: 'Go to next page' })[0]);

      // Click Delete button on page 2
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);

      // Assert: Verify the modal is opened with ALL 15 selected users (not just page 2 users)
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('OPEN_MODAL');
      expect(mockedDispatch.mock.calls[0][0].payload.name).toEqual('BULK_DELETE_HTPASSWD_USER');
      expect(mockedDispatch.mock.calls[0][0].payload.data.selectedUsers).toHaveLength(15);
    });
  });
});
