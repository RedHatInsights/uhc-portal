import React from 'react';

import { useFetchGcpFirewallRule } from '~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpFirewallRule';
import { GCP_BYO_FIREWALL_RULES } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import { GcpFirewallRulesRow } from './GcpFirewallRulesRow';

jest.mock('~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpFirewallRule', () => ({
  useFetchGcpFirewallRule: jest.fn(),
}));

const useFetchGcpFirewallRuleMock = useFetchGcpFirewallRule as jest.Mock;

describe('<GcpFirewallRulesRow />', () => {
  beforeEach(() => {
    mockUseFeatureGate([[GCP_BYO_FIREWALL_RULES, true]]);
    useFetchGcpFirewallRuleMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when the feature gate is disabled', () => {
    mockUseFeatureGate([[GCP_BYO_FIREWALL_RULES, false]]);

    const { container } = render(<GcpFirewallRulesRow firewallRulesId="fw-1" />);

    expect(container).toBeEmptyDOMElement();
    expect(useFetchGcpFirewallRuleMock).toHaveBeenCalledWith('fw-1', false);
  });

  it('returns null when firewallRulesId is missing', () => {
    const { container } = render(<GcpFirewallRulesRow />);

    expect(container).toBeEmptyDOMElement();
    expect(useFetchGcpFirewallRuleMock).toHaveBeenCalledWith(undefined, false);
  });

  it('renders the firewall rule name when loaded', () => {
    useFetchGcpFirewallRuleMock.mockReturnValue({
      data: { id: 'fw-1', name: 'prod-byo-firewall' },
      isLoading: false,
      isError: false,
    });

    render(<GcpFirewallRulesRow firewallRulesId="fw-1" />);

    expect(screen.getByText('Firewall rules')).toBeInTheDocument();
    expect(screen.getByText('prod-byo-firewall')).toBeInTheDocument();
    expect(useFetchGcpFirewallRuleMock).toHaveBeenCalledWith('fw-1', true);
  });

  it('falls back to the firewall rules id when the name is missing', () => {
    useFetchGcpFirewallRuleMock.mockReturnValue({
      data: { id: 'fw-1' },
      isLoading: false,
      isError: false,
    });

    render(<GcpFirewallRulesRow firewallRulesId="fw-1" />);

    expect(screen.getByText('fw-1')).toBeInTheDocument();
  });

  it('shows a loading spinner while the firewall rule is fetching', () => {
    useFetchGcpFirewallRuleMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<GcpFirewallRulesRow firewallRulesId="fw-1" />);

    expect(screen.getByLabelText('Loading firewall rules')).toBeInTheDocument();
  });

  it('shows an error message when the firewall rule request fails', () => {
    useFetchGcpFirewallRuleMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<GcpFirewallRulesRow firewallRulesId="fw-1" />);

    expect(screen.getByText('Unable to load firewall rules name')).toBeInTheDocument();
  });
});
