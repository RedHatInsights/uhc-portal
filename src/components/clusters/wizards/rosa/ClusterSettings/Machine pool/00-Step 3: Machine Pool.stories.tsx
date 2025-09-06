import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Wizard, WizardBody, WizardStep } from '@patternfly/react-core';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { getRandomID } from '~/common/helpers';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { FieldId, initialValues } from '~/components/clusters/wizards/rosa/constants';
import { baseRequestState } from '~/redux/reduxHelpers';
import { SubscriptionCommonFieldsCluster_billing_model as BillingModel } from '~/types/accounts_mgmt.v1';

import MachinePoolScreen from '../../MachinePoolScreen/MachinePoolScreen';

import '../../createROSAWizard.scss';

// Proper ROSA quota structure (based on working MachineTypeSelection.stories.tsx)
const workingRosaQuotaList = {
  items: [
    // ROSA cluster quota (unlimited)
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
          cloud_provider: 'aws',
          resource_name: 'highmem',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'compute',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'memory',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
      ],
    },
    // ROSA node quota (unlimited)
    {
      kind: 'QuotaCost',
      href: '/api/accounts_mgmt/v1/organizations/1H1PQMDtwzAUsjPxgoWRjhSpNGD/quota_cost',
      organization_id: '1H1PQMDtwzAUsjPxgoWRjhSpNGD',
      quota_id: 'compute.node|gp.small|any|byoc|moa|aws',
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
          cloud_provider: 'aws',
          resource_name: 'highmem',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'compute',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'memory',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 0,
        },
      ],
    },
  ],
};

// No quota structure for demonstrating quota alert
const noQuotaList = {
  items: [
    // ROSA cluster quota (no available quota)
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
          cost: 1, // Limited quota with no allowance = no available quota
        },
        {
          cloud_provider: 'aws',
          resource_name: 'compute',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'memory',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'highmem',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'compute',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'aws',
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
    // ROSA node quota (no available quota)
    {
      kind: 'QuotaCost',
      href: '/api/accounts_mgmt/v1/organizations/1H1PQMDtwzAUsjPxgoWRjhSpNGD/quota_cost',
      organization_id: '1H1PQMDtwzAUsjPxgoWRjhSpNGD',
      quota_id: 'compute.node|gp.small|any|byoc|moa|aws',
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
          cost: 1,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'compute',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'memory',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'highmem',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'compute',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'aws',
          resource_name: 'memory',
          resource_type: 'compute.node',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard',
          cost: 1,
        },
      ],
    },
  ],
};

// Mock machine types data (region-specific - always available)
const mockRegionMachineTypes = [
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
];

// All machine types (includes region-specific + potentially unavailable ones)
const mockAllMachineTypes = [
  ...mockRegionMachineTypes,
  // Additional machine types that might be unavailable in certain regions/accounts
  // These show up when "Include types that might be unavailable" toggle is enabled
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
];

// Helper to create typesByID map
const createTypesByID = (types: any[]) =>
  types.reduce((acc, type) => {
    acc[type.id] = type;
    return acc;
  }, {});

