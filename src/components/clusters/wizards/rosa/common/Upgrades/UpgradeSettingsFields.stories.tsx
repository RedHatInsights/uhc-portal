import React from 'react';
import { Form, Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import type { Meta, StoryObj } from '@storybook/react';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import UpgradeSettingsFields from './UpgradeSettingsFields';

const withState = (
  initialValues: any,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: React.FC<{ children: React.ReactNode }>;
} => {
  const middlewares = [thunk, promiseMiddleware] as any;
  const mockStore = createMockStore(middlewares);
  const store: MockStoreEnhanced<unknown, {}> = mockStore({
    // Minimal Redux state for the component
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        <Form>{children}</Form>
      </Formik>
    </Provider>
  );

  return { store, Wrapper };
};

const meta: Meta<typeof UpgradeSettingsFields> = {
  title: 'Wizards/ROSA/Common/Upgrades/UpgradeSettingsFields',
  component: UpgradeSettingsFields,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/common/Upgrades/UpgradeSettingsFields.tsx',
      componentType: 'form-section',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['isHypershift', 'upgradePolicy === "automatic"'],
      featureFlagDependencies: [],
      behaviors: [
        'conditional-visibility',
        'schedule-validation',
        'time-zone-handling',
        'radio-button-selection',
      ],
      sharedWith: ['wizard', 'updates-step'],
      keyComponents: [
        'RadioButtons',
        'UpgradeScheduleSelection',
        'PodDisruptionBudgetGraceSelect',
        'FormGroup',
      ],
      title: 'Upgrade Settings Configuration',
    },
  },
  render: (args: any) => {
    const { Wrapper } = withState({
      [FieldId.UpgradePolicy]: args.upgradePolicy || 'manual',
      [FieldId.Hypershift]: args.hypershift || 'false',
      [FieldId.AutomaticUpgradeSchedule]: args.automaticUpgradeSchedule || '0 0 * * 0',
      [FieldId.NodeDrainGracePeriod]: args.nodeDrainGracePeriod || 60,
    });

    return (
      <div style={{ maxWidth: '750px', margin: '0 auto', padding: '20px' }}>
        <Wrapper>
          <UpgradeSettingsFields />
        </Wrapper>
      </div>
    );
  },
};

export default meta;

type Story = StoryObj<typeof UpgradeSettingsFields>;

export const RosaClassic: Story = {
  name: 'ROSA Classic',
  args: {
    hypershift: 'false',
    upgradePolicy: 'automatic',
    automaticUpgradeSchedule: '0 14 * * 2', // Tuesday 2 PM UTC
  },
  render: (args: any) => {
    const { Wrapper } = withState({
      [FieldId.UpgradePolicy]: args.upgradePolicy || 'automatic',
      [FieldId.Hypershift]: args.hypershift || 'false',
      [FieldId.AutomaticUpgradeSchedule]: args.automaticUpgradeSchedule || '0 14 * * 2',
      [FieldId.NodeDrainGracePeriod]: args.nodeDrainGracePeriod || 60,
    });

    return (
      <div style={{ maxWidth: '750px', margin: '0 auto', padding: '20px' }}>
        <div
          style={{
            backgroundColor: '#fff3cd',
            padding: '20px',
            marginBottom: '16px',
            borderRadius: '6px',
            border: '2px solid #f0ad4e',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          }}
        >
          <h4
            style={{
              margin: '0 0 12px 0',
              color: '#8a6d3b',
              fontSize: '15px',
              fontWeight: '700',
            }}
          >
            ⚠️ Important: Three Different Upgrade Components
          </h4>
          <div style={{ lineHeight: '1.5', fontSize: '13px', color: '#8a6d3b' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>1. ROSA wizard:</strong>{' '}
              clusters/wizards/rosa/common/Upgrades/UpgradeSettingsFields.jsx (ROSA-specific)
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>2. OSD wizard:</strong> clusters/wizards/common/ClusterUpdates.tsx
              (OSD-specific)
            </p>
            <p style={{ margin: '0' }}>
              <strong>3. Day 2 operations:</strong>{' '}
              clusters/common/Upgrades/UpgradeSettingsFields.jsx (Generic, works for both)
            </p>
          </div>
        </div>

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
            ROSA Classic - Automatic Updates
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Configuration:</strong> hypershift: "false",
              upgradePolicy: "automatic"
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Shows:</strong> "Individual updates" first,
              "Recurring updates" selected, schedule picker + Node draining section
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Behavior:</strong> Automatic cluster updates with
              day/time selection and grace period for worker nodes
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Classic ROSA cluster with
              scheduled automatic updates for entire cluster
            </p>
          </div>
        </div>

        <Wrapper>
          <UpgradeSettingsFields />
        </Wrapper>
      </div>
    );
  },
};

export const RosaHosted: Story = {
  name: 'ROSA Hosted',
  args: {
    hypershift: 'true',
    upgradePolicy: 'automatic',
    automaticUpgradeSchedule: '0 10 * * 5', // Friday 10 AM UTC
  },
  render: (args: any) => {
    const { Wrapper } = withState({
      [FieldId.UpgradePolicy]: args.upgradePolicy || 'automatic',
      [FieldId.Hypershift]: args.hypershift || 'true',
      [FieldId.AutomaticUpgradeSchedule]: args.automaticUpgradeSchedule || '0 10 * * 5',
      [FieldId.NodeDrainGracePeriod]: args.nodeDrainGracePeriod || 60,
    });

    return (
      <div style={{ maxWidth: '750px', margin: '0 auto', padding: '20px' }}>
        <div
          style={{
            backgroundColor: '#fff3cd',
            padding: '20px',
            marginBottom: '16px',
            borderRadius: '6px',
            border: '2px solid #f0ad4e',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          }}
        >
          <h4
            style={{
              margin: '0 0 12px 0',
              color: '#8a6d3b',
              fontSize: '15px',
              fontWeight: '700',
            }}
          >
            ⚠️ Important: Three Different Upgrade Components
          </h4>
          <div style={{ lineHeight: '1.5', fontSize: '13px', color: '#8a6d3b' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>1. ROSA wizard:</strong>{' '}
              clusters/wizards/rosa/common/Upgrades/UpgradeSettingsFields.jsx (ROSA-specific)
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>2. OSD wizard:</strong> clusters/wizards/common/ClusterUpdates.tsx
              (OSD-specific)
            </p>
            <p style={{ margin: '0' }}>
              <strong>3. Day 2 operations:</strong>{' '}
              clusters/common/Upgrades/UpgradeSettingsFields.jsx (Generic, works for both)
            </p>
          </div>
        </div>

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
            ROSA Hosted - Automatic Updates
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Configuration:</strong> hypershift: "true",
              upgradePolicy: "automatic"
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Shows:</strong> "Recurring updates" selected
              FIRST, schedule picker, no Node draining section
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Behavior:</strong> Automatic control plane
              updates only, worker nodes require manual updates
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Note:</strong> Radio button order differs from
              Classic - Recurring is preferred for Hosted
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Hosted control plane cluster
              with scheduled automatic control plane updates
            </p>
          </div>
        </div>

        <Wrapper>
          <UpgradeSettingsFields />
        </Wrapper>
      </div>
    );
  },
};
