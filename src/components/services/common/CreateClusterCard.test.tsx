import React from 'react';

import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { render, screen } from '~/testUtils';

import { CreateClusterCard } from './CreateClusterCard';

jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions', () => ({
  useCanCreateManagedCluster: jest.fn(),
}));

describe('<CreateClusterCard />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const props = {
    linkComponentURL: 'fake-url',
    title: 'fake-title',
    bodyContent: 'fake-content',
    createClusterBtnTitle: 'fake-title',
  };

  it('Disables the button if user has no permissions to create a managed cluster', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: false,
    });
    render(<CreateClusterCard {...props} />);
    expect(screen.getByTestId('register-cluster')).toHaveAttribute('aria-disabled', 'true');
  });
  it('Enables the button if user has no permissions to create a managed cluster', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: true,
    });
    render(<CreateClusterCard {...props} />);
    expect(screen.getByTestId('register-cluster')).not.toHaveAttribute('aria-disabled');
  });
});
