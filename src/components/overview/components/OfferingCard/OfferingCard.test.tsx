import React from 'react';

import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { render, screen } from '~/testUtils';

import OfferingCard from './OfferingCard';

jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions', () => ({
  useCanCreateManagedCluster: jest.fn(),
}));

describe('<OfferingCard />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Disables create cluster button if user has no permissions', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: false,
    });
    render(<OfferingCard offeringType="AWS" canCreateManagedCluster={false} />);
    expect(screen.getByTestId('create-cluster')).toHaveAttribute('aria-disabled', 'true');
  });
  it('Enables create cluster button if user has permissions', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: true,
    });
    render(<OfferingCard offeringType="AWS" canCreateManagedCluster />);
    expect(screen.getByTestId('create-cluster')).not.toHaveAttribute('aria-disabled');
  });
});
