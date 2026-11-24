import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';
import type { ClusterFromSubscription } from '~/types/types';

import fixtures from '../../__tests__/ClusterDetails.fixtures';

import ClusterNetwork from './ClusterNetwork';

describe('<ClusterNetwork />', () => {
  const baseCluster = fixtures.clusterDetails.cluster as unknown as ClusterFromSubscription;

  it('is accessible', async () => {
    //  <dl> is added because this is displayed inside dl in the parent component.
    const { container } = render(
      <dl>
        <ClusterNetwork cluster={baseCluster} />
      </dl>,
    );
    await checkAccessibility(container);
  });

  it('shows existing CIDR rows and keeps the Network group label', () => {
    render(
      <dl>
        <ClusterNetwork cluster={baseCluster} />
      </dl>,
    );

    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByTestId('machineCIDR')).toHaveTextContent('10.0.0.0/16');
    expect(screen.getByTestId('serviceCIDR')).toHaveTextContent('172.30.0.0/16');
    expect(screen.getByTestId('podCIDR')).toHaveTextContent('10.128.0.0/14');
    expect(screen.getByTestId('hostPrefix')).toHaveTextContent('23');
  });

  it('hides Network type and OVN subnet rows for non-Hypershift clusters', () => {
    const cluster = {
      ...baseCluster,
      hypershift: { enabled: false },
      openshift_version: '4.18.0',
      network: {
        ...baseCluster.network,
        type: 'OVNKubernetes',
        join_ipv4: '100.64.0.0/16',
        transit_ipv4: '100.65.0.0/16',
        masquerade_ipv4: '100.66.0.0/16',
      },
    } as ClusterFromSubscription;

    render(
      <dl>
        <ClusterNetwork cluster={cluster} />
      </dl>,
    );

    expect(screen.queryByTestId('networkType')).not.toBeInTheDocument();
    expect(screen.queryByTestId('joinSubnet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('transitSubnet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('masqueradeSubnet')).not.toBeInTheDocument();
  });

  it('shows Network type and OVN subnet rows for Hypershift 4.18+ when fields are present', () => {
    const cluster = {
      ...baseCluster,
      hypershift: { enabled: true },
      openshift_version: '4.18.0',
      network: {
        ...baseCluster.network,
        type: 'OVNKubernetes',
        join_ipv4: '100.64.0.0/16',
        transit_ipv4: '100.65.0.0/16',
        masquerade_ipv4: '100.66.0.0/16',
      },
    } as ClusterFromSubscription;

    render(
      <dl>
        <ClusterNetwork cluster={cluster} />
      </dl>,
    );

    expect(screen.getByTestId('networkType')).toHaveTextContent('OVNKubernetes');
    expect(screen.getByTestId('joinSubnet')).toHaveTextContent('100.64.0.0/16');
    expect(screen.getByTestId('transitSubnet')).toHaveTextContent('100.65.0.0/16');
    expect(screen.getByTestId('masqueradeSubnet')).toHaveTextContent('100.66.0.0/16');
  });
});
