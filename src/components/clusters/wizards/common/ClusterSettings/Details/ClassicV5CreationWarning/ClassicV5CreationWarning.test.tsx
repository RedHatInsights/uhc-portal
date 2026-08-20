import React from 'react';

import { trackEvents } from '~/common/analytics';
import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, screen, withState } from '~/testUtils';
import { Organization } from '~/types/accounts_mgmt.v1';

import { ClassicV5CreationWarning } from './ClassicV5CreationWarning';

const useAnalyticsMock = jest.fn();
jest.mock('~/hooks/useAnalytics', () => jest.fn(() => useAnalyticsMock));

const rosaClassicWarningText =
  'OpenShift v4 reaches end of life on March 31, 2028. OpenShift 4.23 is the last supported version for ROSA Classic. To use OpenShift v5, please create a ROSA HCP cluster.';
const osdClassicWarningText =
  'OpenShift v4 reaches end of life on March 31, 2028. OpenShift 4.23 is the last supported version for OSD Classic.';

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

  it('renders the ROSA Classic warning with a link to create a ROSA HCP cluster', async () => {
    const { user } = renderWarning({ isClassic: true, product: 'rosa' });

    const alert = screen.getByTestId('classic-v5-creation-warning');
    expect(alert).toHaveTextContent(rosaClassicWarningText);

    const link = screen.getByRole('link', { name: 'create a ROSA HCP cluster' });
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

    expect(screen.getByText(osdClassicWarningText)).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'create a ROSA HCP cluster' }),
    ).not.toBeInTheDocument();
  });

  it('does not render if OCP5_SUPPORT feature gate is disabled', () => {
    mockUseFeatureGate([[OCP5_SUPPORT, false]]);
    renderWarning({ isClassic: true, product: 'rosa' });

    expect(screen.queryByTestId('classic-v5-creation-warning')).not.toBeInTheDocument();
  });

  it('does not render if cluster is not Classic', () => {
    renderWarning({ isClassic: false, product: 'rosa' });

    expect(screen.queryByTestId('classic-v5-creation-warning')).not.toBeInTheDocument();
  });

  it('does not render if organization has ROSA_OSD_ALLOW_OCP_5 capability', () => {
    renderWarning({
      isClassic: true,
      product: 'rosa',
      organization: orgWithCapability('true'),
    });

    expect(screen.queryByTestId('classic-v5-creation-warning')).not.toBeInTheDocument();
  });
});