const withState = (
  quotaData: any,
  hypershiftMode: boolean = false,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
} => {
  const store = createMockStore([thunk, promiseMiddleware as any])({
    modal: {
      modalName: null,
    },
    // Flavours state (required by MachineTypeSelection)
    flavours: {
      ...baseRequestState,
      fulfilled: true,
      byID: {
        'osd-4': {
          aws: {
            compute_instance_type: 'm5.xlarge',
          },
        },
      },
    },
    userProfile: {
      keycloakProfile: {
        username: 'test-user',
      },
      organization: {
        ...baseRequestState,
        fulfilled: true,
        details: {
          id: '123',
          name: 'Test Organization',
        },
        quotaList: quotaData,
        timestamp: Date.now(),
      },
    },
    machineTypesByRegion: {
      ...baseRequestState,
      fulfilled: true,
      types: {
        aws: mockRegionMachineTypes, // Region-specific subset (verified available)
        gcp: [],
      },
      typesByID: createTypesByID(mockRegionMachineTypes),
    },
    machineTypes: {
      ...baseRequestState,
      fulfilled: true,
      types: {
        aws: mockAllMachineTypes, // All types (shown when toggle enabled)
        gcp: [],
      },
      typesByID: createTypesByID(mockAllMachineTypes),
    },
    rosaReducer: {
      getAWSBillingAccountsResponse: {
        ...baseRequestState,
        fulfilled: true,
        data: [],
      },
      getAWSAccountRolesARNsResponse: {
        ...baseRequestState,
        fulfilled: true,
        data: [],
      },
      getAWSAccountIDsResponse: {
        ...baseRequestState,
        fulfilled: true,
        data: ['123456789012'],
      },
    },
    clusterVersions: {
      ...baseRequestState,
      fulfilled: true,
      list: [
        {
          id: '4.14.0',
          raw_id: '4.14.0',
          channel_group: 'stable',
          available_upgrades: [],
          rosa_enabled: true,
          hosted_control_plane_enabled: hypershiftMode,
        },
      ],
    },
    // Additional Redux state that might be missing
    cloudProviders: {
      ...baseRequestState,
      fulfilled: true,
      list: [
        {
          id: 'aws',
          name: 'Amazon Web Services',
        },
      ],
    },
    cloudAccounts: {
      ...baseRequestState,
      fulfilled: true,
      data: [],
    },
    // Feature gates
    featureGates: {
      ...baseRequestState,
      fulfilled: true,
      data: {},
    },
    // VPC data (required by MachinePoolsSubnets for Hypershift - based on working MachinePoolsSubnets.stories.tsx)
    ccsInquiries: {
      vpcs: {
        fulfilled: true,
        pending: false,
        error: false,
        data: {
          items: [
            {
              id: 'vpc-123456789',
              name: 'rosa-vpc-example',
              aws_subnets: [
                // us-east-1a
                {
                  subnet_id: 'subnet-private-1a',
                  public: false,
                  availability_zone: 'us-east-1a',
                  cidr_block: '10.0.1.0/24',
                },
                {
                  subnet_id: 'subnet-public-1a',
                  public: true,
                  availability_zone: 'us-east-1a',
                  cidr_block: '10.0.11.0/24',
                },
                // us-east-1b
                {
                  subnet_id: 'subnet-private-1b',
                  public: false,
                  availability_zone: 'us-east-1b',
                  cidr_block: '10.0.2.0/24',
                },
                {
                  subnet_id: 'subnet-public-1b',
                  public: true,
                  availability_zone: 'us-east-1b',
                  cidr_block: '10.0.12.0/24',
                },
                // us-east-1c
                {
                  subnet_id: 'subnet-private-1c',
                  public: false,
                  availability_zone: 'us-east-1c',
                  cidr_block: '10.0.3.0/24',
                },
                {
                  subnet_id: 'subnet-public-1c',
                  public: true,
                  availability_zone: 'us-east-1c',
                  cidr_block: '10.0.13.0/24',
                },
              ],
            },
          ],
        },
      },
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
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  };

  return { store, Wrapper };
};

type StoryWrapperProps = {
  showInWizardFramework?: boolean;
  hypershiftMode?: boolean;
  multiAz?: boolean;
  withNodeLabels?: boolean;
};

const StoryWrapper = ({
  showInWizardFramework = true,
  hypershiftMode = false,
  multiAz = false,
  withNodeLabels = false,
}: StoryWrapperProps) => {
  const { Wrapper } = withState(workingRosaQuotaList, hypershiftMode);

  // Create initial values based on the mode
  const formInitialValues = {
    ...initialValues(hypershiftMode),
    [FieldId.Hypershift]: hypershiftMode ? 'true' : 'false',
    [FieldId.MultiAz]: multiAz ? 'true' : 'false',
    [FieldId.MachineType]: 'm5.large',
    [FieldId.Region]: 'us-east-1',
    [FieldId.Product]: normalizedProducts.ROSA,
    [FieldId.BillingModel]: BillingModel.standard,
    [FieldId.CloudProvider]: 'aws',
    [FieldId.ClusterVersion]: {
      id: '4.14.0',
      raw_id: '4.14.0',
      channel_group: 'stable',
    },
    [FieldId.NodeLabels]: withNodeLabels
      ? [
          { id: getRandomID(), key: 'environment', value: 'production' },
          { id: getRandomID(), key: 'team', value: 'backend' },
        ]
      : [{ id: getRandomID() }],
  };

  if (showInWizardFramework) {
    // Show in wizard framework
    return (
      <Wrapper>
        <div className="ocm-page" style={{ height: '100vh', padding: 0, margin: 0 }}>
          <Wizard height="100%" width="100%" className="rosa-wizard">
            <WizardStep name="Machine pool" id="machine-pool">
              <WizardBody>
                <Formik initialValues={formInitialValues} onSubmit={() => {}}>
                  <MachinePoolScreen />
                </Formik>
              </WizardBody>
            </WizardStep>
          </Wizard>
        </div>
      </Wrapper>
    );
  }

  // Show standalone version
  return (
    <Wrapper>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <Formik initialValues={formInitialValues} onSubmit={() => {}}>
          <MachinePoolScreen />
        </Formik>
      </div>
    </Wrapper>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 3: Cluster settings/Machine pool/- Step 3: Machine Pool -',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/MachinePoolScreen/MachinePoolScreen.jsx',
      componentType: 'wizard-step',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['isHypershift', 'isMultiAZ', 'isAutoscalingEnabled', 'hasQuota'],
      featureFlagDependencies: ['autoscaling'],
      behaviors: [
        'quota-enforcement',
        'conditional-disable',
        'form-reset-on-change',
        'cross-field-dependencies',
        'async-validation',
      ],
      step: 3,
      sharedWith: ['wizard'],
      keyComponents: [
        'MachinePoolScreenHeader',
        'MachinePoolsSubnets',
        'MachineTypeSelection',
        'NodeCountInput',
        'AutoScale',
        'WorkerNodeVolumeSizeSection',
        'FormKeyValueList',
        'ImdsSection',
      ],
      title: 'Machine Pool Configuration',
    },
    docs: {
      description: {
        component: `
## ROSA Machine Pool Configuration Step

Step 3 of the ROSA wizard handles machine pool configuration, including compute resources, scaling, networking, and node labels.

### Key Components Integrated
- **MachinePoolScreenHeader** - Step introduction and context
- **MachinePoolsSubnets** - VPC and subnet selection (Hypershift only)
- **MachineTypeSelection** - Compute instance type selection
- **NodeCountInput** - Worker node count configuration
- **AutoScale** - Autoscaling configuration (when available)
- **WorkerNodeVolumeSizeSection** - Storage configuration
- **FormKeyValueList** - Node labels management (Classic only)
- **ImdsSection** - Instance metadata service configuration

### Architecture Modes
- **ROSA Classic** - Traditional deployment with full control
- **ROSA Hosted** - Managed control plane deployment

### Configuration Options
- **Single AZ vs Multi-AZ** - Availability zone deployment options
- **Manual vs Autoscaling** - Node count management strategies
- **Network Configuration** - VPC, subnets, and security groups
- **Node Customization** - Labels, storage, and instance metadata
        `,
      },
    },
  },
  argTypes: {
    showInWizardFramework: {
      control: 'boolean',
      description: 'Show the step within the full wizard framework with left navigation panel',
    },
    hypershiftMode: {
      control: 'boolean',
      description: 'Enable Hypershift (ROSA Hosted) mode',
    },
    multiAz: {
      control: 'boolean',
      description: 'Enable Multi-AZ configuration',
    },
    withNodeLabels: {
      control: 'boolean',
      description: 'Pre-populate with sample node labels',
    },
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

const baseArgs = {
  showInWizardFramework: true,
  hypershiftMode: false,
  multiAz: false,
  withNodeLabels: false,
};

export const RosaClassicSingleAZ: Story = {
  name: 'ROSA Classic Single AZ',
  args: {
    ...baseArgs,
    hypershiftMode: false,
    multiAz: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'ROSA Classic deployment in single availability zone. Shows standard machine pool configuration with node labels section.',
      },
    },
  },
};

export const RosaClassicMultiAZ: Story = {
  name: 'ROSA Classic Multi-AZ',
  args: {
    ...baseArgs,
    hypershiftMode: false,
    multiAz: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'ROSA Classic deployment across multiple availability zones. Node count is per zone.',
      },
    },
  },
};

