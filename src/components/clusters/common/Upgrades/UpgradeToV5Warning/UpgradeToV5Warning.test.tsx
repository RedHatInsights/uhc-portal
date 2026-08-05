import React from 'react';

import { trackEvents } from '~/common/analytics';
import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, render, screen } from '~/testUtils';
import { Organization } from '~/types/accounts_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import UpgradeToV5Warning from './UpgradeToV5Warning';

const useAnalyticsMock = jest.fn();
jest.mock('~/hooks/useAnalytics', () => jest.fn(() => useAnalyticsMock));

const rosaClassicCluster = {
  product: { id: 'ROSA' },
  subscription: { plan: { type: 'ROSA' } },
} as unknown as AugmentedCluster;

const osdClassicGcpCluster = {
  subscription: { plan: { type: 'OSD' } },
  cloud_provider: { id: 'gcp' },
} as unknown as AugmentedCluster;

const rosaClassicWarningText =
  'OpenShift 5 is available, but upgrading from v4 to v5 is not supported on ROSA Classic clusters. To use OpenShift 5, create a new ROSA HCP cluster.';
const osdClassicWarningText =
  'OpenShift 5 is available, but upgrading from v4 to v5 is not supported on OSD Classic clusters.';

const orgWithCapability = (value: 'true' | 'false'): Organization =>
  ({
    capabilities: [{ name: subscriptionCapabilities.ROSA_OSD_ALLOW_OCP_5, value }],
  }) as Organization;

describe('<UpgradeToV5Warning />', () => {
  beforeEach(() => {
    mockUseFeatureGate([[OCP5_SUPPORT, true]]);
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(
      <UpgradeToV5Warning cluster={rosaClassicCluster} isHypershift={false} />,
    );

    await checkAccessibility(container);
  });

  it('renders the ROSA Classic warning copy with a link to create a ROSA HCP cluster', () => {
    render(<UpgradeToV5Warning cluster={rosaClassicCluster} isHypershift={false} />);

    const alert = screen.getByTestId('classic-upgrade-to-v5-warning');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(rosaClassicWarningText);

    expect(screen.getByRole('link', { name: 'create a new ROSA HCP cluster' })).toHaveAttribute(
      'href',
      '/openshift/create/rosa/getstarted',
    );
  });

  it('tracks a click on the "create a new ROSA HCP cluster" link', async () => {
    const { user } = render(
      <UpgradeToV5Warning cluster={rosaClassicCluster} isHypershift={false} />,
    );

    useAnalyticsMock.mockClear();

    await user.click(screen.getByRole('link', { name: 'create a new ROSA HCP cluster' }));

    expect(useAnalyticsMock).toHaveBeenCalledWith(trackEvents.CreateClusterROSA, {
      url: '/create/rosa/getstarted',
      path: window.location.pathname,
    });
  });

  it('renders the OSD Classic warning copy for OSD classic clusters', () => {
    render(<UpgradeToV5Warning cluster={osdClassicGcpCluster} isHypershift={false} />);

    expect(screen.getByText(osdClassicWarningText)).toBeInTheDocument();
  });

  it('does not render when the ocmui-ocp5-support feature flag is off', () => {
    mockUseFeatureGate([[OCP5_SUPPORT, false]]);

    render(<UpgradeToV5Warning cluster={rosaClassicCluster} isHypershift={false} />);

    expect(screen.queryByTestId('classic-upgrade-to-v5-warning')).not.toBeInTheDocument();
  });

  it('does not render for Hypershift clusters', () => {
    render(<UpgradeToV5Warning cluster={rosaClassicCluster} isHypershift />);

    expect(screen.queryByTestId('classic-upgrade-to-v5-warning')).not.toBeInTheDocument();
  });

  it('does not render when the org has the rosa_osd_allow_ocp_5 capability set to "true" and cluster is classic', () => {
    render(
      <UpgradeToV5Warning
        cluster={rosaClassicCluster}
        isHypershift={false}
        organization={orgWithCapability('true')}
      />,
    );

    expect(screen.queryByTestId('classic-upgrade-to-v5-warning')).not.toBeInTheDocument();
  });

  it('renders when the org capability is set to "false"', () => {
    render(
      <UpgradeToV5Warning
        cluster={rosaClassicCluster}
        isHypershift={false}
        organization={orgWithCapability('false')}
      />,
    );

    expect(screen.getByTestId('classic-upgrade-to-v5-warning')).toBeInTheDocument();
  });
});
