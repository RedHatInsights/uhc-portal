import React, { useState } from 'react';

import { Form } from '@patternfly/react-core';
// import { Formik } from 'formik'; // Unused
import { Meta, StoryObj } from '@storybook/react';

import { SubnetSelectField } from '~/components/clusters/common/SubnetSelectField';
import { CloudVpc } from '~/types/clusters_mgmt.v1';
// Mock action for stories since @storybook/addon-actions is not available
const action =
  (name: string) =>
  (...args: any[]) =>
    console.log(`${name}:`, ...args);

// Mock VPC data with comprehensive subnet configurations
const mockVpcWithAllSubnets: CloudVpc = {
  id: 'vpc-04cbedcecd229b9d7',
  name: 'test-vpc-multi-az',
  aws_subnets: [
    // us-east-1a subnets
    {
      subnet_id: 'subnet-private-1a',
      name: 'private-subnet-us-east-1a',
      public: false,
      availability_zone: 'us-east-1a',
    },
    {
      subnet_id: 'subnet-public-1a',
      name: 'public-subnet-us-east-1a',
      public: true,
      availability_zone: 'us-east-1a',
    },
    // us-east-1b subnets
    {
      subnet_id: 'subnet-private-1b',
      name: 'private-subnet-us-east-1b',
      public: false,
      availability_zone: 'us-east-1b',
    },
    {
      subnet_id: 'subnet-public-1b',
      name: 'public-subnet-us-east-1b',
      public: true,
      availability_zone: 'us-east-1b',
    },
    // us-east-1c subnets (multiple private subnets)
    {
      subnet_id: 'subnet-private-1c-1',
      name: 'private-subnet-us-east-1c-primary',
      public: false,
      availability_zone: 'us-east-1c',
    },
    {
      subnet_id: 'subnet-private-1c-2',
      name: 'private-subnet-us-east-1c-secondary',
      public: false,
      availability_zone: 'us-east-1c',
    },
    {
      subnet_id: 'subnet-public-1c',
      name: 'public-subnet-us-east-1c',
      public: true,
      availability_zone: 'us-east-1c',
    },
  ],
};

const mockVpcPrivateOnly: CloudVpc = {
  id: 'vpc-private-only',
  name: 'test-vpc-private-only',
  aws_subnets: [
    {
      subnet_id: 'subnet-private-only-1a',
      name: 'private-only-subnet-us-east-1a',
      public: false,
      availability_zone: 'us-east-1a',
    },
    {
      subnet_id: 'subnet-private-only-1b',
      name: 'private-only-subnet-us-east-1b',
      public: false,
      availability_zone: 'us-east-1b',
    },
  ],
};

const mockVpcPublicOnly: CloudVpc = {
  id: 'vpc-public-only',
  name: 'test-vpc-public-only',
  aws_subnets: [
    {
      subnet_id: 'subnet-public-only-1a',
      name: 'public-only-subnet-us-east-1a',
      public: true,
      availability_zone: 'us-east-1a',
    },
    {
      subnet_id: 'subnet-public-only-1b',
      name: 'public-only-subnet-us-east-1b',
      public: true,
      availability_zone: 'us-east-1b',
    },
  ],
};

const mockVpcLongNames: CloudVpc = {
  id: 'vpc-long-names',
  name: 'test-vpc-with-very-long-subnet-names-for-truncation-testing',
  aws_subnets: [
    {
      subnet_id: 'subnet-very-long-name-1a',
      name: 'this-is-a-very-long-subnet-name-that-should-be-truncated-in-the-dropdown-us-east-1a',
      public: false,
      availability_zone: 'us-east-1a',
    },
    {
      subnet_id: 'subnet-very-long-name-1b',
      name: 'another-extremely-long-subnet-name-for-testing-truncation-behavior-us-east-1b',
      public: true,
      availability_zone: 'us-east-1b',
    },
  ],
};

// Component wrapper for stories
const SubnetSelectFieldWrapper = ({
  selectedVPC,
  privacy = 'private',
  withAutoSelect = true,
  allowedAZs,
  isRequired = false,
  showError = false,
  initialValue = '',
  label = 'Subnet selection',
}: {
  selectedVPC: CloudVpc;
  privacy?: 'public' | 'private';
  withAutoSelect?: boolean;
  allowedAZs?: string[];
  isRequired?: boolean;
  showError?: boolean;
  initialValue?: string;
  label?: string;
}) => {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(showError);

  return (
    <Form style={{ maxWidth: '400px' }}>
      <SubnetSelectField
        name="subnet_id"
        label={label}
        input={
          {
            name: 'subnet_id',
            value,
            onChange: (subnetId: string | undefined) => {
              setValue(subnetId || '');
              action('subnet-changed')(subnetId);
            },
            onBlur: () => {
              setTouched(true);
              action('subnet-blurred')();
            },
          } as any
        }
        meta={{
          error: isRequired && !value ? 'Subnet is required' : undefined,
          touched,
        }}
        isRequired={isRequired}
        privacy={privacy}
        selectedVPC={selectedVPC}
        withAutoSelect={withAutoSelect}
        allowedAZs={allowedAZs}
      />
    </Form>
  );
};

