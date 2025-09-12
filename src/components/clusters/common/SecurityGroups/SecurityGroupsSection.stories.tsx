import React from 'react';
import { Form, Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import type { Meta, StoryObj } from '@storybook/react';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import SecurityGroupsSection from '~/components/clusters/wizards/rosa/VPCScreen/SecurityGroupsSection';
import { CloudVpc } from '~/types/clusters_mgmt.v1';

// Mock VPC data with security groups
const mockVPCWithSecurityGroups: CloudVpc = {
  name: 'rosa-test-vpc-with-sg',
  red_hat_managed: false,
  id: 'vpc-security-groups-123',
  cidr_block: '10.0.0.0/16',
  aws_subnets: [
    {
      subnet_id: 'subnet-private-1a',
      name: 'rosa-test-private-us-east-1a',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-east-1a',
      cidr_block: '10.0.128.0/20',
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
      // description: 'Security group for web servers allowing HTTP/HTTPS', // Not part of SecurityGroup type
    },
    {
      id: 'sg-db-789',
      name: 'database-servers',
      // description: 'Security group for database servers with restricted access', // Not part of SecurityGroup type
    },
    {
      id: 'sg-app-101',
      name: 'application-tier',
      // description: 'Security group for application tier with custom ports', // Not part of SecurityGroup type
    },
    {
      id: 'sg-monitoring-202',
      name: 'monitoring',
      // description: 'Security group for monitoring and logging services', // Not part of SecurityGroup type
    },
  ],
};

const mockVPCWithoutSecurityGroups: CloudVpc = {
  name: 'rosa-test-vpc-no-sg',
  red_hat_managed: false,
  id: 'vpc-no-security-groups-456',
  cidr_block: '10.1.0.0/16',
  aws_subnets: [
    {
      subnet_id: 'subnet-private-no-sg',
      name: 'rosa-test-private-us-east-1a',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-east-1a',
      cidr_block: '10.1.128.0/20',
    },
  ],
  aws_security_groups: [], // No security groups available
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
    // Mock Redux state structure (SecurityGroupsSection doesn't use ccsInquiries but keeping consistent)
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
  openshiftVersion: string;
  isHypershiftSelected: boolean;
  initialSecurityGroups?: {
    applyControlPlaneToAll: boolean;
    controlPlane: string[];
    infra: string[];
    worker: string[];
  };
  isExpanded?: boolean;
};

const StoryWrapper = ({
  selectedVPC,
  openshiftVersion,
  isHypershiftSelected,
  initialSecurityGroups,
}: StoryWrapperProps) => {
  // Create initial form values
  const defaultSecurityGroups = initialSecurityGroups || {
    applyControlPlaneToAll: false,
    controlPlane: [],
    infra: [],
    worker: [],
  };

  const initialValues = {
    [FieldId.SecurityGroups]: defaultSecurityGroups,
  };

  const { Wrapper } = withState(initialValues);

  // Determine version compatibility
  const versionNumber = parseFloat(openshiftVersion);
  const isVersionSupported = versionNumber >= 4.11;
  const hasSecurityGroups = (selectedVPC.aws_security_groups || []).length > 0;

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
          SecurityGroupsSection - Additional Security Groups
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>VPC:</strong> {selectedVPC.name} ({selectedVPC.id})
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>OpenShift Version:</strong> {openshiftVersion}
            {!isVersionSupported && ' (⚠️ Security groups not supported)'}
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong>{' '}
            {isHypershiftSelected ? 'ROSA Hosted (Hypershift)' : 'ROSA Classic'}
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Available Security Groups:</strong>{' '}
            {selectedVPC.aws_security_groups?.length || 0}
            {!hasSecurityGroups && ' (⚠️ No security groups available)'}
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Apply to All:</strong>{' '}
            {defaultSecurityGroups.applyControlPlaneToAll
              ? 'Yes (same groups for all node types)'
              : 'No (separate groups per node type)'}
          </p>
        </div>
      </div>

      <Wrapper>
        <SecurityGroupsSection
          selectedVPC={selectedVPC}
          openshiftVersion={openshiftVersion}
          isHypershiftSelected={isHypershiftSelected}
        />
      </Wrapper>
    </div>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Common/SecurityGroups/SecurityGroupsSection',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/VPCScreen/SecurityGroupsSection.tsx',
      componentType: 'form-section',
      usage: ['Classic', 'Hosted', 'Day-2 Operations'],
      conditionalLogic: ['openshiftVersion >= 4.11', 'selectedVPC.id', 'isHypershiftSelected'],
      featureFlagDependencies: [],
      behaviors: [
        'expandable-section',
        'version-compatibility-check',
        'security-group-validation',
        'apply-to-all-toggle',
        'conditional-node-type-fields',
      ],
      sharedWith: ['vpc-screen', 'cluster-details'],
      keyComponents: [
        'ExpandableSection',
        'EditSecurityGroups',
        'SecurityGroupsEmptyAlert',
        'ReduxCheckbox',
        'Alert',
      ],
      title: 'Additional Security Groups Configuration',
    },
    docs: {
      description: {
        component: `
### SecurityGroupsSection - Additional Security Groups Configuration

The SecurityGroupsSection component provides an expandable interface for configuring additional AWS security groups for ROSA cluster nodes. It supports both ROSA Classic and ROSA Hosted (Hypershift) modes with version-dependent feature availability.

**Usage Contexts:**
- ✅ **ROSA Classic Wizard**: VPC Settings sub-step during cluster creation
- ✅ **Day-2 Operations**: EditMachinePoolModal for post-cluster machine pool management
- ❌ **ROSA Hosted Wizard**: NOT used during cluster creation (VPC Settings step doesn't exist)
- ✅ **ROSA Hosted Day-2**: Used when editing machine pools after cluster creation

**Key Features:**

### **Expandable Interface**
- **Collapsed by default** unless security groups are already selected
- **Toggle visibility** to reduce form complexity
- **Contextual expansion** based on existing selections

### **Version Compatibility**
- **Minimum Version**: OpenShift 4.11+ required for security groups
- **Compatibility Check**: Shows version incompatibility message for older versions
- **Feature Gating**: Automatically hides controls for unsupported versions

### **Security Group Management**
- **VPC-Scoped**: Only shows security groups from the selected VPC
- **Multi-Selection**: Supports multiple security groups per node type
- **Validation**: Ensures security group selections are valid
- **External Links**: Direct access to AWS console and documentation

### **Node Type Configuration**

#### **Apply to All Nodes (Simplified)**
- **Single Selection**: One set of security groups for all node types
- **Simplified Interface**: Reduces complexity for common scenarios
- **Consistent Security**: Same security posture across all nodes

#### **Per-Node Type (Advanced)**
- **Control Plane**: Security groups for master/control plane nodes
- **Infrastructure**: Security groups for infrastructure nodes (router, registry)
- **Worker**: Security groups for application workload nodes
- **Granular Control**: Different security posture per node type

### **Behavioral Differences**

#### **ROSA Classic vs ROSA Hosted**
- **Classic**: All three node types (control plane, infrastructure, worker) - Used in VPC Settings wizard step
- **Hosted**: Only used in day-2 operations (EditMachinePoolModal) - NOT in wizard creation
- **Validation**: Different validation rules based on cluster type and usage context

#### **Empty Security Groups**
- **No Groups Available**: Shows empty state alert with guidance
- **Missing VPC**: Hidden when no VPC is selected
- **AWS Console Links**: Direct navigation to create security groups

### **Form Integration**
- **Formik Integration**: Full form state management
- **Field Validation**: Real-time security group validation
- **State Persistence**: Maintains selections across form interactions
- **Reset Behavior**: Clears selections when VPC changes

### **User Experience**
- **Progressive Disclosure**: Advanced options revealed when needed
- **Helpful Alerts**: Contextual information and warnings
- **External Resources**: Links to AWS console and documentation
- **Accessibility**: Full keyboard and screen reader support

### **Props Control**
- \`selectedVPC\`: VPC containing available security groups
- \`openshiftVersion\`: Controls feature availability
- \`isHypershiftSelected\`: Affects validation and node type handling
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
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

export const CollapsedWithGroups: Story = {
  name: 'Collapsed: VPC with Security Groups',
  args: {
    selectedVPC: mockVPCWithSecurityGroups,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: false,
    initialSecurityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: [],
      infra: [],
      worker: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Collapsed State with Available Security Groups**

Shows the expandable section in its default collapsed state when security groups are available but none are selected.

**Configuration:**
- **VPC**: Contains 5 security groups (default, web-servers, database-servers, etc.)
- **Version**: 4.14.0 (security groups supported)
- **Mode**: ROSA Classic
- **State**: Collapsed, no groups selected

**Key Behaviors:**
- Expandable section shows "Additional security groups" toggle
- Click to expand and reveal security group configuration
- Shows info alert about default security group restrictions
- Links to AWS console and documentation`,
      },
    },
  },
};

