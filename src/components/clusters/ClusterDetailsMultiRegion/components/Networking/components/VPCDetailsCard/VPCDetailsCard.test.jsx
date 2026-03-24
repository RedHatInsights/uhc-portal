import * as React from 'react';

import { GCP_DNS_ZONE } from '~/queries/featureGates/featureConstants';
import { ClusterState } from '~/types/clusters_mgmt.v1/enums';

import {
  mockRestrictedEnv,
  mockUseFeatureGate,
  render,
  screen,
} from '../../../../../../../testUtils';

import VPCDetailsCard from './VPCDetailsCard';

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
      render(<VPCDetailsCard {...props} />);
      expect(screen.queryByText('Shared VPC')).toBeInTheDocument();
      expect(screen.queryByText(sharedVpc)).toBeInTheDocument();
      expect(screen.queryByText('DNS zone')).toBeInTheDocument();
      expect(screen.queryByText(baseDomain)).toBeInTheDocument();
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
      expect(screen.queryByText('DNS zone')).not.toBeInTheDocument();
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
      expect(screen.queryByText('Edit cluster-wide proxy').parentElement).toHaveAttribute(
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
