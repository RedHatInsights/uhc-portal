import React from 'react';
import * as reactRedux from 'react-redux';

import * as useImportHtpasswdUsersModule from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useImportHtpasswdUsers';
import { screen, waitFor, withState } from '~/testUtils';

import { dropFile, uploadFile } from '../testHelpers';

import UploadHTPasswdFileModal from './UploadHTPasswdFileModal';

// Re-export as a plain object so jest.spyOn can redefine useDispatch
jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
}));

const mockedAddNotification = jest.fn();

jest.mock('@redhat-cloud-services/frontend-components-notifications', () => ({
  useAddNotification: () => mockedAddNotification,
}));

const mockedImportUsers = jest.spyOn(useImportHtpasswdUsersModule, 'useImportHtpasswdUsers');

const initialState = {
  modal: {
    data: {
      idpName: 'myIDPName',
      clusterId: 'myClusterId',
      idpId: 'myIDPID',
      region: 'us-east-1',
    },
  },
};

const validFileContent = `user1:$2y$05$hash1
user2:$2y$05$hash2`;
const invalidFileContent = `invalidline
user1:pass1`;

describe('<UploadHTPasswdFileModal />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const mutate = jest.fn();
  const reset = jest.fn();
  const defaultReturn = {
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

  it('renders the modal with Upload button disabled by default', () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    expect(screen.getByText('Upload htpasswd file')).toBeInTheDocument();
    expect(
      screen.getByText(/Upload a valid htpasswd file to add users to identity provider/),
    ).toBeInTheDocument();
    expect(screen.getByText('myIDPName')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('enables Upload button after a valid file is uploaded', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    await uploadFile(validFileContent);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Upload' })).not.toBeDisabled();
    });
  });

  it('shows filename after file upload', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    await uploadFile(validFileContent);

    await waitFor(() => {
      expect(screen.getByLabelText('Read only filename')).toHaveValue('users.htpasswd');
    });
  });

  it('shows parser errors for invalid file and keeps Upload button disabled', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    await uploadFile(invalidFileContent);

    await waitFor(() => {
      expect(
        screen.getByText('Line 1: Invalid format. Expected "username:password".'),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('shows error for missing username', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    await uploadFile(':$2y$05$hash1');

    await waitFor(() => {
      expect(screen.getByText('Line 1: Username cannot be empty.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('shows error for missing password', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    await uploadFile('user1:');

    await waitFor(() => {
      expect(screen.getByText('Line 1: Password cannot be empty.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('shows error for a line with only colons', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    await uploadFile(':');

    await waitFor(() => {
      expect(screen.getByText('Line 1: Username cannot be empty.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('shows error for an empty file', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    await uploadFile('');

    await waitFor(() => {
      expect(screen.getByText('File is empty or contains no valid entries.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('calls mutate with parsed users when Upload is clicked', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    const { user } = withState(initialState, true).render(
      <UploadHTPasswdFileModal onSuccess={onSuccess} />,
    );

    await uploadFile(validFileContent);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Upload' })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: 'Upload' }));

    expect(mutate).toHaveBeenCalledWith([
      { username: 'user1', hashed_password: '$2y$05$hash1' },
      { username: 'user2', hashed_password: '$2y$05$hash2' },
    ]);
  });

  it('calls close modal when cancelling', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    const { user } = withState(initialState, true).render(
      <UploadHTPasswdFileModal onSuccess={onSuccess} />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(reset).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
  });

  it('shows spinner when import is pending', () => {
    mockedImportUsers.mockReturnValue({ ...defaultReturn, isPending: true });

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    expect(screen.getByRole('progressbar', { name: 'Loading...' })).toBeInTheDocument();
  });

  it('closes modal and shows notification on success', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    const { rerender } = withState(initialState, true).render(
      <UploadHTPasswdFileModal onSuccess={onSuccess} />,
    );

    await uploadFile(validFileContent);

    mockedImportUsers.mockReturnValue({ ...defaultReturn, isSuccess: true });
    rerender(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    expect(reset).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    expect(onSuccess).toHaveBeenCalled();
    expect(mockedAddNotification).toHaveBeenCalledWith({
      dismissable: true,
      title: 'Successfully imported 2 users',
      variant: 'success',
    });
  });

  it('shows error when import fails', () => {
    mockedImportUsers.mockReturnValue({
      ...defaultReturn,
      isError: true,
      error: { errorMessage: 'Import failed' },
    });

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    expect(screen.getByText('Import failed')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows error when an unsupported file type is dropped', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    dropFile('data', 'image.png', 'image/png');

    await waitFor(() => {
      expect(
        screen.getByText('File type is not supported. Upload an htpasswd or plain text file.'),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('clears backend error when a new file is uploaded', async () => {
    mockedImportUsers.mockReturnValue({
      ...defaultReturn,
      isError: true,
      error: { errorMessage: 'Import failed' },
    });

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    expect(screen.getByText('Import failed')).toBeInTheDocument();

    await uploadFile(validFileContent);

    expect(reset).toHaveBeenCalled();
  });
});
