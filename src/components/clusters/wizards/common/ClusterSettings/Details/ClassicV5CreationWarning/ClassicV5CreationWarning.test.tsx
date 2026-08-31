import React from 'react';

import { trackEvents } from '~/common/analytics';
import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, screen, within, withState } from '~/testUtils';
import { Organization } from '~/types/accounts_mgmt.v1';

import { ClassicV5CreationWarning } from './ClassicV5CreationWarning';

const useAnalyticsMock = jest.fn();
jest.mock('~/hooks/useAnalytics', () => jest.fn(() => useAnalyticsMock));

const rosaClassicWarningTitle =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for ROSA Classic (EUS Term 1).';
const rosaWarningBody = 'To use OpenShift v5, please create a ROSA HCP cluster.';
const rosaHcpWarningTitle =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for ROSA (EUS Term 1).';
const osdWarningTitle =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for OSD Classic (EUS Term 1).';

const orgWithCapability = (value: 'true' | 'false'): Organization =>
  ({
    capabilities: [{ name: subscriptionCapabilities.ROSA_OSD_ALLOW_OCP_5, value }],
  }) as Organization;

const renderWarning = ({
  organization,
  ...props
}: React.ComponentProps<typeof ClassicV5CreationWarning> & {
  organization?: Organization;
}) =>
  withState({
    userProfile: {
      organization: {
        details: organization,
      },
    },
  }).render(<ClassicV5CreationWarning {...props} />);

describe('<ClassicV5CreationWarning />', () => {
  beforeEach(() => {
    mockUseFeatureGate([[OCP5_SUPPORT, true]]);
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = renderWarning({ isClassic: true, product: 'rosa' });

    await checkAccessibility(container);
  });

  it('renders the ROSA Classic warning with a plain title and link in the alert body', async () => {
    const { user } = renderWarning({ isClassic: true, product: 'rosa' });

    const alert = screen.getByTestId('classic-v5-creation-warning');
    expect(alert).toHaveTextContent(rosaClassicWarningTitle);
    expect(within(alert).getByRole('heading')).toBeInTheDocument();
    expect(within(alert).queryByRole('link')).toBeInTheDocument();
    expect(within(within(alert).getByRole('heading')).queryByRole('link')).not.toBeInTheDocument();

    expect(within(alert).getByText(/To use OpenShift v5, please/i)).toBeInTheDocument();
    expect(alert).toHaveTextContent(rosaWarningBody);

    const link = within(alert).getByRole('link', { name: 'create a ROSA HCP cluster' });
    expect(link).toHaveAttribute('href', '/openshift/create/rosa/getstarted');

    useAnalyticsMock.mockClear();
    await user.click(link);

    expect(useAnalyticsMock).toHaveBeenCalledWith(trackEvents.CreateClusterROSA, {
      url: '/create/rosa/getstarted',
      path: window.location.pathname,
    });
  });

  it('renders the OSD Classic warning message', () => {
    renderWarning({
      isClassic: true,
      product: 'osd',
    });

    const alert = screen.getByTestId('classic-v5-creation-warning');
    expect(alert).toHaveTextContent(osdWarningTitle);
    expect(
      screen.queryByRole('link', { name: 'create a ROSA HCP cluster' }),
    ).not.toBeInTheDocument();
  });

  it('renders the ROSA HCP warning when a v4 version is selected', () => {
    renderWarning({
      isClassic: false,
      product: 'rosa',
      selectedVersion: '4.19.0',
    });

    const alert = screen.getByTestId('classic-v5-creation-warning');
    expect(alert).toHaveTextContent(rosaHcpWarningTitle);
    expect(
      screen.queryByRole('link', { name: 'create a ROSA HCP cluster' }),
    ).not.toBeInTheDocument();
  });

  it('does not render for ROSA HCP when a v5 version is selected', () => {
    renderWarning({
      isClassic: false,
      product: 'rosa',
      selectedVersion: '5.0.0',
    });

    expect(screen.queryByTestId('classic-v5-creation-warning')).not.toBeInTheDocument();
  });

  it('renders ROSA HCP v4 warning even when organization has ROSA_OSD_ALLOW_OCP_5', () => {
    renderWarning({
      isClassic: false,
      product: 'rosa',
      selectedVersion: '4.19.0',
      organization: orgWithCapability('true'),
    });

    expect(screen.getByTestId('classic-v5-creation-warning')).toBeInTheDocument();
  });

  it('does not render if OCP5_SUPPORT feature gate is disabled', () => {
    mockUseFeatureGate([[OCP5_SUPPORT, false]]);
    renderWarning({ isClassic: true, product: 'rosa' });

    expect(screen.queryByTestId('classic-v5-creation-warning')).not.toBeInTheDocument();
  });

  it('does not render for HCP when no version is selected', () => {
    renderWarning({ isClassic: false, product: 'rosa' });

    expect(screen.queryByTestId('classic-v5-creation-warning')).not.toBeInTheDocument();
  });

  it('does not render if organization has ROSA_OSD_ALLOW_OCP_5 capability on Classic', () => {
    renderWarning({
      isClassic: true,
      product: 'rosa',
      organization: orgWithCapability('true'),
    });

    expect(screen.queryByTestId('classic-v5-creation-warning')).not.toBeInTheDocument();
  });
});
