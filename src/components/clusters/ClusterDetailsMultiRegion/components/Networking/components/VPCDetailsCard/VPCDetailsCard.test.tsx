import * as React from 'react';

import { useFetchGcpDnsZone } from '~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpDnsZone';
import { useFetchGcpFirewallRule } from '~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpFirewallRule';
import { GCP_BYO_FIREWALL_RULES, GCP_DNS_ZONE } from '~/queries/featureGates/featureConstants';
import { mockRestrictedEnv, mockUseFeatureGate, render, screen } from '~/testUtils';
import { ClusterState } from '~/types/clusters_mgmt.v1/enums';
import type { AugmentedCluster } from '~/types/types';

import VPCDetailsCard from './VPCDetailsCard';

jest.mock('~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpDnsZone', () => ({
  useFetchGcpDnsZone: jest.fn(),
}));
jest.mock('~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpFirewallRule', () => ({
  useFetchGcpFirewallRule: jest.fn(),
}));

const useFetchGcpDnsZoneMock = useFetchGcpDnsZone as jest.Mock;
const useFetchGcpFirewallRuleMock = useFetchGcpFirewallRule as jest.Mock;

const dnsZone = {
  Kind: 'DnsDomain',
  id: 'wnsb.s2.devshift.org',
  user_defined: true,
  cluster_arch: 'classic',
  cloud_provider: 'gcp',
  gcp: {
    domain_prefix: 'prefix1',
    project_id: 'project1',
    network_id: 'vpc1',
  },
  organization: {
    id: 'testOrg1',
  },
};

const firewallRule = {
  id: 'fw-1',
  name: 'prod-byo-firewall',
};

