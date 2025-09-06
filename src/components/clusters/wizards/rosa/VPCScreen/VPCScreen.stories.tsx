import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Wizard, WizardBody, WizardStep } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { emptyAWSSubnet } from '~/components/clusters/wizards/common/constants';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { baseRequestState } from '~/redux/reduxHelpers';
import { CloudVpc } from '~/types/clusters_mgmt.v1';

import { VPCScreen } from './VPCScreen';

import '../createROSAWizard.scss';

// Mock VPC data with comprehensive configurations
const mockVPCWithFullConfiguration: CloudVpc = {
  name: 'rosa-vpc-complete',
  red_hat_managed: false,
  id: 'vpc-complete-config-123',
  cidr_block: '10.0.0.0/16',
  aws_subnets: [
    // us-east-1a
    {
      subnet_id: 'subnet-private-1a',
      name: 'rosa-vpc-private-us-east-1a',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-east-1a',
      cidr_block: '10.0.128.0/20',
    },
    {
      subnet_id: 'subnet-public-1a',
      name: 'rosa-vpc-public-us-east-1a',
      red_hat_managed: false,
      public: true,
      availability_zone: 'us-east-1a',
      cidr_block: '10.0.0.0/20',
    },
    // us-east-1b
    {
      subnet_id: 'subnet-private-1b',
      name: 'rosa-vpc-private-us-east-1b',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-east-1b',
      cidr_block: '10.0.144.0/20',
    },
    {
      subnet_id: 'subnet-public-1b',
      name: 'rosa-vpc-public-us-east-1b',
      red_hat_managed: false,
      public: true,
      availability_zone: 'us-east-1b',
      cidr_block: '10.0.16.0/20',
    },
    // us-east-1c
    {
      subnet_id: 'subnet-private-1c',
      name: 'rosa-vpc-private-us-east-1c',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-east-1c',
      cidr_block: '10.0.160.0/20',
    },
    {
      subnet_id: 'subnet-public-1c',
      name: 'rosa-vpc-public-us-east-1c',
      red_hat_managed: false,
      public: true,
      availability_zone: 'us-east-1c',
      cidr_block: '10.0.32.0/20',
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
      name: 'database-servers',
      // description: 'Security group for database servers', // Not part of SecurityGroup type
    },
  ],
};

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
  formValues: any,
  dnsDomainsState?: any,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: React.FC<{ children: React.ReactNode }>;
} => {
  const middlewares = [thunk, promiseMiddleware] as any;
  const mockStore = createMockStore(middlewares);
  const store: MockStoreEnhanced<unknown, {}> = mockStore({
    userProfile: {
      keycloakProfile: {
        username: 'test-user',
      },
      organization: {
        ...baseRequestState,
        fulfilled: true,
        details: {
          id: '123',
          name: 'Test Organization',
        },
      },
    },
    // Mock Redux state structure that useAWSVPCInquiry expects
    ccsInquiries: {
      vpcs: {
        fulfilled: true,
        pending: false,
        error: false,
        data: {
          items: [mockVPCWithFullConfiguration],
        },
        cloudProvider: 'aws',
        region: 'us-east-1',
        credentials: {},
      },
    },
    dnsDomains: dnsDomainsState || {
      error: false,
      pending: false,
      fulfilled: true,
      isUpdatingDomains: false,
      createdDnsId: '',
      deletedDnsId: '',
      items: mockDnsDomains,
    },
    cloudProviders: {
      ...baseRequestState,
      fulfilled: true,
    },
    clusterVersions: {
      ...baseRequestState,
      fulfilled: true,
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
          <Formik initialValues={formValues} onSubmit={() => {}}>
            {children}
          </Formik>
        </QueryClientProvider>
      </Provider>
    );
  };

  return { store, Wrapper };
};

type StoryWrapperProps = {
  showInWizardFramework?: boolean;
  privateLinkSelected?: boolean;
  clusterVersion?: string;
  selectedVPC?: CloudVpc;
  isMultiAz?: boolean;
  selectedAZs?: string[];
  initialSubnets?: any[];
  initialSecurityGroups?: any;
  initialSharedVpc?: any;
  dnsDomainState?: any;
};

const StoryWrapper = ({
  showInWizardFramework = true,
  privateLinkSelected = false,
  clusterVersion = '4.14.10',
  selectedVPC,
  isMultiAz = false,
  selectedAZs = [],
  initialSubnets,
  initialSecurityGroups,
  initialSharedVpc,
  dnsDomainState,
}: StoryWrapperProps) => {
  // Create form values based on the scenario
  const defaultFormValues = {
    [FieldId.ClusterName]: 'test-vpc-cluster',
    [FieldId.ClusterVersion]: clusterVersion ? { raw_id: clusterVersion } : undefined,
    [FieldId.SharedVpc]: initialSharedVpc || {
      is_selected: false,
      base_dns_domain: '',
      hosted_zone_id: '',
      hosted_zone_role_arn: '',
    },
    [FieldId.SelectedVpc]: selectedVPC || { id: '', name: '' },
    [FieldId.MachinePoolsSubnets]:
      initialSubnets ||
      (isMultiAz ? [emptyAWSSubnet(), emptyAWSSubnet(), emptyAWSSubnet()] : [emptyAWSSubnet()]),
    [FieldId.MultiAz]: isMultiAz ? 'true' : 'false',
    [FieldId.Region]: 'us-east-1',
    [FieldId.CloudProvider]: 'aws',
    [FieldId.Hypershift]: 'false', // VPC Settings is ROSA Classic only
    [FieldId.SecurityGroups]: initialSecurityGroups || {
      applyControlPlaneToAll: false,
      controlPlane: [],
      infra: [],
      worker: [],
    },
  };

  const { Wrapper } = withState(defaultFormValues, dnsDomainState);

  if (showInWizardFramework) {
    // Show in wizard framework
    return (
      <Wrapper>
        <div className="ocm-page" style={{ height: '100vh', padding: 0, margin: 0 }}>
          <Wizard height="100%" width="100%" className="rosa-wizard">
            <WizardStep name="VPC Settings" id="vpc-settings">
              <WizardBody>
                <VPCScreen privateLinkSelected={privateLinkSelected} />
              </WizardBody>
            </WizardStep>
          </Wizard>
        </div>
      </Wrapper>
    );
  }

  // Show standalone version
  return (
    <Wrapper>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <VPCScreen privateLinkSelected={privateLinkSelected} />
      </div>
    </Wrapper>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 4: Networking/VPC Settings',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/VPCScreen/VPCScreen.tsx',
      componentType: 'wizard-step',
      usage: ['Classic'],
      conditionalLogic: [
        'clusterVersion',
        'privateLinkSelected',
        'isMultiAz',
        'selectedVPC.id',
        'sharedVpc.is_selected',
      ],
      featureFlagDependencies: [],
      behaviors: [
        'conditional-rendering',
        'version-dependent-features',
        'vpc-subnet-management',
        'security-group-configuration',
        'shared-vpc-integration',
        'form-reset-on-change',
      ],
      step: 4,
      subStep: 'VPC Settings',
      sharedWith: ['wizard'],
      keyComponents: [
        'InstallToVPC',
        'AWSSubnetFields',
        'SecurityGroupsSection', // Story moved to Common/SecurityGroups/
        'SharedVPCSection',
        'VPCDropdown',
        'SubnetSelectField',
        'AvailabilityZoneSelection',
      ],
      title: 'VPC Settings Configuration',
    },
    docs: {
      description: {
        component: `
### VPCScreen - VPC Settings Sub-step (ROSA Classic Only)

The VPCScreen component provides comprehensive VPC configuration for ROSA Classic clusters. This is a sub-step within Step 4: Networking that handles VPC selection, subnet configuration, security groups, and AWS Shared VPC setup.

**Key Features:**

### **Cluster Version Validation**
- **Version Required**: Must have a valid OpenShift cluster version selected
- **Warning Alert**: Shows "No cluster version" alert if version is missing
- **Progressive Disclosure**: VPC configuration only appears with valid version

### **VPC and Subnet Configuration**
- **VPC Selection**: Choose from available VPCs in the selected region
- **Subnet Management**: Configure private/public subnets per availability zone
- **Single/Multi-AZ**: Support for both single and multi-availability zone setups
- **PrivateLink Support**: Option for private-only subnet configuration

### **Security Groups Management**
- **Additional Security Groups**: Expandable section for extra security groups
- **Node Type Configuration**: Separate groups for control plane, infrastructure, worker
- **Apply to All**: Simplified option to use same groups for all node types
- **Version Compatibility**: Only available for OpenShift 4.11+

### **AWS Shared VPC Integration**
- **Shared VPC Option**: Install into VPCs shared by other AWS accounts
- **DNS Domain Management**: Create, select, and manage base DNS domains
- **Hosted Zone Configuration**: Associate domains with private hosted zones
- **Role ARN Configuration**: Specify cross-account access roles

### **Behavioral Differences**

#### **PrivateLink Enabled vs Standard**
- **PrivateLink**: Only private subnets shown, no public subnet fields
- **Standard**: Both private and public subnet fields required
- **Filtering**: Availability zones filtered based on required subnet types

#### **Single-AZ vs Multi-AZ**
- **Single-AZ**: One row of subnet configuration
- **Multi-AZ**: Three rows with unique AZ validation
- **Subnet Reset**: Automatically adjusts subnet array when AZ mode changes

#### **Shared VPC Enabled**
- **Additional Fields**: DNS domain, hosted zone ID, role ARN configuration
- **Step-by-Step**: Three-step configuration process with clear instructions
- **Cross-Account**: Integration with AWS organizations and shared resources

### **Form Integration**
- **Formik Integration**: Full form state management with validation
- **Field Dependencies**: VPC selection affects subnet and security group options
- **Reset Behavior**: Changing VPC clears related fields
- **Validation**: Real-time validation for all configuration fields

### **User Experience**
- **Progressive Disclosure**: Complex options revealed as needed
- **Clear Guidance**: Help text and external links for complex concepts
- **Error Handling**: Graceful handling of missing data and API errors
- **Accessibility**: Full keyboard and screen reader support

### **Props Control**
- \`privateLinkSelected\`: Enable PrivateLink mode (affects subnet requirements)

**Note**: This component is only used for ROSA Classic clusters. ROSA Hosted (Hypershift) clusters handle VPC configuration differently in the Machine Pool step.
        `,
      },
    },
  },
  argTypes: {
    showInWizardFramework: {
      control: 'boolean',
      description: 'Show the step within the full wizard framework with left navigation panel',
    },
    privateLinkSelected: {
      control: 'boolean',
      description: 'Enable PrivateLink mode (private subnets only)',
    },
    clusterVersion: {
      control: 'text',
      description: 'OpenShift cluster version (affects feature availability)',
    },
    isMultiAz: {
      control: 'boolean',
      description: 'Multi-AZ configuration vs Single-AZ',
    },
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

export const NoClusterVersion: Story = {
  name: 'No Cluster Version Selected',
  args: {
    showInWizardFramework: true,
    privateLinkSelected: false,
    clusterVersion: '', // No version selected
    selectedVPC: { id: '', name: '' } as any,
    isMultiAz: false,
  },
  parameters: {
    docs: {
      description: {
        story: `**No Cluster Version Warning**

Shows the warning state when no OpenShift cluster version has been selected in previous steps.

**Configuration:**
- **Cluster Version**: Not selected (empty)
- **Warning**: "No cluster version defined" alert shown
- **VPC Configuration**: Hidden until version is selected

**Key Behaviors:**
- Shows warning alert with clear message
- VPC configuration interface is completely hidden
- User must go back to select cluster version first
- Enforces proper wizard step flow`,
      },
    },
  },
};

export const SingleAzBasicSetup: Story = {
  name: 'Single-AZ: Public cluster',
  args: {
    showInWizardFramework: true,
    privateLinkSelected: false,
    clusterVersion: '4.14.10',
    selectedVPC: mockVPCWithFullConfiguration,
    isMultiAz: false,
    selectedAZs: ['us-east-1a'],
    initialSubnets: [
      {
        availabilityZone: 'us-east-1a',
        privateSubnetId: 'subnet-private-1a',
        publicSubnetId: 'subnet-public-1a',
      },
    ],
    initialSecurityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: [],
      infra: [],
      worker: [],
    },
    initialSharedVpc: {
      is_selected: false,
      base_dns_domain: '',
      hosted_zone_id: '',
      hosted_zone_role_arn: '',
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Single-AZ Basic VPC Configuration**

Shows a standard single availability zone VPC setup with basic configuration.

**Configuration:**
- **AZ Mode**: Single-AZ (us-east-1a)
- **VPC**: Selected with subnets configured
- **Subnets**: Both private and public subnets selected
- **Security Groups**: Available but none selected
- **Shared VPC**: Disabled

**Key Behaviors:**
- One row of subnet configuration (AZ + private + public)
- Security groups section collapsed (no groups selected)
- Shared VPC section shows only checkbox
- All components working together in single-AZ mode`,
      },
    },
  },
};

export const MultiAzFullyConfigured: Story = {
  name: 'Multi-AZ: Public cluster',
  args: {
    showInWizardFramework: true,
    privateLinkSelected: false,
    clusterVersion: '4.14.10',
    selectedVPC: mockVPCWithFullConfiguration,
    isMultiAz: true,
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
    initialSecurityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: ['sg-web-456'],
      infra: ['sg-default-123'],
      worker: ['sg-db-789'],
    },
    initialSharedVpc: {
      is_selected: false,
      base_dns_domain: '',
      hosted_zone_id: '',
      hosted_zone_role_arn: '',
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Multi-AZ Fully Configured**

Shows a complete multi-AZ VPC setup with all components configured.

**Configuration:**
- **AZ Mode**: Multi-AZ (3 availability zones)
- **VPC**: Selected with comprehensive subnet coverage
- **Subnets**: All AZs have private and public subnets selected
- **Security Groups**: Different groups per node type
- **Shared VPC**: Disabled

**Key Behaviors:**
- Three rows of subnet configuration (one per AZ)
- Security groups section expanded with per-node-type configuration
- All availability zones properly configured
- Demonstrates complete multi-AZ VPC setup`,
      },
    },
  },
};

