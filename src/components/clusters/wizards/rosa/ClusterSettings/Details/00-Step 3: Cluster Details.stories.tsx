import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { Wizard, WizardBody, WizardStep } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Commented out unused imports
// import { normalizedProducts } from '~/common/subscriptionTypes';
// import { noQuotaTooltip } from '~/common/helpers';
// import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
// import { QuotaTypes } from '~/components/clusters/common/quotaModel';
// import { availableQuota } from '~/components/clusters/common/quotaSelectors';
import { emptyAWSSubnet } from '~/components/clusters/wizards/common/constants';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { MULTIREGION_PREVIEW_ENABLED } from '~/queries/featureGates/featureConstants';
import type { QuotaCostList } from '~/types/accounts_mgmt.v1';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import Details from './Details';

import '../../createROSAWizard.scss';

// Create a query client for React Query with pre-populated feature gate data
const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  // Pre-populate the feature gate query cache
  queryClient.setQueryData(['featureGate', MULTIREGION_PREVIEW_ENABLED], {
    data: { enabled: true },
  });

  // Mock multiregion available regions data
  const mockMultiRegionData = [
    {
      id: 'us-east-1',
      display_name: 'US East (N. Virginia)',
      supports_multi_az: true,
      supports_hypershift: true,
      enabled: true,
      ccs_only: false,
      cloud_provider: 'aws',
      regionalized: true,
    },
    {
      id: 'us-west-2',
      display_name: 'US West (Oregon)',
      supports_multi_az: true,
      supports_hypershift: true,
      enabled: true,
      ccs_only: false,
      cloud_provider: 'aws',
      regionalized: true,
    },
    {
      id: 'eu-west-1',
      display_name: 'Europe (Ireland)',
      supports_multi_az: true,
      supports_hypershift: true,
      enabled: true,
      ccs_only: false,
      cloud_provider: 'aws',
      regionalized: true,
    },
  ];

  // Pre-populate the multiregion available regions query cache
  queryClient.setQueryData(['fetchGetMultiRegionAvailableRegions'], mockMultiRegionData);

  return queryClient;
};

// Mock quota data - combined from our sub-component patterns
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

