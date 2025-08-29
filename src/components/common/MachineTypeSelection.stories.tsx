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
import { MachineTypeSelection } from '~/components/clusters/common/ScaleSection/MachineTypeSelection/MachineTypeSelection';
import { MachineType } from '~/types/clusters_mgmt.v1';

// Mock machine types data (region-specific - always available)
const mockMachineTypes: MachineType[] = [
  {
    id: 'm5.large',
    name: 'm5.large',
    cpu: { value: 2, unit: 'vCPUs' },
    memory: { value: 8, unit: 'GiB' },
    category: 'general_purpose',
    ccs_only: false,
    generic_name: 'highmem',
    size: 'large',
  },
  {
    id: 'm5.xlarge',
    name: 'm5.xlarge',
    cpu: { value: 4, unit: 'vCPUs' },
    memory: { value: 16, unit: 'GiB' },
    category: 'general_purpose',
    ccs_only: false,
    generic_name: 'highmem',
    size: 'xlarge',
  },
  {
    id: 'c5.2xlarge',
    name: 'c5.2xlarge',
    cpu: { value: 8, unit: 'vCPUs' },
    memory: { value: 16, unit: 'GiB' },
    category: 'compute_optimized',
    ccs_only: false,
    generic_name: 'compute',
    size: '2xlarge',
  },
  {
    id: 'r5.xlarge',
    name: 'r5.xlarge',
    cpu: { value: 4, unit: 'vCPUs' },
    memory: { value: 32, unit: 'GiB' },
    category: 'memory_optimized',
    ccs_only: false,
    generic_name: 'memory',
    size: 'xlarge',
  },
] as MachineType[];

// Additional machine types (global list - may not be available in all regions)
const mockAllMachineTypes: MachineType[] = [
  ...mockMachineTypes,
  // These might be unavailable in certain regions/accounts
  {
    id: 'p3.2xlarge',
    name: 'p3.2xlarge',
    cpu: { value: 8, unit: 'vCPUs' },
    memory: { value: 61, unit: 'GiB' },
    category: 'accelerated_computing',
    ccs_only: false,
    generic_name: 'compute',
    size: '2xlarge',
  },
  {
    id: 'x1e.xlarge',
    name: 'x1e.xlarge',
    cpu: { value: 4, unit: 'vCPUs' },
    memory: { value: 122, unit: 'GiB' },
    category: 'memory_optimized',
    ccs_only: false,
    generic_name: 'memory',
    size: 'xlarge',
  },
  {
    id: 'i3.large',
    name: 'i3.large',
    cpu: { value: 2, unit: 'vCPUs' },
    memory: { value: 15.25, unit: 'GiB' },
    category: 'storage_optimized',
    ccs_only: false,
    generic_name: 'compute',
    size: 'large',
  },
] as MachineType[];

// Helper to create typesByID map
const createTypesByID = (types: MachineType[]) =>
  types.reduce(
    (acc, type) => {
      acc[type.id!] = type;
      return acc;
    },
    {} as { [key: string]: MachineType },
  );

const mockMachineTypesResponse = {
  error: false,
  errorMessage: '',
  pending: false,
  fulfilled: true,
  types: {
    aws: mockAllMachineTypes, // Global list with potentially unavailable types
    gcp: [],
  },
  typesByID: createTypesByID(mockAllMachineTypes),
};

const baseRequestState = {
  pending: false,
  fulfilled: true,
  error: false,
};

