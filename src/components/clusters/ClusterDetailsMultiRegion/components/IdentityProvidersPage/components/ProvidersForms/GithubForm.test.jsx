import React from 'react';
import { Formik } from 'formik';

import { render, screen } from '~/testUtils';

import {
  IdentityProvidersPageFormInitialValues,
  IdentityProvidersPageValidationSchema,
} from '../IdentityProvidersPageFormikHelpers';

import GithubFormRequired from './GithubForm';

describe('GithubFormRequired', () => {
  const buildTestComponent = ({ formValues = {}, isEditForm, idpEdited, isPending }) => {
    const initialValues = IdentityProvidersPageFormInitialValues('GithubIdentityProvider');

    return (
      <Formik
        initialValues={{
          ...initialValues,
          ...formValues,
        }}
        validationSchema={IdentityProvidersPageValidationSchema('GithubIdentityProvider')}
        onSubmit={() => {}}
      >
        <GithubFormRequired isEditForm={isEditForm} idpEdited={idpEdited} isPending={isPending} />
      </Formik>
    );
  };

  test('renders GithubFormRequired component', () => {
    render(buildTestComponent({}));

    expect(screen.getByLabelText('Hostname')).toBeInTheDocument();
    expect(screen.getByText('Use organizations')).toBeInTheDocument();
    expect(screen.getByText('Use teams')).toBeInTheDocument();
  });

  test('validates hostname is required if ca is known', async () => {
    const { user } = render(
      buildTestComponent({ isEditForm: true, idpEdited: { github: { ca: 'my ca' } } }),
    );

    const hostNameField = screen.getByLabelText('Hostname *');
    expect(hostNameField).toBeRequired();
    await user.clear(hostNameField);
    await user.type(hostNameField, ' ');
    await user.tab(hostNameField);

    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  test('organizations radio button selected by default if not edit form', async () => {
    render(buildTestComponent({}));

    expect(screen.getByLabelText('Use organizations')).toBeChecked();
    await screen.findByText('Organizations (0)');
    expect(screen.queryByText('Teams (0)')).not.toBeInTheDocument();
  });

  test('organizations radio button selected by default if edit form and git.orgs is known', async () => {
    render(buildTestComponent({ isEditForm: true, idpEdited: { github: { organizations: [] } } }));

    expect(screen.getByLabelText('Use organizations')).toBeChecked();
    await screen.findByText('Organizations (0)');
    expect(screen.queryByText('Teams (0)')).not.toBeInTheDocument();
  });

  test('teams radio button selected by default if edit form and git.orgs is not known', async () => {
    render(buildTestComponent({ isEditForm: true, idpEdited: { github: {} } }));

    expect(screen.getByLabelText('Use organizations')).toBeChecked();
    await screen.findByText('Teams (0)');
    expect(screen.queryByText('Organizations (0)')).not.toBeInTheDocument();
  });

  test('clicking on radio buttons switches between teams and organizations', async () => {
    const { user } = render(buildTestComponent({}));

    expect(screen.getByLabelText('Use organizations')).toBeChecked();
    expect(await screen.findByText('Organizations (0)')).toBeInTheDocument();
    expect(screen.queryByText('Teams (0)')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Use teams'));
    expect(await screen.findByText('Teams (0)')).toBeInTheDocument();
    expect(screen.queryByText('Organizations (0)')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Use organizations'));
    expect(await screen.findByText('Organizations (0)')).toBeInTheDocument();
    expect(screen.queryByText('Teams (0)')).not.toBeInTheDocument();
  });
});
