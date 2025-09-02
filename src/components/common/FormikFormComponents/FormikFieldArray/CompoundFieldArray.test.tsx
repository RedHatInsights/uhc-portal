import React from 'react';
import { Formik } from 'formik';

import { render, screen, userEvent } from '~/testUtils';

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
    render(buildTestComponent(<CompoundFieldArray {...defaultProps} />));

    await userEvent.type(screen.getByPlaceholderText('Unique username 1'), 'username1');
    await userEvent.type(screen.getByLabelText('Password *'), '1234faewd%Dadsfvaerwv');
    await userEvent.type(screen.getByLabelText('Confirm password *'), '1234faewd%Dadsfvaerwv');

    expect(screen.getByText('Add user').getAttribute('disabled')).toBe(null);
  });

  it('adds new field', async () => {
    render(buildTestComponent(<CompoundFieldArray {...defaultProps} />));

    await userEvent.type(screen.getByPlaceholderText('Unique username 1'), 'username1');
    await userEvent.type(screen.getByLabelText('Password *'), '1234faewd%Dadsfvaerwv');
    await userEvent.type(screen.getByLabelText('Confirm password *'), '1234faewd%Dadsfvaerwv');

    await userEvent.click(screen.getByRole('button', { name: 'Add user' }));

    expect(screen.getAllByLabelText('Password *')).toHaveLength(2);
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
