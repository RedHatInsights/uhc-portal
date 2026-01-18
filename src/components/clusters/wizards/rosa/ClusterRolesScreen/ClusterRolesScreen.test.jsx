import React from 'react';
import { Formik } from 'formik';

import { useFetchGetOCMRole } from '~/queries/RosaWizardQueries/useFetchGetOCMRole';
import { checkAccessibility, mockUseFeatureGate, render, screen } from '~/testUtils';

import links from '../../../../../common/installLinks.mjs';
import { FieldId } from '../constants';

import ClusterRolesScreen from './ClusterRolesScreen';

mockUseFeatureGate([]);

jest.mock('~/queries/RosaWizardQueries/useFetchGetOCMRole', () => {
  const impl = {
    useFetchGetOCMRole: jest.fn().mockReturnValue({
      data: { data: { isAdmin: true, arn: 'arn:aws:iam::123456789012:role/AdminOCMRole' } },
      error: undefined,
      isPending: false,
      isSuccess: true,
      status: 'success',
    }),
    refetchGetOCMRole: jest.fn(),
  };
  return impl;
});

jest.mock('~/hooks/useAnalytics', () => jest.fn(() => jest.fn()));

describe('<ClusterRolesScreen />', () => {
  const renderWithFormik = (formValues = {}) =>
    render(
      <Formik
        initialValues={{
          [FieldId.ClusterName]: 'my-cluster',
          [FieldId.Hypershift]: 'false',
          [FieldId.AssociatedAwsId]: '123456789012',
          [FieldId.RosaRolesProviderCreationMode]: undefined,
          [FieldId.CustomOperatorRolesPrefix]: '',
          [FieldId.ByoOidcConfigId]: '',
          [FieldId.InstallerRoleArn]: 'arn:aws:iam::123456789012:role/Installer',
          [FieldId.RegionalInstance]: { id: 'us-east-1' },
          ...formValues,
        }}
        onSubmit={() => {}}
      >
        <ClusterRolesScreen />
      </Formik>,
    );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders header and description, and shows Manual/Auto choices when OCM role fetch succeeds', async () => {
    renderWithFormik();

    expect(screen.getByText('Cluster roles and policies')).toBeInTheDocument();
    expect(
      screen.getByText(/Set whether you'd like to create the OIDC now or wait/i),
    ).toBeInTheDocument();

    // Toggle group for OIDC timing
    expect(screen.getByRole('button', { name: 'Create OIDC Later' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create OIDC Now' })).toBeInTheDocument();

    // Radio options for creation mode in MANAGED OIDC path
    expect(await screen.findByRole('radio', { name: 'Manual' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Auto' })).toBeInTheDocument();
  });

  it('disables Auto option when API says not admin (isAdmin=false)', async () => {
    useFetchGetOCMRole.mockReturnValue({
      data: { data: { isAdmin: false, arn: 'arn:aws:iam::123456789012:role/BasicOCMRole' } },
      error: undefined,
      isPending: false,
      isSuccess: true,
      status: 'success',
    });
    renderWithFormik();

    const auto = await screen.findByRole('radio', { name: 'Auto' });
    expect(auto).toBeDisabled();
  });

  it('shows BYO OIDC configuration field when toggled to Create OIDC Now', async () => {
    const { user } = renderWithFormik();

    const createNow = screen.getByRole('button', { name: 'Create OIDC Now' });
    await user.click(createNow);

    expect(await screen.findByText('Config ID')).toBeInTheDocument();
  });

  it('shows pending spinner when request is pending', async () => {
    useFetchGetOCMRole.mockReturnValue({
      data: undefined,
      error: undefined,
      isPending: true,
      isSuccess: false,
      status: 'pending',
    });
    renderWithFormik();

    expect(await screen.findByLabelText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Checking for admin OCM role...')).toBeInTheDocument();
  });

  it('shows error box when request fails', async () => {
    useFetchGetOCMRole.mockReturnValue({
      data: undefined,
      error: { errorMessage: 'some error' },
      isPending: false,
      isSuccess: false,
      status: 'error',
    });
    renderWithFormik();

    expect(
      await screen.findByText('ocm-role is no longer linked to your Red Hat organization'),
    ).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = renderWithFormik();
    await checkAccessibility(container);
  });

  it('renders correct documentation link when hypershift is not selected', async () => {
    useFetchGetOCMRole.mockReturnValue({
      data: { data: { isAdmin: false, arn: 'arn:aws:iam::123456789012:role/BasicOCMRole' } },
      error: undefined,
      isPending: false,
      isSuccess: true,
      status: 'success',
    });
    renderWithFormik({ [FieldId.Hypershift]: 'false' });

    const link = screen.getByText('Learn more about ROSA roles');
    expect(link).toHaveAttribute('href', links.ROSA_CLASSIC_AWS_IAM_RESOURCES);
  });
});
