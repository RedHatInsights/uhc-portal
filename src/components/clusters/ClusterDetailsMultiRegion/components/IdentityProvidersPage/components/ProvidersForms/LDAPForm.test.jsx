import React from 'react';
import { Formik } from 'formik';

import { render, screen } from '~/testUtils';

import {
  IdentityProvidersPageFormInitialValues,
  IdentityProvidersPageValidationSchema,
} from '../IdentityProvidersPageFormikHelpers';

import LDAPForm from './LDAPForm';

describe('LDAPForm', () => {
  const buildTestComponent = ({ formValues = {}, isEditForm, idpEdited, isPending }) => {
    const initialValues = IdentityProvidersPageFormInitialValues('LDAPIdentityProvider');

    return (
      <Formik
        initialValues={{
          ...initialValues,
          ...formValues,
        }}
        validationSchema={IdentityProvidersPageValidationSchema('GithubIdentityProvider')}
        onSubmit={() => {}}
      >
        <LDAPForm isEditForm={isEditForm} idpEdited={idpEdited} isPending={isPending} />
      </Formik>
    );
  };

  test('renders LDAPForm component', () => {
    render(buildTestComponent({}));

    expect(screen.getByLabelText('Insecure')).toBeInTheDocument();
  });

  test('Changing insecure value changes if ca upload is disabled', async () => {
    const { user } = render(
      buildTestComponent({
        isEditForm: true,
        idpEdited: { ldap: { ca: 'my ldap ca' } },
      }),
    );

    expect(screen.getByLabelText('Insecure')).not.toBeChecked();
    expect(screen.queryByRole('button', { name: 'Reveal' })).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Insecure'));
    expect(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument();

    await user.click(screen.getByLabelText('Insecure'));
    expect(screen.queryByRole('button', { name: 'Reveal' })).not.toBeInTheDocument();
  });
});
