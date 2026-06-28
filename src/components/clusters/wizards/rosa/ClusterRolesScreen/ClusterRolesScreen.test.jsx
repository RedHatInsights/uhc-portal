import React from 'react';
import { Formik } from 'formik';

import docLinks from '~/common/docLinks.mjs';
import { OCM_ROLE_NO_CONSOLE_PROFILE } from '~/components/clusters/wizards/rosa/rosaConstants';
import { OCM_ROLE_NO_CONSOLE } from '~/queries/featureGates/featureConstants';
import { useFetchGetOCMRole } from '~/queries/RosaWizardQueries/useFetchGetOCMRole';
import { checkAccessibility, mockUseFeatureGate, render, screen, waitFor } from '~/testUtils';

import { FieldId } from '../constants';

import ClusterRolesScreen from './ClusterRolesScreen';

mockUseFeatureGate([]);

jest.mock('~/queries/RosaWizardQueries/useFetchGetOCMRole', () => {
  const impl = {
    useFetchGetOCMRole: jest.fn().mockReturnValue({
      data: { isAdmin: true, arn: 'arn:aws:iam::123456789012:role/AdminOCMRole' },
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
  const baseFormikValues = {
    [FieldId.ClusterName]: 'my-cluster',
    [FieldId.Hypershift]: 'false',
    [FieldId.AssociatedAwsId]: '123456789012',
    [FieldId.RosaRolesProviderCreationMode]: undefined,
    [FieldId.CustomOperatorRolesPrefix]: '',
    [FieldId.ByoOidcConfigId]: '',
    [FieldId.InstallerRoleArn]: 'arn:aws:iam::123456789012:role/Installer',
    [FieldId.RegionalInstance]: { id: 'us-east-1' },
  };

  const buildFormikElement = (formValues = {}) => (
    <Formik initialValues={{ ...baseFormikValues, ...formValues }} onSubmit={() => {}}>
      <ClusterRolesScreen />
    </Formik>
  );

  const renderWithFormik = (formValues = {}) => render(buildFormikElement(formValues));

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
      data: { isAdmin: false, arn: 'arn:aws:iam::123456789012:role/BasicOCMRole' },
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

  describe('no_console OCM role', () => {
    const noConsoleOCMRole = {
      data: {
        profile: OCM_ROLE_NO_CONSOLE_PROFILE,
        isAdmin: false,
        arn: 'arn:aws:iam::123456789012:role/NoConsoleRole',
      },
      error: undefined,
      isPending: false,
      isSuccess: true,
      status: 'success',
    };

    it('shows limited permissions alert when feature gate is on and profile is no_console', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, true]]);
      useFetchGetOCMRole.mockReturnValue(noConsoleOCMRole);
      renderWithFormik();

      expect(await screen.findByText('OCM role has limited permissions')).toBeInTheDocument();
      expect(screen.getByText(/was created without console permissions/i)).toBeInTheDocument();
    });

    it('hides role mode radio buttons when feature gate is on and profile is no_console', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, true]]);
      useFetchGetOCMRole.mockReturnValue(noConsoleOCMRole);
      renderWithFormik();

      await screen.findByText('OCM role has limited permissions');
      expect(screen.queryByRole('radio', { name: 'Manual' })).not.toBeInTheDocument();
      expect(screen.queryByRole('radio', { name: 'Auto' })).not.toBeInTheDocument();
    });

    it('does not show limited permissions alert when feature gate is off', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, false]]);
      useFetchGetOCMRole.mockReturnValue(noConsoleOCMRole);
      renderWithFormik();

      await screen.findByRole('radio', { name: 'Manual' });
      expect(screen.queryByText('OCM role has limited permissions')).not.toBeInTheDocument();
    });

    it('enables and selects Auto mode after Refresh when admin role replaces no_console role', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, true]]);
      useFetchGetOCMRole.mockReturnValue(noConsoleOCMRole);

      const { user, rerender } = renderWithFormik();

      // Initially the no_console alert is shown and radio buttons are hidden
      expect(await screen.findByText('OCM role has limited permissions')).toBeInTheDocument();
      expect(screen.queryByRole('radio', { name: 'Auto' })).not.toBeInTheDocument();

      // Click Refresh — sets refreshPendingRef so the next fetch result re-derives the mode
      await user.click(screen.getByRole('button', { name: 'Refresh OCM role' }));

      // Simulate user fixing their OCM role: update mock to return admin data.
      // Done AFTER the click so refreshPendingRef is already true when the component
      // first sees the new data (otherwise the re-render from act() in user.click would
      // fire the effect with refreshPendingRef still false).
      useFetchGetOCMRole.mockReturnValue({
        data: {
          isAdmin: true,
          arn: 'arn:aws:iam::123456789012:role/AdminRole',
          profile: 'admin',
        },
        error: undefined,
        isPending: false,
        isSuccess: true,
        status: 'success',
      });

      // Force re-render to simulate React Query delivering the updated data
      rerender(buildFormikElement());

      // Alert should be gone and Auto mode should be enabled and selected
      expect(screen.queryByText('OCM role has limited permissions')).not.toBeInTheDocument();
      const auto = await screen.findByRole('radio', { name: 'Auto' });
      expect(auto).not.toBeDisabled();
      await waitFor(() => expect(auto).toBeChecked());
    });

    it('automatically enables and selects Auto mode when admin role is returned and feature gate is off', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, false]]);
      useFetchGetOCMRole.mockReturnValue({
        data: {
          isAdmin: true,
          arn: 'arn:aws:iam::123456789012:role/AdminRole',
          profile: 'admin',
        },
        error: undefined,
        isPending: false,
        isSuccess: true,
        status: 'success',
      });

      renderWithFormik();

      // No alert shown (flag off, no no_console check)
      expect(screen.queryByText('OCM role has limited permissions')).not.toBeInTheDocument();

      // Auto mode is enabled and selected automatically on initial load
      const auto = await screen.findByRole('radio', { name: 'Auto' });
      expect(auto).not.toBeDisabled();
      expect(auto).toBeChecked();
    });

    it('does not show limited permissions alert when profile is standard', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, true]]);
      useFetchGetOCMRole.mockReturnValue({
        data: {
          data: {
            profile: 'standard',
            isAdmin: false,
            arn: 'arn:aws:iam::123456789012:role/StandardRole',
          },
        },
        error: undefined,
        isPending: false,
        isSuccess: true,
        status: 'success',
      });
      renderWithFormik();

      await screen.findByRole('radio', { name: 'Manual' });
      expect(screen.queryByText('OCM role has limited permissions')).not.toBeInTheDocument();
    });
  });

  it('is accessible', async () => {
    const { container } = renderWithFormik();
    await checkAccessibility(container);
  });

  it('renders correct documentation link when hypershift is not selected', async () => {
    useFetchGetOCMRole.mockReturnValue({
      data: { isAdmin: false, arn: 'arn:aws:iam::123456789012:role/BasicOCMRole' },
      error: undefined,
      isPending: false,
      isSuccess: true,
      status: 'success',
    });
    renderWithFormik({ [FieldId.Hypershift]: 'false' });

    const link = screen.getByText('Learn more about ROSA roles');

    await waitFor(() => {
      expect(link).toHaveAttribute('href', docLinks.ROSA_CLASSIC_AWS_IAM_RESOURCES);
    });
  });

  it('does not render documentation link when hypershift is selected', async () => {
    useFetchGetOCMRole.mockReturnValue({
      data: { isAdmin: false, arn: 'arn:aws:iam::123456789012:role/BasicOCMRole' },
      error: undefined,
      isPending: false,
      isSuccess: true,
      status: 'success',
    });
    renderWithFormik({ [FieldId.Hypershift]: 'true' });

    const link = screen.queryByText('Learn more about ROSA roles');

    await waitFor(() => {
      expect(link).not.toBeInTheDocument();
    });
  });
});
