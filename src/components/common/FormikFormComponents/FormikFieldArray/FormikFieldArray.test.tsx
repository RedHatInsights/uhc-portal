import React from 'react';
import { Formik } from 'formik';

import { checkAccessibility, render, screen, userEvent } from '~/testUtils';

import { FieldId } from '../../../clusters/ClusterDetailsMultiRegion/components/IdentityProvidersPage/constants';

import { FormikFieldArray } from './FormikFieldArray';

const defaultProps = {
  fieldID: 'teams',
  label: 'Teams',
  helpText:
    'Only users that are members of at least one of the listed teams will be allowed to log in. The format is <org>/<team>.',
  placeHolderText: 'e.g. org/team ',
  isRequired: true,
};

const initialValues = {
  [FieldId.TEAMS]: [''],
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

describe('Formik array fields', () => {
  it('shows enabled Add link while fields are populated and error free', async () => {
    render(buildTestComponent(<FormikFieldArray {...defaultProps} />));

    expect(screen.getByText('Add').parentElement).toBeDisabled();
  });

  it('Adds more fields in field array', async () => {
    render(buildTestComponent(<FormikFieldArray {...defaultProps} />));

    await userEvent.type(screen.getByRole('textbox'), 'Red Hat Team 1');
    expect(screen.getByText('Add').getAttribute('disabled')).toBe(null);

    await userEvent.click(screen.getByRole('button', { name: 'Add Teams' }));
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });

  it('is accessible', async () => {
    // Arrange
    const { container } = render(buildTestComponent(<FormikFieldArray {...defaultProps} />));

    // Act & Assert
    await checkAccessibility(container);
  });
});
