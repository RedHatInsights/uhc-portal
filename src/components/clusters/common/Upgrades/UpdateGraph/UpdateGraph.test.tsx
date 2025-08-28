import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';
import { AugmentedCluster } from '~/types/types';

import UpdateGraph from './UpdateGraph';

const defaultProps = {
  cluster: {
    id: 'myClusterId',
    version: {
      raw_id: 'clusterVersionId',
    },
    subscription: {
      id: 'mock-subscription-id',
      status: 'Active',
      managed: true,
      rh_region_id: 'us-east-1',
    },
  } as AugmentedCluster,
  upgradeGates: [
    {
      id: 'myUpgradeGatesId',
      sts_only: false,
      value: '4.12',
      version_raw_id_prefix: '4.12',
    },
  ],
  schedules: [
    {
      id: 'myUpgradePolicyId',
      schedule_type: 'automatic' as const,
      enable_minor_version_upgrades: false,
      version: '1.2.4',
    },
  ],
  hasMore: false,
  isHypershift: false,
  isSTSEnabled: false,
};

describe('<UpdateGraph />', () => {
  it('is accessible', async () => {
    const { container } = render(
      <UpdateGraph
        currentVersion="current version"
        updateVersion="next version"
        {...defaultProps}
      />,
    );

    expect(container.querySelectorAll('.ocm-upgrade-graph-version')).toHaveLength(2);
    expect(screen.getByText('current version')).toHaveClass('ocm-upgrade-graph-version');
    expect(screen.getByText('next version')).toHaveClass('ocm-upgrade-graph-version');

    // There currently isn't another way to select these elements
    expect(container.querySelectorAll('.ocm-upgrade-graph-version-dot')).toHaveLength(2);

    expect(screen.queryByText(/Additional versions available/)).not.toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('should render with no updates available', () => {
    const { container } = render(
      <UpdateGraph currentVersion="1.2.3" updateVersion={undefined} {...defaultProps} />,
    );

    expect(screen.getByText('1.2.3')).toHaveClass('ocm-upgrade-graph-version');
    expect(container.querySelectorAll('.ocm-upgrade-graph-version')).toHaveLength(1);

    expect(container.querySelectorAll('.ocm-upgrade-graph-version-dot')).toHaveLength(1);

    expect(screen.queryByText(/Additional versions available/)).not.toBeInTheDocument();
  });

  it('should render when additional versions are available', () => {
    const { container } = render(
      <UpdateGraph currentVersion="1.2.3" updateVersion="1.2.4" {...defaultProps} hasMore />,
    );

    expect(container.querySelectorAll('.ocm-upgrade-graph-version')).toHaveLength(2);
    expect(screen.getByText('1.2.3')).toHaveClass('ocm-upgrade-graph-version');
    expect(screen.getByText('1.2.4')).toHaveClass('ocm-upgrade-graph-version');

    expect(container.querySelectorAll('.ocm-upgrade-graph-version-dot')).toHaveLength(2);

    expect(
      screen.getByText('Additional versions available between 1.2.3 and 1.2.4'),
    ).toBeInTheDocument();
  });
});
