import React from 'react';
import { Formik } from 'formik';

import { checkAccessibility, render, screen } from '~/testUtils';

import links from '../../../../../common/installLinks.mjs';

import CustomOperatorRoleNames from './CustomOperatorRoleNames';

// Formik Wrapper:
const buildTestComponent = (initialValues, children, onSubmit = jest.fn(), formValues = {}) => (
  <Formik
    initialValues={{
      ...initialValues,
      ...formValues,
    }}
    onSubmit={onSubmit}
  >
    {children}
  </Formik>
);

describe('<CustomOperatorRoleNames />', () => {
  // Arrange
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders component with all expected text', async () => {
    // Arrange
    // Act
    const { user } = render(buildTestComponent({}, <CustomOperatorRoleNames />));

    // Assert
    expect(screen.getByText('Name operator roles')).toBeInTheDocument();
    expect(
      screen.getByText(
        'To easily identify the Operator IAM roles for a cluster in your AWS account, the Operator role names are prefixed with your cluster name and a random 4-digit hash. You can optionally replace this prefix.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Custom operator roles prefix')).toBeInTheDocument();
    expect(
      screen.getByText(
        `Maximum 32 characters. Changing the cluster name will regenerate this value.`,
      ),
    ).toBeInTheDocument();

    const moreInfoBtn = await screen.findByLabelText('More information');
    expect(moreInfoBtn).toBeInTheDocument();
    await user.click(moreInfoBtn);

    const link = screen.getByText('Defining a custom Operator IAM role prefix');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', links.ROSA_CLASSIC_AWS_IAM_OPERATOR_ROLES);
  });

  it('is accessible', async () => {
    // Arrange
    // Act
    const { container } = render(buildTestComponent({}, <CustomOperatorRoleNames />));
    // Assert
    await checkAccessibility(container);
  });
});
