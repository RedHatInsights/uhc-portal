import React from 'react';

import { ROVS_REGISTRATION } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, render, screen } from '~/testUtils';

import ClusterListFilterDropdown from './ClusterListFilterDropdown';

describe('<ClusterListFilterDropdown />', () => {
  const setFilter = jest.fn();

  const defaultProps = {
    setFilter,
    currentFilters: {},
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    mockUseFeatureGate([[ROVS_REGISTRATION, false]]);
    const { container, user } = render(<ClusterListFilterDropdown {...defaultProps} />);

    await user.click(screen.getByRole('button'));
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    await checkAccessibility(container);
    ['OCP', 'OSD', 'ROSA', 'ARO', 'RHOIC'].forEach((clusterType) => {
      expect(screen.getByText(clusterType)).toBeInTheDocument();
    });
  });

  it('hides ROVS when feature flag is disabled', async () => {
    mockUseFeatureGate([[ROVS_REGISTRATION, false]]);
    const { user } = render(<ClusterListFilterDropdown {...defaultProps} />);

    await user.click(screen.getByRole('button'));
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.queryByText('ROVS')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cluster-type-ROVS')).not.toBeInTheDocument();
  });

  it('shows ROVS when feature flag is enabled', async () => {
    mockUseFeatureGate([[ROVS_REGISTRATION, true]]);
    const { user } = render(<ClusterListFilterDropdown {...defaultProps} />);

    await user.click(screen.getByRole('button'));
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByTestId('cluster-type-ROVS')).toBeInTheDocument();
  });
});
