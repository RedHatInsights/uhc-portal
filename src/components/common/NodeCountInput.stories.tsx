import React from 'react';
import { Form, Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { normalizedProducts } from '~/common/subscriptionTypes';
import NodeCountInput from '~/components/clusters/common/NodeCountInput/NodeCountInput';
import { SubscriptionCommonFieldsCluster_billing_model as BillingModel } from '~/types/accounts_mgmt.v1';
// Create mock quota data
const mockQuotaWithLimitedNodes: any = {
  items: [
    {
      allowed: 1,
      consumed: 0,
      cost: 1,
      product: 'OSD',
      byoc: 'rhinfra',
      related_resources: [
        {
          availability_zone_type: 'multi',
          billing_model: 'standard',
          byoc: 'rhinfra',
          cloud_provider: 'aws',
          cost: 1,
          product: 'OSD',
          resource_name: 'standard',
          resource_type: 'cluster',
        },
      ],
    },
    {
      allowed: 15,
      consumed: 0,
      cost: 1,
      product: 'OSD',
      byoc: 'rhinfra',
      related_resources: [
        {
          availability_zone_type: 'any',
          billing_model: 'standard',
          byoc: 'rhinfra',
          cloud_provider: 'aws',
          cost: 1,
          product: 'OSD',
          resource_name: 'standard',
          resource_type: 'compute.node',
        },
      ],
    },
  ],
};

const mockQuotaUnlimited: any = {
  items: [
    {
      allowed: 0,
      consumed: 0,
      cost: 0,
      product: 'ROSA',
      byoc: 'byoc',
      related_resources: [
        {
          availability_zone_type: 'single',
          billing_model: 'standard',
          byoc: 'byoc',
          cloud_provider: 'aws',
          cost: 0,
          product: 'ROSA',
          resource_name: 'standard',
          resource_type: 'cluster',
        },
      ],
    },
    {
      allowed: 0,
      consumed: 0,
      cost: 0,
      product: 'ROSA',
      byoc: 'byoc',
      related_resources: [
        {
          availability_zone_type: 'any',
          billing_model: 'standard',
          byoc: 'byoc',
          cloud_provider: 'aws',
          cost: 0,
          product: 'ROSA',
          resource_name: 'standard',
          resource_type: 'compute.node',
        },
      ],
    },
  ],
};

// Exact copy of working MachineTypeSelection no-quota, but adapted for OSD managed (rhinfra)
const mockQuotaNoNodes: any = {
  items: [
    {
      kind: 'QuotaCost',
      href: '/api/accounts_mgmt/v1/organizations/1MK6ieFXd0eu1hERdENAPvpbi7x/quota_cost',
      organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
      quota_id: 'cluster|rhinfra|osd',
      allowed: 0,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'any',
          resource_name: 'standard',
          resource_type: 'cluster',
          byoc: 'rhinfra',
          availability_zone_type: 'any',
          product: 'OSD',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'standard',
          resource_type: 'cluster',
          byoc: 'rhinfra',
          availability_zone_type: 'multi',
          product: 'OSD',
          billing_model: 'standard',
          cost: 1,
        },
      ],
    },
    {
      kind: 'QuotaCost',
      href: '/api/accounts_mgmt/v1/organizations/1MK6ieFXd0eu1hERdENAPvpbi7x/quota_cost',
      organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
      quota_id: 'compute.node|standard|rhinfra|osd',
      allowed: 0,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'any',
          resource_name: 'standard',
          resource_type: 'compute.node',
          byoc: 'rhinfra',
          availability_zone_type: 'any',
          product: 'OSD',
          billing_model: 'standard',
          cost: 1,
        },
      ],
    },
  ],
};

const mockMachineTypes = {
  typesByID: {
    'm5.xlarge': {
      id: 'm5.xlarge',
      generic_name: 'standard',
      name: 'm5.xlarge',
      cpu: { value: 4, unit: 'vCPUs' },
      memory: { value: 16, unit: 'GiB' },
    },
    'm5n.2xlarge': {
      id: 'm5n.2xlarge',
      generic_name: 'standard',
      name: 'm5n.2xlarge',
      cpu: { value: 8, unit: 'vCPUs' },
      memory: { value: 32, unit: 'GiB' },
    },
  },
};

// Base request state for consistent mock structure
const baseRequestState = {
  fulfilled: true,
  pending: false,
  error: null,
};

