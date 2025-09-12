import React from 'react';
import { Form, Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import type { Meta, StoryObj } from '@storybook/react';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import SharedVPCSection from './SharedVPCSection';

// Mock DNS domains data
const mockDnsDomains = [
  {
    Kind: 'DnsDomain',
    id: '1234.s1.devshift.org',
    href: '/api/clusters_mgmt/v1/dns_domains/1234.s1.devshift.org',
    organization: {
      kind: 'OrganizationLink',
      id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
      href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
    },
    user_defined: true,
  },
  {
    Kind: 'DnsDomain',
    id: 'abcd.s1.devshift.org',
    href: '/api/clusters_mgmt/v1/dns_domains/abcd.s1.devshift.org',
    organization: {
      kind: 'OrganizationLink',
      id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
      href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
    },
    user_defined: true,
  },
  {
    Kind: 'DnsDomain',
    id: 'prod-cluster.s1.devshift.org',
    href: '/api/clusters_mgmt/v1/dns_domains/prod-cluster.s1.devshift.org',
    organization: {
      kind: 'OrganizationLink',
      id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
      href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
    },
    user_defined: true,
  },
];

const withState = (
  initialValues: any,
  dnsDomains = mockDnsDomains,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: React.FC<{ children: React.ReactNode }>;
} => {
  const middlewares = [thunk, promiseMiddleware] as any;
  const mockStore = createMockStore(middlewares);
  const store: MockStoreEnhanced<unknown, {}> = mockStore({
    // Mock Redux state structure for consistency
    ccsInquiries: {
      vpcs: {
        fulfilled: true,
        pending: false,
        error: false,
        data: {
          items: [],
        },
      },
    },
    dnsDomains: {
      error: false,
      pending: false,
      fulfilled: true,
      isUpdatingDomains: false,
      createdDnsId: '',
      deletedDnsId: '',
      items: dnsDomains,
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
  hostedZoneDomainName?: string;
  isSelected: boolean;
  openshiftVersion: string;
  isHypershiftSelected: boolean;
  initialSharedVpcValues?: {
    is_selected: boolean;
    base_dns_domain: string;
    hosted_zone_id: string;
    hosted_zone_role_arn: string;
  };
  dnsDomains?: any[];
};

const StoryWrapper = ({
  hostedZoneDomainName,
  isSelected,
  openshiftVersion,
  isHypershiftSelected,
  initialSharedVpcValues,
  dnsDomains,
}: StoryWrapperProps) => {
  // Create initial form values
  const defaultSharedVpcValues = initialSharedVpcValues || {
    is_selected: isSelected,
    base_dns_domain: '',
    hosted_zone_id: '',
    hosted_zone_role_arn: '',
  };

  const initialValues = {
    [FieldId.SharedVpc]: defaultSharedVpcValues,
  };

  const { Wrapper } = withState(initialValues, dnsDomains);

  // Determine version compatibility
  const versionNumber = parseFloat(openshiftVersion);
  const isVersionSupported = versionNumber >= 4.11; // AWS Shared VPC minimum version

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
          SharedVPCSection - AWS Shared VPC Configuration
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>OpenShift Version:</strong> {openshiftVersion}
            {!isVersionSupported && ' (⚠️ AWS Shared VPC not supported)'}
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong>{' '}
            {isHypershiftSelected ? 'ROSA Hosted (Hypershift)' : 'ROSA Classic'}
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Shared VPC Selected:</strong>{' '}
            {isSelected ? 'Yes' : 'No'}
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Hosted Zone Domain:</strong>{' '}
            {hostedZoneDomainName || 'Not set'}
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Available DNS Domains:</strong>{' '}
            {dnsDomains?.length || 0}
          </p>
        </div>
      </div>

      <Wrapper>
        <SharedVPCSection
          hostedZoneDomainName={hostedZoneDomainName}
          isSelected={isSelected}
          openshiftVersion={openshiftVersion}
          isHypershiftSelected={isHypershiftSelected}
        />
      </Wrapper>
    </div>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Common/SharedVPCSection',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/NetworkingSection/SharedVPCSection.tsx',
      componentType: 'form-section',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['openshiftVersion >= 4.11', 'isSelected', 'isHypershiftSelected'],
      featureFlagDependencies: [],
      behaviors: [
        'version-compatibility-check',
        'conditional-field-expansion',
        'dns-domain-management',
        'role-arn-validation',
        'hosted-zone-configuration',
      ],
      sharedWith: ['vpc-screen', 'networking-section'],
      keyComponents: ['ReduxCheckbox', 'SharedVPCField', 'Alert', 'Title', 'ExternalLink'],
      title: 'AWS Shared VPC Configuration',
    },
    docs: {
      description: {
        component: `
### SharedVPCSection - AWS Shared VPC Configuration

The SharedVPCSection component provides configuration for AWS Shared VPC functionality, allowing ROSA clusters to be installed into VPCs shared by other AWS accounts within the same organization.

**Key Features:**

### **Version Compatibility**
- **Minimum Version**: OpenShift 4.11+ required for AWS Shared VPC
- **Compatibility Check**: Shows version incompatibility message for older versions
- **Feature Gating**: Automatically hides controls for unsupported versions

### **Shared VPC Checkbox**
- **Enable/Disable**: Toggle shared VPC functionality
- **Progressive Disclosure**: Additional fields appear when enabled
- **Help Text**: Comprehensive explanation with external documentation links

### **DNS Domain Management**
- **Domain Selection**: Choose existing or reserve new base DNS domains
- **Domain Creation**: Create new DNS domains on-demand
- **Domain Deletion**: Remove unused DNS domains
- **Copy Functionality**: Copy domain names to clipboard

### **Configuration Fields (when enabled)**

#### **Step 1: Base DNS Domain**
- **Existing Domains**: Select from available DNS domains
- **New Domain Creation**: Reserve new base DNS domain
- **Domain Management**: Create, select, copy, and delete domains

#### **Step 2: Private Hosted Zone ID**
- **Zone Association**: Link DNS domain with private hosted zone
- **AWS Integration**: Must be created by VPC owner account
- **Validation**: Ensures proper hosted zone ID format

#### **Step 3: Shared VPC Role ARN**
- **Role Specification**: ARN of the role for VPC access
- **Cross-Account Access**: Enables access to shared VPC resources
- **Validation**: Ensures proper ARN format and permissions

### **Behavioral Differences**

#### **ROSA Classic vs ROSA Hosted**
- **Classic**: Full shared VPC support with all configuration options
- **Hosted**: Simplified shared VPC handling (control plane managed)
- **Validation**: Different validation rules based on cluster type

#### **Version-Based Feature Availability**
- **4.11+**: Full AWS Shared VPC support
- **< 4.11**: Shows incompatibility message, no configuration fields

### **User Experience**
- **Clear Instructions**: Step-by-step guidance with numbered instructions
- **External Resources**: Links to AWS console and ROSA documentation
- **Validation Feedback**: Real-time field validation with helpful error messages
- **Alert Notifications**: Important information about VPC owner requirements

### **Form Integration**
- **Formik Integration**: Full form state management
- **Field Validation**: Real-time validation for all fields
- **State Persistence**: Maintains selections across form interactions
- **Conditional Rendering**: Fields appear/disappear based on selections

### **Props Control**
- \`hostedZoneDomainName\`: Generated domain name for the cluster
- \`isSelected\`: Whether shared VPC is currently enabled
- \`openshiftVersion\`: Controls feature availability
- \`isHypershiftSelected\`: Affects validation and behavior
        `,
      },
    },
  },
  argTypes: {
    openshiftVersion: {
      control: 'text',
      description: 'OpenShift version (affects feature availability - requires 4.11+)',
    },
    isHypershiftSelected: {
      control: 'boolean',
      description: 'ROSA Hosted mode vs ROSA Classic mode',
    },
    isSelected: {
      control: 'boolean',
      description: 'Whether AWS Shared VPC is enabled',
    },
    hostedZoneDomainName: {
      control: 'text',
      description: 'Generated hosted zone domain name for the cluster',
    },
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

export const CheckboxOnly: Story = {
  name: 'Checkbox Only (Not Selected)',
  args: {
    hostedZoneDomainName: 'test-cluster.1234.s1.devshift.org',
    isSelected: false,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: false,
    dnsDomains: mockDnsDomains,
  },
  parameters: {
    docs: {
      description: {
        story: `**AWS Shared VPC Checkbox (Collapsed State)**

Shows the initial state with just the checkbox to enable AWS Shared VPC functionality.

**Configuration:**
- **Version**: 4.14.0 (AWS Shared VPC supported)
- **Mode**: ROSA Classic
- **State**: Shared VPC not selected
- **Interface**: Simple checkbox with help text

**Key Behaviors:**
- Shows "Install into AWS shared VPC" checkbox
- Provides detailed help text with external documentation link
- No additional fields visible until checkbox is checked
- Clear explanation of shared VPC benefits and requirements`,
      },
    },
  },
};

export const ExpandedEmpty: Story = {
  name: 'Expanded Configuration (Empty)',
  args: {
    hostedZoneDomainName: 'test-cluster.1234.s1.devshift.org',
    isSelected: true,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: false,
    initialSharedVpcValues: {
      is_selected: true,
      base_dns_domain: '',
      hosted_zone_id: '',
      hosted_zone_role_arn: '',
    },
    dnsDomains: mockDnsDomains,
  },
  parameters: {
    docs: {
      description: {
        story: `**Expanded Shared VPC Configuration (Empty State)**

Shows the full shared VPC configuration interface when enabled but not yet configured.

**Configuration:**
- **Shared VPC**: Enabled (checkbox checked)
- **State**: Empty configuration, ready for input
- **Available Domains**: 3 DNS domains available for selection

**Key Behaviors:**
- Shows important NOTE alert about VPC owner requirements
- Three-step configuration process clearly outlined
- Step 1: Base DNS domain dropdown with existing domains + "Reserve new" option
- Step 2: Private hosted zone ID text field
- Step 3: Shared VPC role ARN text field
- All fields are required and show validation feedback`,
      },
    },
  },
};

export const PartiallyConfigured: Story = {
  name: 'Partially Configured',
  args: {
    hostedZoneDomainName: 'test-cluster.1234.s1.devshift.org',
    isSelected: true,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: false,
    initialSharedVpcValues: {
      is_selected: true,
      base_dns_domain: '1234.s1.devshift.org',
      hosted_zone_id: '',
      hosted_zone_role_arn: '',
    },
    dnsDomains: mockDnsDomains,
  },
  parameters: {
    docs: {
      description: {
        story: `**Partially Configured Shared VPC**

Shows the configuration in progress with the DNS domain selected but other fields pending.

**Configuration:**
- **Step 1**: Base DNS domain selected (1234.s1.devshift.org)
- **Step 2**: Private hosted zone ID - pending input
- **Step 3**: Shared VPC role ARN - pending input
- **Hosted Zone Domain**: test-cluster.1234.s1.devshift.org

**Key Behaviors:**
- DNS domain dropdown shows selected value with copy/delete buttons
- Private hosted zone ID field shows help text with domain name
- Shared VPC role field ready for ARN input
- Form validation will require all fields to be completed`,
      },
    },
  },
};

export const FullyConfigured: Story = {
  name: 'Fully Configured',
  args: {
    hostedZoneDomainName: 'test-cluster.prod-cluster.s1.devshift.org',
    isSelected: true,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: false,
    initialSharedVpcValues: {
      is_selected: true,
      base_dns_domain: 'prod-cluster.s1.devshift.org',
      hosted_zone_id: 'Z1D633PJN98FT9',
      hosted_zone_role_arn: 'arn:aws:iam::123456789012:role/SharedVPCRole',
    },
    dnsDomains: mockDnsDomains,
  },
  parameters: {
    docs: {
      description: {
        story: `**Fully Configured Shared VPC**

Shows the complete shared VPC configuration with all required fields populated.

**Configuration:**
- **Step 1**: Base DNS domain selected (prod-cluster.s1.devshift.org)
- **Step 2**: Private hosted zone ID configured (Z1D633PJN98FT9)
- **Step 3**: Shared VPC role ARN configured
- **Hosted Zone Domain**: test-cluster.prod-cluster.s1.devshift.org

**Key Behaviors:**
- All three configuration steps completed
- DNS domain shows with copy and delete functionality
- Private hosted zone ID properly formatted
- Role ARN follows proper AWS ARN format
- Ready for cluster creation with shared VPC`,
      },
    },
  },
};

export const RosaHostedMode: Story = {
  name: 'ROSA Hosted (Hypershift) Mode',
  args: {
    hostedZoneDomainName: 'hosted-cluster.abcd.s1.devshift.org',
    isSelected: true,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: true,
    initialSharedVpcValues: {
      is_selected: true,
      base_dns_domain: 'abcd.s1.devshift.org',
      hosted_zone_id: 'Z2E633PJN98FT8',
      hosted_zone_role_arn: 'arn:aws:iam::987654321098:role/HypershiftSharedVPCRole',
    },
    dnsDomains: mockDnsDomains,
  },
  parameters: {
    docs: {
      description: {
        story: `**ROSA Hosted (Hypershift) Shared VPC Configuration**

Shows shared VPC configuration for ROSA Hosted clusters with Hypershift.

**Configuration:**
- **Mode**: ROSA Hosted (Hypershift enabled)
- **Shared VPC**: Fully configured for hosted control plane
- **DNS Domain**: abcd.s1.devshift.org
- **Hosted Zone**: Z2E633PJN98FT8

**Key Behaviors:**
- Same configuration interface as ROSA Classic
- Hypershift-specific validation rules applied
- Control plane networking managed by Red Hat
- Shared VPC applies to worker node networking`,
      },
    },
  },
};

export const UnsupportedVersion: Story = {
  name: 'Unsupported OpenShift Version',
  args: {
    hostedZoneDomainName: 'test-cluster.1234.s1.devshift.org',
    isSelected: false,
    openshiftVersion: '4.10.0', // Below 4.11 minimum
    isHypershiftSelected: false,
    dnsDomains: mockDnsDomains,
  },
  parameters: {
    docs: {
      description: {
        story: `**OpenShift Version Below 4.11 (Unsupported)**

Shows version incompatibility message for OpenShift versions that don't support AWS Shared VPC.

**Configuration:**
- **Version**: 4.10.0 (below 4.11 minimum requirement)
- **Feature**: AWS Shared VPC not supported
- **State**: Shows incompatibility message only

**Key Behaviors:**
- Shows "AWS shared VPC" title
- Displays version incompatibility message
- No configuration interface shown
- Clear messaging about version requirements`,
      },
    },
  },
};

export const NoDnsDomainsAvailable: Story = {
  name: 'No DNS Domains Available',
  args: {
    hostedZoneDomainName: 'test-cluster.new-domain.s1.devshift.org',
    isSelected: true,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: false,
    initialSharedVpcValues: {
      is_selected: true,
      base_dns_domain: '',
      hosted_zone_id: '',
      hosted_zone_role_arn: '',
    },
    dnsDomains: [], // No DNS domains available
  },
  parameters: {
    docs: {
      description: {
        story: `**No DNS Domains Available**

Shows the configuration interface when no existing DNS domains are available.

**Configuration:**
- **Available Domains**: 0 (empty list)
- **State**: Ready for new domain creation
- **Interface**: Shows "Reserve new base DNS domain" as primary option

**Key Behaviors:**
- DNS domain dropdown shows empty state
- "Reserve new base DNS domain" button prominently available
- User must create new domain to proceed
- Other configuration steps remain the same`,
      },
    },
  },
};
