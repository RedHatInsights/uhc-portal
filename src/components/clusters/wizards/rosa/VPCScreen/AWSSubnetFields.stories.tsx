import React from 'react';
import { Form, Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Grid } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';

import { emptyAWSSubnet } from '~/components/clusters/wizards/common/constants';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { CloudVpc } from '~/types/clusters_mgmt.v1';

import AWSSubnetFields from './AWSSubnetFields';

// Mock VPC data with comprehensive subnet configurations
const mockVPCWithMultiAZSubnets: CloudVpc = {
  name: 'rosa-test-vpc-multi-az',
  red_hat_managed: false,
  id: 'vpc-04cbedcecd229b9d7',
  cidr_block: '10.0.0.0/16',
  aws_subnets: [
    // us-east-1a - Both private and public
    {
      subnet_id: 'subnet-private-1a',
      name: 'rosa-test-private-us-east-1a',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-east-1a',
      cidr_block: '10.0.128.0/20',
    },
    {
      subnet_id: 'subnet-public-1a',
      name: 'rosa-test-public-us-east-1a',
      red_hat_managed: false,
      public: true,
      availability_zone: 'us-east-1a',
      cidr_block: '10.0.0.0/20',
    },
    // us-east-1b - Both private and public
    {
      subnet_id: 'subnet-private-1b',
      name: 'rosa-test-private-us-east-1b',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-east-1b',
      cidr_block: '10.0.144.0/20',
    },
    {
      subnet_id: 'subnet-public-1b',
      name: 'rosa-test-public-us-east-1b',
      red_hat_managed: false,
      public: true,
      availability_zone: 'us-east-1b',
      cidr_block: '10.0.16.0/20',
    },
    // us-east-1c - Both private and public
    {
      subnet_id: 'subnet-private-1c',
      name: 'rosa-test-private-us-east-1c',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-east-1c',
      cidr_block: '10.0.160.0/20',
    },
    {
      subnet_id: 'subnet-public-1c',
      name: 'rosa-test-public-us-east-1c',
      red_hat_managed: false,
      public: true,
      availability_zone: 'us-east-1c',
      cidr_block: '10.0.32.0/20',
    },
    // us-east-1d - Only public (for testing mixed scenarios)
    {
      subnet_id: 'subnet-public-1d',
      name: 'rosa-test-public-us-east-1d',
      red_hat_managed: false,
      public: true,
      availability_zone: 'us-east-1d',
      cidr_block: '10.0.48.0/20',
    },
  ],
  aws_security_groups: [
    {
      id: 'sg-default-123',
      name: 'default',
      // description: 'Default VPC security group', // Not part of SecurityGroup type
    },
    {
      id: 'sg-web-456',
      name: 'web-servers',
      // description: 'Security group for web servers', // Not part of SecurityGroup type
    },
    {
      id: 'sg-db-789',
      name: 'database',
      // description: 'Security group for database servers', // Not part of SecurityGroup type
    },
  ],
};

const mockVPCSingleAZ: CloudVpc = {
  name: 'rosa-test-vpc-single-az',
  red_hat_managed: false,
  id: 'vpc-single-az-123',
  cidr_block: '10.1.0.0/16',
  aws_subnets: [
    {
      subnet_id: 'subnet-private-single',
      name: 'rosa-test-private-us-east-1a',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-east-1a',
      cidr_block: '10.1.128.0/20',
    },
    {
      subnet_id: 'subnet-public-single',
      name: 'rosa-test-public-us-east-1a',
      red_hat_managed: false,
      public: true,
      availability_zone: 'us-east-1a',
      cidr_block: '10.1.0.0/20',
    },
  ],
  aws_security_groups: [
    {
      id: 'sg-default-single',
      name: 'default',
      // description: 'Default VPC security group', // Not part of SecurityGroup type
    },
  ],
};

