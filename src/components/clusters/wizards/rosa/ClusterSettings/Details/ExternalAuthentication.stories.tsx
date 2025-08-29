import React, { useState } from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { ExpandableSection } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FieldId } from '~/components/clusters/wizards/common/constants';

import { EnableExternalAuthentication } from './EnableExternalAuthentication';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

type StoryWrapperProps = {
  hasExternalAuthCapability: boolean;
  isHypershiftSelected: boolean;
  initialExternalAuthEnabled: boolean;
  isInitiallyExpanded: boolean;
};

const createMockStore = (hasExternalAuthCapability: boolean) => {
  const capabilities = hasExternalAuthCapability
    ? [{ name: 'capability.cluster.external_authentication_oidc', value: 'true' }]
    : [];

  return configureStore()({
    userProfile: {
      keycloakProfile: {
        username: 'test-user',
      },
      organization: {
        fulfilled: true,
        details: {
          id: '123',
          name: 'Test Org',
          capabilities,
        },
      },
    },
  });
};

const StoryWrapper = ({
  hasExternalAuthCapability = true,
  isHypershiftSelected = true,
  initialExternalAuthEnabled = false,
  isInitiallyExpanded = true,
}: StoryWrapperProps) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const mockStore = createMockStore(hasExternalAuthCapability);

  const onToggle = () => setIsExpanded(!isExpanded);

  // Only show if both conditions are met (same logic as in Details.tsx)
  const shouldShowExternalAuth = isHypershiftSelected && hasExternalAuthCapability;

  return (
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <Formik
            initialValues={{
              [FieldId.EnableExteranlAuthentication]: initialExternalAuthEnabled,
            }}
            onSubmit={() => {}}
          >
            {shouldShowExternalAuth ? (
              <ExpandableSection
                toggleText="External Authentication"
                onToggle={onToggle}
                isExpanded={isExpanded}
              >
                <EnableExternalAuthentication />
              </ExpandableSection>
            ) : (
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  color: '#6b7280',
                  fontStyle: 'italic',
                }}
              >
                External Authentication section is not available
                <br />
                <small>
                  {!isHypershiftSelected && 'Requires Hypershift mode. '}
                  {!hasExternalAuthCapability &&
                    'Organization lacks external authentication capability.'}
                </small>
              </div>
            )}
          </Formik>
        </div>
      </QueryClientProvider>
    </Provider>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 3: Cluster settings/Details/ExternalAuthentication',
  component: StoryWrapper,
  parameters: {
    metadata: {
      sourceFile:
        '~/components/clusters/wizards/rosa/ClusterSettings/Details/EnableExternalAuthentication.tsx',
      componentType: 'form-section',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['hasExternalAuthCapability', 'isHypershift', 'externalAuthEnabled'],
      featureFlagDependencies: ['external-authentication-oidc'],
      behaviors: [
        'capability-dependent',
        'expandable-section',
        'conditional-visibility',
        'progressive-disclosure',
      ],
      sharedWith: ['wizard', 'cluster-details-step'],
      keyComponents: [
        'EnableExternalAuthentication',
        'ExpandableSection',
        'CheckboxField',
        'CapabilityCheck',
      ],
      title: 'External Authentication Configuration',
    },
    docs: {
      description: {
        component: `
## External Authentication Section

The External Authentication expandable section provides options for integrating with external identity providers in ROSA Hypershift clusters.

### Key Features
- **Conditional visibility** - Only shown for Hypershift clusters with external auth capability
- **Expandable/Collapsible** design for progressive disclosure  
- **Organization capability gating** - Requires specific organization permissions
- **Educational content** - Learn more links to external authentication documentation
- **Checkbox control** - Simple enable/disable toggle

### Business Logic
- **Hypershift only** - External authentication is not available for classic ROSA
- **Capability gated** - Organization must have 'capability.cluster.external_authentication_oidc'
- **Progressive disclosure** - Hidden by default, revealed when appropriate
- **External provider integration** - Allows authentication via external OIDC providers

### Components Included
- **CheckboxField** for enabling external authentication
- **CheckboxDescription** explaining the feature
- **ExternalLink** to documentation
- **Tooltip** with additional context

### Use Cases
- Hypershift clusters requiring external identity provider integration
- Organizations with OIDC authentication requirements
- Advanced authentication scenarios beyond built-in options
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

export const Default: Story = {
  name: 'Default',
  args: {
    hasExternalAuthCapability: true,
    isHypershiftSelected: true,
    initialExternalAuthEnabled: false,
    isInitiallyExpanded: true,
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
          Default External Authentication
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong> Hypershift with external auth
            capability
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Section visible and expandable
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Interaction:</strong> Click checkbox to
            enable/disable external authentication
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Organizations that can use OIDC
            providers
          </p>
        </div>
      </div>

      <StoryWrapper {...args} />
    </div>
  ),
};

export const NotAvailableClassic: Story = {
  name: 'Not Available (Classic ROSA)',
  args: {
    hasExternalAuthCapability: true,
    isHypershiftSelected: false,
    initialExternalAuthEnabled: false,
    isInitiallyExpanded: false,
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
          External Auth Not Available (Classic Mode)
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong> Classic ROSA (not Hypershift)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Visibility:</strong> Section completely hidden
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Reason:</strong> External auth requires Hypershift
            architecture
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Classic ROSA deployment scenario
          </p>
        </div>
      </div>

      <StoryWrapper {...args} />
    </div>
  ),
};

export const NotAvailableCapability: Story = {
  name: 'Not Available (Missing Capability)',
  args: {
    hasExternalAuthCapability: false,
    isHypershiftSelected: true,
    initialExternalAuthEnabled: false,
    isInitiallyExpanded: false,
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
          External Auth Not Available (Missing Capability)
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong> Hypershift enabled
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Issue:</strong> Organization lacks external
            authentication capability
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Visibility:</strong> Section completely hidden
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Organization without OIDC
            permissions
          </p>
        </div>
      </div>

      <StoryWrapper {...args} />
    </div>
  ),
};
