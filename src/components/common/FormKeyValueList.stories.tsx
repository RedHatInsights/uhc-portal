import React from 'react';
import { FieldArray, Form, Formik } from 'formik';

import { Meta, StoryObj } from '@storybook/react';

import { getRandomID } from '~/common/helpers';
import { validateLabelKey, validateLabelValue } from '~/common/validators';
import FormKeyValueList from '~/components/common/FormikFormComponents/FormKeyValueList/FormKeyValueList';

// Mock action for stories since @storybook/addon-actions is not available
const action =
  (name: string) =>
  (...args: any[]) =>
    console.log(`${name}:`, ...args);

const meta: Meta<typeof FormKeyValueList> = {
  title: 'Common/FormKeyValueList',
  component: FormKeyValueList,
  parameters: {
    metadata: {
      sourceFile: '~/components/common/FormikFormComponents/FormKeyValueList/FormKeyValueList.tsx',
      componentType: 'field',
      usage: ['Classic', 'Hosted', 'Day-2'],
      conditionalLogic: ['keyValueValidation', 'uniqueKeyCheck', 'emptyStateHandling'],
      featureFlagDependencies: [],
      behaviors: [
        'dynamic-add-remove',
        'kubernetes-validation',
        'unique-key-enforcement',
        'empty-state-handling',
      ],
      sharedWith: ['wizard', 'machine-pool-step', 'day-2-operations', 'node-labels'],
      keyComponents: ['FieldArray', 'TextInputField', 'AddRemoveButtons', 'ValidationPopover'],
      title: 'Key-Value List Form',
    },
    docs: {
      description: {
        component: `
## FormKeyValueList

A reusable form component for managing dynamic key-value pairs with validation, commonly used for node labels in cluster configurations.

### Key Features
- **Dynamic add/remove** - Users can add multiple key-value pairs and remove them
- **Validation** - Built-in validation for Kubernetes label syntax
- **Required first entry** - First entry cannot be deleted when it's the only one
- **Empty state handling** - Automatically adds empty entry if none exist
- **Keyboard navigation** - Accessible input fields with proper ARIA labels

### Business Logic
- **Kubernetes label format** - Keys and values must follow Kubernetes label syntax
- **Unique keys** - Prevents duplicate keys within the same form
- **Optional first entry** - First key-value pair can be left empty (serves as placeholder)
- **DNS subdomain prefixes** - Keys can include optional DNS subdomain prefixes (e.g. 'example.com/key')
- **Character limits** - Keys limited to 63 characters for name part, 253 for prefix

### Validation Rules
- **Key format**: Must consist of alphanumeric characters, '-', '_', '.', or '/', start and end with alphanumeric
- **Value format**: Must be empty or consist of alphanumeric characters, '-', '_', '.', start and end with alphanumeric
- **Prefix validation**: DNS subdomain format (lowercase RFC 1123)
- **Length limits**: Key name ≤ 63 chars, prefix ≤ 253 chars, value ≤ 63 chars

### Use Cases
- **ROSA Classic clusters** - Node labels for compute nodes
- **Machine pool configuration** - Labels applied to specific machine pools
- **Multi-wizard usage** - Shared across OSD and ROSA wizards
- **Form validation** - Demonstrates proper error handling and user feedback
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormKeyValueList>;

// Basic usage with empty form
export const BasicUsage: Story = {
  render: () => (
    <Formik
      initialValues={{
        node_labels: [{ id: getRandomID() }],
      }}
      onSubmit={action('onSubmit')}
    >
      <Form>
        <FieldArray name="node_labels">
          {(arrayHelpers) => <FormKeyValueList {...arrayHelpers} />}
        </FieldArray>
      </Form>
    </Formik>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Basic empty form ready for user input. Shows the initial state with one empty key-value pair that serves as a placeholder.',
      },
    },
  },
};

// Pre-filled with valid values
export const PreFilledValues: Story = {
  render: () => (
    <Formik
      initialValues={{
        node_labels: [
          { id: getRandomID(), key: 'environment', value: 'production' },
          { id: getRandomID(), key: 'team', value: 'backend' },
          { id: getRandomID(), key: 'app.kubernetes.io/component', value: 'worker' },
        ],
      }}
      onSubmit={action('onSubmit')}
    >
      <Form>
        <FieldArray name="node_labels">
          {(arrayHelpers) => <FormKeyValueList {...arrayHelpers} />}
        </FieldArray>
      </Form>
    </Formik>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Form with valid pre-filled key-value pairs. Shows different label formats including DNS subdomain prefixes.',
      },
    },
  },
};

// Validation errors for invalid keys and values
export const ValidationErrors: Story = {
  render: () => (
    <Formik
      initialValues={{
        node_labels: [
          { id: getRandomID(), key: '-invalid-start', value: 'validvalue' },
          { id: getRandomID(), key: 'validkey', value: '-invalid-value-' },
          { id: getRandomID(), key: 'duplicate', value: 'value1' },
          { id: getRandomID(), key: 'duplicate', value: 'value2' },
        ],
      }}
      initialTouched={{
        node_labels: [
          { key: true, value: true },
          { key: true, value: true },
          { key: true, value: true },
          { key: true, value: true },
        ],
      }}
      validate={(values) => {
        const errors: any = {};
        const nodeLabelsErrors: any[] = [];

        values.node_labels?.forEach((label: any, index: number) => {
          const labelErrors: any = {};

          // Validate key
          if (label.key) {
            const keyError = validateLabelKey(label.key, values, {}, `node_labels[${index}].key`);
            if (keyError) {
              labelErrors.key = keyError;
            }
          }

          // Validate value
          if (label.value) {
            const valueError = validateLabelValue(label.value);
            if (valueError) {
              labelErrors.value = valueError;
            }
          }

          if (Object.keys(labelErrors).length > 0) {
            nodeLabelsErrors[index] = labelErrors;
          }
        });

        if (nodeLabelsErrors.length > 0) {
          errors.node_labels = nodeLabelsErrors;
        }

        return errors;
      }}
      onSubmit={action('onSubmit')}
    >
      <Form>
        <FieldArray name="node_labels">
          {(arrayHelpers) => <FormKeyValueList {...arrayHelpers} />}
        </FieldArray>
      </Form>
    </Formik>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Form showing various validation errors: invalid key format, invalid value format, and duplicate keys.',
      },
    },
  },
};
