import React from 'react';
import * as reactRedux from 'react-redux';

import * as useBulkDeleteHtpasswdUser from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useBulkDeleteHtpasswdUser';
import { screen, waitFor, withState } from '~/testUtils';

import BulkDeleteUserModal from './BulkDeleteUserModal';

jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
}));

const mockedBulkDeleteUsers = jest.spyOn(useBulkDeleteHtpasswdUser, 'useBulkDeleteHtpasswdUser');

const initialState = {
  modal: {
    data: {
      idpName: 'myIDPName',
      clusterId: 'myClusterId',
      idpId: 'myIDPID',
      selectedUsers: [
        {
          kind: 'HTPasswdUser',
          id: 'userId1',
          username: 'user1',
        },
        {
          kind: 'HTPasswdUser',
          id: 'userId2',
          username: 'user2',
        },
        {
          kind: 'HTPasswdUser',
          id: 'userId3',
          username: 'user3',
        },
        {
          kind: 'HTPasswdUser',
          id: 'userId4',
          username: 'user4',
        },
        {
          kind: 'HTPasswdUser',
          id: 'userId5',
          username: 'user5',
        },
        {
          kind: 'HTPasswdUser',
          id: 'userId6',
          username: 'user6',
        },
        {
          kind: 'HTPasswdUser',
          id: 'userId7',
          username: 'user7',
        },
      ],
    },
  },
};

describe('<BulkDeleteUserModal />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const mutate = jest.fn();
  const reset = jest.fn();
  const defaultReturnBulkDeleteUser = {
    isPending: false,
    failedDeletions: [],
    reset,
    mutate,
  };

  const onSuccess = jest.fn();
  const refreshHtpasswdUsers = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls close modal when cancelling', async () => {
    mockedBulkDeleteUsers.mockReturnValue(defaultReturnBulkDeleteUser);

    const { user } = withState(initialState, true).render(
      <BulkDeleteUserModal onSuccess={onSuccess} refreshHtpasswdUsers={refreshHtpasswdUsers} />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete users' })).toBeInTheDocument();
    });
    expect(reset).not.toHaveBeenCalled();
    expect(mockedDispatch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(reset).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
  });

  it('displays the users and count of remaining users', async () => {
    mockedBulkDeleteUsers.mockReturnValue(defaultReturnBulkDeleteUser);

    withState(initialState, true).render(
      <BulkDeleteUserModal onSuccess={onSuccess} refreshHtpasswdUsers={refreshHtpasswdUsers} />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete users' })).toBeInTheDocument();
    });

    expect(screen.getByText('* user1')).toBeInTheDocument();
    expect(screen.getByText('* user2')).toBeInTheDocument();
    expect(screen.getByText('* user3')).toBeInTheDocument();
    expect(screen.getByText('* user4')).toBeInTheDocument();
    expect(screen.getByText('* user5')).toBeInTheDocument();
    expect(screen.getByText('(2 more)')).toBeInTheDocument();
  });

  it('calls bulk delete when primary button is clicked', async () => {
    mockedBulkDeleteUsers.mockReturnValue(defaultReturnBulkDeleteUser);

    const { user } = withState(initialState, true).render(
      <BulkDeleteUserModal onSuccess={onSuccess} refreshHtpasswdUsers={refreshHtpasswdUsers} />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete users' })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Delete users' })).not.toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Delete users' }));
    expect(mutate).toHaveBeenCalled();
  }, 20000);

  it('shows spinner when bulk delete is pending', () => {
    mockedBulkDeleteUsers.mockReturnValue({ ...defaultReturnBulkDeleteUser, isPending: true });

    withState(initialState, true).render(
      <BulkDeleteUserModal onSuccess={onSuccess} refreshHtpasswdUsers={refreshHtpasswdUsers} />,
    );

    expect(screen.getByRole('progressbar', { name: 'Loading...' })).toBeInTheDocument();
  });

  it('shows error when bulk delete results in an error', () => {
    mockedBulkDeleteUsers.mockReturnValue({
      ...defaultReturnBulkDeleteUser,
      failedDeletions: [
        {
          username: 'user1',
          error: {
            errorMessage: 'I am an error',
          },
        },
      ],
    });

    withState(initialState, true).render(
      <BulkDeleteUserModal onSuccess={onSuccess} refreshHtpasswdUsers={refreshHtpasswdUsers} />,
    );

    expect(
      screen.getByText('A problem occurred while deleting htpasswd user "user1"'),
    ).toBeInTheDocument();
    expect(screen.getByText('I am an error')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // the modal text is still showing
    expect(screen.getByText('These users will lose access to this cluster.')).toBeInTheDocument();
  });
});