const meta: Meta<typeof SubnetSelectField> = {
  title: 'Common/SubnetSelectField',
  component: SubnetSelectField,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/common/VPCScreen/SubnetSelectField/SubnetSelectField.tsx',
      componentType: 'field',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['selectedVPC', 'subnetType', 'availabilityZoneFilter'],
      featureFlagDependencies: [],
      behaviors: [
        'vpc-dependent',
        'subnet-filtering',
        'availability-zone-grouping',
        'dropdown-selection',
      ],
      sharedWith: ['wizard', 'vpc-configuration', 'network-step'],
      keyComponents: ['SubnetDropdown', 'SubnetFiltering', 'AvailabilityZoneGrouping', 'FormGroup'],
      title: 'Subnet Selection Field',
    },
    docs: {
      description: {
        component: `
### SubnetSelectField

A form component for selecting AWS subnets from a VPC with availability zone grouping and filtering capabilities.

**Key Features:**
- **Privacy filtering** - Show only public or private subnets
- **Availability zone grouping** - Subnets grouped by AZ in dropdown
- **AZ filtering** - Optionally restrict to specific availability zones
- **Auto-selection** - Automatically select first subnet when enabled
- **Search/filter** - Built-in fuzzy search by subnet ID or name
- **Validation** - Form validation with error states
- **Truncation** - Long subnet names are truncated with hover tooltips

### Usage Across Wizards
- **OSD Wizard** - VPC subnet selection
- **ROSA Classic** - VPC configuration screen
- **ROSA Hosted** - Public subnet selection in networking step
- **Day 2 Operations** - Machine pool subnet configuration

### Use Cases
- **Public subnets** - For load balancers and internet-facing resources
- **Private subnets** - For worker nodes and internal resources
- **Multi-AZ selection** - High availability subnet configuration
- **Single AZ filtering** - Restricted subnet selection by availability zone
        `,
      },
    },
  },
  argTypes: {
    privacy: {
      control: { type: 'radio' },
      options: ['private', 'public'],
      description: 'Filter subnets by privacy type',
    },
    withAutoSelect: {
      control: { type: 'boolean' },
      description: 'Automatically select first available subnet',
    },
    isRequired: {
      control: { type: 'boolean' },
      description: 'Whether subnet selection is required',
    },
  },
};

export default meta;

type Story = StoryObj<typeof SubnetSelectFieldWrapper>;

export const PrivateSubnets: Story = {
  name: 'Rosa Classic: Private Subnets',
  args: {
    selectedVPC: mockVpcWithAllSubnets,
    privacy: 'private',
    label: 'Private subnet name',
    withAutoSelect: true,
    isRequired: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Displays private subnets grouped by availability zone. Most common use case for worker node placement in ROSA Classic VPC configuration. Shows 4 private subnets across 3 availability zones.',
      },
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
          Rosa Classic: Private Subnet Selection
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> ROSA Classic VPC configuration
            screen
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Purpose:</strong> Select private subnets for worker
            node placement
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Grouping:</strong> Subnets grouped by availability
            zone
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Auto-select:</strong> First available subnet
            automatically selected
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <SubnetSelectFieldWrapper {...args} />
      </div>
    </div>
  ),
};

export const PublicSubnets: Story = {
  name: 'Rosa Hosted: Public Subnets',
  args: {
    selectedVPC: mockVpcWithAllSubnets,
    privacy: 'public',
    label: 'Public subnet name',
    withAutoSelect: true,
    isRequired: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Displays public subnets for load balancers and internet-facing resources. Used in ROSA Hosted networking configuration. Shows 3 public subnets across 3 availability zones.',
      },
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
          Rosa Hosted: Public Subnet Selection
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> ROSA Hosted networking
            configuration step
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Purpose:</strong> Select public subnet for load
            balancers and internet access
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Requirement:</strong> Required for public cluster
            configuration
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Auto-select:</strong> First available public subnet
            selected
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <SubnetSelectFieldWrapper {...args} />
      </div>
    </div>
  ),
};

