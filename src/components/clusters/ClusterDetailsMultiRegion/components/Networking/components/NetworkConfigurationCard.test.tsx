import React from 'react';

import { render, screen } from '~/testUtils';

import type { NetworkWithOvnSubnets } from './NetworkConfigurationCard';
import NetworkConfigurationCard from './NetworkConfigurationCard';

describe('<NetworkConfigurationCard />', () => {
  const baseNetwork: NetworkWithOvnSubnets = {
    machine_cidr: '10.0.0.0/16',
    service_cidr: '172.30.0.0/16',
    pod_cidr: '10.128.0.0/14',
    host_prefix: 23,
  };

  it('shows Network CIDRs title and existing CIDR rows', () => {
    render(<NetworkConfigurationCard network={baseNetwork} />);

    expect(screen.getByText('Network CIDRs')).toBeInTheDocument();
    expect(screen.getByText('Machine CIDR')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.0/16')).toBeInTheDocument();
    expect(screen.getByText('Service CIDR')).toBeInTheDocument();
    expect(screen.getByText('172.30.0.0/16')).toBeInTheDocument();
    expect(screen.getByText('Pod CIDR')).toBeInTheDocument();
    expect(screen.getByText('10.128.0.0/14')).toBeInTheDocument();
    expect(screen.getByText('Host prefix')).toBeInTheDocument();
    expect(screen.getByText('/23')).toBeInTheDocument();
  });

  it('hides Network type and OVN subnet rows when shouldShowOvnNetworkDetails is false', () => {
    render(
      <NetworkConfigurationCard
        network={{
          ...baseNetwork,
          type: 'OVNKubernetes',
          join_ipv4: '100.64.0.0/16',
          transit_ipv4: '100.65.0.0/16',
          masquerade_ipv4: '100.66.0.0/16',
        }}
        shouldShowOvnNetworkDetails={false}
      />,
    );

    expect(screen.queryByText('Network type')).not.toBeInTheDocument();
    expect(screen.queryByText('Join subnet')).not.toBeInTheDocument();
    expect(screen.queryByText('Transit subnet')).not.toBeInTheDocument();
    expect(screen.queryByText('Masquerade subnet')).not.toBeInTheDocument();
  });

  it('shows Network type and OVN subnet rows when enabled and fields are present', () => {
    render(
      <NetworkConfigurationCard
        network={{
          ...baseNetwork,
          type: 'OVNKubernetes',
          join_ipv4: '100.64.0.0/16',
          transit_ipv4: '100.65.0.0/16',
          masquerade_ipv4: '100.66.0.0/16',
        }}
        shouldShowOvnNetworkDetails
      />,
    );

    expect(screen.getByText('Network type')).toBeInTheDocument();
    expect(screen.getByText('OVNKubernetes')).toBeInTheDocument();
    expect(screen.getByText('Join subnet')).toBeInTheDocument();
    expect(screen.getByText('100.64.0.0/16')).toBeInTheDocument();
    expect(screen.getByText('Transit subnet')).toBeInTheDocument();
    expect(screen.getByText('100.65.0.0/16')).toBeInTheDocument();
    expect(screen.getByText('Masquerade subnet')).toBeInTheDocument();
    expect(screen.getByText('100.66.0.0/16')).toBeInTheDocument();
  });

  it('omits OVN rows when enabled but API fields are missing', () => {
    render(<NetworkConfigurationCard network={baseNetwork} shouldShowOvnNetworkDetails />);

    expect(screen.queryByText('Network type')).not.toBeInTheDocument();
    expect(screen.queryByText('Join subnet')).not.toBeInTheDocument();
    expect(screen.queryByText('Transit subnet')).not.toBeInTheDocument();
    expect(screen.queryByText('Masquerade subnet')).not.toBeInTheDocument();
  });
});