// Wrapper to provide Redux state and React Query
const withState = (
  storyConfig: { quotaList?: any } = {},
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
} => {
  const { quotaList = mockQuotaWithLimitedNodes } = storyConfig;

  const store = createMockStore([thunk, promiseMiddleware as any])({
    userProfile: {
      organization: {
        ...baseRequestState,
        details: {
          id: '123',
          name: 'Test Organization',
          capabilities: [],
        },
        quotaList,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <div style={{ padding: '20px', maxWidth: '400px' }}>{children}</div>
        </QueryClientProvider>
      </Provider>
    );
  };

  return { store, Wrapper };
};

const meta: Meta<typeof NodeCountInput> = {
  title: 'Common/NodeCountInput',
  component: NodeCountInput,
  parameters: {
    layout: 'centered',
    metadata: {
      sourceFile: '~/components/clusters/common/NodeCountInput/NodeCountInput.tsx',
      componentType: 'field',
      usage: ['Classic', 'Hosted', 'Day-2'],
      conditionalLogic: ['isMultiAZ', 'hasQuota', 'nodeCountValidation'],
      featureFlagDependencies: [],
      behaviors: [
        'quota-enforcement',
        'multi-az-calculation',
        'real-time-validation',
        'number-input',
      ],
      sharedWith: ['wizard', 'machine-pool-step', 'day-2-operations'],
      keyComponents: ['NumberInputField', 'QuotaValidation', 'MultiAZCalculation', 'FormGroup'],
      title: 'Node Count Input',
    },
    docs: {
      description: {
        component: `
NodeCountInput provides a dropdown interface for selecting the number of compute nodes in OpenShift clusters. It handles complex scenarios including:

- **Multi-AZ calculations**: Shows nodes per zone with total calculation
- **Hypershift mode**: Pool-based node counting for hosted control planes  
- **Quota enforcement**: Validates against available cluster and node quota
- **BYOC vs Managed**: Different validation rules for customer vs Red Hat infrastructure
- **Editing vs Creation**: Different behavior when scaling existing clusters

The component integrates with Formik for form management and Redux for quota state.
        `,
      },
    },
  },
  argTypes: {
    // Hide controls to focus on specific scenarios
    quota: { control: false },
    input: { control: false },
    machineTypes: { control: false },
    product: { control: false },
    billingModel: { control: false },
    cloudProviderID: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const baseInitialValues = {
  nodesCompute: 4,
};

export const OSDSingleAZ: Story = {
  args: {
    quota: mockQuotaWithLimitedNodes,
    label: 'Compute node count',
    helpText: 'The compute nodes are where your workloads run.',
    isMultiAz: false,
    isByoc: false,
    isMachinePool: false,
    machineType: 'm5.xlarge',
    machineTypes: mockMachineTypes,
    minNodes: 4,
    cloudProviderID: 'aws',
    product: normalizedProducts.OSD,
    billingModel: BillingModel.standard,
    isHypershiftWizard: false,
    isEditingCluster: false,
    allow249NodesOSDCCSROSA: false,
  },
  parameters: {
    initialValues: baseInitialValues,
  },
  render: (args) => {
    const { Wrapper } = withState({ quotaList: mockQuotaWithLimitedNodes });

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
            Node Count Input - OSD Single AZ
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> OpenShift Dedicated single
              availability zone cluster
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> Standard managed cluster with
              quota-limited node selection
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Select compute node count
              (minimum 4 nodes for single AZ)
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Creating OSD cluster with
              basic compute capacity
            </p>
          </div>
        </div>
        <Wrapper>
          <Formik initialValues={baseInitialValues} onSubmit={() => {}}>
            {({ values, setFieldValue }) => (
              <Form>
                <NodeCountInput
                  {...args}
                  input={{
                    name: 'nodesCompute',
                    value: values.nodesCompute,
                    onChange: (value: number) => setFieldValue('nodesCompute', value),
                    onBlur: () => {},
                  }}
                />
              </Form>
            )}
          </Formik>
        </Wrapper>
      </div>
    );
  },
};

export const OSDMultiAZ: Story = {
  args: {
    quota: mockQuotaWithLimitedNodes,
    label: 'Compute node count (per zone)',
    helpText: 'The compute nodes are where your workloads run.',
    isMultiAz: true,
    isByoc: false,
    isMachinePool: false,
    machineType: 'm5.xlarge',
    machineTypes: mockMachineTypes,
    minNodes: 9,
    cloudProviderID: 'aws',
    product: normalizedProducts.OSD,
    billingModel: BillingModel.standard,
    isHypershiftWizard: false,
    isEditingCluster: false,
    allow249NodesOSDCCSROSA: false,
  },
  parameters: {
    initialValues: { nodesCompute: 9 },
  },
  render: (args) => {
    const { Wrapper } = withState({ quotaList: mockQuotaWithLimitedNodes });

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
            Node Count Input - OSD Multi-AZ
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> OpenShift Dedicated multi
              availability zone cluster
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> High availability cluster with
              per-zone node selection and total calculation
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Select compute nodes per
              zone (minimum 3 per zone = 9 total)
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Creating fault-tolerant OSD
              cluster across multiple zones
            </p>
          </div>
        </div>
        <Wrapper>
          <Formik initialValues={{ nodesCompute: 9 }} onSubmit={() => {}}>
            {({ values, setFieldValue }) => (
              <Form>
                <NodeCountInput
                  {...args}
                  input={{
                    name: 'nodesCompute',
                    value: values.nodesCompute,
                    onChange: (value: number) => setFieldValue('nodesCompute', value),
                    onBlur: () => {},
                  }}
                />
              </Form>
            )}
          </Formik>
        </Wrapper>
      </div>
    );
  },
};

export const ROSAClassicSingleAZ: Story = {
  args: {
    quota: mockQuotaUnlimited,
    label: 'Compute node count',
    helpText: 'The compute nodes are where your workloads run.',
    isMultiAz: false,
    isByoc: true,
    isMachinePool: false,
    machineType: 'm5.xlarge',
    machineTypes: mockMachineTypes,
    minNodes: 2,
    cloudProviderID: 'aws',
    product: normalizedProducts.ROSA,
    billingModel: BillingModel.standard,
    isHypershiftWizard: false,
    isEditingCluster: false,
    allow249NodesOSDCCSROSA: true,
  },
  parameters: {
    initialValues: { nodesCompute: 2 },
  },
  render: (args) => {
    const { Wrapper } = withState({ quotaList: mockQuotaUnlimited });

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
            Node Count Input - ROSA Classic Single AZ
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> ROSA Classic (self-managed control
              plane) single AZ cluster
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> BYOC cluster with unlimited quota
              in customer AWS account
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Select compute node count
              (minimum 2 nodes for ROSA Classic Single AZ)
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Creating ROSA cluster with
              self-managed control plane and maximum flexibility
            </p>
          </div>
        </div>
        <Wrapper>
          <Formik initialValues={{ nodesCompute: 2 }} onSubmit={() => {}}>
            {({ values, setFieldValue }) => (
              <Form>
                <NodeCountInput
                  {...args}
                  input={{
                    name: 'nodesCompute',
                    value: values.nodesCompute,
                    onChange: (value: number) => setFieldValue('nodesCompute', value),
                    onBlur: () => {},
                  }}
                />
              </Form>
            )}
          </Formik>
        </Wrapper>
      </div>
    );
  },
};

export const ROSAClassicMultiAZ: Story = {
  args: {
    quota: mockQuotaUnlimited,
    label: 'Compute node count (per zone)',
    helpText: 'The compute nodes are where your workloads run.',
    isMultiAz: true,
    isByoc: true,
    isMachinePool: false,
    machineType: 'm5.xlarge',
    machineTypes: mockMachineTypes,
    minNodes: 3,
    cloudProviderID: 'aws',
    product: normalizedProducts.ROSA,
    billingModel: BillingModel.standard,
    isHypershiftWizard: false,
    isEditingCluster: false,
    allow249NodesOSDCCSROSA: true,
  },
  parameters: {
    initialValues: { nodesCompute: 3 },
  },
  render: (args) => {
    const { Wrapper } = withState({ quotaList: mockQuotaUnlimited });

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
            Node Count Input - ROSA Classic Multi-AZ
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> ROSA Classic (self-managed control
              plane) multi availability zone cluster
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> High availability BYOC cluster
              with per-zone node selection and total calculation
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Select compute nodes per
              zone (minimum 1 per zone = 3 total for ROSA Classic Multi-AZ)
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Creating fault-tolerant ROSA
              cluster with self-managed control plane across multiple zones
            </p>
          </div>
        </div>
        <Wrapper>
          <Formik initialValues={{ nodesCompute: 3 }} onSubmit={() => {}}>
            {({ values, setFieldValue }) => (
              <Form>
                <NodeCountInput
                  {...args}
                  input={{
                    name: 'nodesCompute',
                    value: values.nodesCompute,
                    onChange: (value: number) => setFieldValue('nodesCompute', value),
                    onBlur: () => {},
                  }}
                />
              </Form>
            )}
          </Formik>
        </Wrapper>
      </div>
    );
  },
};

