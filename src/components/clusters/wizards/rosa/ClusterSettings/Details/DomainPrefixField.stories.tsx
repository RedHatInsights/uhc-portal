import React, { useEffect } from 'react';
import { Field, FieldProps, Formik } from 'formik';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { Split, SplitItem } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  domainPrefixValidation,
  // domainPrefixAsyncValidation, // Unused
  // createPessimisticValidator, // Unused
} from '~/common/validators';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { CheckboxField, RichInputField } from '~/components/clusters/wizards/form';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import PopoverHint from '~/components/common/PopoverHint';

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
      text: 'Globally unique domain prefix in your organization',
      validator: async () => {
        if (!value?.length) {
          return false;
        }
        // Simulate async validation delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // For story purposes, simulate existing domain prefixes
        if (hasExistingName || value === 'existing-prefix') {
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
  initialDomainPrefix: string;
  initialHasDomainPrefix: boolean;
  hasExistingName?: boolean;
  isMultiRegion?: boolean;
  autoTriggerValidation?: boolean;
};

const StoryWrapper = ({
  initialDomainPrefix,
  initialHasDomainPrefix,
  hasExistingName = false,
  isMultiRegion = false,
  autoTriggerValidation = true,
}: StoryWrapperProps) => (
  <Provider store={mockStore}>
    <QueryClientProvider client={queryClient}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <Formik
          initialValues={{
            [FieldId.DomainPrefix]: initialDomainPrefix,
            [FieldId.HasDomainPrefix]: initialHasDomainPrefix,
          }}
          initialTouched={
            autoTriggerValidation
              ? {
                  domain_prefix: true,
                }
              : {}
          }
          onSubmit={() => {}}
        >
          {({ values, setFieldTouched, validateField }) => {
            const hasDomainPrefix = values[FieldId.HasDomainPrefix];

            // Auto-trigger validation for demo purposes
            useEffect(() => {
              if (autoTriggerValidation && initialDomainPrefix && hasDomainPrefix) {
                setTimeout(() => {
                  setFieldTouched(FieldId.DomainPrefix, true);
                  validateField(FieldId.DomainPrefix);
                }, 100);
              }
            }, [
              autoTriggerValidation,
              initialDomainPrefix,
              hasDomainPrefix,
              setFieldTouched,
              validateField,
            ]);

            return (
              <>
                {/* Checkbox Toggle */}
                <div style={{ marginBottom: '16px' }}>
                  <Split hasGutter className="pf-v6-u-mb-0">
                    <SplitItem>
                      <CheckboxField
                        name={FieldId.HasDomainPrefix}
                        label="Create custom domain prefix"
                      />
                    </SplitItem>
                    <SplitItem>
                      <PopoverHint hint={constants.domainPrefixHint} />
                    </SplitItem>
                  </Split>
                </div>

                {/* Domain Prefix Field - Only shown when checkbox is checked */}
                {hasDomainPrefix && (
                  <Field name={FieldId.DomainPrefix}>
                    {({ field, form }: FieldProps) => (
                      <RichInputField
                        name={FieldId.DomainPrefix}
                        label="Domain prefix"
                        type="text"
                        isRequired
                        validation={(value: string) => domainPrefixValidation(value)}
                        asyncValidation={createStoryAsyncValidation(hasExistingName, isMultiRegion)}
                        input={field}
                        onChange={async (value: string) => {
                          // Update Formik field value
                          form.setFieldValue(FieldId.DomainPrefix, value);
                        }}
                      />
                    )}
                  </Field>
                )}
              </>
            );
          }}
        </Formik>
      </div>
    </QueryClientProvider>
  </Provider>
);

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 3: Cluster settings/Details/DomainPrefixField',
  component: StoryWrapper,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/wizards/form/RichInputField.tsx',
      componentType: 'field',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['hasDomainPrefix', 'domainPrefixValidation', 'asyncValidation'],
      featureFlagDependencies: [],
      behaviors: [
        'checkbox-toggle',
        'real-time-validation',
        'async-validation',
        'progressive-disclosure',
      ],
      sharedWith: ['wizard', 'cluster-details-step'],
      keyComponents: [
        'CheckboxField',
        'RichInputField',
        'domainPrefixValidation',
        'domainPrefixAsyncValidation',
      ],
      title: 'Domain Prefix Field',
    },
    docs: {
      description: {
        component: `
## Domain Prefix Field

The domain prefix field allows users to create a custom subdomain prefix for their ROSA cluster. It includes a checkbox toggle and DNS validation.

### Key Features
- **Toggle behavior** with checkbox to show/hide the field
- **Real-time validation** with visual feedback popover
- **Shorter length limit** - 15 characters maximum (vs 54 for cluster name)
- **DNS validation** - same rules as cluster name but shorter
- **Async uniqueness check** for domain prefix availability
- **Integrated help text** explaining subdomain generation

### Validation Rules
- **Length**: 1-15 characters maximum
- **Format**: DNS-compatible (lowercase alphanumeric + hyphens only)
- **Start**: Must begin with a lowercase alphabetic character
- **End**: Must end with a lowercase alphanumeric character
- **Uniqueness**: Must be globally unique within the organization

### Use Cases
- Optional custom subdomain creation during cluster setup
- Progressive disclosure of advanced configuration
- Validation feedback for DNS compliance
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
    initialDomainPrefix: '',
    initialHasDomainPrefix: false,
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
          Default Domain Prefix Field
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Checkbox unchecked, field hidden
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Behavior:</strong> Check the box to reveal the
            domain prefix input field
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Help Text:</strong> Explains 15-character limit and
            automatic generation
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Optional subdomain customization
            in wizard
          </p>
        </div>
      </div>

      <StoryWrapper {...args} />
    </div>
  ),
};