export const FilteredByAvailabilityZone: Story = {
  name: 'Rosa Classic: Filtered by Availability Zone',
  args: {
    selectedVPC: mockVpcWithAllSubnets,
    privacy: 'private',
    label: 'Private subnet (us-east-1c only)',
    withAutoSelect: true,
    allowedAZs: ['us-east-1c'],
    isRequired: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows only subnets from specific availability zones. Used when subnet selection must match other resources in the same AZ. Shows 2 private subnets from us-east-1c only.',
      },
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
          Rosa Classic: Availability Zone Filtering
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> ROSA Classic subnet selection
            with AZ constraints
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Filter:</strong> Only subnets from us-east-1c
            availability zone
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Matching subnet AZ with other
            cluster resources
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Result:</strong> 2 private subnets shown (filtered
            from 4 total)
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <SubnetSelectFieldWrapper {...args} />
      </div>
    </div>
  ),
};

export const AutoSelectDisabled: Story = {
  name: 'Rosa Classic: Auto-Select Disabled',
  args: {
    selectedVPC: mockVpcWithAllSubnets,
    privacy: 'private',
    label: 'Private subnet (manual selection)',
    withAutoSelect: false,
    isRequired: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'No automatic selection of first subnet. User must manually choose. Used when explicit subnet selection is required without assumptions.',
      },
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
          Rosa Classic: Manual Subnet Selection
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> ROSA Classic subnet selection
            without auto-selection
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Behavior:</strong> No automatic selection of first
            subnet
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Requirement:</strong> User must explicitly choose
            subnet
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Deliberate subnet selection
            without assumptions
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <SubnetSelectFieldWrapper {...args} />
      </div>
    </div>
  ),
};

export const ValidationError: Story = {
  name: 'Rosa Classic: Validation Error',
  args: {
    selectedVPC: mockVpcWithAllSubnets,
    privacy: 'private',
    label: 'Private subnet name',
    withAutoSelect: false,
    isRequired: true,
    showError: true,
    initialValue: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows validation error when required field is empty. Error state is displayed with red border and error message below the field.',
      },
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
          Rosa Classic: Validation Error State
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> Required subnet field validation
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Error state:</strong> Empty required field with
            validation error
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Visual cues:</strong> Red border and error message
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>User action:</strong> Must select subnet to clear
            error
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <SubnetSelectFieldWrapper {...args} />
      </div>
    </div>
  ),
};

export const NoSubnetsAvailable: Story = {
  name: 'Rosa Classic: No Subnets Available',
  args: {
    selectedVPC: mockVpcPublicOnly,
    privacy: 'private',
    label: 'Private subnet name',
    withAutoSelect: true,
    isRequired: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows disabled state when no subnets match the privacy filter. VPC has only public subnets but private subnets are requested. Dropdown is disabled with "No private subnets found" message.',
      },
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
          Rosa Classic: No Matching Subnets
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> VPC with only public subnets
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Request:</strong> Private subnets needed but none
            available
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Dropdown disabled with explanatory
            message
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Resolution:</strong> Choose different VPC or
            configure private subnets
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <SubnetSelectFieldWrapper {...args} />
      </div>
    </div>
  ),
};

export const LongSubnetNames: Story = {
  name: 'Rosa Classic: Long Subnet Names - Truncation',
  args: {
    selectedVPC: mockVpcLongNames,
    privacy: 'private',
    label: 'Subnet with long name',
    withAutoSelect: true,
    isRequired: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates truncation of long subnet names in dropdown. Names longer than 40 characters are truncated with "..." and show full name on hover. Useful for VPCs with descriptive naming conventions.',
      },
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
          Rosa Classic: Subnet Name Truncation
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> VPC with descriptive subnet
            naming conventions
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Behavior:</strong> Names &gt;40 characters
            truncated with "..."
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Interaction:</strong> Hover to see full subnet name
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Enterprise environments with
            detailed naming
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <SubnetSelectFieldWrapper {...args} />
      </div>
    </div>
  ),
};

export const Day2MachinePoolSubnet: Story = {
  name: 'Day 2: Machine Pool Subnet Selection',
  args: {
    selectedVPC: mockVpcPrivateOnly,
    privacy: 'private',
    label: 'Machine pool subnet',
    withAutoSelect: false,
    isRequired: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Day 2 operations scenario for selecting subnets when editing machine pools. Private subnets only, no auto-selection to ensure deliberate choice.',
      },
    },
  },
  render: (args) => (
    <div
      style={{
        maxWidth: '600px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          marginBottom: '16px',
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '14px',
        }}
      >
        <strong>Day 2 Context:</strong> Edit Machine Pool Modal
      </div>
      <SubnetSelectFieldWrapper {...args} />
    </div>
  ),
};