describe('<VPCDetailsCard />', () => {
  const defaultProps = {
    cluster: {
      aws: {
        subnet_ids: ['subnet-05281fa2678b6d8cd', 'subnet-03f3654ffc25369ac'],
      },
    } as AugmentedCluster,
  };

  beforeEach(() => {
    useFetchGcpDnsZoneMock.mockReturnValue({ data: undefined });
    useFetchGcpFirewallRuleMock.mockReturnValue({ data: undefined });
    mockUseFeatureGate([
      [GCP_DNS_ZONE, false],
      [GCP_BYO_FIREWALL_RULES, false],
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('in default environment', () => {
    it('renders footer', () => {
      render(<VPCDetailsCard {...defaultProps} />);
      expect(screen.queryByText('Edit cluster-wide proxy')).toBeInTheDocument();
    });
  });

  describe('in restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();
    beforeAll(() => {
      isRestrictedEnv.mockReturnValue(true);
    });
    afterAll(() => {
      isRestrictedEnv.mockReturnValue(false);
    });
    it('does not render footer', () => {
      render(<VPCDetailsCard {...defaultProps} />);
      expect(screen.queryByText('Edit cluster-wide proxy')).not.toBeInTheDocument();
    });
  });

  describe('PrivateLink', () => {
    it.each([
      ['Enabled', true],
      ['Disabled', false],
    ])('renders PrivateLink as %s for classic ROSA clusters', (label, privateLink) => {
      render(
        <VPCDetailsCard
          cluster={
            {
              aws: {
                subnet_ids: ['subnet-05281fa2678b6d8cd'],
                private_link: privateLink,
              },
              hypershift: { enabled: false },
            } as AugmentedCluster
          }
        />,
      );

      expect(screen.getByText('PrivateLink')).toBeInTheDocument();
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it('does not render PrivateLink for HCP clusters', () => {
      render(
        <VPCDetailsCard
          cluster={
            {
              aws: {
                subnet_ids: ['subnet-05281fa2678b6d8cd'],
                private_link: false,
              },
              hypershift: { enabled: true },
            } as AugmentedCluster
          }
        />,
      );

      expect(screen.queryByText('PrivateLink')).not.toBeInTheDocument();
    });
  });

  describe('When Private Service Connect Subnet is provided', () => {
    const props = {
      cluster: {
        gcp_network: {},
        gcp: {
          private_service_connect: {
            service_attachment_subnet: 'gcpPrivateServiceConnect',
          },
        },
      } as AugmentedCluster,
    };

    it('renders Private Service Connect Subnet', () => {
      render(<VPCDetailsCard {...props} />);
      expect(screen.queryByText('Private Service Connect Subnet')).toBeInTheDocument();
      expect(screen.queryByText('gcpPrivateServiceConnect')).toBeInTheDocument();
    });
  });

  describe('When shared vpc is provided', () => {
    const baseDomain = 'wnsb.s2.devshift.org';
    const sharedVpc = 'shared-vpc1';
    const props = {
      cluster: {
        cloud_provider: { id: 'gcp' },
        gcp_network: {
          vpc_name: 'test-vpc1',
          control_plane_subnet: 'test-vpc1-control-plane',
          compute_subnet: 'test-vpc1-worker',
          vpc_project_id: sharedVpc,
        },
        gcp: {},
        dns: {
          base_domain: baseDomain,
        },
      } as AugmentedCluster,
    };

    it('renders shared vpc details when shared vpc exists', () => {
      useFetchGcpDnsZoneMock.mockReturnValue({
        data: dnsZone,
      });
      mockUseFeatureGate([
        [GCP_DNS_ZONE, true],
        [GCP_BYO_FIREWALL_RULES, false],
      ]);
      render(<VPCDetailsCard {...props} />);
      expect(screen.queryByText('Shared VPC')).toBeInTheDocument();
      expect(screen.queryByText(sharedVpc)).toBeInTheDocument();
      expect(screen.queryByText('DNS Zone')).toBeInTheDocument();
      expect(screen.queryByText(`${dnsZone.gcp.domain_prefix}.${baseDomain}`)).toBeInTheDocument();
    });

    it('does not show shared vpc details when shared vpc does not exist', () => {
      mockUseFeatureGate([
        [GCP_DNS_ZONE, true],
        [GCP_BYO_FIREWALL_RULES, false],
      ]);
      const newProps = {
        cluster: {
          ...props.cluster,
          gcp_network: {
            vpc_name: 'test-vpc1',
            control_plane_subnet: 'test-vpc1-control-plane',
            compute_subnet: 'test-vpc1-worker',
            vpc_project_id: '',
          },
        } as AugmentedCluster,
      };

      render(<VPCDetailsCard {...newProps} />);
      expect(screen.queryByText('Shared VPC')).not.toBeInTheDocument();
      expect(screen.queryByText(sharedVpc)).not.toBeInTheDocument();
      expect(screen.queryByText('DNS Zone')).not.toBeInTheDocument();
      expect(screen.queryByText(baseDomain)).not.toBeInTheDocument();
    });

    it('renders Firewall Rules under Shared VPC when firewall_rules_id is present', () => {
      useFetchGcpDnsZoneMock.mockReturnValue({ data: dnsZone });
      useFetchGcpFirewallRuleMock.mockReturnValue({ data: firewallRule });
      mockUseFeatureGate([
        [GCP_DNS_ZONE, true],
        [GCP_BYO_FIREWALL_RULES, true],
      ]);

      render(
        <VPCDetailsCard
          cluster={
            {
              ...props.cluster,
              gcp_network: {
                ...props.cluster.gcp_network,
                firewall_rules_id: firewallRule.id,
              },
            } as AugmentedCluster
          }
        />,
      );

      expect(screen.getByText('Shared VPC')).toBeInTheDocument();
      expect(screen.getByText('Firewall rules')).toBeInTheDocument();
      expect(screen.getByText('prod-byo-firewall')).toBeInTheDocument();
      expect(useFetchGcpFirewallRuleMock).toHaveBeenCalledWith(firewallRule.id, true);
    });
  });

  describe('Firewall Rules for non-shared VPC', () => {
    it('renders Firewall rules under VPC Details when firewall_rules_id is present', () => {
      useFetchGcpFirewallRuleMock.mockReturnValue({ data: firewallRule });
      mockUseFeatureGate([
        [GCP_DNS_ZONE, false],
        [GCP_BYO_FIREWALL_RULES, true],
      ]);

      render(
        <VPCDetailsCard
          cluster={
            {
              cloud_provider: { id: 'gcp' },
              gcp_network: {
                vpc_name: 'mipereir-byo-vpc',
                firewall_rules_id: firewallRule.id,
              },
            } as AugmentedCluster
          }
        />,
      );

      expect(screen.getByText('VPC Details')).toBeInTheDocument();
      expect(screen.queryByText('Shared VPC')).not.toBeInTheDocument();
      expect(screen.getByText('Firewall rules')).toBeInTheDocument();
      expect(screen.getByText('prod-byo-firewall')).toBeInTheDocument();
    });

    it('does not render Firewall Rules when the feature gate is disabled', () => {
      useFetchGcpFirewallRuleMock.mockReturnValue({ data: firewallRule });
      mockUseFeatureGate([
        [GCP_DNS_ZONE, false],
        [GCP_BYO_FIREWALL_RULES, false],
      ]);

      render(
        <VPCDetailsCard
          cluster={
            {
              cloud_provider: { id: 'gcp' },
              gcp_network: {
                vpc_name: 'mipereir-byo-vpc',
                firewall_rules_id: firewallRule.id,
              },
            } as AugmentedCluster
          }
        />,
      );

      expect(screen.queryByText('Firewall rules')).not.toBeInTheDocument();
      expect(useFetchGcpFirewallRuleMock).toHaveBeenCalledWith(firewallRule.id, false);
    });
  });

  describe.each([
    [
      'cluster is in read-only mode, and user is allowed to update cluster resource',
      {
        status: {
          configuration_mode: 'read_only',
        },
        canUpdateClusterResource: true,
      },
    ],
    [
      'cluster is hibernating',
      {
        state: ClusterState.hibernating,
      },
    ],
    [
      'cluster is resuming from hibernation, and user is allowed to update cluster resource',
      {
        state: ClusterState.resuming,
        canUpdateClusterResource: true,
      },
    ],
    [
      'user is not allowed to update cluster resource',
      {
        canUpdateClusterResource: false,
      },
    ],
  ])('When %s', (title, clusterProps) => {
    const props = {
      cluster: {
        ...defaultProps.cluster,
        ...clusterProps,
      } as AugmentedCluster,
    };

    it('Edit button is disabled', () => {
      render(<VPCDetailsCard {...props} />);
      expect(screen.queryByText('Edit cluster-wide proxy')?.parentElement).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });
  });

  describe('When cluster is neither in read-only mode nor in one of the hibernation states, and user is allowed updates to the cluster resource', () => {
    const props = {
      cluster: {
        ...defaultProps.cluster,
        canUpdateClusterResource: true,
        state: ClusterState.installing,
        status: {
          configuration_mode: 'full',
        },
      } as AugmentedCluster,
    };

    it('Edit button is enabled', () => {
      render(<VPCDetailsCard {...props} />);
      expect(screen.queryByText('Edit cluster-wide proxy')).not.toHaveAttribute(
        'aria-disabled',
        'false',
      );
    });
  });
});
