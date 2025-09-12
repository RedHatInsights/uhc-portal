import React, { useState } from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { ExpandableSection, Grid } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import { AWSCustomerManagedEncryption } from './AWSCustomerManagedEncryption';
import { HCPEtcdEncryptionSection } from './HCPEtcdEncryptionSection';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const mockStore = configureStore()({
  userProfile: {
    keycloakProfile: {
      username: 'test-user',
    },
    organization: {
      fulfilled: true,
      details: {
        id: '123',
        name: 'Test Org',
      },
    },
  },
});

type StoryWrapperProps = {
  isHypershiftSelected: boolean;
  initialCustomerManagedKey: boolean;
  initialEtcdEncryption: boolean;
  isInitiallyExpanded: boolean;
};

const StoryWrapper = ({
  isHypershiftSelected = true,
  initialCustomerManagedKey = false,
  initialEtcdEncryption = false,
  isInitiallyExpanded = true,
}: StoryWrapperProps) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  const onToggle = () => setIsExpanded(!isExpanded);

  return (
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <Formik
            initialValues={{
              [FieldId.CustomerManagedKey]: initialCustomerManagedKey.toString(),
              [FieldId.KmsKeyArn]: '',
              [FieldId.EtcdEncryption]: initialEtcdEncryption,
              [FieldId.EtcdKeyArn]: '',
              [FieldId.Region]: 'us-east-1',
            }}
            onSubmit={() => {}}
          >
            {() => (
              <ExpandableSection
                toggleText="Advanced Encryption"
                onToggle={onToggle}
                isExpanded={isExpanded}
              >
                <Grid hasGutter>
                  <AWSCustomerManagedEncryption />

                  {isHypershiftSelected && <HCPEtcdEncryptionSection />}
                </Grid>
              </ExpandableSection>
            )}
          </Formik>
        </div>
      </QueryClientProvider>
    </Provider>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 3: Cluster settings/Details/AdvancedEncryption',
  component: StoryWrapper,
  parameters: {
    metadata: {
      sourceFile:
        '~/components/clusters/wizards/rosa/ClusterSettings/Details/AWSCustomerManagedEncryption.tsx',
      componentType: 'form-section',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['isHypershift', 'customerManagedKey', 'etcdEncryption'],
      featureFlagDependencies: [],
      behaviors: [
        'progressive-disclosure',
        'expandable-section',
        'kms-validation',
        'conditional-fields',
        'alert-warnings',
      ],
      sharedWith: ['wizard', 'cluster-details-step'],
      keyComponents: [
        'AWSCustomerManagedEncryption',
        'HCPEtcdEncryptionSection',
        'RadioGroupField',
        'TextInputField',
        'CheckboxField',
        'ExpandableSection',
      ],
      title: 'Advanced Encryption Configuration',
    },
    docs: {
      description: {
        component: `
## Advanced Encryption Section

The Advanced Encryption expandable section provides sophisticated encryption configuration options for ROSA clusters, including AWS KMS keys and etcd encryption.

### Key Features
- **Expandable/Collapsible** design for progressive disclosure
- **AWS Customer Managed Encryption** - Choose between default or custom KMS keys
- **Progressive disclosure** - Key ARN field appears when "Use custom KMS keys" is selected
- **Hypershift etcd Encryption** - Optional custom KMS key for etcd encryption (Hypershift only)
- **Dynamic layout** - Additional fields and alerts appear based on selections
- **Validation** - KMS Key ARN format validation with regional constraints
- **Educational content** - Learn more links and contextual help

### Progressive Disclosure Behavior
- **Default KMS Keys**: No additional fields shown
- **Custom KMS Keys**: Reveals Key ARN input field with validation and alert
- **etcd Encryption**: Checkbox reveals additional KMS key field for etcd (Hypershift only)

### Components Included
- **RadioGroupField** for KMS key selection (default vs custom)
- **TextInputField** for KMS Key ARN entry with validation
- **CheckboxField** for etcd encryption toggle (Hypershift only)
- **Alert** warnings about key deletion consequences
- **External links** to AWS documentation

### Use Cases
- Standard encryption setup with default AWS keys
- Advanced encryption with customer-managed KMS keys
- Hypershift-specific etcd encryption configuration
- Educational guidance for encryption best practices
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
    isHypershiftSelected: true,
    initialCustomerManagedKey: false,
    initialEtcdEncryption: false,
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
          Default Advanced Encryption
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Default KMS keys selected, no etcd
            encryption
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Interaction:</strong> Select "Use custom KMS keys"
            to see Key ARN field appear
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>etcd:</strong> Check "Encrypt etcd with custom KMS
            key" to reveal etcd Key ARN field
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Interactive demonstration of all
            encryption options
          </p>
        </div>
      </div>

      <StoryWrapper {...args} />
    </div>
  ),
};

export const ClassicMode: Story = {
  name: 'Classic Mode',
  args: {
    isHypershiftSelected: false,
    initialCustomerManagedKey: false,
    initialEtcdEncryption: false,
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
          Classic ROSA Encryption Options
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong> Classic ROSA (not Hypershift)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Available:</strong> Only AWS customer-managed
            encryption
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Hidden:</strong> etcd encryption options
            (Hypershift-only feature)
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Standard ROSA deployment
            encryption configuration
          </p>
        </div>
      </div>

      <StoryWrapper {...args} />
    </div>
  ),
};