export const PrivateLinkConfiguration: Story = {
  name: 'Multi-AZ: Private cluster',
  args: {
    showInWizardFramework: true,
    privateLinkSelected: true,
    clusterVersion: '4.14.10',
    selectedVPC: mockVPCWithFullConfiguration,
    isMultiAz: true,
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
    initialSecurityGroups: {
      applyControlPlaneToAll: true,
      controlPlane: ['sg-default-123', 'sg-web-456'],
      infra: [],
      worker: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**PrivateLink Multi-AZ Configuration**

Shows PrivateLink-enabled cluster configuration with private subnets only.

**How PrivateLink Gets Enabled:**
1. **Step 4: Networking** - User selects "Private" cluster privacy
2. **"Install into existing VPC"** checkbox automatically checked (required)
3. **"Use a PrivateLink"** checkbox appears for AWS private clusters
4. **User checks PrivateLink** → \`privateLinkSelected\` becomes true

**Note**: PrivateLink is available in both ROSA and OSD wizards for AWS private clusters.

**Configuration:**
- **PrivateLink**: Enabled (private subnets only)
- **AZ Mode**: Multi-AZ for high availability
- **Subnets**: Only private subnet columns shown
- **Security Groups**: "Apply to all" enabled with shared groups

**Key Behaviors:**
- Public subnet columns completely hidden
- Three rows showing only private subnet selection
- Security groups configured to apply same groups to all node types
- Optimal configuration for private, secure clusters`,
      },
    },
  },
};

