import React from 'react';
import { Form, Formik } from 'formik';

import type { Meta, StoryObj } from '@storybook/react';

import PodDistruptionBudgetGraceSelect from '~/components/clusters/common/Upgrades/PodDistruptionBudgetGraceSelect';

const meta: Meta<typeof PodDistruptionBudgetGraceSelect> = {
  title: 'Common/PodDistruptionBudgetGraceSelect',
  component: PodDistruptionBudgetGraceSelect,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/common/Upgrades/PodDistruptionBudgetGraceSelect.tsx',
      componentType: 'field',
      usage: ['Classic'],
      conditionalLogic: ['!isHypershift', 'upgradePolicy === "automatic"'],
      featureFlagDependencies: [],
      behaviors: [
        'classic-only',
        'dropdown-selection',
        'grace-period-validation',
        'conditional-visibility',
      ],
      sharedWith: ['wizard', 'updates-step'],
      keyComponents: ['FormSelectField', 'GracePeriodOptions', 'FormGroup'],
      title: 'Pod Disruption Budget Grace Period',
    },
  },
  render: (args: any) => (
    <Formik
      initialValues={{
        nodeDrainGracePeriod: args.initialValue || 60,
      }}
      onSubmit={() => {}}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <PodDistruptionBudgetGraceSelect
            isDisabled={args.isDisabled || false}
            input={{
              value: values.nodeDrainGracePeriod,
              onChange: (value: number) => {
                setFieldValue('nodeDrainGracePeriod', value);
              },
            }}
          />
        </Form>
      )}
    </Formik>
  ),
};

export default meta;

type Story = StoryObj<typeof PodDistruptionBudgetGraceSelect>;

export const Default: Story = {
  name: 'Default (1 hour)',
  args: {
    input: {
      value: 60,
      onChange: (value: number) => console.log('Changed to:', value),
    },
    isDisabled: false,
  },
  render: (args: any) => (
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
          Default Grace Period Selection
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Configuration:</strong> isDisabled: false,
            initialValue: 60 minutes
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Shows:</strong> Dropdown with grace period options
            (15 min to 8 hours)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Behavior:</strong> Users can select how long pod
            disruption budgets are respected during node draining
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> ROSA Classic cluster creation
            and Day 2 upgrade configuration
          </p>
        </div>
      </div>

      <Formik
        initialValues={{
          nodeDrainGracePeriod: args.initialValue || 60,
        }}
        onSubmit={() => {}}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <PodDistruptionBudgetGraceSelect
              isDisabled={args.isDisabled || false}
              input={{
                value: values.nodeDrainGracePeriod,
                onChange: (value: number) => {
                  setFieldValue('nodeDrainGracePeriod', value);
                },
              }}
            />
          </Form>
        )}
      </Formik>
    </div>
  ),
};

export const Disabled: Story = {
  name: 'Disabled state',
  args: {
    input: {
      value: 60,
      onChange: (value: number) => console.log('Changed to:', value),
    },
    isDisabled: true,
  },
  render: (args: any) => (
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
          Disabled Grace Period Selection
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Configuration:</strong> isDisabled: true,
            initialValue: 60 minutes
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Shows:</strong> Non-interactive dropdown showing
            current value
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Behavior:</strong> Field cannot be modified by user
            interaction
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Day 2 operations where grace
            period cannot be changed after cluster creation
          </p>
        </div>
      </div>

      <Formik
        initialValues={{
          nodeDrainGracePeriod: args.initialValue || 60,
        }}
        onSubmit={() => {}}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <PodDistruptionBudgetGraceSelect
              isDisabled={args.isDisabled || true}
              input={{
                value: values.nodeDrainGracePeriod,
                onChange: (value: number) => {
                  setFieldValue('nodeDrainGracePeriod', value);
                },
              }}
            />
          </Form>
        )}
      </Formik>
    </div>
  ),
};
