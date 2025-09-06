import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Form } from '@patternfly/react-core';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  defaultWorkerNodeVolumeSizeGiB,
  workerNodeVolumeSizeMinGiB,
  workerNodeVolumeSizeMinGiBHcp,
} from '~/components/clusters/common/machinePools/constants';
import WorkerNodeVolumeSizeSection from '~/components/clusters/wizards/rosa/MachinePoolScreen/components/WorkerNodeVolumeSizeSection/WorkerNodeVolumeSizeSection';

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

const meta: Meta<typeof WorkerNodeVolumeSizeSection> = {
  title: 'Common/WorkerNodeVolumeSizeSection',
  component: WorkerNodeVolumeSizeSection,
  parameters: {
    metadata: {
      sourceFile:
        '~/components/clusters/wizards/rosa/MachinePoolScreen/components/WorkerNodeVolumeSizeSection/WorkerNodeVolumeSizeSection.tsx',
      componentType: 'form-section',
      usage: ['Classic', 'Hosted', 'Day-2'],
      conditionalLogic: ['isHypershift', 'volumeSizeValidation', 'minVolumeSize'],
      featureFlagDependencies: [],
      behaviors: [
        'min-max-validation',
        'hypershift-aware-minimums',
        'number-input',
        'unit-display',
      ],
      sharedWith: ['wizard', 'machine-pool-step', 'day-2-operations'],
      keyComponents: ['NumberInputField', 'VolumeValidation', 'MinimumSizeCheck', 'FormGroup'],
      title: 'Worker Node Volume Size Configuration',
    },
    docs: {
      description: {
        component: `
## Worker Node Volume Size Section

The Worker Node Volume Size section allows configuration of root disk size for EC2 instances, used across multiple areas of the application: ROSA wizard and Day 2 machine pool editing operations.

### Key Features
- **EBS volume configuration** - Sets AWS EBS root disk size for worker nodes
- **Dynamic validation** - Min/max constraints based on cluster type and version
- **Unit display** - Clear GiB unit indication with number input
- **Default initialization** - Automatically sets appropriate default size (${defaultWorkerNodeVolumeSizeGiB} GiB)
- **Real-time validation** - Immediate feedback on size constraints

### Business Logic
- **Classic ROSA** - Minimum ${workerNodeVolumeSizeMinGiB} GiB, maximum varies by cluster version
- **Hypershift** - Lower minimum (${workerNodeVolumeSizeMinGiBHcp} GiB) due to hosted control plane
- **Version-based limits** - Cluster 4.14+ supports up to 16TB, older versions limited to 1TB
- **AWS EBS constraints** - Follows AWS EBS volume size limitations

### Usage Areas
- **Day 1**: ROSA cluster creation wizard disk size configuration
- **Day 2**: Edit machine pool disk size settings for existing clusters
- **Both architectures**: Classic ROSA and Hypershift clusters

### Shared Implementation
This component shares identical logic with \`DiskSizeField\` used in machine pool editing:
- Same utility functions (\`getWorkerNodeVolumeSizeMinGiB\`, \`getWorkerNodeVolumeSizeMaxGiB\`)
- Same constants and validation rules
- Identical PopoverHint text and min/max range calculations

### Components Included
- **FormNumberInput** with GiB unit display
- **PopoverHint** explaining EBS volume constraints and current min/max
- **Field validation** with min/max size checking
- **FormGroup** with required field indication

### Use Cases
- Standard workloads with default ${defaultWorkerNodeVolumeSizeGiB} GiB volumes
- Storage-intensive applications requiring larger volumes
- Hypershift clusters with lower minimum requirements
- Legacy cluster versions with restricted maximums
- Day 2 operations for modifying existing machine pool disk sizes
        `,
      },
    },
  },
  render: (args: any, { parameters }) => {
    const { initialValues } = parameters;
    const { Wrapper } = withState(initialValues);

    return (
      <Wrapper>
        <WorkerNodeVolumeSizeSection {...args} />
      </Wrapper>
    );
  },
};

export default meta;

type Story = StoryObj<typeof WorkerNodeVolumeSizeSection>;

const baseInitialValues = {
  worker_volume_size_gib: defaultWorkerNodeVolumeSizeGiB, // Real default from constants (300 GiB)
};

