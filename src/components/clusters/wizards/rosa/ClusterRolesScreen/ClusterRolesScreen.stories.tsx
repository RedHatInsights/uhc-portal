import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Wizard, WizardBody, WizardStep } from '@patternfly/react-core';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { queryConstants } from '~/queries/queriesConstants';

import { initialValues } from '../constants';

import ClusterRolesScreen from './ClusterRolesScreen';

import '../createROSAWizard.scss';

// Mock OIDC configurations data - matches real AWS/CloudFront URLs
const mockOidcConfigurations = [
  {
    id: '22qa79chsq8manq8hvmnt33upj48lmas',
    issuer_url: 'https://d3gttgcc2zmq3d.cloudfront.net/22qa79chsq8manq8hvmnt33upj48lmas',
    managed: false,
    secret_arn: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:rosa-oidc-secret-abc123',
    thumbprint: 'a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9',
  },
  {
    id: '233dk2t6918rk6nOg8cOaau9btsiqjb',
    issuer_url: 'https://new-staging-oidc-b4s8.s3.us-east-1.amazonaws.com',
    managed: true,
    secret_arn: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:rosa-oidc-secret-def456',
    thumbprint: 'b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0',
  },
  {
    id: '2aOf9palp4bob7jq3h2lpc6q345644',
    issuer_url: 'https://rosa-oidc-prod.s3.amazonaws.com/2aOf9palp4bob7jq3h2lpc6q345644',
    managed: false,
    secret_arn: 'arn:aws:secretsmanager:us-west-2:123456789012:secret:rosa-oidc-secret-ghi789',
    thumbprint: 'c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1',
  },
  {
    id: '45fg7h3kq9r2ts8vwx1y4za6bc9def12',
    issuer_url: 'https://d1a2b3c4e5f6g7.cloudfront.net/45fg7h3kq9r2ts8vwx1y4za6bc9def12',
    managed: true,
    secret_arn: 'arn:aws:secretsmanager:eu-west-1:123456789012:secret:rosa-oidc-secret-jkl012',
    thumbprint: 'd3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2',
  },
];

// Mock OCM role data
const mockOCMRoleData = {
  data: {
    arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-OCM-Role-123456789012',
    isAdmin: true,
  },
};

const withState = (
  formValues: any,
  hasOCMRoleError = false,
  enableMultiRegion = false,
): {
  Wrapper: React.FC<{ children: React.ReactNode }>;
} => {
  const middlewares = [thunk, promiseMiddleware] as any;
  const mockStore = createMockStore(middlewares);

  const store: MockStoreEnhanced<unknown, {}> = mockStore({
    // Minimal Redux state - React Query handles the data fetching
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity, // Prevent automatic refetching
      },
      mutations: { retry: false },
    },
  });

  // Set global flag for service mock to check
  (window as any).__storybookOCMRoleError = hasOCMRoleError;

  // Control cache population based on scenario
  if (!hasOCMRoleError) {
    // Only pre-populate success data - let error cases trigger actual API calls that will fail
    queryClient.setQueryData([queryConstants.FETCH_GET_OCM_ROLE], mockOCMRoleData);
  }

  // Always pre-populate OIDC configurations cache with correct data structure
  queryClient.setQueryData([queryConstants.FETCH_GET_USER_OIDC_CONFIGURATIONS], {
    data: {
      items: mockOidcConfigurations,
    },
  });

  // Pre-populate feature gate cache if multi-region is enabled
  if (enableMultiRegion) {
    queryClient.setQueryData(['featureGate', 'multi-region-support'], {
      data: { enabled: true },
    });
    console.log('🚀 Multi-Region Feature Gate Enabled in React Query Cache');
  } else {
    queryClient.setQueryData(['featureGate', 'multi-region-support'], {
      data: { enabled: false },
    });
  }

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Cleanup function to reset global flag when story changes
    React.useEffect(
      () => () => {
        delete (window as any).__storybookOCMRoleError;
      },
      [],
    );

    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  };

  return { Wrapper };
};

interface StoryWrapperProps {
  showInWizardFramework?: boolean;
  hasByoOidcConfig?: boolean;
  hasOCMAdminRole?: boolean;
  hasOCMRoleError?: boolean;
  enableMultiRegion?: boolean;
  initialFormValues?: Record<string, any>;
}

