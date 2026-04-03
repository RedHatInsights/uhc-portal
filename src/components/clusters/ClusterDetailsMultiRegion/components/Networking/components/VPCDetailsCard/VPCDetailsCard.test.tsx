import * as React from 'react';

import { ClusterState } from '~/types/clusters_mgmt.v1/enums';
import { AugmentedCluster } from '~/types/types';

import { mockRestrictedEnv, render, screen } from '../../../../../../../testUtils';

import { VPCDetailsCard } from './VPCDetailsCard';

describe('<VPCDetailsCard />', () => {
  const defaultCluster = {
    aws: {
      subnet_ids: ['subnet-05281fa2678b6d8cd', 'subnet-03f3654ffc25369ac'],
    },
  } as AugmentedCluster;

  describe('in default environment', () => {
    it('renders footer', () => {
      render(<VPCDetailsCard cluster={defaultCluster} />);
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
      render(<VPCDetailsCard cluster={defaultCluster} />);
      expect(screen.queryByText('Edit cluster-wide proxy')).not.toBeInTheDocument();
    });
  });

  describe('When Private Service Connect Subnet is provided', () => {
    const cluster = {
      ...defaultCluster,
      gcp_network: 'gcpNetwork',
      gcp: {
        private_service_connect: {
          service_attachment_subnet: 'gcpPrivateServiceConnect',
        },
      },
    } as AugmentedCluster;

    it('renders Private Service Connect Subnet', () => {
      render(<VPCDetailsCard cluster={cluster} />);
      expect(screen.queryByText('Private Service Connect Subnet')).toBeInTheDocument();
      expect(screen.queryByText('gcpPrivateServiceConnect')).toBeInTheDocument();
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
    const cluster = {
      ...defaultCluster,
      ...clusterProps,
    } as AugmentedCluster;

    it('Edit button is disabled', () => {
      render(<VPCDetailsCard cluster={cluster} />);
      expect(screen.queryByText('Edit cluster-wide proxy').parentElement).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });
  });

  describe('When cluster is neither in read-only mode nor in one of the hibernation states, and user is allowed updates to the cluster resource', () => {
    const cluster = {
      ...defaultCluster,
      canUpdateClusterResource: true,
      state: ClusterState.installing,
      status: {
        configuration_mode: 'full',
      },
    } as AugmentedCluster;

    it('Edit button is enabled', () => {
      render(<VPCDetailsCard cluster={cluster} />);
      expect(screen.queryByText('Edit cluster-wide proxy')).not.toHaveAttribute(
        'aria-disabled',
        'false',
      );
    });
  });
});
