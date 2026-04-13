import React from 'react';
import * as reactRedux from 'react-redux';

import * as useImportHtpasswdUsersModule from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useImportHtpasswdUsers';
import { screen, userEvent, waitFor, withState } from '~/testUtils';

import UploadHTPasswdFileModal from './UploadHTPasswdFileModal';

jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
}));

const mockedAddNotification = jest.fn();

jest.mock('@redhat-cloud-services/frontend-components-notifications', () => ({
  __esModule: true,
  ...jest.requireActual('@redhat-cloud-services/frontend-components-notifications'),
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

const validFileContent = 'user1:$2y$05$hash1\nuser2:$2y$05$hash2';
const invalidFileContent = 'invalidline\nuser1:pass1';

const uploadFile = async (content: string, filename = 'users.htpasswd') => {
  const file = new File([content], filename, { type: 'text/plain' });
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  await userEvent.upload(fileInput, file);
};

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

    expect(screen.getByText('Upload HTPasswd file')).toBeInTheDocument();
    expect(
      screen.getByText(/Upload an HTPasswd file to add users to identity provider/),
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

  it('shows masked content in the preview after file upload', async () => {
    mockedImportUsers.mockReturnValue(defaultReturn);

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    await uploadFile(validFileContent);

    await waitFor(() => {
      const textarea = screen.getByRole('textbox', { name: 'File upload' });
      expect(textarea).toHaveValue('user1:*******\nuser2:*******');
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

  it('closes modal and shows notification on success', () => {
    mockedImportUsers.mockReturnValue({ ...defaultReturn, isSuccess: true });

    withState(initialState, true).render(<UploadHTPasswdFileModal onSuccess={onSuccess} />);

    expect(reset).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    expect(onSuccess).toHaveBeenCalled();
    expect(mockedAddNotification).toHaveBeenCalledWith({
      dismissable: true,
      title: 'Successfully imported 0 user',
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
});