export const ExpandedApplyToAll: Story = {
  name: 'Expanded: Apply Same Groups to All Nodes',
  args: {
    selectedVPC: mockVPCWithSecurityGroups,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: false,
    initialSecurityGroups: {
      applyControlPlaneToAll: true,
      controlPlane: ['sg-web-456', 'sg-monitoring-202'],
      infra: [],
      worker: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Expanded with "Apply to All Nodes" Enabled**

Shows the expanded configuration with the simplified "apply to all" option selected.

**Configuration:**
- **VPC**: Multiple security groups available
- **Apply to All**: Enabled (checkbox checked)
- **Selected Groups**: web-servers and monitoring groups
- **Interface**: Simplified single selection interface

**Key Behaviors:**
- "Apply same security groups to all node types" checkbox checked
- Single security group selector (no separate node type fields)
- Selected groups apply to control plane, infrastructure, and worker nodes
- Streamlined interface for common use cases`,
      },
    },
  },
};

export const ExpandedPerNodeType: Story = {
  name: 'Expanded: Different Groups per Node Type',
  args: {
    selectedVPC: mockVPCWithSecurityGroups,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: false,
    initialSecurityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: ['sg-default-123', 'sg-monitoring-202'],
      infra: ['sg-web-456'],
      worker: ['sg-app-101', 'sg-db-789'],
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Expanded with Per-Node Type Configuration**

Shows the advanced configuration with different security groups for each node type.

**Configuration:**
- **Apply to All**: Disabled (advanced mode)
- **Control Plane**: default + monitoring groups
- **Infrastructure**: web-servers group
- **Worker**: application-tier + database-servers groups
- **Granular Control**: Different security posture per node type

**Key Behaviors:**
- Three separate security group selectors
- Each node type can have different security groups
- Labels clearly identify each node type
- Advanced configuration for complex security requirements`,
      },
    },
  },
};