const StoryWrapper = ({
  showInWizardFramework = true,
  hasByoOidcConfig = true,
  hasOCMAdminRole = true,
  hasOCMRoleError = false,
  enableMultiRegion = false,
  initialFormValues = {},
}: StoryWrapperProps) => {
  const { Wrapper } = withState({}, hasOCMRoleError, enableMultiRegion);

  // Create form values based on the scenario
  const defaultFormValues = {
    ...initialValues(false), // Default to ROSA Classic
    hypershift: 'false', // Default to ROSA Classic, but can be overridden in stories
    cluster_name: 'test-cluster',
    associated_aws_id: '123456789012',
    rosa_roles_provider_creation_mode: hasOCMAdminRole ? 'auto' : 'manual',
    byo_oidc_config_id: hasByoOidcConfig ? '22qa79chsq8manq8hvmnt33upj48lmas' : '',
    custom_operator_roles_prefix: 'test-cluster-a1b2',
    installer_role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
    regional_instance: null, // Will be overridden by individual stories if needed
    ...initialFormValues,
  };

  // Debug logging for Multi-Region Preview story
  if (enableMultiRegion) {
    console.log('🔍 Multi-Region Debug Info:', {
      enableMultiRegion,
      hypershift: defaultFormValues.hypershift,
      regional_instance: defaultFormValues.regional_instance,
      featureGateFromStore: enableMultiRegion,
    });
  }

  if (showInWizardFramework) {
    // Show in wizard framework
    return (
      <Wrapper>
        <div className="ocm-page" style={{ height: '100vh', padding: 0, margin: 0 }}>
          <Wizard height="100%" width="100%" className="rosa-wizard">
            <WizardStep name="Cluster roles and policies" id="cluster-roles-policies">
              <WizardBody>
                <Formik initialValues={defaultFormValues} onSubmit={() => {}}>
                  <ClusterRolesScreen />
                </Formik>
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
        <Formik initialValues={defaultFormValues} onSubmit={() => {}}>
          <ClusterRolesScreen />
        </Formik>
      </div>
    </Wrapper>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 5: Cluster roles and policies',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/ClusterRolesScreen/ClusterRolesScreen.jsx',
      componentType: 'wizard-step',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['isHypershift', 'isMultiRegionEnabled', 'isAutoModeAvailable'],
      featureFlagDependencies: ['multiregion-preview'],
      behaviors: [
        'async-validation',
        'conditional-disable',
        'form-reset-on-change',
        'cross-field-dependencies',
        'cli-command-generation',
      ],
      step: 5,
      sharedWith: ['wizard'],
      keyComponents: [
        'CustomerOIDCConfiguration',
        'CustomOperatorRoleNames',
        'ToggleGroup',
        'InstructionCommand',
        'BackToAssociateAwsAccountLink',
      ],
      title: 'Cluster Roles and Policies Configuration',
    },
    docs: {
      description: {
        component: `
### ClusterRolesScreen - Step 5: Cluster roles and policies

The ClusterRolesScreen component handles OIDC provider configuration and operator role creation for both ROSA Classic and ROSA Hosted clusters.

**Key Features:**
- **OIDC Provider Configuration**: Select existing OIDC config or create new one
- **Operator Roles Creation**: Generate CLI commands for creating cluster-specific operator roles
- **Custom Prefix**: Specify custom prefix for operator role names
- **Multi-Region Support**: Additional login command for multi-region deployments
- **Admin Detection**: Automatic vs manual role creation based on OCM role permissions

**Component Workflow:**

### Step 1: OIDC Configuration
- **Config Selection**: Dropdown to select existing OIDC configuration
- **Create New**: Instructions and CLI commands to create new OIDC config
- **Refresh**: Button to refresh OIDC configurations after creation

### Step 2: Operator Roles Prefix  
- **Auto-Generated**: Based on cluster name + random hash
- **Custom Override**: Optional custom prefix (max 32 characters)
- **Validation**: Ensures proper naming conventions

### Step 3: CLI Commands
- **Standard Experience**: Shows one \`rosa create operator-roles\` command
- **Multi-Region Preview**: Shows \`rosa login\` + \`rosa create operator-roles\` commands (rare)
- **Copy-Paste Ready**: ClipboardCopy components for easy CLI execution

**User Experience:**
- **Standard Experience (99%+ users)**: Single CLI command for both ROSA modes
- **Multi-Region Preview (~7 orgs)**: Two-step CLI workflow with regional login

**ROSA Modes:**
- **ROSA Classic**: Shows this step under "Create OIDC Now" tab, always single CLI command
- **ROSA Hosted**: Shows this step as the main form (no tabs), single CLI command for most users

**Feature Flag Awareness:**
The multi-region functionality is controlled by the \`multi-region-support\` feature gate, which is only enabled for a very limited set of organizations in preview.
        `,
      },
    },
  },
  argTypes: {
    showInWizardFramework: {
      control: 'boolean',
      description: 'Show the step within the full wizard framework with left navigation panel',
    },
    hasByoOidcConfig: {
      control: 'boolean',
      description: 'Whether user has selected an OIDC config (shows CustomerOIDCConfiguration)',
    },
    hasOCMAdminRole: {
      control: 'boolean',
      description: 'Whether user has OCM admin role (enables auto mode vs manual only)',
    },
    hasOCMRoleError: {
      control: 'boolean',
      description: 'Show OCM role error alert (ocm-role no longer linked)',
    },
    enableMultiRegion: {
      control: 'boolean',
      description: 'Enable multi-region preview feature (shows rosa login command for ROSA Hosted)',
    },
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

export const RosaHosted: Story = {
  name: 'Rosa Hosted',
  args: {
    showInWizardFramework: true,
    hasByoOidcConfig: true,
    hasOCMAdminRole: true,
    hasOCMRoleError: false,
    initialFormValues: {
      cluster_name: 'prod-hosted-cluster',
      hypershift: 'true', // ROSA Hosted mode
      byo_oidc_config_id: '22qa79chsq8manq8hvmnt33upj48lmas',
      custom_operator_roles_prefix: 'prod-hosted-cluster-a1b2',
      regional_instance: null, // No regional instance in common production experience
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**ROSA Hosted Standard Configuration**

This story demonstrates the cluster roles and policies configuration for **ROSA Hosted deployments** as experienced by 99%+ of production users.

**ROSA Hosted Characteristics:**
- **Always Multi-AZ**: Hosted control plane requires multiple availability zones
- **Standard CLI**: Shows single \`rosa create operator-roles\` command
- **Production Standard**: Most common user experience

**CLI Command Shown:**
\`\`\`bash
# Single command execution
rosa create operator-roles --prefix "prod-hosted-cluster-a1b2" --oidc-config-id "22qa..." --hosted-cp [options]
\`\`\`

**Key Features:**
- **Hosted Control Plane**: Red Hat manages the control plane
- **Always Multi-AZ**: High availability built-in
- **OIDC Configuration**: Dropdown with existing configurations
- **Custom Prefix**: Operator roles naming with cluster-specific prefix
- **Copy-Paste Ready**: ClipboardCopy components for easy CLI execution

**Interactive Controls:**
Use the Controls panel to experiment with:
- **OIDC Config Toggle**: Show/hide OIDC configuration section
- **OCM Admin Role**: Toggle between auto and manual role creation modes

**When This Applies:**
- Standard ROSA Hosted production deployments (99%+ of users)
- Organizations not enrolled in multi-region preview
- Most enterprise and development environments
- Default ROSA Hosted experience

**Note:** A separate "Multi-Region Preview" story shows the rare multi-region experience with \`rosa login\` commands.`,
      },
    },
  },
};

export const RosaClassic: Story = {
  name: 'Rosa Classic',
  args: {
    showInWizardFramework: true,
    hasByoOidcConfig: true,
    hasOCMAdminRole: true,
    hasOCMRoleError: false,
    initialFormValues: {
      cluster_name: 'prod-classic-cluster',
      hypershift: 'false', // ROSA Classic mode
      byo_oidc_config_id: '22qa79chsq8manq8hvmnt33upj48lmas',
      custom_operator_roles_prefix: 'prod-classic-cluster-x7y8',
      regional_instance: null, // No regional instance for standard region deployment
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**ROSA Classic Configuration**

This story demonstrates the cluster roles and policies configuration for **ROSA Classic deployments**.

**ROSA Classic Characteristics:**
- **Self-Managed Control Plane**: You manage the control plane infrastructure
- **Single CLI Command**: Shows standard \`rosa create operator-roles\` command (no rosa login needed)
- **Toggle Choice**: Choose between "Create OIDC Later" or "Create OIDC Now"
- **Standard API**: Uses standard Red Hat API endpoint (no regional endpoint needed)

**CLI Command Shown:**
\`\`\`bash
# Single command execution (no regional login required)
rosa create operator-roles --prefix "prod-classic-cluster-x7y8" --oidc-config-id "22qa..." [options]
\`\`\`

**Key Features:**
- **Toggle Options**: Choose when to create OIDC provider (later vs now)
- **OIDC Configuration**: Dropdown with existing configurations when "Create OIDC Now" is selected
- **Custom Prefix**: Operator roles naming with cluster-specific prefix
- **Standard Workflow**: Single-command execution for most users

**UI Differences from ROSA Hosted:**
- **Toggle Buttons**: Shows "Create OIDC Later" / "Create OIDC Now" options
- **No OIDC Alert**: No blue alert about OIDC requirements
- **Conditional Form**: OIDC configuration only shows when "Create OIDC Now" is selected

**When This Applies:**
- ROSA Classic deployments (both Single-AZ and Multi-AZ)
- Standard region deployments with standard API endpoints
- Most production and development environments
- Users preferring self-managed control planes

**Note:** Multi-region capabilities (requiring \`rosa login\` commands) are currently only available for ROSA Hosted deployments in preview.`,
      },
    },
  },
};

