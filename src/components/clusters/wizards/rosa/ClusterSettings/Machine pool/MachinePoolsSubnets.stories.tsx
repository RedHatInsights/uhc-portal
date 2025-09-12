import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Form } from '@patternfly/react-core';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FormSubnet } from '~/components/clusters/wizards/common/FormSubnet';
import { CloudVpc, Subnetwork } from '~/types/clusters_mgmt.v1';

import MachinePoolsSubnets from '../../MachinePoolScreen/MachinePoolsSubnets';

const mockVpcWithSubnets: CloudVpc = {
  id: 'vpc-123456789',
  name: 'rosa-vpc-example',
  aws_subnets: [
    // us-east-1a
    {
      subnet_id: 'subnet-private-1a',
      public: false,
      availability_zone: 'us-east-1a',
      cidr_block: '10.0.1.0/24',
    },
    {
      subnet_id: 'subnet-public-1a',
      public: true,
      availability_zone: 'us-east-1a',
      cidr_block: '10.0.11.0/24',
    },
    // us-east-1b
    {
      subnet_id: 'subnet-private-1b',
      public: false,
      availability_zone: 'us-east-1b',
      cidr_block: '10.0.2.0/24',
    },
    {
      subnet_id: 'subnet-public-1b',
      public: true,
      availability_zone: 'us-east-1b',
      cidr_block: '10.0.12.0/24',
    },
    // us-east-1c
    {
      subnet_id: 'subnet-private-1c',
      public: false,
      availability_zone: 'us-east-1c',
      cidr_block: '10.0.3.0/24',
    },
    {
      subnet_id: 'subnet-public-1c',
      public: true,
      availability_zone: 'us-east-1c',
      cidr_block: '10.0.13.0/24',
    },
  ] as Subnetwork[],
} as CloudVpc;

const mockVpcSingleAz: CloudVpc = {
  id: 'vpc-singleaz',
  name: 'rosa-vpc-single-az',
  aws_subnets: [
    {
      subnet_id: 'subnet-private-single',
      public: false,
      availability_zone: 'us-east-1a',
      cidr_block: '10.0.1.0/24',
    },
    {
      subnet_id: 'subnet-public-single',
      public: true,
      availability_zone: 'us-east-1a',
      cidr_block: '10.0.11.0/24',
    },
  ] as Subnetwork[],
} as CloudVpc;

const withState = (
  initialValues: any,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
} => {
  const store = createMockStore([thunk, promiseMiddleware as any])({
    // Mock Redux state structure that useAWSVPCInquiry expects
    ccsInquiries: {
      vpcs: {
        fulfilled: true,
        pending: false,
        error: false,
        data: {
          items: [mockVpcWithSubnets, mockVpcSingleAz],
        },
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Formik initialValues={initialValues} onSubmit={() => {}}>
            <Form>{children}</Form>
          </Formik>
        </QueryClientProvider>
      </Provider>
    );
  };

  return { store, Wrapper };
};

const meta: Meta<typeof MachinePoolsSubnets> = {
  title: 'Wizards/ROSA/Step 3: Cluster settings/Machine pool/MachinePoolsSubnets',
  component: MachinePoolsSubnets,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/MachinePoolScreen/MachinePoolsSubnets.tsx',
      componentType: 'form-section',
      usage: ['Hosted'],
      conditionalLogic: ['isHypershift', 'selectedVPC', 'machinePoolsSubnets.length <= 3'],
      featureFlagDependencies: [],
      behaviors: [
        'dynamic-form-fields',
        'availability-zone-validation',
        'vpc-dependency',
        'high-availability-warnings',
      ],
      sharedWith: ['wizard', 'machine-pool-step'],
      keyComponents: ['VPCDropdown', 'MachinePoolSubnetsForm', 'FieldArray', 'FormSubnet'],
      title: 'Machine Pools Subnets Configuration',
    },
    docs: {
      description: {
        component: `
## Machine Pools Subnets

The Machine Pools Subnets section configures VPC and subnet selection for Hypershift ROSA clusters, supporting up to 3 machine pools.

### Key Features
- **VPC selection** - Choose from available VPCs with dropdown refresh
- **Private subnet assignment** - One private subnet per machine pool
- **Availability zone validation** - Warns when subnets are in the same AZ
- **High availability optimization** - Encourages subnet distribution across AZs
- **Dynamic subnet form** - Add/remove subnets based on VPC selection

### Business Logic
- **Hypershift only** - This component is exclusive to Hypershift architecture
- **Up to 3 machine pools** - Maximum of 3 subnets can be configured
- **Private subnets required** - Only private subnets are used for machine pools
- **AZ distribution** - System warns if all subnets are in the same availability zone
- **VPC dependency** - Subnet selection is conditional on VPC selection

### Components Included
- **VPCDropdown** with refresh capability and validation
- **MachinePoolSubnetsForm** for subnet selection with warnings
- **FieldArray** for dynamic machine pool subnet management
- **FormSubnet** type for subnet configuration data

### Use Cases
- Hypershift clusters requiring specific networking configuration
- Multi-AZ deployments for high availability
- Private subnet isolation for security requirements
- Custom VPC scenarios with existing infrastructure
        `,
      },
    },
  },
  render: (args: any, { parameters }) => {
    const { initialValues } = parameters;
    const { Wrapper } = withState(initialValues);

    return (
      <Wrapper>
        <MachinePoolsSubnets {...args} />
      </Wrapper>
    );
  },
};