export const SingleAzPrivateCluster: Story = {
  name: 'Single-AZ: Private cluster',
  args: {
    showInWizardFramework: true,
    privateLinkSelected: true,
    clusterVersion: '4.14.10',
    selectedVPC: mockVPCWithFullConfiguration,
    isMultiAz: false,
    selectedAZs: ['us-east-1a'],
    initialSubnets: [
      {
        availabilityZone: 'us-east-1a',
        privateSubnetId: 'subnet-private-1a',
        publicSubnetId: '',
      },
    ],
    initialSecurityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: ['sg-default-123'],
      infra: ['sg-web-456'],
      worker: ['sg-db-789'],
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**PrivateLink Single-AZ Configuration**

Shows PrivateLink-enabled cluster configuration for single availability zone deployment.

**How PrivateLink Gets Enabled:**
1. **Step 4: Networking** - User selects "Private" cluster privacy
2. **"Install into existing VPC"** checkbox automatically checked (required)
3. **"Use a PrivateLink"** checkbox appears for AWS private clusters
4. **User checks PrivateLink** → \`privateLinkSelected\` becomes true

**Note**: PrivateLink is available in both ROSA and OSD wizards for AWS private clusters.

**Configuration:**
- **PrivateLink**: Enabled (private subnets only)
- **AZ Mode**: Single-AZ for simpler deployment
- **Subnets**: Only private subnet column shown
- **Security Groups**: Different groups per node type

**Key Behaviors:**
- Public subnet column completely hidden
- Single row showing only private subnet selection
- Security groups individually configured for each node type
- Optimal for cost-effective private clusters`,
      },
    },
  },
};