// Proper quota structure matching real test patterns + mock machine types
const workingQuotaList = {
  items: [
    // ROSA cluster quota (unlimited like real tests)
    {
      kind: 'QuotaCost',
      href: '/api/accounts_mgmt/v1/organizations/1H1PQMDtwzAUsjPxgoWRjhSpNGD/quota_cost',
      organization_id: '1H1PQMDtwzAUsjPxgoWRjhSpNGD',
      quota_id: 'cluster|gp.small|any|byoc|moa|aws',
      allowed: 0,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'aws',
          resource_name: 'highmem',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'compute',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'memory',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
        {
          cloud_provider: 'any',
          resource_name: 'highmem',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'compute',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'memory',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
      ],
    },
    // OSD cluster quota for OSDWizard story
    {
      kind: 'QuotaCost',
      href: '/api/accounts_mgmt/v1/organizations/1MK6ieFXd0eu1hERdENAPvpbi7x/quota_cost',
      organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
      quota_id: 'cluster|rhinfra|osd',
      allowed: 20,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'any',
          resource_name: 'highmem',
          resource_type: 'cluster',
          byoc: 'rhinfra',
          availability_zone_type: 'any',
          product: 'OSD',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'compute',
          resource_type: 'cluster',
          byoc: 'rhinfra',
          availability_zone_type: 'any',
          product: 'OSD',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'memory',
          resource_type: 'cluster',
          byoc: 'rhinfra',
          availability_zone_type: 'any',
          product: 'OSD',
          billing_model: 'standard',
          cost: 1,
        },
      ],
    },
    // BYOC/ROSA node quota
    {
      kind: 'QuotaCost',
      href: '/api/accounts_mgmt/v1/organizations/1MK6ieFXd0eu1hERdENAPvpbi7x/quota_cost',
      organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
      quota_id: 'compute.node|cpu|byoc|rosa',
      allowed: 0,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'aws',
          resource_name: 'highmem',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'compute',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'memory',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
        {
          cloud_provider: 'any',
          resource_name: 'highmem',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'compute',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'memory',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
      ],
    },
    // OSD node quota for OSDWizard story
    {
      kind: 'QuotaCost',
      href: '/api/accounts_mgmt/v1/organizations/1MK6ieFXd0eu1hERdENAPvpbi7x/quota_cost',
      organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
      quota_id: 'compute.node|cpu|rhinfra|osd',
      allowed: 100,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'any',
          resource_name: 'highmem',
          resource_type: 'compute.node',
          byoc: 'rhinfra',
          availability_zone_type: 'any',
          product: 'OSD',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'compute',
          resource_type: 'compute.node',
          byoc: 'rhinfra',
          availability_zone_type: 'any',
          product: 'OSD',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'memory',
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

// No quota for demonstrating quota alert
const noQuotaList = {
  items: [
    {
      kind: 'QuotaCost',
      href: '/api/accounts_mgmt/v1/organizations/1MK6ieFXd0eu1hERdENAPvpbi7x/quota_cost',
      organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
      quota_id: 'cluster|byoc|osd',
      allowed: 0,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'any',
          resource_name: 'highmem',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'compute',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'memory',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'highmem',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'compute',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'memory',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
      ],
    },
    {
      kind: 'QuotaCost',
      href: '/api/accounts_mgmt/v1/organizations/1MK6ieFXd0eu1hERdENAPvpbi7x/quota_cost',
      organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
      quota_id: 'compute.node|cpu|byoc|osd',
      allowed: 0,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'any',
          resource_name: 'highmem',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'compute',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'memory',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'highmem',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'compute',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'memory',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
      ],
    },
  ],
};

const withState = (
  initialValues: any,
  storyConfig: {
    quotaList?: any;
  } = {},
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
} => {
  const { quotaList = workingQuotaList } = storyConfig;

  // Note: Quota structure based on real test patterns

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
    flavours: {
      ...baseRequestState,
      byID: {
        'osd-4': {
          aws: { compute_instance_type: 'm5.xlarge' },
          gcp: { compute_instance_type: 'custom-4-16384' },
        },
      },
    },
    machineTypesByRegion: {
      ...baseRequestState,
      types: {
        aws: mockMachineTypes, // Region-specific subset (verified available)
        gcp: [],
      },
      typesByID: createTypesByID(mockMachineTypes),
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
          <Formik initialValues={initialValues} onSubmit={() => {}}>
            <Form>{children}</Form>
          </Formik>
        </QueryClientProvider>
      </Provider>
    );
  };

  return { store, Wrapper };
};

