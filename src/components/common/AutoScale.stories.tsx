import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Form } from '@patternfly/react-core';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { getDefaultClusterAutoScaling } from '~/components/clusters/common/clusterAutoScalingValues';
import { AutoScale } from '~/components/clusters/wizards/common/ClusterSettings/MachinePool/AutoScale/AutoScale';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

const baseRequestState = {
  pending: false,
  fulfilled: true,
  error: false,
};

const mockClusterVersion = {
  raw_id: '4.14.15',
  id: 'openshift-v4.14.15',
  display_name: '4.14.15',
};

const withState = (
  initialValues: any,
  hasAutoscaleCapability: boolean = true,
  featureGates: { [key: string]: boolean } = {},
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
} => {
  const store = createMockStore([thunk, promiseMiddleware as any])({
    ...baseRequestState,
    userProfile: {
      keycloakProfile: {
        username: 'test-user',
      },
      organization: {
        ...baseRequestState,
        fulfilled: true,
        details: {
          id: '123',
          name: 'Test Org',
          capabilities: hasAutoscaleCapability
            ? [{ name: 'capability.cluster.autoscale_clusters', value: 'true', inherited: true }]
            : [],
        },
        quotaList: {
          items: [],
        },
        timestamp: 0,
      },
    },
    modal: {
      modalName: null,
      modalProps: {},
    },
    featureGates: {
      MAX_NODES_TOTAL_249: featureGates.MAX_NODES_TOTAL_249 ?? true,
      IMDS_SELECTION: featureGates.IMDS_SELECTION ?? true,
    },
  });

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

const meta: Meta<typeof AutoScale> = {
  title: 'Common/AutoScale',
  component: AutoScale,
  parameters: {
    metadata: {
      sourceFile:
        '~/components/clusters/wizards/common/ClusterSettings/MachinePool/AutoScale/AutoScale.tsx',
      componentType: 'form-section',
      usage: ['Classic', 'Hosted', 'Day-2'],
      conditionalLogic: ['hasAutoscaleCapability', 'autoscalingEnabled', 'minMaxValidation'],
      featureFlagDependencies: ['autoscaling'],
      behaviors: [
        'capability-dependent',
        'checkbox-toggle',
        'min-max-validation',
        'conditional-visibility',
      ],
      sharedWith: ['wizard', 'machine-pool-step', 'day-2-operations'],
      keyComponents: ['CheckboxField', 'NumberInputField', 'MinMaxValidation', 'CapabilityCheck'],
      title: 'Autoscaling Configuration',
    },
    docs: {
      description: {
        component: `
## AutoScale Component

The AutoScale component provides cluster autoscaling configuration used across multiple areas of the application: ROSA wizard, OSD wizard, and Day 2 operations (editing existing clusters).

### Key Features
- **Conditional availability** - Based on product type, billing model, and organization capabilities
- **Architecture-specific UI** - Different labels and behavior for Classic vs Hypershift
- **Additional configuration modal** - Complex autoscaler configuration for Classic ROSA
- **Feature gate integration** - Node limits based on cluster version and feature flags
- **Min/max validation** - Comprehensive node count validation with quota awareness

### Business Logic
- **ROSA clusters** - Always support autoscaling
- **OSD clusters** - Require marketplace billing or organization capability
- **Classic ROSA** - Shows "Edit cluster autoscaling settings" button for additional config
- **Hypershift/Hosted** - Shows min/max node inputs with "per machine pool" labeling
- **Multi-AZ vs Single-AZ** - Different node labeling ("per zone" vs "node count")
- **Feature gates** - MAX_NODES_TOTAL_249 enables higher node limits (249 vs 180)

### Usage Areas
- **Day 1**: ROSA and OSD cluster creation wizards
- **Day 2**: Editing autoscaling settings on existing clusters (Machine Pool details)
- **Both architectures**: Classic ROSA and Hypershift/Hosted clusters

### Components Included
- **CheckboxField** for enabling/disabling autoscaling
- **AutoScaleEnabledInputs** for min/max node configuration when enabled
- **ClusterAutoScaleSettingsDialog** for additional autoscaler settings (Classic only)
- **PopoverHint** with architecture-specific help text

### Use Cases
- Standard ROSA deployments with basic autoscaling (Multi-AZ and Single-AZ)
- OSD clusters with marketplace billing or organization capabilities
- Hypershift/Hosted clusters with per-machine-pool scaling
- Classic clusters with additional autoscaler configuration options
- Day 2 operations for modifying existing cluster autoscaling settings
        `,
      },
    },
  },
  render: (args: any, { parameters }) => {
    const { initialValues, hasAutoscaleCapability, featureGates } = parameters;
    const { Wrapper } = withState(initialValues, hasAutoscaleCapability, featureGates);

    return (
      <Wrapper>
        <AutoScale {...args} />
      </Wrapper>
    );
  },
};

export default meta;

type Story = StoryObj<typeof AutoScale>;

export const RosaClassicMultiAz: Story = {
  name: 'ROSA Classic: Multi-AZ',
  parameters: {
    initialValues: {
      [FieldId.Product]: normalizedProducts.ROSA,
      [FieldId.Hypershift]: 'false',
      [FieldId.Byoc]: 'true',
      [FieldId.MultiAz]: 'true',
      [FieldId.AutoscalingEnabled]: true, // Changed from false to true
      [FieldId.MinReplicas]: 2,
      [FieldId.MaxReplicas]: 6,
      [FieldId.ClusterVersion]: mockClusterVersion,
      [FieldId.ClusterAutoscaling]: getDefaultClusterAutoScaling(249),
    },
    hasAutoscaleCapability: true,
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
          ROSA Classic Multi-AZ - Autoscaling Configuration
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Autoscaling enabled (checkbox
            checked)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Cluster type:</strong> Classic ROSA Multi-AZ
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Node labels:</strong> "Minimum/Maximum nodes per
            zone"
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Helper text:</strong> Shows "x 3 zones = X"
            multiplier
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Additional configuration:</strong> "Edit cluster
            autoscaling settings" button visible
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Help text:</strong> Kubernetes-style declarative
            arguments
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Multi-AZ Classic ROSA with
            dynamic scaling
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {meta.render!(args, {
          parameters: {
            initialValues: {
              [FieldId.Product]: normalizedProducts.ROSA,
              [FieldId.Hypershift]: 'false',
              [FieldId.Byoc]: 'true',
              [FieldId.MultiAz]: 'true',
              [FieldId.AutoscalingEnabled]: true,
              [FieldId.MinReplicas]: 2,
              [FieldId.MaxReplicas]: 6,
              [FieldId.ClusterVersion]: mockClusterVersion,
              [FieldId.ClusterAutoscaling]: getDefaultClusterAutoScaling(249),
            },
            hasAutoscaleCapability: true,
          },
        } as any)}
      </div>
    </div>
  ),
};

export const RosaClassicSingleAz: Story = {
  name: 'ROSA Classic: Single-AZ',
  parameters: {
    initialValues: {
      [FieldId.Product]: normalizedProducts.ROSA,
      [FieldId.Hypershift]: 'false',
      [FieldId.Byoc]: 'true',
      [FieldId.MultiAz]: 'false', // Changed from 'true' to show Single-AZ labeling
      [FieldId.AutoscalingEnabled]: true,
      [FieldId.MinReplicas]: 2,
      [FieldId.MaxReplicas]: 6,
      [FieldId.ClusterVersion]: mockClusterVersion,
      [FieldId.ClusterAutoscaling]: getDefaultClusterAutoScaling(249),
    },
    hasAutoscaleCapability: true,
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
          ROSA Classic Single-AZ - Autoscaling Configuration
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Architecture:</strong> Classic ROSA Single-AZ
            (non-Hypershift)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Autoscaling enabled (checkbox
            checked)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Node labels:</strong> "Minimum/Maximum node count"
            (no "per zone")
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Helper text:</strong> No multiplier (raw node
            count, not "x 3 zones")
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Additional configuration:</strong> "Edit cluster
            autoscaling settings" button visible
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Help text:</strong> Kubernetes-style declarative
            arguments
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Single-AZ Classic ROSA with
            dynamic scaling
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {meta.render!(args, {
          parameters: {
            initialValues: {
              [FieldId.Product]: normalizedProducts.ROSA,
              [FieldId.Hypershift]: 'false',
              [FieldId.Byoc]: 'true',
              [FieldId.MultiAz]: 'false', // Single-AZ
              [FieldId.AutoscalingEnabled]: true,
              [FieldId.MinReplicas]: 2,
              [FieldId.MaxReplicas]: 6,
              [FieldId.ClusterVersion]: mockClusterVersion,
              [FieldId.ClusterAutoscaling]: getDefaultClusterAutoScaling(249),
            },
            hasAutoscaleCapability: true,
          },
        } as any)}
      </div>
    </div>
  ),
};

export const RosaHosted: Story = {
  name: 'ROSA Hosted',
  parameters: {
    initialValues: {
      [FieldId.Product]: normalizedProducts.ROSA,
      [FieldId.Hypershift]: 'true',
      [FieldId.Byoc]: 'true',
      [FieldId.MultiAz]: 'true',
      [FieldId.AutoscalingEnabled]: true,
      [FieldId.MinReplicas]: 1,
      [FieldId.MaxReplicas]: 3,
      [FieldId.MachinePoolsSubnets]: [
        { availabilityZone: 'us-east-1a', privateSubnetId: 'subnet-123', publicSubnetId: '' },
        { availabilityZone: 'us-east-1b', privateSubnetId: 'subnet-456', publicSubnetId: '' },
      ],
      [FieldId.ClusterVersion]: mockClusterVersion,
      [FieldId.ClusterAutoscaling]: getDefaultClusterAutoScaling(249),
    },
    hasAutoscaleCapability: true,
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
          ROSA Hosted - Machine Pool Autoscaling
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Architecture:</strong> Hypershift (hosted control
            plane)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Autoscaling enabled (checkbox
            checked)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Node labels:</strong> "Minimum/Maximum nodes per
            machine pool"
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Machine pools:</strong> 2 machine pools configured
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Note:</strong> No "Edit cluster autoscaling
            settings" button for Hypershift/hosted
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Help text:</strong> Automatic node addition/removal
            based on requirements
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Hypershift clusters with
            per-pool scaling
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {meta.render!(args, {
          parameters: {
            initialValues: {
              [FieldId.Product]: normalizedProducts.ROSA,
              [FieldId.Hypershift]: 'true',
              [FieldId.Byoc]: 'true',
              [FieldId.MultiAz]: 'true',
              [FieldId.AutoscalingEnabled]: true,
              [FieldId.MinReplicas]: 1,
              [FieldId.MaxReplicas]: 3,
              [FieldId.MachinePoolsSubnets]: [
                {
                  availabilityZone: 'us-east-1a',
                  privateSubnetId: 'subnet-123',
                  publicSubnetId: '',
                },
                {
                  availabilityZone: 'us-east-1b',
                  privateSubnetId: 'subnet-456',
                  publicSubnetId: '',
                },
              ],
              [FieldId.ClusterVersion]: mockClusterVersion,
              [FieldId.ClusterAutoscaling]: getDefaultClusterAutoScaling(249),
            },
            hasAutoscaleCapability: true,
          },
        } as any)}
      </div>
    </div>
  ),
};

export const FeatureGateDisabled: Story = {
  name: 'Feature Gate Disabled - Lower Node Limits',
  parameters: {
    initialValues: {
      [FieldId.Product]: normalizedProducts.ROSA,
      [FieldId.Hypershift]: 'false',
      [FieldId.Byoc]: 'true',
      [FieldId.MultiAz]: 'true',
      [FieldId.AutoscalingEnabled]: true,
      [FieldId.MinReplicas]: 2,
      [FieldId.MaxReplicas]: 180, // Lower max due to feature gate
      [FieldId.ClusterVersion]: mockClusterVersion,
      [FieldId.ClusterAutoscaling]: getDefaultClusterAutoScaling(180), // Lower limit
    },
    hasAutoscaleCapability: true,
    featureGates: {
      MAX_NODES_TOTAL_249: false, // Feature gate disabled
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
          Feature Gate Disabled - Restricted Node Limits
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Feature gate:</strong> MAX_NODES_TOTAL_249 disabled
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Node limit:</strong> 180 nodes maximum (vs 249 when
            enabled)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Validation:</strong> Lower maximum enforced in
            autoscaler settings
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Current max:</strong> 180 nodes (shown in UI)
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Organizations without extended
            node limit capability
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {meta.render!(args, {
          parameters: {
            initialValues: {
              [FieldId.Product]: normalizedProducts.ROSA,
              [FieldId.Hypershift]: 'false',
              [FieldId.Byoc]: 'true',
              [FieldId.MultiAz]: 'true',
              [FieldId.AutoscalingEnabled]: true,
              [FieldId.MinReplicas]: 2,
              [FieldId.MaxReplicas]: 180,
              [FieldId.ClusterVersion]: mockClusterVersion,
              [FieldId.ClusterAutoscaling]: getDefaultClusterAutoScaling(180),
            },
            hasAutoscaleCapability: true,
            featureGates: {
              MAX_NODES_TOTAL_249: false,
            },
          },
        } as any)}
      </div>
    </div>
  ),
};

export const NoAutoscaleCapability: Story = {
  name: 'No Autoscale Capability - Feature Unavailable',
  parameters: {
    initialValues: {
      [FieldId.Product]: normalizedProducts.OSD, // OSD without marketplace billing
      [FieldId.Hypershift]: 'false',
      [FieldId.Byoc]: 'true',
      [FieldId.MultiAz]: 'true',
      [FieldId.AutoscalingEnabled]: false,
      [FieldId.BillingModel]: 'standard', // Not marketplace billing
      [FieldId.ClusterVersion]: mockClusterVersion,
      [FieldId.ClusterAutoscaling]: getDefaultClusterAutoScaling(249),
    },
    hasAutoscaleCapability: false, // Organization lacks capability
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
          Autoscaling Capability Not Available
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Product:</strong> OSD with standard billing (not
            marketplace)
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Organization:</strong> Lacks autoscaling capability
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Behavior:</strong> AutoScale component will not
            render
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Alternative:</strong> Manual node count
            configuration only
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Standard OSD without marketplace
            billing or capability
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', textAlign: 'center', padding: '40px', color: '#6c757d' }}>
        <p>AutoScale component would not render due to missing capability.</p>
        <p>
          <em>In the actual wizard, only manual node count input would be shown.</em>
        </p>
      </div>
    </div>
  ),
};
