import React from 'react';
import { Formik } from 'formik';

import { render, screen } from '~/testUtils';

import { FieldId } from '../../../clusters/ClusterDetailsMultiRegion/components/IdentityProvidersPage/constants';

import { CompoundFieldArray } from './CompoundFieldArray';

const defaultProps = {
  label: 'Users list',
  isRequired: true,
  helpText: '',
  fieldSpan: 8,
  addMoreTitle: 'Add user',
  compoundFields: [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      helpText: 'Unique name of the user within the cluster.',
      isRequired: true,
      getPlaceholderText: (index: number) => `Unique username ${index + 1}`,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      isRequired: true,
    },
    {
      name: 'password-confirm',
      label: 'Confirm password',
      type: 'password',
      isRequired: true,
      helpText: 'Retype the password to confirm.',
    },
  ],
  addMoreButtonDisabled: false,
  minusButtonDisabledMessage: 'To delete the static user, add another user first."',
  isGroupError: false,
};

const initialValues = {
  [FieldId.USERS]: [
    {
      username: '',
      password: '',
      'password-confirm': '',
    },
  ],
};

const buildTestComponent = (children: React.ReactNode, formValues = {}) => (
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

describe('Formik fields change', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Fields are populated with correct values', async () => {
    render(
      buildTestComponent(<CompoundFieldArray {...defaultProps} />, {
        [FieldId.USERS]: [
          {
            username: 'testusername',
            password: 'abc123',
            'password-confirm': 'abc123',
          },
        ],
      }),
    );

    expect(screen.getByLabelText('Password *')).toHaveDisplayValue('abc123');
    expect(screen.getByLabelText('Confirm password *')).toHaveDisplayValue('abc123');
  });

  it('shows enabled Add user while fields are populated and error free', async () => {
    const { user } = render(buildTestComponent(<CompoundFieldArray {...defaultProps} />));

    await user.type(screen.getByPlaceholderText('Unique username 1'), 'username1');
    await user.type(screen.getByLabelText('Password *'), '1234faewd%Dadsfvaerwv');
    await user.type(screen.getByLabelText('Confirm password *'), '1234faewd%Dadsfvaerwv');

    expect(screen.getByRole('button', { name: 'Add user' })).toBeEnabled();
  });

  it('disables Add user when fields are empty', () => {
    render(buildTestComponent(<CompoundFieldArray {...defaultProps} />));

    expect(screen.getByRole('button', { name: 'Add user' })).toBeDisabled();
  });

  it('disables Add user when only some fields are filled', async () => {
    const { user } = render(buildTestComponent(<CompoundFieldArray {...defaultProps} />));

    await user.type(screen.getByPlaceholderText('Unique username 1'), 'username1');

    expect(screen.getByRole('button', { name: 'Add user' })).toBeDisabled();
  });

  it('adds new field', async () => {
    const { user } = render(buildTestComponent(<CompoundFieldArray {...defaultProps} />));

    await user.type(screen.getByPlaceholderText('Unique username 1'), 'username1');
    await user.type(screen.getByLabelText('Password *'), '1234faewd%Dadsfvaerwv');
    await user.type(screen.getByLabelText('Confirm password *'), '1234faewd%Dadsfvaerwv');

    await user.click(screen.getByRole('button', { name: 'Add user' }));

    expect(screen.getAllByLabelText('Password *')).toHaveLength(2);
  });

  it('disables Add user after adding a new empty row', async () => {
    const { user } = render(buildTestComponent(<CompoundFieldArray {...defaultProps} />));

    await user.type(screen.getByPlaceholderText('Unique username 1'), 'username1');
    await user.type(screen.getByLabelText('Password *'), '1234faewd%Dadsfvaerwv');
    await user.type(screen.getByLabelText('Confirm password *'), '1234faewd%Dadsfvaerwv');

    await user.click(screen.getByRole('button', { name: 'Add user' }));

    expect(screen.getByRole('button', { name: 'Add user' })).toBeDisabled();
  });

  describe('onlySingleItem', () => {
    it('does not show label, add, or delete buttons if onlySingleItem', () => {
      render(buildTestComponent(<CompoundFieldArray {...defaultProps} onlySingleItem />));

      expect(screen.queryByText('Users list (1)')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add user' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    });
  });
});
