import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Wizard, WizardBody, WizardStep } from '@patternfly/react-core';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// import { baseRequestState } from '~/redux/reduxHelpers'; // Unused
import {
  HOST_PREFIX_DEFAULT,
  MACHINE_CIDR_DEFAULT,
  POD_CIDR_DEFAULT,
  SERVICE_CIDR_DEFAULT,
} from '~/components/clusters/common/networkingConstants';

import { initialValues } from '../constants';

import CIDRScreen from './CIDRScreen';

import '../createROSAWizard.scss';

const withState = (
  formValues: any,
): {
  Wrapper: React.FC<{ children: React.ReactNode }>;
} => {
  const middlewares = [thunk, promiseMiddleware] as any[];
  const mockStore = createMockStore(middlewares);

  const store: MockStoreEnhanced<unknown, {}> = mockStore({
    // Add any necessary Redux state for CIDR screen
    // The CIDR screen doesn't seem to require complex Redux state like machine types or quotas
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );

  return { Wrapper };
};

interface StoryWrapperProps {
  showInWizardFramework?: boolean;
  hypershiftMode?: boolean;
  multiAz?: boolean;
  installToVpc?: boolean;
  useDefaultValues?: boolean;
  initialFormValues?: Record<string, any>;
}

const StoryWrapper = ({
  showInWizardFramework = true,
  hypershiftMode = false,
  multiAz = true,
  installToVpc = false,
  useDefaultValues = true,
  initialFormValues = {},
}: StoryWrapperProps) => {
  const { Wrapper } = withState({});

  // Create form values based on the scenario
  const defaultFormValues = {
    ...initialValues(hypershiftMode),
    hypershift: hypershiftMode ? 'true' : 'false',
    cloud_provider: 'aws',
    multi_az: multiAz,
    install_to_vpc: installToVpc,
    cidr_default_values_toggle: useDefaultValues,
    network_machine_cidr: useDefaultValues ? MACHINE_CIDR_DEFAULT : '',
    network_service_cidr: useDefaultValues ? SERVICE_CIDR_DEFAULT : '',
    network_pod_cidr: useDefaultValues ? POD_CIDR_DEFAULT : '',
    network_host_prefix: useDefaultValues ? HOST_PREFIX_DEFAULT : '',
    ...initialFormValues,
  };

  if (showInWizardFramework) {
    // Show in wizard framework
    return (
      <Wrapper>
        <div className="ocm-page" style={{ height: '100vh', padding: 0, margin: 0 }}>
          <Wizard height="100%" width="100%" className="rosa-wizard">
            <WizardStep name="CIDR ranges" id="cidr-ranges">
              <WizardBody>
                <Formik initialValues={defaultFormValues} onSubmit={() => {}}>
                  <CIDRScreen />
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
          <CIDRScreen />
        </Formik>
      </div>
    </Wrapper>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 4: Networking/CIDR ranges',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/CIDRScreen/CIDRScreen.jsx',
      componentType: 'wizard-step',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['multiAz', 'installToVpc', 'cidrDefaultValuesToggle'],
      featureFlagDependencies: [],
      behaviors: [
        'real-time-validation',
        'conditional-alerts',
        'default-value-toggle',
        'cidr-overlap-detection',
      ],
      step: 4,
      sharedWith: ['wizard'],
      keyComponents: [
        'CIDRDefaultValuesToggle',
        'MachineCIDRField',
        'ServiceCIDRField',
        'PodCIDRField',
        'HostPrefixField',
        'VPCInstallationAlert',
      ],
      title: 'CIDR Ranges Configuration',
    },
    docs: {
      description: {
        component: `
### CIDRScreen - Step 4: CIDR Ranges Configuration

The CIDRScreen component handles advanced networking configuration for ROSA clusters, allowing users to customize CIDR ranges for their cluster networking.

**Key Features:**
- **Machine CIDR**: IP range for worker nodes
- **Service CIDR**: IP range for Kubernetes services  
- **Pod CIDR**: IP range for pod networking
- **Host Prefix**: Subnet allocation size per node
- **Default Values**: Safe defaults with one-click configuration
- **Validation**: Ensures non-overlapping ranges and proper subnet masks

**Behavioral Differences:**

### ROSA Classic vs ROSA Hosted
The CIDR configuration is essentially identical between modes, with only minor internal validation differences:
- **ROSA Hosted**: Always uses multi-AZ CIDR validation rules (even for single-AZ)
- **ROSA Classic**: Uses appropriate single-AZ or multi-AZ validation based on cluster configuration

### Form Behavior
- **Use default values**: Checkbox that populates all fields with safe defaults
- **Custom values**: Manual entry with real-time validation
- **VPC Installation**: Shows additional validation when installing to existing VPCs
- **Multi-AZ**: Affects subnet mask requirements for Machine CIDR

### Validation Rules
- All ranges must be non-overlapping
- Machine CIDR must match selected VPC subnets (when applicable)
- Service and Pod CIDRs must use private IP ranges
- Host prefix determines how many pods can run per node
        `,
      },
    },
  },
  argTypes: {
    showInWizardFramework: {
      control: 'boolean',
      description: 'Show the step within the full wizard framework with left navigation panel',
    },
    hypershiftMode: {
      control: 'boolean',
      description: 'ROSA Hosted mode (true) vs ROSA Classic mode (false)',
    },
    multiAz: {
      control: 'boolean',
      description: 'Multi-AZ configuration (affects validation rules)',
    },
    installToVpc: {
      control: 'boolean',
      description: 'Installing to existing VPC (shows additional validation)',
    },
    useDefaultValues: {
      control: 'boolean',
      description: 'Use default CIDR values checkbox state',
    },
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

export const MultiAzConfiguration: Story = {
  name: 'Rosa Hosted or Rosa Classic: Multi-AZ',
  args: {
    showInWizardFramework: true,
    hypershiftMode: false, // Can be toggled via controls
    multiAz: true,
    installToVpc: false,
    useDefaultValues: true,
    initialFormValues: {
      network_machine_cidr: MACHINE_CIDR_DEFAULT,
      network_service_cidr: SERVICE_CIDR_DEFAULT,
      network_pod_cidr: POD_CIDR_DEFAULT,
      network_host_prefix: HOST_PREFIX_DEFAULT,
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Interactive Multi-AZ CIDR Configuration**

This story works for both ROSA Classic and ROSA Hosted modes in multi-AZ configuration.

**Key Features:**
- **Default Values**: Safe CIDR ranges pre-populated for immediate use
- **Multi-AZ Validation**: Uses stricter subnet mask requirements for multi-AZ clusters
- **Interactive Controls**: Toggle between ROSA modes, VPC installation, and default values
- **Comprehensive Validation**: Real-time validation ensures non-overlapping ranges

**Default CIDR Ranges:**
- **Machine CIDR**: ${MACHINE_CIDR_DEFAULT} (worker node IPs)
- **Service CIDR**: ${SERVICE_CIDR_DEFAULT} (Kubernetes service IPs)  
- **Pod CIDR**: ${POD_CIDR_DEFAULT} (pod networking IPs)
- **Host Prefix**: ${HOST_PREFIX_DEFAULT} (subnet allocation per node)

**Interactive Usage:**
Use the Controls panel to:
- Switch between ROSA Classic and Hosted modes
- Toggle VPC installation to see validation changes
- Enable/disable default values to see custom entry mode
- Experiment with different multi-AZ scenarios`,
      },
    },
  },
};

export const SingleAzConfiguration: Story = {
  name: 'Rosa Classic: Single AZ',
  args: {
    showInWizardFramework: true,
    hypershiftMode: false,
    multiAz: false,
    installToVpc: false,
    useDefaultValues: true,
    initialFormValues: {
      network_machine_cidr: MACHINE_CIDR_DEFAULT,
      network_service_cidr: SERVICE_CIDR_DEFAULT,
      network_pod_cidr: POD_CIDR_DEFAULT,
      network_host_prefix: HOST_PREFIX_DEFAULT,
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**ROSA Classic Single-AZ CIDR Configuration**

This story demonstrates CIDR configuration specifically for ROSA Classic clusters in single availability zone mode.

**Single-AZ Specific Features:**
- **Relaxed Validation**: Less restrictive subnet mask requirements for Machine CIDR
- **Simplified Networking**: Single-AZ clusters have simpler networking requirements
- **Cost Optimization**: Single-AZ deployment reduces cross-AZ data transfer costs

**Validation Differences:**
- **Machine CIDR**: Allows smaller subnet masks (less restrictive than multi-AZ)
- **Host Prefix**: Same validation as multi-AZ
- **Service/Pod CIDRs**: Identical validation to multi-AZ

**Use Cases:**
- Development and testing environments
- Cost-sensitive deployments
- Workloads that don't require high availability across AZs
- Simplified network architecture requirements

**Note**: ROSA Hosted clusters are always multi-AZ, so this configuration is only applicable to ROSA Classic.`,
      },
    },
  },
};

export const VpcInstallationAlert: Story = {
  name: 'Machine CIDR range alert',
  args: {
    showInWizardFramework: true,
    hypershiftMode: false,
    multiAz: true,
    installToVpc: true, // Trigger the VPC installation alert
    useDefaultValues: true,
    initialFormValues: {
      network_machine_cidr: MACHINE_CIDR_DEFAULT,
      network_service_cidr: SERVICE_CIDR_DEFAULT,
      network_pod_cidr: POD_CIDR_DEFAULT,
      network_host_prefix: HOST_PREFIX_DEFAULT,
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Machine CIDR range matching alert**

This story demonstrates the conditional alert that appears when installing ROSA into an existing VPC.

**Alert Details:**
- **Title**: "Ensure the Machine CIDR range matches the selected VPC subnets."
- **Type**: Info alert (blue, plain inline style)
- **Placement**: Within Machine CIDR field help text
- **Trigger**: Only appears when \`installToVpc = true\`

**When This Alert Appears:**
- User selects "Install into an existing VPC" in the Network configuration step
- Alert reminds users that Machine CIDR must be compatible with existing VPC subnets
- Helps prevent networking conflicts between cluster nodes and existing VPC resources

**Why This Alert Is Important:**
- **Compatibility Check**: Machine CIDR must not conflict with existing VPC subnets
- **Network Planning**: Users must verify their CIDR choice works with selected VPC
- **Deployment Success**: Incorrect CIDR can cause cluster installation failures

**Alert Location:**
The alert appears directly under the Machine CIDR field's validation message, providing contextual guidance exactly where users need it most.

**Story Usage:**
Enable the "installToVpc" control to see how the alert appears contextually within the Machine CIDR field.`,
      },
    },
  },
};
