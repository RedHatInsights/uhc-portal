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

  it('renders component with the initial expected text', async () => {
    // Arrange
    // Act
    render(buildTestComponent({}, <CustomOperatorRoleNames />));

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
  });

  it('is accessible', async () => {
    // Arrange
    // Act
    const { container } = render(buildTestComponent({}, <CustomOperatorRoleNames />));
    // Assert
    await checkAccessibility(container);
  });

  it('renders HCP IAM operator roles link when hypershift is selected', async () => {
    const { user } = render(
      buildTestComponent({}, <CustomOperatorRoleNames isHypershiftSelected />),
    );

    const moreInfoBtn = await screen.findByLabelText('More information');
    await user.click(moreInfoBtn);

    const link = screen.getByText('Defining a custom Operator IAM role prefix');
    expect(link).toHaveAttribute('href', links.ROSA_AWS_IAM_OPERATOR_ROLES);
  });

  it('renders classic IAM operator roles link when classic is selected', async () => {
    const { user } = render(buildTestComponent({}, <CustomOperatorRoleNames />));

    const moreInfoBtn = await screen.findByLabelText('More information');
    await user.click(moreInfoBtn);

    const link = screen.getByText('Defining a custom Operator IAM role prefix');
    expect(link).toHaveAttribute('href', links.ROSA_CLASSIC_AWS_IAM_OPERATOR_ROLES);
  });
});