export const MultiRegionPreview: Story = {
  name: 'Multi-Region Preview (Rosa Hosted)',
  args: {
    showInWizardFramework: true,
    hasByoOidcConfig: true,
    hasOCMAdminRole: true,
    hasOCMRoleError: false,
    enableMultiRegion: true, // Enable multi-region feature gate for this story
    initialFormValues: {
      cluster_name: 'preview-multiregion-cluster',
      hypershift: 'true', // ROSA Hosted mode required for multi-region
      byo_oidc_config_id: '22qa79chsq8manq8hvmnt33upj48lmas',
      custom_operator_roles_prefix: 'preview-multiregion-cluster-x9z1',
      regional_instance: {
        id: 'us-east-1',
        url: 'https://api.rosa.us-east-1.redhat.com',
        name: 'US East 1',
        environment: 'production',
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Multi-Region Preview Experience (Limited Organizations)**

This story demonstrates the **multi-region preview feature** available to only ~7 organizations globally (3 in production, 4 in staging).

**Preview Feature Characteristics:**
- **ROSA Hosted Only**: Multi-region commands only available for hosted control planes
- **Limited Access**: Only enabled for specific preview organizations
- **Regional API Endpoints**: Uses region-specific Red Hat API endpoints
- **Two-Step CLI**: Requires \`rosa login\` before operator role creation

**CLI Commands Shown:**
\`\`\`bash
# Step 1: Login to regional endpoint
rosa login --url https://api.rosa.us-east-1.redhat.com

# Step 2: Create operator roles
rosa create operator-roles --prefix "preview-multiregion-cluster-x9z1" --oidc-config-id "22qa..." --hosted-cp [options]
\`\`\`

**Technical Details:**
- **Feature Gate**: \`multi-region-support\` must be enabled in Unleash
- **Organization Whitelist**: Only specific organizations have access
- **API Architecture**: Uses regional API endpoints instead of global endpoint
- **Sequential Execution**: Commands must be run in order

**When This Applies:**
- Organizations enrolled in multi-region preview program
- Regional compliance requirements (data sovereignty)
- Multi-region disaster recovery scenarios
- Preview of future multi-region GA capabilities

**Note:** This is NOT the standard user experience. Most users (99%+) will see the single-command workflow shown in the main "Rosa Hosted" story.`,
      },
    },
  },
};

