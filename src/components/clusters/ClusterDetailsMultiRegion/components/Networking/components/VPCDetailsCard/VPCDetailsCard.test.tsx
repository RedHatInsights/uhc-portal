import * as React from 'react';

import { useFetchGcpDnsZone } from '~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpDnsZone';
import { GCP_DNS_ZONE } from '~/queries/featureGates/featureConstants';
import { mockRestrictedEnv, mockUseFeatureGate, render, screen } from '~/testUtils';
import { ClusterState } from '~/types/clusters_mgmt.v1/enums';

import VPCDetailsCard from './VPCDetailsCard';

jest.mock('~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpDnsZone', () => ({
  useFetchGcpDnsZone: jest.fn(),
}));

const useFetchGcpDnsZoneMock = useFetchGcpDnsZone as jest.Mock;

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

describe('<VPCDetailsCard />', () => {
  const defaultProps = {
    cluster: {
      aws: {
        subnet_ids: ['subnet-05281fa2678b6d8cd', 'subnet-03f3654ffc25369ac'],
      },
    },
  };

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

  describe('When Private Service Connect Subnet is provided', () => {
    const props = {
      cluster: {
        gcp_network: 'gcpNetwork',
        gcp: {
          private_service_connect: {
            service_attachment_subnet: 'gcpPrivateServiceConnect',
          },
        },
      },
    };

    it('renders Private Service Connect Subnet', () => {
      render(<VPCDetailsCard {...props} />);
      expect(screen.queryByText('Private Service Connect Subnet')).toBeInTheDocument();
      expect(screen.queryByText('gcpPrivateServiceConnect')).toBeInTheDocument();
    });
  });

  describe('When shared vpc is provided', () => {
    useFetchGcpDnsZoneMock.mockReturnValue({
      data: dnsZone,
    });
    mockUseFeatureGate([[GCP_DNS_ZONE, true]]);
    const baseDomain = 'wnsb.s2.devshift.org';
    const sharedVpc = 'shared-vpc1';
    const props = {
      cluster: {
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
      },
    };

    it('renders shared vpc details when shared vpc exists', () => {
      useFetchGcpDnsZoneMock.mockReturnValue({
        data: dnsZone,
      });
      render(<VPCDetailsCard {...props} />);
      expect(screen.queryByText('Shared VPC')).toBeInTheDocument();
      expect(screen.queryByText(sharedVpc)).toBeInTheDocument();
      expect(screen.queryByText('DNS Zone')).toBeInTheDocument();
      expect(screen.queryByText(`${dnsZone.gcp.domain_prefix}.${baseDomain}`)).toBeInTheDocument();
    });

    it('does not show shared vpc details when shared vpc does not exist', () => {
      const newProps = {
        cluster: {
          ...props.cluster,
          gcp_network: {
            vpc_name: 'test-vpc1',
            control_plane_subnet: 'test-vpc1-control-plane',
            compute_subnet: 'test-vpc1-worker',
            vpc_project_id: '',
          },
        },
      };

      render(<VPCDetailsCard {...newProps} />);
      expect(screen.queryByText('Shared VPC')).not.toBeInTheDocument();
      expect(screen.queryByText(sharedVpc)).not.toBeInTheDocument();
      expect(screen.queryByText('DNS Zone')).not.toBeInTheDocument();
      expect(screen.queryByText(baseDomain)).not.toBeInTheDocument();
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
      },
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
      },
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
