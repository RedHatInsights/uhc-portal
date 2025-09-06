import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import SecurityGroupsTable from '~/components/clusters/wizards/common/ReviewCluster/SecurityGroupsTable';
import { SecurityGroup } from '~/types/clusters_mgmt.v1';

const meta: Meta<typeof SecurityGroupsTable> = {
  title: 'Wizards/Common/SecurityGroupsTable',
  component: SecurityGroupsTable,
  parameters: {
    metadata: {
      sourceFile:
        '~/components/clusters/common/VPCScreen/SecurityGroupsTable/SecurityGroupsTable.tsx',
      componentType: 'form-section',
      usage: ['Classic'],
      conditionalLogic: ['installToVpc', 'selectedVPC', 'securityGroupsValidation'],
      featureFlagDependencies: [],
      behaviors: ['vpc-dependent', 'table-selection', 'multi-select', 'role-based-assignment'],
      sharedWith: ['wizard', 'vpc-configuration'],
      keyComponents: ['SecurityGroupTable', 'RoleAssignment', 'MultiSelect', 'VPCDependency'],
      title: 'Security Groups Table',
    },
    docs: {
      description: {
        component:
          'Table component for displaying AWS Security Groups configuration by node type in cluster review screens.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '800px', margin: '20px' }}>
        <div
          style={{
            backgroundColor: '#fff3cd',
            padding: '20px',
            marginBottom: '16px',
            borderRadius: '6px',
            border: '2px solid #f0ad4e',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          }}
        >
          <h4
            style={{
              margin: '0 0 12px 0',
              color: '#8a6d3b',
              fontSize: '15px',
              fontWeight: '700',
            }}
          >
            🔒 Security Groups Table Component
          </h4>
          <div style={{ lineHeight: '1.5', fontSize: '13px', color: '#8a6d3b' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Purpose:</strong> Displays selected security groups organized by node type
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Node Types:</strong> Control plane, Worker, Infrastructure, or All (when
              unified)
            </p>
            <p style={{ margin: '0' }}>
              <strong>Fallback:</strong> Shows security group ID when name is not available
            </p>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    vpcGroups: {
      control: 'object',
      description: 'Available security groups in the VPC with details',
    },
    formGroups: {
      control: 'object',
      description: 'Selected security group configuration by node type',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SecurityGroupsTable>;

const mockVpcSecurityGroups: SecurityGroup[] = [
  {
    id: 'sg-control123',
    name: 'ROSA-Control-Plane-SG',
    // description: 'Security group for ROSA control plane nodes', // Not part of SecurityGroup type
  },
  {
    id: 'sg-worker456',
    name: 'ROSA-Worker-SG',
    // description: 'Security group for ROSA worker nodes', // Not part of SecurityGroup type
  },
  {
    id: 'sg-infra789',
    name: 'ROSA-Infrastructure-SG',
    // description: 'Security group for ROSA infrastructure nodes', // Not part of SecurityGroup type
  },
  {
    id: 'sg-default012',
    name: 'Default VPC Security Group',
    // description: 'Default security group for the VPC', // Not part of SecurityGroup type
  },
  {
    id: 'sg-custom345',
    name: 'Custom Application SG',
    // description: 'Custom security group for applications', // Not part of SecurityGroup type
  },
] as SecurityGroup[];

const mockVpcSecurityGroupsMinimal: SecurityGroup[] = [
  {
    id: 'sg-abc123',
    name: 'Basic Control SG',
  },
  {
    id: 'sg-def456',
    name: 'Basic Worker SG',
  },
  {
    id: 'sg-xyz999',
    // No name - will fall back to ID
  },
] as SecurityGroup[];

export const SeparateNodeTypes: Story = {
  args: {
    vpcGroups: mockVpcSecurityGroups,
    formGroups: {
      applyControlPlaneToAll: false,
      controlPlane: ['sg-control123', 'sg-default012'],
      infra: ['sg-infra789', 'sg-default012'],
      worker: ['sg-worker456', 'sg-custom345', 'sg-default012'],
    },
  },
};

export const ApplyToAllNodes: Story = {
  args: {
    vpcGroups: mockVpcSecurityGroups,
    formGroups: {
      applyControlPlaneToAll: true,
      controlPlane: ['sg-control123', 'sg-default012'],
      infra: [],
      worker: [],
    },
  },
};

export const ControlPlaneOnly: Story = {
  args: {
    vpcGroups: mockVpcSecurityGroups,
    formGroups: {
      applyControlPlaneToAll: false,
      controlPlane: ['sg-control123'],
      infra: [],
      worker: [],
    },
  },
};

export const WorkerAndInfraOnly: Story = {
  args: {
    vpcGroups: mockVpcSecurityGroups,
    formGroups: {
      applyControlPlaneToAll: false,
      controlPlane: [],
      infra: ['sg-infra789', 'sg-default012'],
      worker: ['sg-worker456', 'sg-custom345'],
    },
  },
};

export const SingleSecurityGroupPerType: Story = {
  args: {
    vpcGroups: mockVpcSecurityGroups,
    formGroups: {
      applyControlPlaneToAll: false,
      controlPlane: ['sg-control123'],
      infra: ['sg-infra789'],
      worker: ['sg-worker456'],
    },
  },
};

export const UnknownSecurityGroups: Story = {
  args: {
    vpcGroups: mockVpcSecurityGroupsMinimal,
    formGroups: {
      applyControlPlaneToAll: false,
      controlPlane: ['sg-abc123', 'sg-unknown123'], // sg-unknown123 not in vpcGroups
      infra: ['sg-xyz999'], // No name in vpcGroups
      worker: ['sg-def456', 'sg-missing456'], // sg-missing456 not in vpcGroups
    },
  },
};

export const MixedConfiguration: Story = {
  args: {
    vpcGroups: [
      {
        id: 'sg-shared001',
        name: 'Shared Security Group',
        // description: 'Used across multiple node types', // Not part of SecurityGroup type
      },
      {
        id: 'sg-control002',
        name: 'Control Plane Specific',
        // description: 'Only for control plane nodes', // Not part of SecurityGroup type
      },
      {
        id: 'sg-compute003',
        name: 'Compute Nodes SG',
        // description: 'For worker and infra nodes', // Not part of SecurityGroup type
      },
      {
        id: 'sg-external004',
        name: 'External Access SG',
        // description: 'Allows external traffic', // Not part of SecurityGroup type
      },
    ] as SecurityGroup[],
    formGroups: {
      applyControlPlaneToAll: false,
      controlPlane: ['sg-shared001', 'sg-control002'],
      infra: ['sg-shared001', 'sg-compute003'],
      worker: ['sg-shared001', 'sg-compute003', 'sg-external004'],
    },
  },
};

export const AllNodesWithMultipleGroups: Story = {
  args: {
    vpcGroups: mockVpcSecurityGroups,
    formGroups: {
      applyControlPlaneToAll: true,
      controlPlane: ['sg-control123', 'sg-default012', 'sg-custom345'],
      infra: [], // Ignored when applyControlPlaneToAll is true
      worker: [], // Ignored when applyControlPlaneToAll is true
    },
  },
};

export const EmptyConfiguration: Story = {
  args: {
    vpcGroups: mockVpcSecurityGroups,
    formGroups: {
      applyControlPlaneToAll: false,
      controlPlane: [],
      infra: [],
      worker: [],
    },
  },
};
