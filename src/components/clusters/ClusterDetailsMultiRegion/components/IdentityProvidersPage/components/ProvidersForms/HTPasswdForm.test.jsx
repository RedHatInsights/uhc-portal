import React from 'react';
import { Formik } from 'formik';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { HTPASSWD_IMPORT } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import { FieldId } from '../../constants';

import HTPasswdForm from './HTPasswdForm';

jest.mock('~/components/clusters/wizards/hooks/useFormState');

const initialValues = {
  [FieldId.USERS]: [
    {
      username: '',
      password: '',
      'password-confirm': '',
    },
  ],
};

const buildTestComponent = (children, formValues = {}) => (
  <Formik
    initialValues={{
      ...initialValues,
      ...formValues,
    }}
    onSubmit={() => {}}
  >
    {children}
  </Formik>
);

describe('HTPasswdForm', () => {
  const mockedUseFormState = useFormState;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows disabled Add user while fields are empty', async () => {
    mockedUseFormState.mockReturnValue({
      values: { ...initialValues },
      errors: {
        [FieldId.USERS]: [
          {
            username: 'ERROR1',
            password: {
              emptyPassword: true,
              baseRequirements: false,
              uppercase: false,
              lowercase: false,
              numbersOrSymbols: false,
            },
          },
        ],
      },
      touched: {},
      setFieldValue: jest.fn(),
      getFieldProps: jest.fn(),
      getFieldMeta: jest.fn().mockReturnValue({ error: 'ERROR' }),
    });

    render(buildTestComponent(<HTPasswdForm />));

    expect(await screen.findByPlaceholderText('Unique username 1')).toBeInTheDocument();

    expect(await screen.findByRole('button', { name: 'Add user' })).toBeDisabled();
  });

  it('does not show mode selection radio buttons when feature flag is off', () => {
    mockUseFeatureGate([[HTPASSWD_IMPORT, false]]);
    mockedUseFormState.mockReturnValue({
      values: { ...initialValues },
      errors: {},
      setFieldValue: jest.fn(),
      getFieldProps: jest.fn(),
      getFieldMeta: jest.fn().mockReturnValue({ error: undefined }),
    });

    render(buildTestComponent(<HTPasswdForm />));

    expect(screen.queryByRole('radio', { name: 'Add users manually' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('radio', { name: 'Upload an htpasswd file' }),
    ).not.toBeInTheDocument();
  });

  it('shows mode selection radio buttons when feature flag is on', () => {
    mockUseFeatureGate([[HTPASSWD_IMPORT, true]]);

    mockedUseFormState.mockReturnValue({
      values: { ...initialValues },
      errors: {},
      setFieldValue: jest.fn(),
      getFieldProps: jest.fn(),
      getFieldMeta: jest.fn().mockReturnValue({ error: undefined }),
    });

    render(buildTestComponent(<HTPasswdForm />));

    expect(screen.getByRole('radio', { name: 'Add users manually' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Upload an htpasswd file' })).toBeInTheDocument();
  });

  it('shows disabled Add user while fields have errors', async () => {
    mockUseFeatureGate([[HTPASSWD_IMPORT, false]]);

    mockedUseFormState.mockReturnValue({
      values: { ...initialValues },
      errors: {
        [FieldId.USERS]: [
          {
            password: {
              emptyPassword: false,
              baseRequirements: true,
              uppercase: false,
              lowercase: true,
              numbersOrSymbols: false,
            },
            'password-confirm': 'The passwords do not match',
          },
        ],
      },
      touched: {},
      setFieldValue: jest.fn(),
      getFieldProps: jest.fn(),
      getFieldMeta: jest.fn().mockReturnValue({ error: 'ERROR' }),
    });

    render(buildTestComponent(<HTPasswdForm />));
    expect(screen.getByText('Add user').parentElement).toBeDisabled();
  });
});
