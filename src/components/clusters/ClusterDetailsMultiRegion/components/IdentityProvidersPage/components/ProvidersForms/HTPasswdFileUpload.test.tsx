import React from 'react';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { render, screen, waitFor } from '~/testUtils';

import { dropFile, uploadFile } from '../testHelpers';

import HTPasswdFileUpload from './HTPasswdFileUpload';

jest.mock('~/components/clusters/wizards/hooks/useFormState');

const validFileContent = 'user1:$2y$05$hash1\nuser2:$2y$05$hash2';
const invalidFileContent = 'invalidline\nuser1:pass1';

describe('<HTPasswdFileUpload />', () => {
  const mockedUseFormState = useFormState as jest.Mock;
  const setFieldValue = jest.fn();

  beforeEach(() => {
    mockedUseFormState.mockReturnValue({ setFieldValue });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with browse button and placeholder text', () => {
    render(<HTPasswdFileUpload />);

    expect(screen.getByRole('button', { name: 'Browse' })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Upload an htpasswd file or drag and drop'),
    ).toBeInTheDocument();
  });

  it('shows filename after valid file upload', async () => {
    render(<HTPasswdFileUpload />);

    await uploadFile(validFileContent);

    await waitFor(() => {
      expect(screen.getByLabelText('Read only filename')).toHaveValue('users.htpasswd');
    });
  });

  it('calls setFieldValue with parsed users after valid file upload', async () => {
    render(<HTPasswdFileUpload />);

    await uploadFile(validFileContent);

    await waitFor(() => {
      expect(setFieldValue).toHaveBeenCalledWith('users', [
        { username: 'user1', password: '$2y$05$hash1' },
        { username: 'user2', password: '$2y$05$hash2' },
      ]);
    });
  });

  it('shows parser errors for invalid file', async () => {
    render(<HTPasswdFileUpload />);

    await uploadFile(invalidFileContent);

    await waitFor(() => {
      expect(
        screen.getByText('Line 1: Invalid format. Expected "username:password".'),
      ).toBeInTheDocument();
    });
  });

  it('calls setFieldValue with empty array after invalid file upload', async () => {
    render(<HTPasswdFileUpload />);

    await uploadFile(invalidFileContent);

    await waitFor(() => {
      expect(setFieldValue).toHaveBeenCalledWith('users', []);
    });
  });

  it('clears stale users when a valid upload is followed by an invalid one', async () => {
    render(<HTPasswdFileUpload />);

    await uploadFile(validFileContent);
    await waitFor(() => {
      expect(setFieldValue).toHaveBeenCalledWith(
        'users',
        expect.arrayContaining([{ username: 'user1', password: '$2y$05$hash1' }]),
      );
    });

    await uploadFile(invalidFileContent);
    await waitFor(() => {
      expect(setFieldValue).toHaveBeenLastCalledWith('users', []);
    });
  });

  it('clear button is disabled before upload and enabled after', async () => {
    render(<HTPasswdFileUpload />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    await uploadFile(validFileContent);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Clear' })).not.toBeDisabled();
    });
  });

  it('disables the file input when isDisabled is true', () => {
    render(<HTPasswdFileUpload isDisabled />);

    expect(screen.getByRole('button', { name: 'Browse' })).toBeDisabled();
  });

  it('shows error when an unsupported file type is dropped', async () => {
    render(<HTPasswdFileUpload />);

    dropFile('data', 'image.png', 'image/png');

    await waitFor(() => {
      expect(
        screen.getByText('File type is not supported. Upload an htpasswd or plain text file.'),
      ).toBeInTheDocument();
    });
  });
});