export const RosaClassicVolume: Story = {
  name: 'Rosa Classic',
  args: {
    minWorkerVolumeSizeGiB: workerNodeVolumeSizeMinGiB, // Real Classic ROSA minimum from constants
    maxWorkerVolumeSizeGiB: 16384, // Real maximum for cluster 4.14+
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
          Rosa Classic - Default Configuration
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Architecture:</strong> Classic ROSA
            (non-Hypershift)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Range:</strong> {workerNodeVolumeSizeMinGiB} -
            16,384 GiB (cluster 4.14+)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Default:</strong> {defaultWorkerNodeVolumeSizeGiB}{' '}
            GiB (shown in UI)
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Standard Classic ROSA deployment
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {meta.render!(args, { parameters: { initialValues: baseInitialValues } } as any)}
      </div>
    </div>
  ),
};

export const ROSAHostedVolume: Story = {
  name: 'ROSA Hosted',
  args: {
    minWorkerVolumeSizeGiB: workerNodeVolumeSizeMinGiBHcp, // Real Hypershift minimum from constants
    maxWorkerVolumeSizeGiB: 16384, // Same maximum as Classic
  },
  parameters: {
    initialValues: {
      worker_volume_size_gib: defaultWorkerNodeVolumeSizeGiB, // Keep default value
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
          Hosted (Hypershift) Configuration
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Architecture:</strong> Hypershift (hosted control
            plane)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Range:</strong> {workerNodeVolumeSizeMinGiBHcp} -
            16,384 GiB
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Default:</strong> {defaultWorkerNodeVolumeSizeGiB}{' '}
            GiB (shown in UI)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Minimum:</strong> Lower than Classic ROSA (
            {workerNodeVolumeSizeMinGiBHcp} vs {workerNodeVolumeSizeMinGiB} GiB)
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Hypershift cluster deployments
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {meta.render!(args, {
          parameters: {
            initialValues: { worker_volume_size_gib: defaultWorkerNodeVolumeSizeGiB },
          },
        } as any)}
      </div>
    </div>
  ),
};

export const ClusterVersionBefore414: Story = {
  name: 'Cluster version before 4.14',
  args: {
    minWorkerVolumeSizeGiB: workerNodeVolumeSizeMinGiB,
    maxWorkerVolumeSizeGiB: 1024, // Real maximum for cluster versions < 4.14
  },
  parameters: {
    initialValues: {
      worker_volume_size_gib: 500,
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
          Cluster Version &lt; 4.14 Constraints
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Version constraint:</strong> Cluster version &lt;
            4.14
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Applies to:</strong> Both Classic ROSA and
            Hypershift clusters
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Range:</strong> {workerNodeVolumeSizeMinGiB} -
            1,024 GiB (1TB maximum)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Example:</strong> 500 GiB (shown in UI)
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Legacy cluster versions with EBS
            volume limits
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {meta.render!(args, {
          parameters: { initialValues: { worker_volume_size_gib: 500 } },
        } as any)}
      </div>
    </div>
  ),
};

export const ClusterVersion414AndLater: Story = {
  name: 'Cluster version 4.14 and later',
  args: {
    minWorkerVolumeSizeGiB: workerNodeVolumeSizeMinGiB,
    maxWorkerVolumeSizeGiB: 16384, // Real maximum for cluster 4.14+
  },
  parameters: {
    initialValues: {
      worker_volume_size_gib: 8192, // 8TB example
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
          Cluster Version {'>'}= 4.14 - Maximum Volume Support
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Version constraint:</strong> Cluster version {'>'}=
            4.14
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Applies to:</strong> Both Classic ROSA and
            Hypershift clusters
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Range:</strong> {workerNodeVolumeSizeMinGiB} -
            16,384 GiB (16TB maximum)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Example:</strong> 8TB (8,192 GiB) shown in UI
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Enhancement:</strong> 16x larger volumes than older
            versions
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Data-intensive applications
            requiring large storage
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {meta.render!(args, {
          parameters: { initialValues: { worker_volume_size_gib: 8192 } },
        } as any)}
      </div>
    </div>
  ),
};

export const RosaAddOrEditMachinePool: Story = {
  name: 'Rosa: Add or Edit Machine Pool',
  args: {
    minWorkerVolumeSizeGiB: workerNodeVolumeSizeMinGiB,
    maxWorkerVolumeSizeGiB: 16384,
  },
  parameters: {
    initialValues: {
      worker_volume_size_gib: 500, // Current volume size
    },
  },
  render: (args) => {
    const { Wrapper } = withState({ worker_volume_size_gib: 500 });

    return (
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
            Worker Node Volume Size - Add/Edit Machine Pool
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> Day 2 operations - ROSA add/edit
              machine pool
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Context:</strong> Machine pool volume size
              configuration
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Current size:</strong> 500 GiB (example value)
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Configuring disk size for new
              or existing machine pools
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '600px' }}>
          <Wrapper>
            <WorkerNodeVolumeSizeSection {...args} />
          </Wrapper>
        </div>
      </div>
    );
  },
};