export const SharedVpcEnabled: Story = {
  name: 'AWS Shared VPC: Fully Configured',
  args: {
    showInWizardFramework: true,
    privateLinkSelected: false,
    clusterVersion: '4.14.10',
    selectedVPC: mockVPCWithFullConfiguration,
    isMultiAz: false,
    selectedAZs: ['us-east-1a'],
    initialSubnets: [
      {
        availabilityZone: 'us-east-1a',
        privateSubnetId: 'subnet-private-1a',
        publicSubnetId: 'subnet-public-1a',
      },
    ],
    initialSecurityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: ['sg-default-123'],
      infra: [],
      worker: [],
    },
    initialSharedVpc: {
      is_selected: true,
      base_dns_domain: 'prod-cluster.s1.devshift.org',
      hosted_zone_id: 'Z1D633PJN98FT9',
      hosted_zone_role_arn: 'arn:aws:iam::123456789012:role/SharedVPCRole',
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**AWS Shared VPC Fully Configured**

Shows the complete AWS Shared VPC configuration with all steps completed.

**Configuration:**
- **Shared VPC**: Enabled and fully configured
- **DNS Domain**: prod-cluster.s1.devshift.org selected
- **Hosted Zone**: Z1D633PJN98FT9 configured
- **Role ARN**: Cross-account role specified
- **VPC/Subnets**: Standard single-AZ configuration

**Key Behaviors:**
- Shared VPC section expanded with all three steps completed
- Step 1: Base DNS domain selected with copy/delete options
- Step 2: Private hosted zone ID configured
- Step 3: Shared VPC role ARN properly formatted
- Ready for cross-account VPC cluster creation`,
      },
    },
  },
};

export const LegacyVersionLimitations: Story = {
  name: 'Legacy Version: Limited Features',
  args: {
    showInWizardFramework: true,
    privateLinkSelected: false,
    clusterVersion: '4.10.8', // Below 4.11 minimum for security groups and shared VPC
    selectedVPC: mockVPCWithFullConfiguration,
    isMultiAz: false,
    selectedAZs: ['us-east-1a'],
    initialSubnets: [
      {
        availabilityZone: 'us-east-1a',
        privateSubnetId: 'subnet-private-1a',
        publicSubnetId: 'subnet-public-1a',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: `**Legacy OpenShift Version with Feature Limitations**

Shows VPC configuration for older OpenShift versions with limited feature support.

**Configuration:**
- **Version**: 4.10.8 (below feature minimums)
- **VPC/Subnets**: Full functionality available
- **Security Groups**: Not supported (shows incompatibility message)
- **Shared VPC**: Not supported (shows incompatibility message)

**Key Behaviors:**
- VPC and subnet configuration works normally
- Security groups section shows version incompatibility
- Shared VPC section shows version incompatibility
- Clear messaging about version requirements for advanced features`,
      },
    },
  },
};