const meta: Meta<typeof MachineTypeSelection> = {
  title: 'Common/MachineTypeSelection',
  component: MachineTypeSelection,
  parameters: {
    metadata: {
      sourceFile:
        '~/components/clusters/common/ScaleSection/MachineTypeSelection/MachineTypeSelection.tsx',
      componentType: 'field',
      usage: ['Classic', 'Hosted', 'Day-2'],
      conditionalLogic: ['hasQuota', 'showUnavailableTypes', 'machineTypeCategory'],
      featureFlagDependencies: [],
      behaviors: [
        'quota-enforcement',
        'category-filtering',
        'availability-toggle',
        'dropdown-selection',
        'real-time-validation',
      ],
      sharedWith: ['wizard', 'machine-pool-step', 'day-2-operations'],
      keyComponents: [
        'MachineTypeDropdown',
        'CategoryFilter',
        'AvailabilityToggle',
        'QuotaValidation',
        'MachineTypeCard',
      ],
      title: 'Machine Type Selection',
    },
    docs: {
      description: {
        component: `
## Machine Type Selection

The Machine Type Selection component allows users to choose compute node instance types for their clusters. It displays available machine types grouped by category with detailed specifications.

### Key Features
- **Categorized display** - Groups machine types by General Purpose, Compute Optimized, Memory Optimized, etc.
- **Quota checking** - Shows availability based on organization quota limits
- **Detailed specs** - Displays CPU, memory, and other specifications for each type
- **Search and filter** - TreeView interface for easy navigation
- **BYOC support** - Different behavior for Bring Your Own Cloud vs managed clusters

### Wizard Usage Scenarios
- **OSD Wizard** - OpenShift Dedicated managed cluster creation with quota validation
- **ROSA Classic Wizard** - Self-managed control plane cluster setup (permanent instance type choice)
- **ROSA Hosted Wizard** - Hosted control plane cluster with flexible machine pool creation

### Architecture Support  
- **AWS** - Full support for EC2 instance types (m5.large, c5.xlarge, r5.2xlarge, etc.)
- **GCP** - Support for Google Cloud machine types
- **BYOC vs Managed** - Different quota models for customer-managed vs Red Hat-managed infrastructure

### Business Logic
- **Quota enforcement** - Machine types disabled when quota insufficient, shows quota alert
- **Region filtering** - Shows only types available in selected region (BYOC/ROSA scenarios)
- **Default selection** - Automatically selects recommended instance type when available
- **Validation** - Prevents invalid selections and shows helpful error messages

### Components Included
- **TreeViewSelect** - Hierarchical machine type browser with category grouping
- **Quota alerts** - Warning messages when insufficient quota available
- **Error handling** - Graceful degradation when data unavailable
- **Loading states** - Spinner during data fetching

### Use Cases
- **OSD wizard** - Selecting compute node specifications for managed clusters
- **ROSA Classic wizard** - Choosing permanent default machine pool instance type  
- **ROSA Hosted wizard** - Flexible machine pool instance type selection
- **Day-2 operations** - Editing existing machine pool instance types
        `,
      },
    },
  },
  argTypes: {
    // Props are configured per story to show specific wizard scenarios
    // Controls removed to focus on the three main use cases
  },
};

export default meta;

type Story = StoryObj<typeof MachineTypeSelection>;

const baseInitialValues = {
  instanceType: '',
};

export const OSDWizard: Story = {
  args: {
    machineTypesResponse: mockMachineTypesResponse,
    isMultiAz: false,
    isBYOC: false,
    cloudProviderID: 'aws' as const,
    productId: normalizedProducts.OSD,
    billingModel: 'standard' as const,
    isMachinePool: false,
    inModal: false,
    allExpanded: true,
  },
  parameters: {
    initialValues: baseInitialValues,
  },
  render: (args) => {
    const { Wrapper } = withState(baseInitialValues);

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
            OSD Wizard Machine Type Selection
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> OpenShift Dedicated cluster
              creation wizard
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> Shows available instance types
              with quota enforcement
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Expand categories and
              select compute node type
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Creating new OSD managed
              cluster
            </p>
          </div>
        </div>
        <Wrapper>
          <MachineTypeSelection {...args} />
        </Wrapper>
      </div>
    );
  },
};

