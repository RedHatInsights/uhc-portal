import React from 'react';

import { trackEvents } from '~/common/analytics';
import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, screen, within, withState } from '~/testUtils';
import { Organization } from '~/types/accounts_mgmt.v1';

import { ClassicV5CreationWarning } from './ClassicV5CreationWarning';

const useAnalyticsMock = jest.fn();
jest.mock('~/hooks/useAnalytics', () => jest.fn(() => useAnalyticsMock));

const warningText = 'To use OpenShift v5, please create a ROSA HCP cluster.';

const orgWithCapability = (value: 'true' | 'false'): Organization =>
  ({
    capabilities: [{ name: subscriptionCapabilities.ROSA_OSD_ALLOW_OCP_5, value }],
  }) as Organization;

const renderWarning = ({ organization }: { organization?: Organization } = {}) =>
  withState({
    userProfile: {
      organization: {
        details: organization,
      },
    },
  }).render(<ClassicV5CreationWarning />);

describe('<ClassicV5CreationWarning />', () => {
  beforeEach(() => {
    mockUseFeatureGate([[OCP5_SUPPORT, true]]);
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = renderWarning();

    await checkAccessibility(container);
  });

  it('renders the warning with a tracked link to create a ROSA HCP cluster', async () => {
    const { user } = renderWarning();

    const alert = screen.getByTestId('classic-v5-creation-warning');
    expect(alert).toHaveTextContent(warningText);

    const link = within(alert).getByRole('link', { name: 'create a ROSA HCP cluster' });
    expect(link).toHaveAttribute('href', '/openshift/create/rosa/getstarted');

    useAnalyticsMock.mockClear();
    await user.click(link);

    expect(useAnalyticsMock).toHaveBeenCalledWith(trackEvents.CreateClusterROSA, {
      url: '/create/rosa/getstarted',
      path: window.location.pathname,
    });
  });

  it('does not render if OCP5_SUPPORT feature gate is disabled', () => {
    mockUseFeatureGate([[OCP5_SUPPORT, false]]);
    renderWarning();

    expect(screen.queryByTestId('classic-v5-creation-warning')).not.toBeInTheDocument();
  });

  it('does not render if organization has ROSA_OSD_ALLOW_OCP_5 capability', () => {
    renderWarning({ organization: orgWithCapability('true') });

    expect(screen.queryByTestId('classic-v5-creation-warning')).not.toBeInTheDocument();
  });
});