export default meta;

type Story = StoryObj<typeof MachinePoolsSubnets>;

export const Default: Story = {
  name: 'No VPC Selected',
  parameters: {
    initialValues: {
      selected_vpc: null,
      machinePoolsSubnets: [],
    },
  },
  render: (args) => (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '20px' }}>
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
          Initial VPC Selection State
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> No VPC selected
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Action required:</strong> Select a VPC to continue
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Next step:</strong> Subnet selection will appear
            after VPC choice
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Starting point for Hypershift
            networking setup
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {meta.render!(args, {
          parameters: { initialValues: { selected_vpc: null, machinePoolsSubnets: [] } },
        } as any)}
      </div>
    </div>
  ),
};

export const VpcSelectedMultiAz: Story = {
  name: 'VPC Selected - Multi-AZ Subnets Available',
  parameters: {
    initialValues: {
      selected_vpc: mockVpcWithSubnets,
      machinePoolsSubnets: [
        {
          availabilityZone: '',
          privateSubnetId: 'subnet-private-1a',
          publicSubnetId: '',
        },
        {
          availabilityZone: '',
          privateSubnetId: 'subnet-private-1b',
          publicSubnetId: '',
        },
      ] as FormSubnet[],
    },
  },
  render: (args) => (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '20px' }}>
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
          Optimal Multi-AZ Configuration
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Architecture:</strong> 2 machine pools across
            different AZs
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>High availability:</strong> ✅ Subnets in
            us-east-1a and us-east-1b
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Configuration:</strong> Private subnets selected
            for each pool
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Production Hypershift deployment
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {meta.render!(args, {
          parameters: {
            initialValues: {
              selected_vpc: mockVpcWithSubnets,
              machinePoolsSubnets: [
                {
                  availabilityZone: '',
                  privateSubnetId: 'subnet-private-1a',
                  publicSubnetId: '',
                },
                {
                  availabilityZone: '',
                  privateSubnetId: 'subnet-private-1b',
                  publicSubnetId: '',
                },
              ],
            },
          },
        } as any)}
      </div>
    </div>
  ),
};

export const HighAvailabilityWarning: Story = {
  name: 'Warning - All Subnets in Same AZ',
  parameters: {
    initialValues: {
      selected_vpc: mockVpcSingleAz,
      machinePoolsSubnets: [
        {
          availabilityZone: '',
          privateSubnetId: 'subnet-private-single',
          publicSubnetId: '',
        },
        {
          availabilityZone: '',
          privateSubnetId: 'subnet-private-single',
          publicSubnetId: '',
        },
      ] as FormSubnet[],
    },
  },
  render: (args) => (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '20px' }}>
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
          High Availability Warning Scenario
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Issue:</strong> All subnets in same availability
            zone (us-east-1a)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Warning displayed:</strong> Cluster will not be
            highly available
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Recommendation:</strong> Select subnets from
            different AZs
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Single-AZ VPC or subnet
            configuration error
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {meta.render!(args, {
          parameters: {
            initialValues: {
              selected_vpc: mockVpcSingleAz,
              machinePoolsSubnets: [
                {
                  availabilityZone: '',
                  privateSubnetId: 'subnet-private-single',
                  publicSubnetId: '',
                },
                {
                  availabilityZone: '',
                  privateSubnetId: 'subnet-private-single',
                  publicSubnetId: '',
                },
              ],
            },
          },
        } as any)}
      </div>
    </div>
  ),
};

export const ThreeMachinePools: Story = {
  name: 'Maximum Machine Pools (3) - Different AZs',
  parameters: {
    initialValues: {
      selected_vpc: mockVpcWithSubnets,
      machinePoolsSubnets: [
        {
          availabilityZone: '',
          privateSubnetId: 'subnet-private-1a',
          publicSubnetId: '',
        },
        {
          availabilityZone: '',
          privateSubnetId: 'subnet-private-1b',
          publicSubnetId: '',
        },
        {
          availabilityZone: '',
          privateSubnetId: 'subnet-private-1c',
          publicSubnetId: '',
        },
      ] as FormSubnet[],
    },
  },
  render: (args) => (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '20px' }}>
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
          Maximum Capacity Configuration
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Scale:</strong> 3 machine pools (maximum supported)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Distribution:</strong> Across us-east-1a,
            us-east-1b, us-east-1c
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>High availability:</strong> ✅ Optimal AZ
            distribution
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Large-scale Hypershift
            deployment
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {meta.render!(args, {
          parameters: {
            initialValues: {
              selected_vpc: mockVpcWithSubnets,
              machinePoolsSubnets: [
                {
                  availabilityZone: '',
                  privateSubnetId: 'subnet-private-1a',
                  publicSubnetId: '',
                },
                {
                  availabilityZone: '',
                  privateSubnetId: 'subnet-private-1b',
                  publicSubnetId: '',
                },
                {
                  availabilityZone: '',
                  privateSubnetId: 'subnet-private-1c',
                  publicSubnetId: '',
                },
              ],
            },
          },
        } as any)}
      </div>
    </div>
  ),
};
