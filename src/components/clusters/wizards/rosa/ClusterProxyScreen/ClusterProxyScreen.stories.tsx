import React from 'react';
import { Formik } from 'formik';

import { Wizard, WizardStep } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import ClusterProxyScreen from '../ClusterProxyScreen';

type StoryWrapperProps = {
  showInWizardFramework: boolean;
  initialFormValues: {
    [FieldId.HttpProxyUrl]: string;
    [FieldId.HttpsProxyUrl]: string;
    [FieldId.NoProxyDomains]: string | string[];
    [FieldId.AdditionalTrustBundle]: string;
  };
};

// Wrapper component moved outside to avoid nested component definition
const FormikQueryWrapper = ({
  children,
  queryClient,
  initialFormValues,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
  initialFormValues: any;
}) => (
  <QueryClientProvider client={queryClient}>
    <Formik initialValues={initialFormValues} onSubmit={() => {}} validate={() => ({})}>
      {children}
    </Formik>
  </QueryClientProvider>
);

const StoryWrapper = ({ showInWizardFramework, initialFormValues }: StoryWrapperProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  if (showInWizardFramework) {
    return (
      <div style={{ height: '100vh' }}>
        <FormikQueryWrapper queryClient={queryClient} initialFormValues={initialFormValues}>
          <Wizard>
            <WizardStep name="Cluster-wide proxy" id="cluster-proxy">
              <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                <ClusterProxyScreen />
              </div>
            </WizardStep>
          </Wizard>
        </FormikQueryWrapper>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <FormikQueryWrapper queryClient={queryClient} initialFormValues={initialFormValues}>
        <ClusterProxyScreen />
      </FormikQueryWrapper>
    </div>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 4: Networking/Cluster-wide Proxy',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/ClusterProxyScreen.jsx',
      componentType: 'wizard-step',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['noUrlValues', 'anyTouched', 'noValues'],
      featureFlagDependencies: [],
      behaviors: [
        'progressive-field-validation',
        'cross-field-dependencies',
        'file-upload-validation',
        'url-validation',
        'conditional-field-enable',
      ],
      step: 4,
      sharedWith: ['wizard'],
      keyComponents: ['ReduxVerticalFormGroup', 'ReduxFileUpload', 'Alert', 'ExternalLink'],
      title: 'Cluster-wide Proxy Configuration',
    },
    docs: {
      description: {
        component: `
### ClusterProxyScreen - Cluster-wide Proxy Configuration

The ClusterProxyScreen component handles cluster-wide proxy configuration for ROSA clusters.

**Key Features:**
- **HTTP/HTTPS Proxy URLs**: Configure proxy servers for outbound connections
- **No Proxy Domains**: Specify domains to bypass proxy (only enabled when proxy URLs are set)
- **Additional Trust Bundle**: Upload PEM-encoded X.509 certificates for proxy authentication
- **Validation**: Requires at least one field to be configured
- **Cross-field Dependencies**: No Proxy Domains field is disabled until proxy URLs are provided

**Behavior:**
- **Universal Usage**: Same configuration for both ROSA Classic and ROSA Hosted
- **No AZ Dependencies**: Proxy settings apply cluster-wide, independent of availability zones
- **Validation Warning**: Shows alert when fields are touched but no values provided
- **File Upload**: Supports drag-and-drop or paste for trust bundle certificates

**Form Fields:**
- **HTTP Proxy URL**: Must be valid HTTP URL format
- **HTTPS Proxy URL**: Must be valid HTTP or HTTPS URL format  
- **No Proxy Domains**: Comma-separated list, validates domain format
- **Additional Trust Bundle**: Validates PEM certificate format

**Navigation Integration:**
- Alert provides link back to "Networking > Configuration" step
- Part of Step 4: Networking wizard flow
- Only visible when "Configure cluster-wide proxy" is enabled in Configuration step
        `,
      },
    },
  },
  argTypes: {
    showInWizardFramework: {
      control: 'boolean',
      description: 'Show component within PatternFly Wizard framework',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StoryWrapper>;

export const InitialState: Story = {
  args: {
    showInWizardFramework: true,
    initialFormValues: {
      [FieldId.HttpProxyUrl]: '',
      [FieldId.HttpsProxyUrl]: '',
      [FieldId.NoProxyDomains]: [],
      [FieldId.AdditionalTrustBundle]: '',
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Initial State Configuration**

Shows the initial state when user first enters the cluster-wide proxy configuration.

**Configuration:**
- **HTTP Proxy**: Not configured
- **HTTPS Proxy**: Not configured  
- **No Proxy Domains**: Disabled (no proxy URLs set)
- **Trust Bundle**: Not uploaded

**Key Behaviors:**
- Info alert instructs to "Configure at least 1 of the following fields"
- No Proxy Domains field is disabled with placeholder "Configure HTTP or HTTPS proxy first"
- Touching any field without providing value shows validation warning
- Warning alert includes link back to Configuration step`,
      },
    },
  },
};

export const Populated: Story = {
  args: {
    showInWizardFramework: true,
    initialFormValues: {
      [FieldId.HttpProxyUrl]: 'http://proxy.company.com:8080',
      [FieldId.HttpsProxyUrl]: 'https://proxy.company.com:8443',
      [FieldId.NoProxyDomains]: [
        'localhost',
        '127.0.0.1',
        '169.254.169.254',
        '.company.com',
        '.cluster.local',
        '.svc',
        'registry.redhat.io',
        'quay.io',
      ],
      [FieldId.AdditionalTrustBundle]: `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRkSPMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjMwMTAxMDAwMDAwWhcNMjQwMTAxMDAwMDAwWjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAyVdGZJQHuw==
-----END CERTIFICATE-----`,
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Populated Configuration**

Shows full proxy configuration with all fields populated.

**Configuration:**
- **HTTP Proxy**: http://proxy.company.com:8080
- **HTTPS Proxy**: https://proxy.company.com:8443
- **No Proxy Domains**: Comprehensive bypass list including Red Hat registries
- **Trust Bundle**: Corporate CA certificate uploaded

**Key Behaviors:**
- Complete enterprise proxy setup with both HTTP/HTTPS routing
- Comprehensive no-proxy list covers all common internal services
- Additional trust bundle enables connection to corporate services
- Red Hat registries (registry.redhat.io, quay.io) bypass proxy for optimal performance
- Optimal configuration for corporate environments with proxy requirements`,
      },
    },
  },
};