export const RosaHostedMultiAZ: Story = {
  name: 'ROSA Hosted',
  args: {
    ...baseArgs,
    hypershiftMode: true,
    multiAz: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'ROSA Hosted (Hypershift) deployment. Shows subnet selection for machine pools and per-machine-pool node count.',
      },
    },
  },
};

export const NoQuotaAlert: Story = {
  name: 'No Quota Alert',
  args: {
    showInWizardFramework: true,
    hypershiftMode: false,
    multiAz: false,
    withNodeLabels: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the quota alert when insufficient quota is available. Shows "You do not have enough quota to create a cluster with the minimum required worker capacity." message instead of machine type selection.',
      },
    },
  },
  render: (args) => {
    const { Wrapper } = withState(noQuotaList, args.hypershiftMode);

    const formInitialValues = {
      ...initialValues(args.hypershiftMode),
      [FieldId.Hypershift]: args.hypershiftMode ? 'true' : 'false',
      [FieldId.MultiAz]: args.multiAz ? 'true' : 'false',
      [FieldId.MachineType]: 'm5.large',
      [FieldId.Region]: 'us-east-1',
      [FieldId.Product]: normalizedProducts.ROSA,
      [FieldId.BillingModel]: BillingModel.standard,
      [FieldId.CloudProvider]: 'aws',
      [FieldId.ClusterVersion]: {
        id: '4.14.0',
        raw_id: '4.14.0',
        channel_group: 'stable',
      },
      [FieldId.NodeLabels]: [{ id: getRandomID() }],
    };

    return (
      <Wrapper>
        <Formik initialValues={formInitialValues} onSubmit={() => {}}>
          {args.showInWizardFramework ? (
            <div className="ocm-page" style={{ height: '100vh', padding: 0, margin: 0 }}>
              <Wizard height="100%" width="100%" className="rosa-wizard">
                <WizardStep name="Machine pool" id="machine-pool">
                  <WizardBody>
                    <MachinePoolScreen />
                  </WizardBody>
                </WizardStep>
              </Wizard>
            </div>
          ) : (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              <MachinePoolScreen />
            </div>
          )}
        </Formik>
      </Wrapper>
    );
  },
};
