import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import AwsVpcTable from '~/components/clusters/wizards/common/ReviewCluster/AwsVpcTable';
import { CloudVpc } from '~/types/clusters_mgmt.v1';

const meta: Meta<typeof AwsVpcTable> = {
  title: 'Wizards/Common/AwsVpcTable',
  component: AwsVpcTable,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/common/VPCScreen/AwsVpcTable/AwsVpcTable.tsx',
      componentType: 'form-section',
      usage: ['Classic'],
      conditionalLogic: ['installToVpc', 'vpcSelection', 'subnetValidation'],
      featureFlagDependencies: [],
      behaviors: [
        'table-selection',
        'vpc-filtering',
        'subnet-validation',
        'conditional-visibility',
      ],
      sharedWith: ['wizard', 'vpc-configuration'],
      keyComponents: ['VPCTable', 'VPCSelection', 'SubnetValidation', 'TableFiltering'],
      title: 'AWS VPC Table Selection',
    },
    docs: {
      description: {
        component:
          'Table component for displaying AWS VPC subnet configuration in cluster review screens.',
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
            🏗️ AWS VPC Table Component
          </h4>
          <div style={{ lineHeight: '1.5', fontSize: '13px', color: '#8a6d3b' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Purpose:</strong> Displays VPC subnet configuration in review screens
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Layout:</strong> Responsive grid showing AZ, private subnets, and optionally
              public subnets
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Names:</strong> Shows friendly subnet names when available in VPC metadata
            </p>
            <p style={{ margin: '0' }}>
              <strong>Fallback:</strong> Displays subnet IDs when names are missing (see "Subnet IDs
              Only" story)
            </p>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    vpc: {
      control: 'object',
      description: 'VPC object containing subnet information',
    },
    hasPublicSubnets: {
      control: 'boolean',
      description: 'Whether to show public subnet column',
    },
    machinePoolsSubnets: {
      control: 'object',
      description: 'Array of machine pool subnet configurations',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AwsVpcTable>;

const mockVpcWithNames: CloudVpc = {
  vpc_id: 'vpc-12345678',
  cidr_block: '10.0.0.0/16',
  aws_subnets: [
    {
      subnet_id: 'subnet-private-1a',
      name: 'Private Subnet 1A',
      availability_zone: 'us-east-1a',
      cidr_block: '10.0.10.0/24',
    },
    {
      subnet_id: 'subnet-private-1b',
      name: 'Private Subnet 1B',
      availability_zone: 'us-east-1b',
      cidr_block: '10.0.20.0/24',
    },
    {
      subnet_id: 'subnet-private-1c',
      name: 'Private Subnet 1C',
      availability_zone: 'us-east-1c',
      cidr_block: '10.0.30.0/24',
    },
    {
      subnet_id: 'subnet-public-1a',
      name: 'Public Subnet 1A',
      availability_zone: 'us-east-1a',
      cidr_block: '10.0.1.0/24',
    },
    {
      subnet_id: 'subnet-public-1b',
      name: 'Public Subnet 1B',
      availability_zone: 'us-east-1b',
      cidr_block: '10.0.2.0/24',
    },
    {
      subnet_id: 'subnet-public-1c',
      name: 'Public Subnet 1C',
      availability_zone: 'us-east-1c',
      cidr_block: '10.0.3.0/24',
    },
  ],
} as CloudVpc;

const mockVpcWithoutNames: CloudVpc = {
  vpc_id: 'vpc-87654321',
  cidr_block: '172.16.0.0/16',
  aws_subnets: [
    {
      subnet_id: 'subnet-abc123',
      availability_zone: 'us-west-2a',
      cidr_block: '172.16.10.0/24',
    },
    {
      subnet_id: 'subnet-def456',
      availability_zone: 'us-west-2b',
      cidr_block: '172.16.20.0/24',
    },
    {
      subnet_id: 'subnet-ghi789',
      availability_zone: 'us-west-2a',
      cidr_block: '172.16.1.0/24',
    },
    {
      subnet_id: 'subnet-jkl012',
      availability_zone: 'us-west-2b',
      cidr_block: '172.16.2.0/24',
    },
  ],
} as CloudVpc;

export const WithPublicSubnets: Story = {
  args: {
    vpc: mockVpcWithNames,
    hasPublicSubnets: true,
    machinePoolsSubnets: [
      {
        availabilityZone: 'us-east-1a',
        privateSubnetId: 'subnet-private-1a',
        publicSubnetId: 'subnet-public-1a',
      },
      {
        availabilityZone: 'us-east-1b',
        privateSubnetId: 'subnet-private-1b',
        publicSubnetId: 'subnet-public-1b',
      },
      {
        availabilityZone: 'us-east-1c',
        privateSubnetId: 'subnet-private-1c',
        publicSubnetId: 'subnet-public-1c',
      },
    ],
  },
};

export const PrivateSubnetsOnly: Story = {
  args: {
    vpc: mockVpcWithNames,
    hasPublicSubnets: false,
    machinePoolsSubnets: [
      {
        availabilityZone: 'us-east-1a',
        privateSubnetId: 'subnet-private-1a',
        publicSubnetId: '',
      },
      {
        availabilityZone: 'us-east-1b',
        privateSubnetId: 'subnet-private-1b',
        publicSubnetId: '',
      },
    ],
  },
};

export const SubnetIDsOnly: Story = {
  args: {
    vpc: mockVpcWithoutNames,
    hasPublicSubnets: true,
    machinePoolsSubnets: [
      {
        availabilityZone: 'us-west-2a',
        privateSubnetId: 'subnet-abc123',
        publicSubnetId: 'subnet-ghi789',
      },
      {
        availabilityZone: 'us-west-2b',
        privateSubnetId: 'subnet-def456',
        publicSubnetId: 'subnet-jkl012',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'When subnet names are not available in the VPC metadata, the component falls back to displaying subnet IDs instead of friendly names.',
      },
    },
  },
};

export const SingleAZ: Story = {
  args: {
    vpc: mockVpcWithNames,
    hasPublicSubnets: true,
    machinePoolsSubnets: [
      {
        availabilityZone: 'us-east-1a',
        privateSubnetId: 'subnet-private-1a',
        publicSubnetId: 'subnet-public-1a',
      },
    ],
  },
};

export const MultiAZPrivateOnly: Story = {
  args: {
    vpc: {
      vpc_id: 'vpc-private123',
      cidr_block: '192.168.0.0/16',
      aws_subnets: [
        {
          subnet_id: 'subnet-prv-2a',
          name: 'ROSA Private 2A',
          availability_zone: 'us-west-2a',
          cidr_block: '192.168.10.0/24',
        },
        {
          subnet_id: 'subnet-prv-2b',
          name: 'ROSA Private 2B',
          availability_zone: 'us-west-2b',
          cidr_block: '192.168.20.0/24',
        },
        {
          subnet_id: 'subnet-prv-2c',
          name: 'ROSA Private 2C',
          availability_zone: 'us-west-2c',
          cidr_block: '192.168.30.0/24',
        },
      ],
    } as CloudVpc,
    hasPublicSubnets: false,
    machinePoolsSubnets: [
      {
        availabilityZone: 'us-west-2a',
        privateSubnetId: 'subnet-prv-2a',
        publicSubnetId: '',
      },
      {
        availabilityZone: 'us-west-2b',
        privateSubnetId: 'subnet-prv-2b',
        publicSubnetId: '',
      },
      {
        availabilityZone: 'us-west-2c',
        privateSubnetId: 'subnet-prv-2c',
        publicSubnetId: '',
      },
    ],
  },
};

export const MixedSubnetNames: Story = {
  args: {
    vpc: {
      vpc_id: 'vpc-mixed123',
      cidr_block: '10.10.0.0/16',
      aws_subnets: [
        {
          subnet_id: 'subnet-named-private',
          name: 'Custom Private Subnet',
          availability_zone: 'eu-west-1a',
          cidr_block: '10.10.10.0/24',
        },
        {
          subnet_id: 'subnet-unnamed-private',
          // No name - will fall back to ID
          availability_zone: 'eu-west-1b',
          cidr_block: '10.10.20.0/24',
        },
        {
          subnet_id: 'subnet-named-public',
          name: 'Custom Public Subnet',
          availability_zone: 'eu-west-1a',
          cidr_block: '10.10.1.0/24',
        },
        {
          subnet_id: 'subnet-unnamed-public',
          // No name - will fall back to ID
          availability_zone: 'eu-west-1b',
          cidr_block: '10.10.2.0/24',
        },
      ],
    } as CloudVpc,
    hasPublicSubnets: true,
    machinePoolsSubnets: [
      {
        availabilityZone: 'eu-west-1a',
        privateSubnetId: 'subnet-named-private',
        publicSubnetId: 'subnet-named-public',
      },
      {
        availabilityZone: 'eu-west-1b',
        privateSubnetId: 'subnet-unnamed-private',
        publicSubnetId: 'subnet-unnamed-public',
      },
    ],
  },
};
