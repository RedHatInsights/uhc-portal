import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Wizard, WizardBody, WizardStep } from '@patternfly/react-core';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { baseRequestState } from '~/redux/reduxHelpers';

import { initialValues } from '../constants';

import NetworkScreen from './NetworkScreen';

import '../createROSAWizard.scss';

// Mock VPC data for stories
const mockVpcWithSubnets = {
  id: 'vpc-04cbedcecd229b9d7',
  name: 'test-vpc-multi-az',
  aws_subnets: [
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
  ],
};

const withState = (
  formValues: any,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
} => {
  const store = createMockStore([thunk, promiseMiddleware as any])({
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
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  };

  return { store, Wrapper };
};

type StoryWrapperProps = {
  showInWizardFramework?: boolean;
  showClusterPrivacy?: boolean;
  showVPCCheckbox?: boolean;
  showClusterWideProxyCheckbox?: boolean;
  privateLinkSelected?: boolean;
  forcePrivateLink?: boolean;
  hypershiftMode?: boolean;
  clusterVersion?: string;
  initialFormValues?: any;
};

const StoryWrapper = ({
  showInWizardFramework = true,
  showClusterPrivacy = true,
  showVPCCheckbox = true,
  showClusterWideProxyCheckbox = false,
  privateLinkSelected = false,
  forcePrivateLink = false,
  hypershiftMode = false,
  clusterVersion = '4.14.10',
  initialFormValues = {},
}: StoryWrapperProps) => {
  const { Wrapper } = withState({});

  // Create form values based on the scenario and controls
  const defaultFormValues = {
    ...initialValues(hypershiftMode),
    hypershift: hypershiftMode ? 'true' : 'false',
    cluster_version: {
      raw_id: clusterVersion,
      rosa_enabled: true,
      hosted_control_plane_enabled: hypershiftMode,
    },
    cluster_privacy: 'external',
    install_to_vpc: false,
    configure_proxy: false,
    use_private_link: privateLinkSelected,
    application_ingress: 'default',
    selected_vpc: mockVpcWithSubnets,
    cluster_privacy_public_subnet_id: hypershiftMode ? 'subnet-public-1a' : '',
    ...initialFormValues,
  };

  if (showInWizardFramework) {
    // Show in wizard framework
    return (
      <Wrapper>
        <div className="ocm-page" style={{ height: '100vh', padding: 0, margin: 0 }}>
          <Wizard height="100%" width="100%" className="rosa-wizard">
            <WizardStep name="Networking" id="networking">
              <WizardBody>
                <Formik initialValues={defaultFormValues} onSubmit={() => {}}>
                  <NetworkScreen
                    showClusterPrivacy={showClusterPrivacy}
                    showVPCCheckbox={showVPCCheckbox}
                    showClusterWideProxyCheckbox={showClusterWideProxyCheckbox}
                    privateLinkSelected={privateLinkSelected}
                    forcePrivateLink={forcePrivateLink}
                  />
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
          <NetworkScreen
            showClusterPrivacy={showClusterPrivacy}
            showVPCCheckbox={showVPCCheckbox}
            showClusterWideProxyCheckbox={showClusterWideProxyCheckbox}
            privateLinkSelected={privateLinkSelected}
            forcePrivateLink={forcePrivateLink}
          />
        </Formik>
      </div>
    </Wrapper>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 4: Networking/Configuration',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/NetworkScreen/NetworkScreen.jsx',
      componentType: 'wizard-step',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: [
        'isHypershift',
        'clusterVersion >= 4.14',
        'privateLinkSelected',
        'forcePrivateLink',
      ],
      featureFlagDependencies: ['application-ingress'],
      behaviors: [
        'conditional-visibility',
        'version-dependent-features',
        'cross-field-dependencies',
        'form-reset-on-change',
      ],
      step: 4,
      sharedWith: ['wizard'],
      keyComponents: [
        'ClusterPrivacyRadioButtons',
        'VPCConfigurationSection',
        'PrivateLinkCheckbox',
        'ClusterWideProxyCheckbox',
        'ApplicationIngressSection',
        'DefaultIngressFieldsFormik',
        'PublicSubnetSelection',
      ],
      title: 'Network Configuration',
    },
    docs: {
      description: {
        component: `
### NetworkScreen - Step 4: Networking Configuration

The NetworkScreen component handles network configuration for ROSA clusters with significantly different behavior between Classic and Hosted modes.

**Key Behavioral Differences:**

### ROSA Classic
- **Cluster Privacy**: Public/Private radio buttons
- **VPC Configuration**: "Install into existing VPC" checkbox with PrivateLink options
- **Proxy Configuration**: "Configure cluster-wide proxy" checkbox (nested within VPC section)
- **Application Ingress**: Default/Custom settings (Custom reveals DefaultIngressFieldsFormik)

### ROSA Hosted  
- **Cluster Privacy**: Public/Private radio buttons + public subnet selection (when public)
- **Proxy Configuration**: "Configure cluster-wide proxy" checkbox (top-level, under cluster privacy)
- **No VPC Section**: VPC configuration handled in Step 3: Machine Pool
- **No Application Ingress**: Ingress managed by hosted control plane

### Conditional Field Visibility
- **Application Ingress**: Only ROSA Classic with version 4.14+
- **Public Subnet**: Only ROSA Hosted when cluster privacy is "Public"
- **PrivateLink**: Only when private cluster selected in ROSA Classic
- **Proxy Configuration**: Both modes, but different locations (Classic: nested in VPC, Hosted: top-level)

### Props Control
- \`showClusterPrivacy\`: Show cluster privacy section
- \`showVPCCheckbox\`: Show VPC configuration (Classic only)
- \`showClusterWideProxyCheckbox\`: Show proxy configuration (both Classic and Hosted)
- \`privateLinkSelected\`: Control PrivateLink state
- \`forcePrivateLink\`: Force PrivateLink for private clusters
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
    clusterVersion: {
      control: 'text',
      description: 'Cluster version (affects available features)',
    },
    showClusterPrivacy: {
      control: 'boolean',
      description: 'Show cluster privacy section',
    },
    showVPCCheckbox: {
      control: 'boolean',
      description: 'Show VPC configuration section (Classic only)',
    },
    showClusterWideProxyCheckbox: {
      control: 'boolean',
      description: 'Show cluster-wide proxy checkbox (both Classic and Hosted)',
    },
    privateLinkSelected: {
      control: 'boolean',
      description: 'Enable PrivateLink for private clusters',
    },
    forcePrivateLink: {
      control: 'boolean',
      description: 'Force PrivateLink requirement',
    },
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

export const RosaClassic: Story = {
  name: 'ROSA Classic',
  args: {
    showInWizardFramework: true,
    hypershiftMode: false,
    showClusterPrivacy: true,
    showVPCCheckbox: true,
    showClusterWideProxyCheckbox: true, // Enable proxy checkbox for Classic
    privateLinkSelected: false,
    forcePrivateLink: false,
    clusterVersion: '4.14.10',
    initialFormValues: {
      cluster_privacy: 'external',
      install_to_vpc: false,
      application_ingress: 'default',
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Interactive ROSA Classic Configuration**

Explore all ROSA Classic networking options using the controls panel:

**Cluster Privacy Options:**
- Toggle between Public and Private cluster configurations
- Private clusters show warning alert and require VPC installation
- PrivateLink options available for private clusters

**VPC Configuration:**
- "Install into an existing VPC" checkbox (enabled by default for private clusters)
- PrivateLink checkbox for secure connectivity (private clusters only)
- "Configure a cluster-wide proxy" checkbox (nested under VPC section)

**Application Ingress Settings:**
- Default vs Custom ingress configuration
- Custom settings reveal advanced ingress form fields (DefaultIngressFieldsFormik)
- Available for cluster versions 4.14+ (controlled by clusterVersion)

**Interactive Controls:**
Use the Controls panel to experiment with different combinations and see how the UI adapts.`,
      },
    },
  },
};

export const RosaHosted: Story = {
  name: 'ROSA Hosted',
  args: {
    showInWizardFramework: true,
    hypershiftMode: true,
    showClusterPrivacy: true,
    showVPCCheckbox: false, // Hosted doesn't show VPC section
    showClusterWideProxyCheckbox: true, // Hosted shows proxy
    privateLinkSelected: false,
    forcePrivateLink: false,
    clusterVersion: '4.14.10',
    initialFormValues: {
      cluster_privacy: 'external',
      configure_proxy: false,
      cluster_privacy_public_subnet_id: 'subnet-public-1a', // Sample public subnet selected
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Interactive ROSA Hosted Configuration**

Explore ROSA Hosted networking options using the controls panel:

**Cluster Privacy Options:**
- Toggle between Public and Private cluster configurations  
- Public clusters show subnet selection field (pre-populated with sample subnets)
- Private clusters show warning alert (no subnet selection needed)

**Proxy Configuration:**
- "Configure a cluster-wide proxy" checkbox
- Enable HTTP/HTTPS proxy for cluster internet access
- Independent of cluster privacy settings

**Key Differences from Classic:**
- No VPC configuration section (handled in Step 3: Machine Pool)
- No Application Ingress settings (managed by hosted control plane)
- Public subnet selection embedded within cluster privacy section

**Interactive Controls:**
Use the Controls panel to toggle between public/private and proxy settings to see the UI changes.`,
      },
    },
  },
};

export const LegacyClusterVersion: Story = {
  name: 'ROSA Classic: Legacy Version (< 4.14)',
  args: {
    showInWizardFramework: true,
    hypershiftMode: false,
    showClusterPrivacy: true,
    showVPCCheckbox: true,
    showClusterWideProxyCheckbox: true, // Enable proxy checkbox for consistency
    privateLinkSelected: false,
    forcePrivateLink: false,
    clusterVersion: '4.13.8', // Pre-4.14 version
    initialFormValues: {
      cluster_privacy: 'external',
      install_to_vpc: false,
      application_ingress: 'default',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'ROSA Classic cluster with version below 4.14. Application ingress section shows "It can be customized for 4.14 clusters or newer" message with link to knowledge base article.',
      },
    },
  },
};
