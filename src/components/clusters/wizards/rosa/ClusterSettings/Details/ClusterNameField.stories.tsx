import React, { useEffect } from 'react';
import { Field, FieldProps, Formik } from 'formik';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// import { FormGroup } from '@patternfly/react-core'; // Unused
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  clusterNameValidation,
  // clusterNameAsyncValidation, // Unused
  // createPessimisticValidator, // Unused
} from '~/common/validators';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { RichInputField } from '~/components/clusters/wizards/form';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Create a custom async validation function for Storybook that simulates the real behavior
const createStoryAsyncValidation =
  (hasExistingName: boolean, isMultiRegion: boolean) => (value: string) => [
    {
      text: 'Globally unique name in your organization',
      validator: async () => {
        if (!value?.length) {
          return false;
        }
        // Simulate async validation delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // For story purposes, simulate existing names
        if (hasExistingName || value === 'existing-cluster') {
          return false;
        }
        return true;
      },
    },
  ];

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
  initialClusterName: string;
  hasExistingName?: boolean;
  isMultiRegion?: boolean;
  autoTriggerValidation?: boolean;
};

const StoryWrapper = ({
  initialClusterName,
  hasExistingName = false,
  isMultiRegion = false,
  autoTriggerValidation = true,
}: StoryWrapperProps) => (
  <Provider store={mockStore}>
    <QueryClientProvider client={queryClient}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <Formik
          initialValues={{
            [FieldId.ClusterName]: initialClusterName,
            [FieldId.CustomOperatorRolesPrefix]: '',
          }}
          initialTouched={
            autoTriggerValidation
              ? {
                  name: true,
                }
              : {}
          }
          onSubmit={() => {}}
        >
          {({ setFieldValue, setFieldTouched, validateField }) => {
            // Auto-trigger validation for demo purposes
            useEffect(() => {
              if (autoTriggerValidation && initialClusterName) {
                setTimeout(() => {
                  setFieldTouched(FieldId.ClusterName, true);
                  validateField(FieldId.ClusterName);
                }, 100);
              }
            }, [autoTriggerValidation, initialClusterName, setFieldTouched, validateField]);

            return (
              <Field name={FieldId.ClusterName}>
                {({ field, form }: FieldProps) => (
                  <RichInputField
                    name={FieldId.ClusterName}
                    label="Cluster name"
                    type="text"
                    isRequired
                    extendedHelpText={constants.clusterNameHint}
                    validation={(value: string) => clusterNameValidation(value, 54)}
                    asyncValidation={createStoryAsyncValidation(hasExistingName, isMultiRegion)}
                    input={field}
                    onChange={async (value: string) => {
                      // Update Formik field value
                      form.setFieldValue(FieldId.ClusterName, value);
                      // Simulate updating operator roles prefix like in real wizard
                      const prefix = value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
                      form.setFieldValue(
                        FieldId.CustomOperatorRolesPrefix,
                        `${prefix}-operator-roles`,
                        false,
                      );
                    }}
                  />
                )}
              </Field>
            );
          }}
        </Formik>
      </div>
    </QueryClientProvider>
  </Provider>
);

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 3: Cluster settings/Details/ClusterNameField',
  component: StoryWrapper,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/wizards/form/RichInputField.tsx',
      componentType: 'field',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['isMultiRegion', 'clusterNameValidation', 'asyncValidation'],
      featureFlagDependencies: ['multiregion-preview'],
      behaviors: [
        'real-time-validation',
        'async-validation',
        'progressive-disclosure',
        'cross-field-dependencies',
      ],
      sharedWith: ['wizard', 'cluster-details-step'],
      keyComponents: [
        'RichInputField',
        'clusterNameValidation',
        'clusterNameAsyncValidation',
        'FormGroup',
      ],
      title: 'Cluster Name Input Field',
    },
    docs: {
      description: {
        component: `
## Cluster Name Input Field

The cluster name field is a critical component in the ROSA wizard that validates cluster names according to DNS and OpenShift standards.

### Key Features
- **Real-time validation** with visual feedback popover
- **Synchronous validation** for format and length requirements  
- **Asynchronous validation** to check for name uniqueness
- **Progressive disclosure** of validation requirements
- **Integrated help text** explaining cluster name usage

### Validation Rules
- **Length**: 1-54 characters maximum
- **Format**: DNS-compatible (lowercase alphanumeric + hyphens only)
- **Start**: Must begin with a lowercase alphabetic character
- **End**: Must end with a lowercase alphanumeric character  
- **Uniqueness**: Must be globally unique within the organization

### Use Cases
- Standard cluster name entry during wizard setup
- Real-time feedback for validation errors
- Guidance for users unfamiliar with DNS naming conventions
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
    initialClusterName: '',
    hasExistingName: false,
    autoTriggerValidation: false,
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
          Default Cluster Name Field
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Empty field with help text
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Validation:</strong> Shows validation rules when
            focused, then clicked outside
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Help Text:</strong> Explains cluster name purpose
            and subdomain usage
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Initial state when user starts
            entering cluster name
          </p>
        </div>
      </div>

      <StoryWrapper {...args} />
    </div>
  ),
};

export const MultiRegionMode: Story = {
  name: 'Multi-Region Mode',
  args: {
    initialClusterName: 'multi-region-cluster',
    hasExistingName: false,
    isMultiRegion: true,
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
          Multi-Region Cluster Name Validation
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong> Multi-region enabled (Hypershift)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Validation:</strong> Regional uniqueness checking
            instead of global
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Scope:</strong> Name must be unique within selected
            regional instance
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Hypershift clusters with
            multi-region support
          </p>
        </div>
      </div>

      <StoryWrapper {...args} />
    </div>
  ),
};