export const ROSAHosted: Story = {
  args: {
    quota: mockQuotaUnlimited,
    label: 'Compute node count (per machine pool)',
    helpText: 'Each machine pool will have this number of nodes initially.',
    isMultiAz: false,
    isByoc: true,
    isMachinePool: false,
    machineType: 'm5.xlarge',
    machineTypes: mockMachineTypes,
    minNodes: 3,
    cloudProviderID: 'aws',
    product: normalizedProducts.ROSA,
    billingModel: BillingModel.standard,
    isHypershiftWizard: true,
    poolNumber: 3,
    clusterVersion: '4.13.0',
    isEditingCluster: false,
    allow249NodesOSDCCSROSA: true,
  },
  parameters: {
    initialValues: { nodesCompute: 3 },
  },
  render: (args) => {
    const { Wrapper } = withState({ quotaList: mockQuotaUnlimited });

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
            Node Count Input - ROSA Hosted (Hypershift)
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> ROSA Hosted (managed control
              plane) with machine pool architecture
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> Shows nodes per machine pool with
              total calculation across all pools
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Select nodes per machine
              pool (minimum 1 node per pool)
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Creating ROSA Hosted cluster
              with efficient compute distribution across machine pools
            </p>
          </div>
        </div>
        <Wrapper>
          <Formik initialValues={{ nodesCompute: 3 }} onSubmit={() => {}}>
            {({ values, setFieldValue }) => (
              <Form>
                <NodeCountInput
                  {...args}
                  input={{
                    name: 'nodesCompute',
                    value: values.nodesCompute,
                    onChange: (value: number) => setFieldValue('nodesCompute', value),
                    onBlur: () => {},
                  }}
                />
              </Form>
            )}
          </Formik>
        </Wrapper>
      </div>
    );
  },
};