export const NoOCMRoleDetected: Story = {
  name: 'No OCM Role detected',
  args: {
    showInWizardFramework: true,
    hasByoOidcConfig: false,
    hasOCMAdminRole: false,
    hasOCMRoleError: true, // Show the OCM role error alert
    initialFormValues: {
      cluster_name: 'my-test-cluster',
      custom_operator_roles_prefix: 'my-test-cluster-a1b2',
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**No OCM Role Detected Error State**

This story demonstrates the error state when the OCM role is no longer linked to the Red Hat organization.

**Error Scenario:**
- **Alert Message**: "ocm-role is no longer linked to your Red Hat organization"
- **Error Type**: Red error box with detailed error information
- **User Action**: Must re-associate AWS account or fix OCM role configuration

**What This Means:**
- The OCM (OpenShift Cluster Manager) role in the user's AWS account has been removed or modified
- The role is required for Red Hat to manage ROSA clusters on behalf of the customer  
- This prevents cluster creation until the issue is resolved

**Typical Causes:**
- OCM role was accidentally deleted from AWS account
- OCM role permissions were modified, breaking the trust relationship
- AWS account was disconnected from Red Hat organization
- Role ARN changed without updating Red Hat configuration

**Resolution Steps:**
1. Check if OCM role exists in AWS IAM console
2. Verify role trust relationships and permissions
3. Re-run account association if needed
4. Contact Red Hat support if issue persists

**UI Behavior:**
- Shows prominent red error alert at top of form
- Prevents normal form progression until resolved
- Provides "Back to Associate AWS Account" link for easy navigation`,
      },
    },
  },
};
