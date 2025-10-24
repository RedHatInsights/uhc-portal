import React from 'react';

import {
  AWS_TAGS_NEW_MP,
  CAPACITY_RESERVATION_ID_FIELD,
} from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';
import { MachinePool, NodePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import MachinePoolExpandedRow from '../components/MachinePoolExpandedRow';

const vpc = {
  aws_security_groups: [
    {
      name: '',
      id: 'sg-group-without-a-name',
    },
    {
      name: 'abc is my name',
      id: 'sg-abc',
    },
  ],
};

jest.mock('~/components/clusters/common/useAWSVPCFromCluster', () => ({
  useAWSVPCFromCluster: () => ({ clusterVpc: vpc }),
}));

const defaultMachinePool: MachinePool = {
  aws: {
    additional_security_group_ids: ['sg-abc', 'sg-def'],
    spot_market_options: {}, // spot pricing, on-demand
  },
  labels: {
    fooLabel: 'barLabel',
    noValueLabel: '',
  },
  taints: [
    { key: 'fooTaint', value: 'barTaint', effect: 'NoExecute' },
    { key: 'helloTaint', value: 'worldTaint', effect: 'NoSchedule' },
  ],
  subnets: ['subnet-abc', 'subnet-def'],
  autoscaling: { min_replicas: 0, max_replicas: 4 },
};

const cluster = { id: 'my-cluster-id', hypershift: { enabled: true } } as ClusterFromSubscription;

const getDefaultProps = (machinePoolProps: Partial<MachinePool>) => ({
  cluster,
  isMultiZoneCluster: false,
  machinePool: {
    ...defaultMachinePool,
    ...machinePoolProps,
  },
});

const defaultNodePool: NodePool = {
  labels: {
    fooLabel: 'barLabel',
    noValueLabel: '',
  },
  taints: [
    { key: 'fooTaint', value: 'barTaint', effect: 'NoExecute' },
    { key: 'helloTaint', value: 'worldTaint', effect: 'NoSchedule' },
  ],
  aws_node_pool: {
    tags: {
      fooTag: 'fooTagValue',
      barTag: 'barTagValue',
      foobarTag: 'fooBarValue',
    },
  },
  auto_repair: undefined,
};

const getNodePoolProps = (nodePoolProps: Partial<NodePool>) => ({
  cluster,
  isMultiZoneCluster: false,
  machinePool: {
    ...defaultNodePool,
    ...nodePoolProps,
  },
});

const verifyTextIsPresent = (textItems: string[]) => {
  textItems.forEach((textItem) => {
    expect(screen.queryByText(textItem)).toBeInTheDocument();
  });
};

describe('MachinePoolExpandedRow', () => {
  describe('Labels', () => {
    it('are displayed correctly without AWS tags', () => {
      mockUseFeatureGate([[AWS_TAGS_NEW_MP, false]]);
      render(<MachinePoolExpandedRow {...getDefaultProps({})} />);
      expect(screen.getAllByText('Labels')[0]).toBeInTheDocument();
      verifyTextIsPresent(['fooLabel = barLabel']);
      expect(screen.getByRole('button', { name: /1 remaining/i })).toBeInTheDocument();
    });

    it('are displayed correctly with AWS tags', () => {
      mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
      render(<MachinePoolExpandedRow {...getNodePoolProps({})} />);
      expect(screen.getByText('Labels and AWS tags')).toBeInTheDocument();
      verifyTextIsPresent(['fooLabel = barLabel']);
      expect(screen.getByRole('button', { name: /1 remaining/i })).toBeInTheDocument();
    });

    it('are not displayed if there are none', () => {
      render(<MachinePoolExpandedRow {...getNodePoolProps({ labels: {} })} />);
      expect(screen.queryByText('Labels')).not.toBeInTheDocument();
    });
  });

  describe('AWS tags', () => {
    it('are displayed correctly', () => {
      mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
      render(<MachinePoolExpandedRow {...getNodePoolProps({})} />);
      expect(screen.getByText('AWS tags')).toBeInTheDocument();
      verifyTextIsPresent(['fooTag = fooTagValue']);
      expect(screen.getByRole('button', { name: /2 remaining/i })).toBeInTheDocument();
    });

    it('are not displayed if there are none', () => {
      render(
        <MachinePoolExpandedRow
          {...getNodePoolProps({
            aws_node_pool: {},
          })}
        />,
      );
      expect(screen.queryByText('AWS tags')).not.toBeInTheDocument();
    });
  });

  describe('Taints', () => {
    it('are displayed correctly', () => {
      render(<MachinePoolExpandedRow {...getDefaultProps({})} />);
      expect(screen.getByText('Taints')).toBeInTheDocument();
      verifyTextIsPresent(['fooTaint = barTaint:NoExecute', 'helloTaint = worldTaint:NoSchedule']);
    });

    it('are not displayed if there are none', () => {
      render(
        <MachinePoolExpandedRow
          {...getDefaultProps({
            taints: undefined,
          })}
        />,
      );
      expect(screen.queryByText('Taints')).not.toBeInTheDocument();
    });
  });

  describe('Security groups', () => {
    it('are displayed using their names if available', () => {
      render(<MachinePoolExpandedRow {...getDefaultProps({})} />);
      expect(screen.getByText('Security groups')).toBeInTheDocument();
      verifyTextIsPresent(['abc is my name']);
    });
    it('are displayed using their IDs if names are not available', () => {
      render(<MachinePoolExpandedRow {...getDefaultProps({})} />);
      expect(screen.getByText('Security groups')).toBeInTheDocument();
      verifyTextIsPresent(['sg-def']);
    });

    it('are not displayed if there are none', () => {
      render(
        <MachinePoolExpandedRow
          {...getDefaultProps({
            aws: {
              additional_security_group_ids: [],
            },
          })}
        />,
      );
      expect(screen.queryByText('Security groups')).not.toBeInTheDocument();
    });
  });

  describe('Subnets', () => {
    it('are displayed correctly', () => {
      render(<MachinePoolExpandedRow {...getDefaultProps({})} />);
      expect(screen.getByText('Subnets')).toBeInTheDocument();
      verifyTextIsPresent(['subnet-abc', 'subnet-def']);
    });

    it('are not displayed if there are none', () => {
      render(
        <MachinePoolExpandedRow
          {...getDefaultProps({
            subnets: [],
          })}
        />,
      );
      expect(screen.queryByText('Subnets')).not.toBeInTheDocument();
    });
  });

  describe('Autoscaling settings', () => {
    it('are displayed correctly', () => {
      render(<MachinePoolExpandedRow {...getDefaultProps({})} />);
      expect(screen.getByText('Autoscaling')).toBeInTheDocument();
    });

    it('are not displayed if not enabled', () => {
      render(
        <MachinePoolExpandedRow
          {...getDefaultProps({
            autoscaling: undefined,
          })}
        />,
      );
      expect(screen.queryByText('Autoscaling')).not.toBeInTheDocument();
    });
  });

  describe('AutoRepair settings', () => {
    it('shows Enabled when true', () => {
      render(<MachinePoolExpandedRow {...getNodePoolProps({ auto_repair: true })} />);
      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    it('shows Disabled when false', () => {
      render(<MachinePoolExpandedRow {...getNodePoolProps({ auto_repair: false })} />);
      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });
  });

  describe('Capacity reservation settings', () => {
    it('shows N/A when no reservation id exists', () => {
      mockUseFeatureGate([[CAPACITY_RESERVATION_ID_FIELD, true]]);
      render(<MachinePoolExpandedRow {...getNodePoolProps({})} />);
      expect(screen.getByText('Reservation Id: N/A')).toBeInTheDocument();
    });

    it('shows the id when it exists', () => {
      mockUseFeatureGate([[CAPACITY_RESERVATION_ID_FIELD, true]]);
      render(
        <MachinePoolExpandedRow
          {...getNodePoolProps({ aws_node_pool: { capacity_reservation: { id: 'capId1' } } })}
        />,
      );
      expect(screen.getByText('Reservation Id: capId1')).toBeInTheDocument();
    });
  });

  describe('Spot price settings', () => {
    it('are displayed correctly', () => {
      render(<MachinePoolExpandedRow {...getDefaultProps({})} />);
      expect(screen.getByText('Spot instance pricing')).toBeInTheDocument();
    });

    it('are not displayed if not set', () => {
      render(
        <MachinePoolExpandedRow
          {...getDefaultProps({
            aws: {
              spot_market_options: undefined,
            },
          })}
        />,
      );
      expect(screen.queryByText('Spot instance pricing')).not.toBeInTheDocument();
    });
  });
});
