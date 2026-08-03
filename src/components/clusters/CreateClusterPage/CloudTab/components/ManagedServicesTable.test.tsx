import React from 'react';

import links from '~/components/clusters/CreateClusterPage/CreateClusterConsts';
import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { ROVS_REGISTRATION } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import { ManagedServicesTable } from './ManagedServicesTable';

jest.mock('@scalprum/react-core', () => ({
  ...jest.requireActual('@scalprum/react-core'),
  useRemoteHook: jest.fn(() => ({ hookResult: null })),
}));

jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions', () => ({
  useCanCreateManagedCluster: jest.fn(),
}));

describe('<ManagedServicesTable />', () => {
  beforeEach(() => {
    mockUseFeatureGate([[ROVS_REGISTRATION, false]]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Disables create OSD and create OSD trial buttons if user has no permissions', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: false,
    });
    render(<ManagedServicesTable isTrialEnabled />);
    expect(screen.getByTestId('osd-create-trial-cluster')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('osd-create-cluster-button')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
  it('Enables create OSD and create OSD trial buttons if user has permissions', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: true,
    });
    render(<ManagedServicesTable isTrialEnabled />);
    expect(screen.getByTestId('osd-create-trial-cluster')).not.toHaveAttribute('aria-disabled');
    expect(screen.getByTestId('osd-create-cluster-button')).not.toHaveAttribute('aria-disabled');
  });
  it('hides ROVS row when feature flag is disabled', () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: true,
    });
    render(<ManagedServicesTable hasOSDQuota />);
    expect(
      screen.queryByText('Red Hat OpenShift Virtualization Service on IBM Cloud'),
    ).not.toBeInTheDocument();
  });
  it('shows ROVS row when feature flag is enabled', () => {
    mockUseFeatureGate([[ROVS_REGISTRATION, true]]);
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: true,
    });
    render(<ManagedServicesTable hasOSDQuota />);
    expect(
      screen.getByText('Red Hat OpenShift Virtualization Service on IBM Cloud'),
    ).toHaveAttribute('href', links.IBM_CLOUD_ROVS);
    expect(screen.getByTestId('rovs-try-it-on-ibm')).toHaveAttribute('href', links.IBM_CLOUD_ROVS);
  });
});