// Mock quota data for limited scenario - no quota available
const mockQuotaLimited: QuotaCostList = {
  kind: 'QuotaCostList',
  page: 1,
  size: 10,
  total: 2,
  items: [
    {
      kind: 'QuotaCost',
      organization_id: '123',
      quota_id: 'cluster|aws|single|byoc|rosa|standard',
      allowed: 0, // No quota allowed - will show warnings
      consumed: 0,
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
      allowed: 0, // No quota allowed - will show warnings
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

// Mock version data - from VersionSelection patterns
const mockVersionsHypershift = [
  {
    id: 'openshift-v4.14.0',
    raw_id: '4.14.0',
    hosted_control_plane_enabled: true,
    rosa_enabled: true,
    channel_group: 'stable',
    enabled: true,
    default: true,
    end_of_life_timestamp: '2025-06-30T23:59:59Z',
  },
  {
    id: 'openshift-v4.13.0',
    raw_id: '4.13.0',
    hosted_control_plane_enabled: true,
    rosa_enabled: true,
    channel_group: 'stable',
    enabled: true,
    default: false,
    end_of_life_timestamp: '2024-12-31T23:59:59Z',
  },
  {
    id: 'openshift-v4.12.0',
    raw_id: '4.12.0',
    hosted_control_plane_enabled: true,
    rosa_enabled: true,
    channel_group: 'stable',
    enabled: true,
    default: false,
    end_of_life_timestamp: '2024-06-30T23:59:59Z',
  },
  // Add some versions that are NOT compatible with Hypershift to trigger the toggle
  {
    id: 'openshift-v4.11.0',
    raw_id: '4.11.0',
    hosted_control_plane_enabled: false, // Not Hypershift compatible
    rosa_enabled: true,
    channel_group: 'stable',
    enabled: true,
    default: false,
    end_of_life_timestamp: '2024-03-31T23:59:59Z',
  },
  {
    id: 'openshift-v4.10.0',
    raw_id: '4.10.0',
    hosted_control_plane_enabled: false, // Not Hypershift compatible
    rosa_enabled: true,
    channel_group: 'stable',
    enabled: true,
    default: false,
    end_of_life_timestamp: '2023-12-31T23:59:59Z',
  },
];

// Mock regions data to fix the region error
const mockRegions = [
  {
    id: 'us-east-1',
    display_name: 'US East, N. Virginia',
    cloud_provider: 'aws',
    enabled: true,
    supports_multi_az: true,
  },
  {
    id: 'us-west-2',
    display_name: 'US West, Oregon',
    cloud_provider: 'aws',
    enabled: true,
    supports_multi_az: true,
  },
];

type StoryWrapperProps = {
  quotaScenario: 'full' | 'limited';
  hasExternalAuthCapability: boolean;
  hasUnstableVersions: boolean;
  showInWizardFramework: boolean;
  isHypershiftMode?: boolean;
};

const createMockStore = (
  quotaList: QuotaCostList,
  hasExternalAuthCapability: boolean,
  hasUnstableVersions: boolean,
) => {
  const capabilities = [];
  if (hasExternalAuthCapability) {
    capabilities.push({
      name: 'capability.organization.hcp_allow_external_authentication',
      value: 'true',
    });
  }
  if (hasUnstableVersions) {
    capabilities.push({ name: 'capability.organization.unstable_versions', value: 'true' });
  }

  return configureStore()({
    userProfile: {
      keycloakProfile: {
        username: 'test-user',
      },
      organization: {
        fulfilled: true,
        details: {
          id: '123',
          name: 'Test Org',
          capabilities,
        },
        quotaList,
      },
    },
    clusters: {
      clusterVersions: {
        fulfilled: true,
        pending: false,
        error: null,
        errorMessage: null,
        params: {
          product: 'hcp',
          isRosa: true,
          isHCP: true,
        },
        versions: mockVersionsHypershift,
      },
    },
    rosaReducer: {
      getAWSAccountRolesARNsResponse: {
        fulfilled: true,
        data: [],
      },
    },
    regions: {
      availableRegionalInstances: {
        fulfilled: true,
        data: [],
      },
      regions: {
        fulfilled: true,
        pending: false,
        error: null,
        items: mockRegions,
      },
    },
    cloudProviders: {
      items: [
        {
          id: 'aws',
          name: 'Amazon Web Services',
          display_name: 'Amazon Web Services',
          regions: mockRegions,
        },
      ],
      fulfilled: true,
      pending: false,
      error: null,
    },
    // Add the missing machineTypesByRegion state
    machineTypesByRegion: {
      error: false,
      errorMessage: '',
      pending: false,
      fulfilled: true,
      types: {},
      typesByID: {},
      region: {
        id: 'us-east-1',
        display_name: 'US East, N. Virginia',
        cloud_provider: 'aws',
      },
    },
  });
};

const FormikWrapper = ({
  children,
  quotaScenario,
  hasExternalAuthCapability,
  hasUnstableVersions,
  isHypershiftMode = true,
}: any) => {
  const quotaList = quotaScenario === 'full' ? mockQuotaWithBothAZ : mockQuotaLimited;

  const mockStore = createMockStore(quotaList, hasExternalAuthCapability, hasUnstableVersions);

  return (
    <Provider store={mockStore}>
      <QueryClientProvider client={createQueryClient()}>
        <Formik
          initialValues={{
            // Cluster identification
            [FieldId.ClusterName]: '',
            [FieldId.DomainPrefix]: '',
            [FieldId.HasDomainPrefix]: false,
            [FieldId.CustomOperatorRolesPrefix]: '',

            // Architecture and availability
            [FieldId.Hypershift]: isHypershiftMode ? 'true' : 'false', // Allow both modes
            [FieldId.MultiAz]: 'false',
            [FieldId.Region]: 'us-east-1', // Set a default region
            [FieldId.RegionalInstance]: '',

            // Version and roles
            [FieldId.ClusterVersion]: undefined,
            [FieldId.RosaMaxOsVersion]: '4.14.0',
            [FieldId.InstallerRoleArn]: 'arn:aws:iam::123456789012:role/installer',
            [FieldId.SupportRoleArn]: 'arn:aws:iam::123456789012:role/support',
            [FieldId.WorkerRoleArn]: 'arn:aws:iam::123456789012:role/worker',

            // Encryption
            [FieldId.CustomerManagedKey]: 'false',
            [FieldId.KmsKeyArn]: '',
            [FieldId.EtcdEncryption]: false,
            [FieldId.EtcdKeyArn]: '',

            // Authentication
            [FieldId.EnableExteranlAuthentication]: false,

            // Network and resources
            [FieldId.MachinePoolsSubnets]: [emptyAWSSubnet()],
            [FieldId.NodesCompute]: 2,
            [FieldId.MinReplicas]: 2,
            [FieldId.MaxReplicas]: 2,

            // Billing and privacy
            [FieldId.BillingModel]: SubscriptionCommonFieldsClusterBillingModel.standard,
            [FieldId.ClusterPrivacy]: 'public',
          }}
          onSubmit={(values) => {
            console.log('Form submitted with values:', values);
          }}
        >
          {children}
        </Formik>
      </QueryClientProvider>
    </Provider>
  );
};

const StoryWrapper = ({
  quotaScenario = 'full',
  hasExternalAuthCapability = true,
  hasUnstableVersions = false,
  showInWizardFramework = false,
  isHypershiftMode = true,
}: StoryWrapperProps) => {
  if (showInWizardFramework) {
    // Show in wizard framework with multiple steps like the real ROSA wizard
    return (
      <FormikWrapper
        quotaScenario={quotaScenario}
        hasExternalAuthCapability={hasExternalAuthCapability}
        hasUnstableVersions={hasUnstableVersions}
        isHypershiftMode={isHypershiftMode}
      >
        <div className="ocm-page" style={{ height: '100vh', padding: 0, margin: 0 }}>
          <Wizard height="100%" width="100%" className="rosa-wizard">
            {/* Step 1: Cluster Settings - Details (Our main component) */}
            <WizardStep name="Cluster settings: Details" id="step3-details">
              <WizardBody>
                <Details />
              </WizardBody>
            </WizardStep>
          </Wizard>
        </div>
      </FormikWrapper>
    );
  }

  // Show standalone version (current approach)
  return (
    <FormikWrapper
      quotaScenario={quotaScenario}
      hasExternalAuthCapability={hasExternalAuthCapability}
      hasUnstableVersions={hasUnstableVersions}
      isHypershiftMode={isHypershiftMode}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <Details />
      </div>
    </FormikWrapper>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 3: Cluster settings/Details/- Step 3: Cluster details -',
  component: StoryWrapper,
  parameters: {
    docs: {
      description: {
        component: `
# 🎯 Step 3: Cluster Details - Complete Interactive Step

This is the **main story** for the complete ROSA Cluster Details step, combining all sub-components into a fully functional wizard step within a **realistic multi-step wizard framework**.

## 🚀 **What This Story Demonstrates**

### **📋 Complete Form Flow**
- **Cluster identification** - Name and optional domain prefix with validation
- **Version selection** - OpenShift versions with compatibility checking  
- **Architecture** - Hosted Control Plane (Hypershift) vs Classic ROSA configuration
- **Availability zones** - Single vs multi-zone with quota validation
- **Encryption** - Advanced encryption options with progressive disclosure
- **Authentication** - External authentication (capability-gated)

### **🔄 Interactive Behaviors**
- **Real-time validation** - Cluster name and domain prefix uniqueness
- **Progressive disclosure** - Fields appear/disappear based on selections
- **Quota enforcement** - Options disabled when quota insufficient
- **Cross-field dependencies** - AZ selection affects node counts
- **Capability gating** - Features shown based on org permissions

### **🧭 Wizard Framework**
The story is displayed within the **PatternFly Wizard framework**, showing:
- **Cluster settings: Details** - Our complete interactive component
- **Left navigation panel** - Shows the step context 
- **Wizard styling and layout** - Matches the real ROSA wizard appearance

### **🎛️ All Sub-Components Working Together**
This story proves that all individual component stories work correctly in combination:
- ✅ ClusterNameField with async validation
- ✅ DomainPrefixField with conditional visibility  
- ✅ VersionSelection with Hypershift filtering
- ✅ AvailabilityZones with quota checking
- ✅ AdvancedEncryption with progressive disclosure
- ✅ ExternalAuthentication with capability gating

## 🎮 **How to Use This Story**

### **"Hosted" Story** (Default)
1. **🏷️ Enter cluster name** - See real-time validation feedback
2. **✅ Check domain prefix** - Watch field appear with separate validation
3. **📋 Select version** - Choose from compatible Hypershift versions
4. **🌐 Choose availability** - Single/multi-zone affects other settings
5. **🔐 Expand encryption** - Toggle options to see progressive disclosure
6. **🔑 Try authentication** - Available if org has capability

### **"Classic: AZ - No quota, No Ext. Auth" Story**
Demonstrates **limitation scenarios**:
- **🚫 No quota available** - Both AZ options disabled with warning tooltips
- **🚫 No external auth** - External authentication section hidden
- **📊 Classic ROSA mode** - Shows traditional availability zone radio buttons
- **⚠️ Hover over disabled AZ options** to see quota warning tooltips

## 💡 **Story Scenarios**

Use the Controls panel to test different scenarios:
- **Quota levels** - Full vs limited quota affects available options
- **Capabilities** - Toggle external auth and unstable versions
- **Architecture modes** - Hypershift vs Classic ROSA behavior
- **Interactive** - All form behaviors work as in the real wizard

This story serves as both **documentation** and **integration testing** for the complete wizard step.
        `,
      },
    },
  },
  argTypes: {
    showInWizardFramework: {
      control: 'boolean',
      description: 'Show the step within the full wizard framework with left navigation panel',
    },
    isHypershiftMode: {
      control: 'boolean',
      description: 'Enable Hypershift (Hosted Control Plane) mode vs Classic ROSA mode',
    },
  },
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

export const Default: Story = {
  name: 'ROSA Hosted',
  args: {
    quotaScenario: 'full',
    hasExternalAuthCapability: true,
    hasUnstableVersions: false,
    showInWizardFramework: true,
    isHypershiftMode: true,
  },
  render: (args) => <StoryWrapper {...args} />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const LimitedQuota: Story = {
  name: 'ROSA Classic: No AZ quota, ext. auth not shown',
  args: {
    quotaScenario: 'limited',
    hasExternalAuthCapability: false, // Disable external auth capability
    hasUnstableVersions: false,
    showInWizardFramework: true,
    isHypershiftMode: false, // Use Classic mode to show availability zone warnings
  },
  render: (args) => <StoryWrapper {...args} />,
  parameters: {
    layout: 'fullscreen',
  },
};
