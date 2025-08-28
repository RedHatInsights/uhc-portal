import React from 'react';
import * as reactRedux from 'react-redux';

import * as notifications from '@redhat-cloud-services/frontend-components-notifications';

import * as useCreateEditHtpasswdUser from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useCreateEditHtpasswdUser';
import { screen, waitFor, withState } from '~/testUtils';

import EditUserModal from './EditUserModal';

jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
}));

jest.mock('@redhat-cloud-services/frontend-components-notifications', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('@redhat-cloud-services/frontend-components-notifications'),
  };
  return config;
});

const mockedAddUser = jest.spyOn(useCreateEditHtpasswdUser, 'useCreateEditHtpasswdUser');

const initialState = {
  modal: {
    data: {
      idpName: 'myIDPName',
      clusterId: 'myClusterId',
      idpId: 'myIDPID',
      user: {
        id: 'myUserId',
        username: 'myUserName',
      },
    },
  },
};

describe('<EditUserModal />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const useAddNotificationsMock = jest.spyOn(notifications, 'useAddNotification');
  const mockedAddNotification = jest.fn();
  useAddNotificationsMock.mockReturnValue(mockedAddNotification);

  const mutate = jest.fn();
  const reset = jest.fn();
  const defaultReturnAddUser = {
    isPending: false,
    isError: false,
    error: {},
    isSuccess: false,
    reset,
    mutate,
  };

  const onSuccess = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls close modal when cancelling', async () => {
    mockedAddUser.mockReturnValue(defaultReturnAddUser);

    const { user } = withState(initialState, true).render(<EditUserModal onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit user' })).toBeInTheDocument();
    });
    expect(reset).not.toHaveBeenCalled();
    expect(mockedDispatch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(reset).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
  });

  it('displays the edit user form', async () => {
    mockedAddUser.mockReturnValue(defaultReturnAddUser);

    withState(initialState, true).render(<EditUserModal onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit user' })).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox', { name: 'Username' })).toBeInTheDocument();

    expect(screen.getByLabelText('Password *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password *')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Edit user' })).toBeDisabled();
  });

  it('calls edit user when primary button is clicked', async () => {
    mockedAddUser.mockReturnValue(defaultReturnAddUser);

    const { user } = withState(initialState, true).render(<EditUserModal onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit user' })).toBeInTheDocument();
    });

    const password = '12345abcdeABC!#';

    await user.type(screen.getByLabelText('Password *'), password);
    await user.type(screen.getByLabelText('Confirm password *'), password);

    expect(screen.getByRole('button', { name: 'Edit user' })).not.toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Edit user' }));

    expect(mutate).toHaveBeenCalledWith({ username: 'myUserName', password, userID: 'myUserId' });
  }, 20000);

  it('shows spinner when add user is pending', () => {
    mockedAddUser.mockReturnValue({ ...defaultReturnAddUser, isPending: true });

    withState(initialState, true).render(<EditUserModal onSuccess={onSuccess} />);

    expect(screen.getByRole('progressbar', { name: 'Loading...' })).toBeInTheDocument();
  });

  it('closes modal when add user is successful', async () => {
    mockedAddUser.mockReturnValue({ ...defaultReturnAddUser, isSuccess: true });

    withState(initialState, true).render(<EditUserModal onSuccess={onSuccess} />);

    expect(reset).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');

    expect(mockedAddNotification).toHaveBeenCalledWith({
      dismissable: true,
      title: 'Successfully edited user myUserName',
      variant: 'success',
    });
  });

  it('shows error when add user results in an error', () => {
    mockedAddUser.mockReturnValue({
      ...defaultReturnAddUser,
      isError: true,
      error: { errorMessage: 'I am an error' },
    });

    withState(initialState, true).render(<EditUserModal onSuccess={onSuccess} />);

    expect(screen.getByText('I am an error')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // the form is still showing
    expect(screen.getByRole('textbox', { name: 'Username' })).toBeInTheDocument();
    expect(screen.getByLabelText('Password *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password *')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Edit user' })).not.toBeDisabled();
  });
});