export const RosaHostedDayTwoOperations: Story = {
  name: 'ROSA Hosted: Day-2 Operations (Machine Pool Edit)',
  args: {
    selectedVPC: mockVPCWithSecurityGroups,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: true,
    initialSecurityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: ['sg-web-456'],
      infra: [],
      worker: ['sg-app-101'],
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**ROSA Hosted: Day-2 Operations Context**

⚠️ **Important**: This component is NOT used during ROSA Hosted cluster creation wizard. The VPC Settings step doesn't exist for ROSA Hosted clusters.

**Where this IS used for ROSA Hosted:**
- ✅ **Day-2 Operations**: Edit Machine Pool modal after cluster creation
- ✅ **Machine Pool Management**: Adding/editing machine pools post-creation
- ✅ **Security Group Updates**: Modifying security groups for existing machine pools

**Configuration:**
- **Mode**: ROSA Hosted (Hypershift enabled)
- **Context**: Post-cluster creation management
- **Control Plane**: Managed by Red Hat (not configurable)
- **Worker Nodes**: Customer-managed security groups via machine pools

**Key Behaviors:**
- Used in EditMachinePoolModal component
- Hypershift-specific validation rules
- Focus on worker node security configuration only
- Control plane security managed by Red Hat (not shown)`,
      },
    },
  },
};

export const NoSecurityGroups: Story = {
  name: 'VPC with No Security Groups',
  args: {
    selectedVPC: mockVPCWithoutSecurityGroups,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: false,
    initialSecurityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: [],
      infra: [],
      worker: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**VPC with No Available Security Groups**

Shows the empty state when the selected VPC has no security groups available.

**Configuration:**
- **VPC**: No security groups available
- **Version**: 4.14.0 (security groups supported)
- **State**: Empty state with guidance

**Key Behaviors:**
- Shows SecurityGroupsEmptyAlert component
- Provides guidance on creating security groups
- Links to AWS console for security group creation
- Expandable section still available but shows empty state`,
      },
    },
  },
};

export const UnsupportedVersion: Story = {
  name: 'Unsupported OpenShift Version',
  args: {
    selectedVPC: mockVPCWithSecurityGroups,
    openshiftVersion: '4.10.0', // Below 4.11 minimum
    isHypershiftSelected: false,
    initialSecurityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: [],
      infra: [],
      worker: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**OpenShift Version Below 4.11 (Unsupported)**

Shows version incompatibility message for OpenShift versions that don't support security groups.

**Configuration:**
- **Version**: 4.10.0 (below 4.11 minimum requirement)
- **Feature**: Security groups not supported
- **State**: Shows incompatibility message

**Key Behaviors:**
- Expandable section shows version incompatibility message
- No security group configuration interface shown
- Clear messaging about version requirements
- User guidance to upgrade for security group support`,
      },
    },
  },
};

export const NoVPCSelected: Story = {
  name: 'No VPC Selected (Hidden)',
  args: {
    selectedVPC: { id: '', name: '' } as any,
    openshiftVersion: '4.14.0',
    isHypershiftSelected: false,
    initialSecurityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: [],
      infra: [],
      worker: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**No VPC Selected (Component Hidden)**

Shows the behavior when no VPC is selected - the component is completely hidden.

**Configuration:**
- **VPC**: No VPC selected (empty ID)
- **Behavior**: Component returns null (not rendered)
- **User Flow**: Must select VPC first

**Key Behaviors:**
- SecurityGroupsSection component is not rendered
- No security group configuration available
- User must select VPC first in AWSSubnetFields
- Proper form flow enforcement`,
      },
    },
  },
};