export const NoQuota: Story = {
  args: {
    quota: mockQuotaNoNodes,
    label: 'Compute node count',
    helpText: 'The compute nodes are where your workloads run.',
    isMultiAz: false,
    isByoc: true,
    isMachinePool: false,
    machineType: '', // Empty string triggers no-quota disabled state for BYOC
    machineTypes: mockMachineTypes,
    minNodes: 2,
    cloudProviderID: 'aws',
    product: normalizedProducts.ROSA,
    billingModel: BillingModel.standard,
    isHypershiftWizard: false,
    isEditingCluster: false,
    allow249NodesOSDCCSROSA: false,
  },
  parameters: {
    initialValues: baseInitialValues,
  },
  render: (args) => {
    const { Wrapper } = withState({ quotaList: mockQuotaNoNodes });

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
            Node Count Input - No Quota
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> BYOC cluster with insufficient
              quota
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> Empty machineType + isByoc + zero
              quota triggers disabled dropdown
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Logic:</strong> For BYOC:{' '}
              <code>notEnoughQuota = !machineType || options.length &lt; 1</code>
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Hover over disabled
              dropdown to see quota tooltip message
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> BYOC user needs to select
              machine type or increase quota before proceeding
            </p>
          </div>
        </div>
        <Wrapper>
          <Formik initialValues={baseInitialValues} onSubmit={() => {}}>
            {({ values, setFieldValue }) => (
              <Form>
                <NodeCountInput
                  {...args}
                  input={{
                    name: 'nodesCompute',
                    value: values.nodesCompute,
                    onChange: (value: number) => setFieldValue('nodesCompute', value),
                    onBlur: () => {},
                  }}
                />
              </Form>
            )}
          </Formik>
        </Wrapper>
      </div>
    );
  },
};

export const Day2MachinePoolAutoscaling: Story = {
  name: 'Day 2: Machine Pool Autoscaling',
  args: {
    quota: mockQuotaWithLimitedNodes,
    label: 'Compute node count',
    helpText: 'Scale your cluster compute capacity up or down.',
    isMultiAz: false,
    isByoc: false,
    isMachinePool: false,
    machineType: 'm5.xlarge',
    machineTypes: mockMachineTypes,
    minNodes: 4,
    currentNodeCount: 6,
    cloudProviderID: 'aws',
    product: normalizedProducts.OSD,
    billingModel: BillingModel.standard,
    isHypershiftWizard: false,
    isEditingCluster: true,
    allow249NodesOSDCCSROSA: false,
  },
  parameters: {
    initialValues: { nodesCompute: 6 },
  },
  render: (args) => {
    const { Wrapper } = withState({ quotaList: mockQuotaWithLimitedNodes });

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
            Node Count Input - Editing Existing Cluster
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> Scaling existing cluster capacity
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> Current node count preserved,
              allows scaling within quota limits
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Scale nodes up (if quota
              allows) or down (within minimum limits)
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Day 2 operations - adjusting
              cluster capacity based on workload demands
            </p>
          </div>
        </div>
        <Wrapper>
          <Formik initialValues={{ nodesCompute: 6 }} onSubmit={() => {}}>
            {({ values, setFieldValue }) => (
              <Form>
                <NodeCountInput
                  {...args}
                  input={{
                    name: 'nodesCompute',
                    value: values.nodesCompute,
                    onChange: (value: number) => setFieldValue('nodesCompute', value),
                    onBlur: () => {},
                  }}
                />
              </Form>
            )}
          </Formik>
        </Wrapper>
      </div>
    );
  },
};
