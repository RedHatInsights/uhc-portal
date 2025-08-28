import React from 'react';

import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { render, screen } from '~/testUtils';

import { ManagedServicesTable } from './ManagedServicesTable';

jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions', () => ({
  useCanCreateManagedCluster: jest.fn(),
}));

describe('<ManagedServicesTable />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Disables create OSD and create OSD trial buttons if user has no permissions', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: false,
    });
    render(<ManagedServicesTable hasOSDQuota isTrialEnabled />);
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
    render(<ManagedServicesTable hasOSDQuota isTrialEnabled />);
    expect(screen.getByTestId('osd-create-trial-cluster')).not.toHaveAttribute('aria-disabled');
    expect(screen.getByTestId('osd-create-cluster-button')).not.toHaveAttribute('aria-disabled');
  });
});
