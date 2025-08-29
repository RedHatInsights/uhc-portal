import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Form } from '@patternfly/react-core';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { IMDSType } from '~/components/clusters/wizards/common/constants';

import ImdsSection from '../../MachinePoolScreen/components/ImdsSection';

const withState = (
  initialValues: any,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
} => {
  const store = createMockStore([thunk, promiseMiddleware as any])({});

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
        <QueryClientProvider client={queryClient}>
          <Formik initialValues={initialValues} onSubmit={() => {}}>
            <Form>{children}</Form>
          </Formik>
        </QueryClientProvider>
      </Provider>
    );
  };

  return { store, Wrapper };
};

const meta: Meta<typeof ImdsSection> = {
  title: 'Wizards/ROSA/Step 3: Cluster settings/Machine pool/ImdsSection',
  component: ImdsSection,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/MachinePoolScreen/components/ImdsSection.tsx',
      componentType: 'form-section',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['isDisabled', 'clusterVersion', 'imdsType'],
      featureFlagDependencies: [],
      behaviors: [
        'version-dependent-features',
        'conditional-disable',
        'security-enhancement',
        'radio-button-selection',
      ],
      sharedWith: ['wizard', 'machine-pool-step'],
      keyComponents: ['RadioButtons', 'ImdsSectionHint', 'ImdsSectionAlert', 'FormGroup'],
      title: 'Instance Metadata Service Configuration',
    },
    docs: {
      description: {
        component: `
## IMDS Section

The Instance Metadata Service (IMDS) section allows configuration of EC2 instance metadata access options for ROSA cluster worker nodes.

### Key Features
- **Version selection** - Choose between IMDSv1+v2 or IMDSv2 only
- **Cluster version gating** - Older cluster versions may not support IMDSv2-only mode
- **Security enhancement** - IMDSv2 provides session-oriented, more secure metadata access
- **Radio button selection** - Clear option selection with descriptions

### Business Logic
- **Default mode** - IMDSv1 and IMDSv2 for backward compatibility
- **Security mode** - IMDSv2 only for enhanced security (session-oriented)
- **Version constraints** - Some cluster versions disable IMDSv2-only selection
- **AWS integration** - Controls EC2 instance metadata service behavior

### Components Included
- **RadioButtons** for IMDS version selection
- **ImdsSectionHint** with explanatory tooltip
- **ImdsSectionAlert** when selection is disabled
- **FormGroup** with consistent labeling

### Use Cases
- Enhanced security requiring IMDSv2-only mode
- Backward compatibility scenarios needing both versions
- Clusters with specific compliance requirements
        `,
      },
    },
  },
  render: (args: any, { parameters }) => {
    const { initialValues } = parameters;
    const { Wrapper } = withState(initialValues);

    return (
      <Wrapper>
        <ImdsSection {...args} />
      </Wrapper>
    );
  },
};

export default meta;

type Story = StoryObj<typeof ImdsSection>;

const baseInitialValues = {
  imds: IMDSType.V1AndV2,
};

export const Default: Story = {
  name: 'IMDS Selection Enabled',
  args: {
    isDisabled: false,
    imds: IMDSType.V1AndV2,
    onChangeImds: (value: IMDSType) => console.log('IMDS changed to:', value),
  },
  parameters: {
    initialValues: baseInitialValues,
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
          Default IMDS Configuration
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong> Both IMDSv1 and IMDSv2 enabled
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Selection enabled for all versions
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Interaction:</strong> Click radio buttons to change
            IMDS version
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Backward compatibility with
            existing workloads
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {meta.render!(args, { parameters: { initialValues: baseInitialValues } } as any)}
      </div>
    </div>
  ),
};

export const V2OnlySelected: Story = {
  name: 'IMDSv2 Only Selected',
  args: {
    isDisabled: false,
    imds: IMDSType.V2Only,
    onChangeImds: (value: IMDSType) => console.log('IMDS changed to:', value),
  },
  parameters: {
    initialValues: {
      ...baseInitialValues,
      imds: IMDSType.V2Only,
    },
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
          Enhanced Security Mode (IMDSv2 Only)
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong> IMDSv2 only (session-oriented)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Security:</strong> Enhanced metadata service
            security
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Interaction:</strong> Pre-selected for security
            compliance
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Security-focused deployments
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {meta.render!(args, {
          parameters: { initialValues: { ...baseInitialValues, imds: IMDSType.V2Only } },
        } as any)}
      </div>
    </div>
  ),
};

export const DisabledForOlderClusterVersion: Story = {
  name: 'Disabled - Older Cluster Version',
  args: {
    isDisabled: true,
    imds: IMDSType.V1AndV2,
    onChangeImds: (value: IMDSType) => console.log('IMDS changed to:', value),
  },
  parameters: {
    initialValues: baseInitialValues,
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
          IMDS Selection Disabled (Older Cluster Version)
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong> Forced to IMDSv1 and IMDSv2
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Constraint:</strong> Cluster version doesn't
            support IMDSv2-only
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Visibility:</strong> Alert shown instead of radio
            buttons
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Legacy cluster versions
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {meta.render!(args, { parameters: { initialValues: baseInitialValues } } as any)}
      </div>
    </div>
  ),
};
