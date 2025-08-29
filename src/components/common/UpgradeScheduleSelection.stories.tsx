import React from 'react';
import { Form, Formik } from 'formik';

import type { Meta, StoryObj } from '@storybook/react';

import UpgradeScheduleSelection from '~/components/clusters/common/Upgrades/UpgradeScheduleSelection';

const meta: Meta<typeof UpgradeScheduleSelection> = {
  title: 'Common/UpgradeScheduleSelection',
  component: UpgradeScheduleSelection,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/common/Upgrades/UpgradeScheduleSelection.tsx',
      componentType: 'field',
      usage: ['Classic', 'Hosted', 'Day-2'],
      conditionalLogic: ['isHypershift', 'isDisabled', 'scheduleValidation'],
      featureFlagDependencies: [],
      behaviors: [
        'schedule-validation',
        'time-zone-handling',
        'dropdown-selection',
        'cron-expression-generation',
      ],
      sharedWith: ['wizard', 'updates-step', 'day-2-operations'],
      keyComponents: ['DayOfWeekDropdown', 'TimeDropdown', 'CronGenerator', 'FormGroup'],
      title: 'Upgrade Schedule Selection',
    },
  },
  render: (args: any) => (
    <Formik
      initialValues={{
        automaticUpgradeSchedule: args.initialValue || '0 0 * * 0', // Sunday at midnight UTC
      }}
      onSubmit={() => {}}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <UpgradeScheduleSelection
            isDisabled={args.isDisabled || false}
            isHypershift={args.isHypershift || false}
            input={{
              value: values.automaticUpgradeSchedule,
              onChange: (value: string) => {
                setFieldValue('automaticUpgradeSchedule', value);
              },
            }}
          />
        </Form>
      )}
    </Formik>
  ),
};

export default meta;

type Story = StoryObj<typeof UpgradeScheduleSelection>;

export const Default: Story = {
  name: 'ROSA Classic Schedule',
  args: {
    input: {
      value: '0 14 * * 2', // Tuesday at 2 PM UTC
      onChange: (cron: string) => console.log('Schedule changed:', cron),
    },
    isHypershift: false,
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
          ROSA Classic Recurring Updates Schedule
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Configuration:</strong> isHypershift: false, cron:
            "0 14 * * 2" (Tuesday 2 PM UTC)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Shows:</strong> Day/time selection dropdowns with
            standard update messaging
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Behavior:</strong> Updates entire cluster (control
            plane + worker nodes) together
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Classic ROSA cluster automatic
            update scheduling
          </p>
        </div>
      </div>

      <Formik
        initialValues={{
          automaticUpgradeSchedule: args.initialValue || '0 14 * * 2',
        }}
        onSubmit={() => {}}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <UpgradeScheduleSelection
              isDisabled={args.isDisabled || false}
              isHypershift={args.isHypershift || false}
              input={{
                value: values.automaticUpgradeSchedule,
                onChange: (value: string) => {
                  setFieldValue('automaticUpgradeSchedule', value);
                },
              }}
            />
          </Form>
        )}
      </Formik>
    </div>
  ),
};

export const HypershiftMode: Story = {
  name: 'ROSA Hosted Schedule',
  args: {
    input: {
      value: '0 10 * * 5', // Friday at 10 AM UTC
      onChange: (cron: string) => console.log('Schedule changed:', cron),
    },
    isHypershift: true,
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
          ROSA Hosted (Hypershift) Schedule
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Configuration:</strong> isHypershift: true, cron:
            "0 10 * * 5" (Friday 10 AM UTC)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Shows:</strong> Day/time selection with
            Hypershift-specific alert messaging
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Behavior:</strong> Only control plane updates
            automatically, worker nodes need manual updates
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Hosted control plane cluster
            automatic update scheduling
          </p>
        </div>
      </div>

      <Formik
        initialValues={{
          automaticUpgradeSchedule: args.initialValue || '0 10 * * 5',
        }}
        onSubmit={() => {}}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <UpgradeScheduleSelection
              isDisabled={args.isDisabled || false}
              isHypershift={args.isHypershift || true}
              input={{
                value: values.automaticUpgradeSchedule,
                onChange: (value: string) => {
                  setFieldValue('automaticUpgradeSchedule', value);
                },
              }}
            />
          </Form>
        )}
      </Formik>
    </div>
  ),
};

export const CustomSchedule: Story = {
  name: 'Custom Schedule (Read-only)',
  args: {
    input: {
      value: '0 3 15 * *', // Invalid format for UI - monthly on 15th
      onChange: (cron: string) => console.log('Schedule changed:', cron),
    },
    isHypershift: false,
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
          Custom Schedule Configuration
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Configuration:</strong> isHypershift: false, cron:
            "0 3 15 * *" (monthly on 15th)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Shows:</strong> Read-only message with reset option
            for complex cron schedules
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Behavior:</strong> UI cannot modify complex
            schedules, must use API or reset
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Clusters with custom schedules
            set via API that UI cannot parse
          </p>
        </div>
      </div>

      <Formik
        initialValues={{
          automaticUpgradeSchedule: args.initialValue || '0 3 15 * *',
        }}
        onSubmit={() => {}}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <UpgradeScheduleSelection
              isDisabled={args.isDisabled || false}
              isHypershift={args.isHypershift || false}
              input={{
                value: values.automaticUpgradeSchedule,
                onChange: (value: string) => {
                  setFieldValue('automaticUpgradeSchedule', value);
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
      value: '0 8 * * 1', // Monday at 8 AM UTC
      onChange: (cron: string) => console.log('Schedule changed:', cron),
    },
    isHypershift: false,
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
          Disabled Schedule Selection
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Configuration:</strong> isDisabled: true, cron: "0
            8 * * 1" (Monday 8 AM UTC)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Shows:</strong> Non-interactive dropdowns showing
            current schedule
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Behavior:</strong> Schedule cannot be modified by
            user interaction
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Day 2 operations where schedule
            modification is restricted
          </p>
        </div>
      </div>

      <Formik
        initialValues={{
          automaticUpgradeSchedule: args.initialValue || '0 8 * * 1',
        }}
        onSubmit={() => {}}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <UpgradeScheduleSelection
              isDisabled={args.isDisabled || true}
              isHypershift={args.isHypershift || false}
              input={{
                value: values.automaticUpgradeSchedule,
                onChange: (value: string) => {
                  setFieldValue('automaticUpgradeSchedule', value);
                },
              }}
            />
          </Form>
        )}
      </Formik>
    </div>
  ),
};
