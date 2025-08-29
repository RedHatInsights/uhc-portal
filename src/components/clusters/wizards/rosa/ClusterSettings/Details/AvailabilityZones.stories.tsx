import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { noQuotaTooltip } from '~/common/helpers';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { QuotaTypes } from '~/components/clusters/common/quotaModel';
import { availableQuota } from '~/components/clusters/common/quotaSelectors';
import {
  getMinReplicasCount,
  getNodesCount,
} from '~/components/clusters/common/ScaleSection/AutoScaleSection/AutoScaleHelper';
import { CloudProviderType, emptyAWSSubnet } from '~/components/clusters/wizards/common/constants';
import { RadioGroupField } from '~/components/clusters/wizards/form';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import type { QuotaCostList } from '~/types/accounts_mgmt.v1';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock quota data scenarios - properly formatted for API response with related_resources
const mockQuotaWithBothAZ: QuotaCostList = {
  kind: 'QuotaCostList',
  page: 1,
  size: 10,
  total: 2,
  items: [
    {
      kind: 'QuotaCost',
      organization_id: '123',
      quota_id: 'cluster|aws|single|byoc|rosa|standard',
      allowed: 5,
      consumed: 1,
      related_resources: [
        {
          cloud_provider: 'aws',
          resource_name: 'standard-4',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard' as any,
          cost: 1,
        },
      ],
    },
    {
      kind: 'QuotaCost',
      organization_id: '123',
      quota_id: 'cluster|aws|multi|byoc|rosa|standard',
      allowed: 3,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'aws',
          resource_name: 'standard-4',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard' as any,
          cost: 1,
        },
      ],
    },
  ],
};

const mockQuotaOnlySingleAZ: QuotaCostList = {
  kind: 'QuotaCostList',
  page: 1,
  size: 10,
  total: 2,
  items: [
    {
      kind: 'QuotaCost',
      organization_id: '123',
      quota_id: 'cluster|aws|single|byoc|rosa|standard',
      allowed: 5,
      consumed: 1,
      related_resources: [
        {
          cloud_provider: 'aws',
          resource_name: 'standard-4',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'single',
          product: 'ROSA',
          billing_model: 'standard' as any,
          cost: 1,
        },
      ],
    },
    {
      kind: 'QuotaCost',
      organization_id: '123',
      quota_id: 'cluster|aws|multi|byoc|rosa|standard',
      allowed: 0,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'aws',
          resource_name: 'standard-4',
          resource_type: 'cluster',
          byoc: 'byoc',
          availability_zone_type: 'multi',
          product: 'ROSA',
          billing_model: 'standard' as any,
          cost: 1,
        },
      ],
    },
  ],
};

const createMockStore = (quotaList: QuotaCostList) =>
  configureStore()({
    userProfile: {
      keycloakProfile: {
        username: 'test-user',
      },
      organization: {
        fulfilled: true,
        details: {
          id: '123',
          name: 'Test Org',
        },
        quotaList,
      },
    },
  });

type StoryWrapperProps = {
  quotaScenario: 'both' | 'singleOnly' | 'none';
  billingModel: string;
  isHypershiftSelected: boolean;
  initialMultiAz: boolean;
};

