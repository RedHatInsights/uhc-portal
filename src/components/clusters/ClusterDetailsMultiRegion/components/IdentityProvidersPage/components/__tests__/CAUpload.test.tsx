/* eslint-disable testing-library/prefer-user-event */
/* eslint-disable testing-library/no-wait-for-side-effects */
import React from 'react';
import { FieldInputProps, Formik } from 'formik';
import fs from 'fs';
import path from 'path';

import { fireEvent, render, screen, waitFor } from '~/testUtils';

import CAUpload from '../CAUpload';

describe('<CAUpload />', () => {
  const onChangeMock = jest.fn();
  const inputProp = {
    input: { name: 'inputName', onChange: onChangeMock } as unknown as FieldInputProps<string>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('properly renders', () => {
    // Act
    // @ts-ignore
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <CAUpload {...inputProp} label="label" fieldName="ldap_ca" />
      </Formik>,
    );

    // Assert
    expect(screen.queryByTestId('ca-upload-form')).toBeInTheDocument();

    expect(screen.getByRole('textbox', { name: 'label' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'label' }).getAttribute('id')).toBe('inputName');
    expect(screen.getByRole('textbox', { name: 'label' }).getAttribute('name')).toBe('inputName');

    expect(screen.queryByRole('button', { name: 'Hide' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument();
  });

  it('upload file event greater size than expected', async () => {
    // Arrange
    const file = new File([fs.readFileSync(path.join(__dirname, './1Kfile'), 'utf8')], 'filename', {
      type: 'text/plain',
    });
    // @ts-ignore
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <CAUpload label="label" {...inputProp} maxFileSize={10} fieldName="ldap_ca" />
      </Formik>,
    );
    expect(
      screen.queryByText(/Maximum file size exceeded. File size limit/),
    ).not.toBeInTheDocument();

    // Act
    await waitFor(() =>
      fireEvent.change(screen.getByTestId('ca-upload-input-file'), {
        target: { files: [file] },
      }),
    );

    // Assert
    expect(
      screen.getByText('Maximum file size exceeded. File size limit is 10 B'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hide' })).not.toBeInTheDocument();
  });

  it('upload 1K file event for default max file size', async () => {
    // Arrange
    const file = new File([fs.readFileSync(path.join(__dirname, './1Kfile'), 'utf8')], 'filename', {
      type: 'text/plain',
    });
    // @ts-ignore
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <CAUpload label="label" {...inputProp} fieldName="ldap_ca" />
      </Formik>,
    );
    expect(onChangeMock).toBeCalledTimes(0);

    // Act
    await waitFor(() =>
      fireEvent.change(screen.getByTestId('ca-upload-input-file'), {
        target: { files: [file] },
      }),
    );

    // Assert
    expect(
      screen.queryByText(/Maximum file size exceeded. File size limit/),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
    });

    expect(onChangeMock).toBeCalledTimes(1);
    expect(onChangeMock).toBeCalledWith(expect.any(String));

    expect(screen.queryByRole('button', { name: 'Reveal' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '' }).getAttribute('id')).toBe('inputName_text');
    expect(screen.getByRole('textbox', { name: '' }).getAttribute('name')).toBe('inputName_text');
  });

  it('upload file size lower than expected', async () => {
    // Arrange
    const file = new File([fs.readFileSync(path.join(__dirname, './1Kfile'), 'utf8')], 'filename', {
      type: 'text/plain',
    });
    // @ts-ignore
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <CAUpload {...inputProp} label="label" maxFileSize={2000} fieldName="ldap_ca" />
      </Formik>,
    );
    expect(onChangeMock).toBeCalledTimes(0);

    // Act
    await waitFor(() =>
      fireEvent.change(screen.getByTestId('ca-upload-input-file'), {
        target: { files: [file] },
      }),
    );

    // Assert
    expect(
      screen.queryByText(/Maximum file size exceeded. File size limit/),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
    });

    expect(onChangeMock).toBeCalledTimes(1);
    expect(onChangeMock).toBeCalledWith(expect.any(String));

    expect(screen.queryByRole('button', { name: 'Reveal' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '' }).getAttribute('id')).toBe('inputName_text');
    expect(screen.getByRole('textbox', { name: '' }).getAttribute('name')).toBe('inputName_text');
  });

  it('hide mechanism', async () => {
    // Arrange
    const file = new File([fs.readFileSync(path.join(__dirname, './1Kfile'), 'utf8')], 'filename', {
      type: 'text/plain',
    });
    // @ts-ignore
    const { user } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <CAUpload label="label" {...inputProp} fieldName="ldap_ca" />
      </Formik>,
    );

    expect(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reveal' }).getAttribute('disabled')).toBe('');

    expect(screen.queryByRole('textbox', { name: '' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hide' })).not.toBeInTheDocument();

    await waitFor(() =>
      fireEvent.change(screen.getByTestId('ca-upload-input-file'), {
        target: { files: [file] },
      }),
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: 'Reveal' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide' }).getAttribute('disabled')).toBe(null);
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Hide' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Reveal' }).getAttribute('disabled')).toBe(null);
    expect(screen.queryByRole('textbox', { name: '' })).not.toBeInTheDocument();
  });

  it('reveal mechanism', async () => {
    // Arrange
    const file = new File([fs.readFileSync(path.join(__dirname, './1Kfile'), 'utf8')], 'filename', {
      type: 'text/plain',
    });
    // @ts-ignore
    const { user } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <CAUpload label="label" {...inputProp} fieldName="ldap_ca" />
      </Formik>,
    );

    expect(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reveal' }).getAttribute('disabled')).toBe('');

    expect(screen.queryByRole('textbox', { name: '' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hide' })).not.toBeInTheDocument();

    await waitFor(() =>
      fireEvent.change(screen.getByTestId('ca-upload-input-file'), {
        target: { files: [file] },
      }),
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: 'Reveal' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide' }).getAttribute('disabled')).toBe(null);
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hide' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Reveal' }).getAttribute('disabled')).toBe(null);
    expect(screen.queryByRole('textbox', { name: '' })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reveal' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Hide' }).getAttribute('disabled')).toBe(null);
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();
  });

  it('upload file and modify textarea', async () => {
    // Arrange
    const file = new File(
      [fs.readFileSync(path.join(__dirname, './1Kfile'), 'utf8')],
      'whateverthefilename',
      {
        type: 'text/plain',
      },
    );
    // @ts-ignore
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <CAUpload label="label" {...inputProp} fieldName="ldap_ca" />
      </Formik>,
    );
    await waitFor(() =>
      fireEvent.change(screen.getByTestId('ca-upload-input-file'), {
        target: { files: [file] },
      }),
    );
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();
    });
    expect(screen.getByRole('textbox', { name: 'label' }).getAttribute('value')).toBe(
      'whateverthefilename',
    );
    onChangeMock.mockClear(); // clear onChangeMock counter, basically

    // Act
    fireEvent.change(screen.getByRole('textbox', { name: '' }), {
      target: { value: 'whatever' },
    });

    // Assert
    expect(onChangeMock).toBeCalledTimes(1);
    expect(onChangeMock).toBeCalledWith('whatever');
    expect(screen.getByRole('textbox', { name: 'label' }).getAttribute('value')).toBe('');
  });
});