export const ROSAClassic: Story = {
  args: {
    machineTypesResponse: mockMachineTypesResponse,
    isMultiAz: false,
    isBYOC: true,
    cloudProviderID: 'aws' as const,
    productId: normalizedProducts.ROSA,
    billingModel: 'standard' as const,
    isMachinePool: false,
    inModal: false,
    allExpanded: true,
  },
  parameters: {
    initialValues: baseInitialValues,
  },
  render: (args) => {
    const { Wrapper } = withState(baseInitialValues);

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
            ROSA Classic Wizard Machine Type Selection
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> ROSA Classic (self-managed control
              plane) wizard
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> Customer AWS account machine
              types with quota validation
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Select default worker node
              instance type (cannot be changed post-creation)
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Creating ROSA Classic cluster
              with self-managed control plane
            </p>
          </div>
        </div>
        <Wrapper>
          <MachineTypeSelection {...args} />
        </Wrapper>
      </div>
    );
  },
};

export const ROSAHosted: Story = {
  args: {
    machineTypesResponse: mockMachineTypesResponse,
    isMultiAz: false,
    isBYOC: true,
    cloudProviderID: 'aws' as const,
    productId: normalizedProducts.ROSA,
    billingModel: 'standard' as const,
    isMachinePool: false,
    inModal: false,
    allExpanded: true,
  },
  parameters: {
    initialValues: baseInitialValues,
  },
  render: (args) => {
    const { Wrapper } = withState(baseInitialValues);

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
            ROSA Hosted Wizard Machine Type Selection
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> ROSA Hosted (hosted control plane)
              wizard
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> Default worker node selection for
              hosted control plane cluster
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Select default worker node
              instance type (cannot be changed post-creation)
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Creating ROSA Hosted cluster
              with managed control plane
            </p>
          </div>
        </div>
        <Wrapper>
          <MachineTypeSelection {...args} />
        </Wrapper>
      </div>
    );
  },
};

export const QuotaAlert: Story = {
  args: {
    machineTypesResponse: mockMachineTypesResponse,
    isMultiAz: false,
    isBYOC: false,
    cloudProviderID: 'aws' as const,
    productId: normalizedProducts.OSD,
    billingModel: 'standard' as const,
    isMachinePool: false,
    inModal: false,
    allExpanded: true,
  },
  parameters: {
    initialValues: baseInitialValues,
  },
  render: (args) => {
    const { Wrapper } = withState(baseInitialValues, { quotaList: noQuotaList });

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
            Machine Type Selection - No Quota Available
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> Insufficient quota scenario
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> Shows quota alert when
              insufficient cluster/node quota available
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Component displays warning
              about quota limitations
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> User needs to contact sales to
              increase quota limits
            </p>
          </div>
        </div>
        <Wrapper>
          <MachineTypeSelection {...args} />
        </Wrapper>
      </div>
    );
  },
};

export const AddMachinePool: Story = {
  args: {
    machineTypesResponse: mockMachineTypesResponse,
    isMultiAz: false,
    isBYOC: true,
    cloudProviderID: 'aws' as const,
    productId: normalizedProducts.ROSA,
    billingModel: 'standard' as const,
    isMachinePool: true,
    inModal: true,
    allExpanded: true,
  },
  parameters: {
    initialValues: baseInitialValues,
  },
  render: (args) => {
    const { Wrapper } = withState(baseInitialValues);

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
            Add Machine Pool - Day 2 Operations
          </h4>
          <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Mode:</strong> Post-cluster creation machine pool
              addition
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>State:</strong> Adding additional machine pool to
              existing cluster via modal
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong style={{ color: '#495057' }}>Interaction:</strong> Select instance type for
              new machine pool (requires minimum 1 node)
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ color: '#495057' }}>Use case:</strong> Day 2 operations - expanding
              cluster compute capacity with different instance types
            </p>
          </div>
        </div>
        <Wrapper>
          <MachineTypeSelection {...args} />
        </Wrapper>
      </div>
    );
  },
};