const StoryWrapper = ({
  quotaScenario,
  billingModel = SubscriptionCommonFieldsClusterBillingModel.standard,
  isHypershiftSelected = false,
  initialMultiAz = false,
}: StoryWrapperProps) => {
  const quotaList =
    quotaScenario === 'both'
      ? mockQuotaWithBothAZ
      : quotaScenario === 'singleOnly'
        ? mockQuotaOnlySingleAZ
        : ({ kind: 'QuotaCostList', page: 1, size: 0, total: 0, items: [] } as QuotaCostList);
  const mockStore = createMockStore(quotaList);

  const hasAzResources = (isMultiAz: boolean) => {
    const params = {
      product: normalizedProducts.ROSA,
      cloudProviderID: CloudProviderType.Aws,
      isBYOC: true,
      billingModel: billingModel as any,
      isMultiAz,
    };
    const clusterQuota = availableQuota(quotaList, {
      ...params,
      resourceType: QuotaTypes.CLUSTER,
    });
    return clusterQuota >= 1;
  };

  const quotaDisabledAndTooltip = (hasQuota: boolean) =>
    hasQuota ? { disabled: false } : { disabled: true, tooltip: noQuotaTooltip };

  const availabilityZoneOptions = [
    {
      value: 'false',
      label: 'Single zone',
      popoverHint: constants.availabilityHintSingleZone,
      ...quotaDisabledAndTooltip(hasAzResources(false)),
    },
    {
      value: 'true',
      label: 'Multi-zone',
      popoverHint: constants.availabilityHintMultiZone,
      ...quotaDisabledAndTooltip(hasAzResources(true)),
    },
  ];

  return (
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Formik
            initialValues={{
              [FieldId.MultiAz]: initialMultiAz.toString(),
              [FieldId.NodesCompute]: 2,
              [FieldId.MinReplicas]: 2,
              [FieldId.MaxReplicas]: 2,
              [FieldId.MachinePoolsSubnets]: [emptyAWSSubnet()],
            }}
            onSubmit={() => {}}
          >
            {({ setFieldValue, values }) => {
              const machinePoolsSubnets = values[FieldId.MachinePoolsSubnets];

              const handleMultiAzChange = (
                _event: React.FormEvent<HTMLDivElement>,
                value: string,
              ) => {
                const isValueMultiAz = value === 'true';

                // Update node counts based on AZ selection
                setFieldValue(FieldId.NodesCompute, getNodesCount(true, isValueMultiAz, true));
                const replicas = getMinReplicasCount(
                  true,
                  isValueMultiAz,
                  true,
                  isHypershiftSelected,
                );
                setFieldValue(FieldId.MinReplicas, replicas);
                setFieldValue(FieldId.MaxReplicas, replicas);

                // Update machine pools subnets array
                const mpSubnetsReset = [machinePoolsSubnets?.[0] || emptyAWSSubnet()];
                if (isValueMultiAz) {
                  mpSubnetsReset.push(emptyAWSSubnet());
                  mpSubnetsReset.push(emptyAWSSubnet());
                }
                setFieldValue(FieldId.MachinePoolsSubnets, mpSubnetsReset);
              };

              return (
                <RadioGroupField
                  label="Availability"
                  name={FieldId.MultiAz}
                  options={availabilityZoneOptions}
                  onChange={handleMultiAzChange}
                  direction="row"
                  isRequired
                />
              );
            }}
          </Formik>
        </div>
      </QueryClientProvider>
    </Provider>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 3: Cluster settings/Details/AvailabilityZones',
  component: StoryWrapper,
  parameters: {
    docs: {
      description: {
        component: `
## Availability Zones Selection

The availability zones component allows users to choose between single-zone and multi-zone cluster deployment with sophisticated quota validation and side effects.

### Key Features
- **Quota validation** - Checks available quota for single vs multi-AZ deployments
- **Conditional disabling** - Disables options when insufficient quota is available
- **Complex side effects** - Updates node counts, replica counts, and subnet configurations
- **Integrated tooltips** - Shows quota warnings and availability zone explanations
- **Business logic** - Integrates with billing models, Hypershift mode, and resource requirements

### Business Logic
- **Single-zone** requires different quota allocation than multi-zone
- **Multi-zone** automatically adjusts to 3 subnets (one per AZ)
- **Node counts** are recalculated based on availability zone selection
- **Replica counts** follow minimum requirements for resilience

### Use Cases
- Quota-aware availability zone selection during cluster creation
- Educational tooltips explaining single vs multi-zone trade-offs
- Automatic resource calculation and subnet management
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

export const Default: Story = {
  name: 'Default',
  args: {
    quotaScenario: 'both',
    billingModel: SubscriptionCommonFieldsClusterBillingModel.standard,
    isHypershiftSelected: false,
    initialMultiAz: false,
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
          Default Availability Zones Selection
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Both single-zone and multi-zone
            options available
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Quota:</strong> Sufficient quota for both
            deployment types
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Tooltips:</strong> Hover over ? icons to see
            availability zone explanations
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Behavior:</strong> Selecting multi-zone will update
            node counts and subnet arrays
          </p>
        </div>
      </div>

      <StoryWrapper {...args} />
    </div>
  ),
};

export const QuotaLimited: Story = {
  name: 'Quota Limited (Single-Zone Only)',
  args: {
    quotaScenario: 'singleOnly',
    billingModel: SubscriptionCommonFieldsClusterBillingModel.standard,
    isHypershiftSelected: false,
    initialMultiAz: false,
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
          Quota Limited Scenario
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Multi-zone option disabled due to
            insufficient quota ⚠️
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Quota:</strong> Only single-zone quota available
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Visual:</strong> Multi-zone option is grayed out
            with quota warning tooltip
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Guides users when quota limits
            deployment options
          </p>
        </div>
      </div>

      <StoryWrapper {...args} />
    </div>
  ),
};
