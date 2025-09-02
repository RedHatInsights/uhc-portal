import React from 'react';

import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { render, screen } from '~/testUtils';

import WithWizard from './WithWizardCard';

jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions', () => ({
  useCanCreateManagedCluster: jest.fn(),
}));

describe('<WithWizard />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Disables "Create with web interface" button if user has no permissions', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: false,
    });
    render(<WithWizard />);
    expect(screen.getByText('Create with web interface').parentElement).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
  it('Enables "Create with web interface" button if user has permissions', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: true,
    });
    render(<WithWizard />);
    expect(screen.getByText('Create with web interface').parentElement).not.toHaveAttribute(
      'aria-disabled',
    );
  });
});