const mockVPCPrivateOnly: CloudVpc = {
  name: 'rosa-test-vpc-private-only',
  red_hat_managed: false,
  id: 'vpc-private-only-456',
  cidr_block: '10.2.0.0/16',
  aws_subnets: [
    {
      subnet_id: 'subnet-private-only-1a',
      name: 'rosa-test-private-us-east-1a',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-east-1a',
      cidr_block: '10.2.128.0/20',
    },
    {
      subnet_id: 'subnet-private-only-1b',
      name: 'rosa-test-private-us-east-1b',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-east-1b',
      cidr_block: '10.2.144.0/20',
    },
  ],
  aws_security_groups: [],
};

const withState = (
  initialValues: any,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: React.FC<{ children: React.ReactNode }>;
} => {
  const middlewares = [thunk, promiseMiddleware] as any;
  const mockStore = createMockStore(middlewares);
  const store: MockStoreEnhanced<unknown, {}> = mockStore({
    // Mock Redux state structure that useAWSVPCInquiry expects
    ccsInquiries: {
      vpcs: {
        fulfilled: true,
        pending: false,
        error: false,
        data: {
          items: [mockVPCWithMultiAZSubnets, mockVPCSingleAZ, mockVPCPrivateOnly],
        },
        cloudProvider: 'aws',
        region: 'us-east-1',
        credentials: {},
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        <Form>{children}</Form>
      </Formik>
    </Provider>
  );

  return { store, Wrapper };
};

type StoryWrapperProps = {
  selectedVPC: CloudVpc;
  isMultiAz: boolean;
  privateLinkSelected: boolean;
  selectedRegion: string;
  selectedAZs: string[];
  initialSubnets?: any[];
  initialSecurityGroups?: any;
};

const StoryWrapper = ({
  selectedVPC,
  isMultiAz,
  privateLinkSelected,
  selectedRegion,
  selectedAZs,
  initialSubnets,
  initialSecurityGroups,
}: StoryWrapperProps) => {
  // Create initial form values
  const defaultSubnets =
    initialSubnets ||
    (isMultiAz ? [emptyAWSSubnet(), emptyAWSSubnet(), emptyAWSSubnet()] : [emptyAWSSubnet()]);

  const initialValues = {
    [FieldId.SelectedVpc]: selectedVPC,
    [FieldId.MachinePoolsSubnets]: defaultSubnets,
    [FieldId.SecurityGroups]: initialSecurityGroups || {
      controlPlane: [],
      infra: [],
      worker: [],
      applyControlPlaneToAll: false,
    },
  };

  const { Wrapper } = withState(initialValues);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          marginBottom: '24px',
          borderRadius: '6px',
          border: '1px solid #dee2e6',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        }}
      >
        <h4
          style={{
            margin: '0 0 16px 0',
            color: '#495057',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          AWSSubnetFields - VPC and Subnet Selection
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>VPC:</strong> {selectedVPC.name} ({selectedVPC.id})
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong>{' '}
            {isMultiAz ? 'Multi-AZ' : 'Single-AZ'}
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Privacy:</strong>{' '}
            {privateLinkSelected
              ? 'Private subnets only (PrivateLink)'
              : 'Private + Public subnets'}
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Subnets available:</strong>{' '}
            {selectedVPC.aws_subnets?.length || 0} (
            {selectedVPC.aws_subnets?.filter((s) => s.public).length || 0} public,{' '}
            {selectedVPC.aws_subnets?.filter((s) => !s.public).length || 0} private)
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Selected AZs:</strong>{' '}
            {selectedAZs.length > 0 ? selectedAZs.join(', ') : 'None selected'}
          </p>
        </div>
      </div>

      <Wrapper>
        <Grid hasGutter>
          <AWSSubnetFields
            selectedVPC={selectedVPC}
            isMultiAz={isMultiAz}
            privateLinkSelected={privateLinkSelected}
            selectedRegion={selectedRegion}
            selectedAZs={selectedAZs}
          />
        </Grid>
      </Wrapper>
    </div>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 4: Networking/VPC Settings/AWSSubnetFields',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/VPCScreen/AWSSubnetFields.tsx',
      componentType: 'form-section',
      usage: ['Classic'],
      conditionalLogic: ['isMultiAz', 'privateLinkSelected', 'selectedVPC', 'selectedAZs'],
      featureFlagDependencies: [],
      behaviors: [
        'conditional-column-visibility',
        'cross-field-dependencies',
        'dynamic-row-count',
        'subnet-validation',
        'az-dependent-options',
      ],
      sharedWith: ['wizard'],
      keyComponents: ['VPCDropdown', 'SingleSubnetFieldsRow'],
      title: 'AWS Subnet Configuration Fields',
    },
    docs: {
      description: {
        component: `
### AWSSubnetFields - VPC and Subnet Selection

The AWSSubnetFields component handles VPC selection and subnet configuration for ROSA Classic clusters. It provides a comprehensive interface for selecting VPCs, availability zones, and their corresponding subnets.

**Key Features:**

### **VPC Selection**
- **VPCDropdown**: Select from available VPCs in the region
- **Auto-reset**: Clears security groups when VPC changes
- **Validation**: Requires VPC selection before subnet configuration

### **Availability Zone Configuration**
- **Single-AZ**: One availability zone with one subnet pair
- **Multi-AZ**: Three availability zones with three subnet pairs
- **Validation**: Ensures unique AZ selection across machine pools
- **Filtering**: Only shows AZs that have required subnet types

### **Subnet Selection**
- **Private Subnets**: Always required for worker nodes
- **Public Subnets**: Required unless PrivateLink is enabled
- **Filtering**: Shows only subnets in the selected AZ
- **Tooltips**: Provides guidance when fields are disabled

### **Behavioral Differences**

#### **PrivateLink Enabled (Private Clusters)**
- Shows only private subnet fields
- Public subnet columns are hidden
- Filters AZs to only those with private subnets

#### **Standard Configuration**
- Shows both private and public subnet fields
- Requires both subnet types for each AZ
- Filters AZs to those with both subnet types

#### **Multi-AZ vs Single-AZ**
- **Single-AZ**: One row of subnet fields
- **Multi-AZ**: Three rows of subnet fields
- **Validation**: Multi-AZ enforces unique AZ selection

### **Form Integration**
- Updates \`machine_pools_subnets\` form field
- Resets security group fields on VPC change
- Provides real-time validation feedback
- Integrates with Formik field state management

### **Props Control**
- \`selectedVPC\`: The chosen VPC with subnet/security group data
- \`isMultiAz\`: Controls single vs multi-AZ layout
- \`privateLinkSelected\`: Shows/hides public subnet fields
- \`selectedAZs\`: Pre-selected availability zones
- \`selectedRegion\`: AWS region for filtering
        `,
      },
    },
  },
  argTypes: {
    isMultiAz: {
      control: 'boolean',
      description: 'Show multi-AZ configuration (3 subnet rows) vs single-AZ (1 subnet row)',
    },
    privateLinkSelected: {
      control: 'boolean',
      description: 'Enable PrivateLink mode (hide public subnet fields)',
    },
    selectedRegion: {
      control: 'text',
      description: 'AWS region for subnet filtering',
    },
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

export const SingleAZPublicPrivate: Story = {
  name: 'Single-AZ: Public cluster',
  args: {
    selectedVPC: mockVPCSingleAZ,
    isMultiAz: false,
    privateLinkSelected: false,
    selectedRegion: 'us-east-1',
    selectedAZs: ['us-east-1a'],
    initialSubnets: [
      {
        availabilityZone: 'us-east-1a',
        privateSubnetId: 'subnet-private-single',
        publicSubnetId: 'subnet-public-single',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: `**Single-AZ Configuration with Public and Private Subnets**

Shows the standard single availability zone configuration where both private and public subnets are required.

**Configuration:**
- **VPC**: Single-AZ VPC with 1 private + 1 public subnet
- **Mode**: Single-AZ (1 subnet row)
- **Subnets**: Both private and public subnet fields visible
- **Pre-selected**: us-east-1a with matching subnets selected

**Key Behaviors:**
- VPC dropdown shows available VPCs
- AZ dropdown filters to zones with both subnet types
- Private subnet field is always required
- Public subnet field is required (not PrivateLink)
- Tooltips guide user through selection process`,
      },
    },
  },
};

export const SingleAZPrivateOnly: Story = {
  name: 'Single-AZ: Private cluster',
  args: {
    selectedVPC: mockVPCPrivateOnly,
    isMultiAz: false,
    privateLinkSelected: true,
    selectedRegion: 'us-east-1',
    selectedAZs: ['us-east-1a'],
    initialSubnets: [
      {
        availabilityZone: 'us-east-1a',
        privateSubnetId: 'subnet-private-only-1a',
        publicSubnetId: '',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: `**Single-AZ PrivateLink Configuration (Private Subnets Only)**

Demonstrates PrivateLink mode where only private subnets are needed for secure connectivity.

**Configuration:**
- **VPC**: Private-only VPC with 2 private subnets across AZs
- **Mode**: Single-AZ + PrivateLink enabled
- **Subnets**: Only private subnet field visible
- **Pre-selected**: us-east-1a with private subnet selected

**Key Behaviors:**
- Public subnet column is completely hidden
- AZ filtering shows only zones with private subnets
- Simpler interface for private-only clusters
- Security through PrivateLink instead of public internet`,
      },
    },
  },
};

export const MultiAZComplete: Story = {
  name: 'Multi-AZ: Public cluster',
  args: {
    selectedVPC: mockVPCWithMultiAZSubnets,
    isMultiAz: true,
    privateLinkSelected: false,
    selectedRegion: 'us-east-1',
    selectedAZs: ['us-east-1a', 'us-east-1b', 'us-east-1c'],
    initialSubnets: [
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
  parameters: {
    docs: {
      description: {
        story: `**Multi-AZ Configuration with Full Subnet Selection**

Shows the complete multi-AZ setup with all three availability zones configured.

**Configuration:**
- **VPC**: Multi-AZ VPC with 6 subnets (3 private + 3 public)
- **Mode**: Multi-AZ (3 subnet rows)
- **Subnets**: All AZs have both private and public subnets selected
- **High Availability**: Distributes workload across multiple zones

**Key Behaviors:**
- Three rows of subnet fields (one per AZ)
- Each row requires unique AZ selection
- Subnet dropdowns filter by selected AZ
- Provides maximum availability and fault tolerance`,
      },
    },
  },
};

export const MultiAZPrivateOnly: Story = {
  name: 'Multi-AZ: Private cluster',
  args: {
    selectedVPC: mockVPCWithMultiAZSubnets,
    isMultiAz: true,
    privateLinkSelected: true,
    selectedRegion: 'us-east-1',
    selectedAZs: ['us-east-1a', 'us-east-1b', 'us-east-1c'],
    initialSubnets: [
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
      {
        availabilityZone: 'us-east-1c',
        privateSubnetId: 'subnet-private-1c',
        publicSubnetId: '',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: `**Multi-AZ PrivateLink Configuration**

Combines multi-AZ high availability with PrivateLink security.

**Configuration:**
- **VPC**: Multi-AZ VPC with private subnets in each zone
- **Mode**: Multi-AZ + PrivateLink enabled
- **Security**: Private connectivity without public internet exposure
- **High Availability**: Distributed across multiple zones

**Key Behaviors:**
- Three rows of subnet fields, public columns hidden
- All AZs configured with private subnets only
- Optimal for security-sensitive workloads
- Maintains high availability without public exposure`,
      },
    },
  },
};
