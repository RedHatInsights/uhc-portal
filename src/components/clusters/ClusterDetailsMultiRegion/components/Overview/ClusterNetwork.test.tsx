import React from 'react';

import { HCP_OVN_IP4_SUBNETS } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, render, screen } from '~/testUtils';
import type { ClusterFromSubscription } from '~/types/types';

import fixtures from '../../__tests__/ClusterDetails.fixtures';

import ClusterNetwork from './ClusterNetwork';

describe('<ClusterNetwork />', () => {
  const baseCluster = fixtures.clusterDetails.cluster as unknown as ClusterFromSubscription;

  afterEach(() => {
    mockUseFeatureGate([]);
  });

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

  it('hides Network type and OVN subnet rows when the feature gate is disabled', () => {
    mockUseFeatureGate([[HCP_OVN_IP4_SUBNETS, false]]);
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

    expect(screen.queryByTestId('networkType')).not.toBeInTheDocument();
    expect(screen.queryByTestId('joinSubnet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('transitSubnet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('masqueradeSubnet')).not.toBeInTheDocument();
  });

  it('hides Network type and OVN subnet rows for non-Hypershift clusters', () => {
    mockUseFeatureGate([[HCP_OVN_IP4_SUBNETS, true]]);
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

  it('shows Network type and OVN subnet rows for Hypershift 4.18+ when the gate is enabled', () => {
    mockUseFeatureGate([[HCP_OVN_IP4_SUBNETS, true]]);
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
