import React from 'react';

import { render, screen } from '~/testUtils';

import ClusterUpdateLink from '../ClusterUpdateLink';

describe('<ClusterUpdateLink />', () => {
  it('renders null for OCP when no upgrades are available', () => {
    const cluster = {
      managed: false,
      metrics: {
        upgrade: {
          available: false,
        },
      },
    };

    const { container } = render(<ClusterUpdateLink cluster={cluster} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders null for OCP when cluster.subscription.status === Stale', () => {
    const cluster = {
      managed: false,
      metrics: {
        upgrade: {
          available: true,
        },
      },
      subscription: {
        status: 'Stale',
      },
    };
    const { container } = render(<ClusterUpdateLink cluster={cluster} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders null for OSD when cluster.subscription.status === Stale', () => {
    const cluster = {
      managed: true,
      metrics: {
        upgrade: {
          available: true,
        },
      },
      subscription: {
        status: 'Stale',
      },
    };
    const { container } = render(<ClusterUpdateLink cluster={cluster} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows next version numbers when an upgrade is running', () => {
    const cluster = {
      openshift_version: 'some-old-version',
      version: {
        raw_id: 'some-old-version',
      },
      metrics: {
        upgrade: {
          available: true,
          state: 'running',
          version: 'some-new-version',
        },
      },
    };

    render(<ClusterUpdateLink cluster={cluster} />);
    expect(screen.getByText('→ some-new-version')).toBeInTheDocument();
  });

  it('shows update link for managed cluster when canUpdateSubscription is true', () => {
    const cluster = {
      managed: true,
      state: 'ready',
      openshift_version: '4.12.0',
      version: {
        raw_id: '4.12.0',
        available_upgrades: ['4.12.1'],
      },
      canUpdateSubscription: true,
      subscription: {
        id: 'subscription-id',
        status: 'Active',
      },
      metrics: {
        upgrade: {
          available: true,
        },
      },
    };

    render(<ClusterUpdateLink cluster={cluster} />);

    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });

  it('shows update link for managed cluster when only list canEdit is true', () => {
    const cluster = {
      managed: true,
      state: 'ready',
      openshift_version: '4.12.0',
      version: {
        raw_id: '4.12.0',
        available_upgrades: ['4.12.1'],
      },
      canEdit: true,
      subscription: {
        id: 'subscription-id',
        status: 'Active',
      },
      metrics: {
        upgrade: {
          available: true,
        },
      },
    };

    render(<ClusterUpdateLink cluster={cluster} />);

    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });

  it('renders null for managed cluster when user cannot update subscription', () => {
    const cluster = {
      managed: true,
      state: 'ready',
      openshift_version: '4.12.0',
      version: {
        raw_id: '4.12.0',
        available_upgrades: ['4.12.1'],
      },
      canUpdateSubscription: false,
      subscription: {
        id: 'subscription-id',
        status: 'Active',
      },
      metrics: {
        upgrade: {
          available: true,
        },
      },
    };

    const { container } = render(<ClusterUpdateLink cluster={cluster} />);

    expect(container).toBeEmptyDOMElement();
  });
});
