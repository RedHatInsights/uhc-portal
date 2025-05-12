import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import UpdateGraph from './UpdateGraph';

const defaultProps = {
  cluster: {
    id: 'myClusterId',
    version: {
      raw_id: 'clusterVersionId',
    },
  },
  upgradeGates: [
    {
      id: 'myUpgradeGatesId',
      sts_only: false,
      value: '4.12',
      version_raw_id_prefix: '4.12',
    },
  ],
  schedules: {
    items: [
      {
        id: 'myUpgradePolicyId',
        schedule_type: 'automatic',
        enable_minor_version_upgrades: false,
        version: '1.2.4',
      },
    ],
  },
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
    const { container } = render(<UpdateGraph currentVersion="1.2.3" {...defaultProps} />);

    expect(screen.getByText('1.2.3')).toHaveClass('ocm-upgrade-graph-version');
    expect(container.querySelectorAll('.ocm-upgrade-graph-version')).toHaveLength(1);

    expect(container.querySelectorAll('.ocm-upgrade-graph-version-dot')).toHaveLength(1);

    expect(screen.queryByText(/Additional versions available/)).not.toBeInTheDocument();
  });

  it('should render when additional versions are available', () => {
    const { container } = render(
      <UpdateGraph currentVersion="1.2.3" updateVersion="1.2.4" hasMore {...defaultProps} />,
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
