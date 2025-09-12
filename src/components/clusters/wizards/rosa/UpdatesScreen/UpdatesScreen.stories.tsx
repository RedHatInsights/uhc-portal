import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Wizard, WizardBody, WizardStep } from '@patternfly/react-core';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { baseRequestState } from '~/redux/reduxHelpers';
import { SubscriptionCommonFieldsCluster_billing_model as BillingModel } from '~/types/accounts_mgmt.v1';

import { FieldId, initialValues } from '../constants';

import UpdatesScreen from './UpdatesScreen';

import '../createROSAWizard.scss';

const withState = (
  hypershiftMode: boolean = false,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
} => {
  const store = createMockStore([thunk, promiseMiddleware as any])({
    modal: {
      modalName: null,
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
        timestamp: Date.now(),
      },
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
    featureGates: {
      ...baseRequestState,
      fulfilled: true,
      data: {},
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
  upgradePolicy?: string;
};

const StoryWrapper = ({
  showInWizardFramework = true,
  hypershiftMode = false,
  upgradePolicy = 'automatic',
}: StoryWrapperProps) => {
  const { Wrapper } = withState(hypershiftMode);

  // Create initial values based on the mode
  const formInitialValues = {
    ...initialValues(hypershiftMode),
    [FieldId.Hypershift]: hypershiftMode ? 'true' : 'false',
    [FieldId.UpgradePolicy]: upgradePolicy,
    [FieldId.AutomaticUpgradeSchedule]: '0 14 * * 2', // Tuesday 2 PM UTC
    [FieldId.NodeDrainGracePeriod]: 60, // 1 hour
    [FieldId.Region]: 'us-east-1',
    [FieldId.Product]: normalizedProducts.ROSA,
    [FieldId.BillingModel]: BillingModel.standard,
    [FieldId.CloudProvider]: 'aws',
    [FieldId.ClusterVersion]: {
      id: '4.14.0',
      raw_id: '4.14.0',
      channel_group: 'stable',
    },
  };

  if (showInWizardFramework) {
    // Show in wizard framework
    return (
      <Wrapper>
        <div className="ocm-page" style={{ height: '100vh', padding: 0, margin: 0 }}>
          <Wizard height="100%" width="100%" className="rosa-wizard">
            <WizardStep name="Cluster updates" id="cluster-updates">
              <WizardBody>
                <Formik initialValues={formInitialValues} onSubmit={() => {}}>
                  <UpdatesScreen />
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
          <UpdatesScreen />
        </Formik>
      </div>
    </Wrapper>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 6: Cluster updates',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/UpdatesScreen/UpdatesScreen.jsx',
      componentType: 'wizard-step',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['isHypershift', 'upgradePolicy === "automatic"'],
      featureFlagDependencies: [],
      behaviors: [
        'conditional-visibility',
        'schedule-validation',
        'form-reset-on-change',
        'time-zone-handling',
      ],
      step: 6,
      sharedWith: ['wizard'],
      keyComponents: [
        'UpgradeSettingsFields',
        'UpgradeScheduleSelection',
        'PodDisruptionBudgetGraceSelect',
        'AutomaticUpgradeRadioButtons',
      ],
      title: 'Cluster Updates Configuration',
    },
    docs: {
      description: {
        component: `
## ROSA Cluster Updates Configuration Step

Step 6 of the ROSA wizard handles cluster update strategy configuration, including upgrade scheduling and node draining policies.

### Key Components Integrated
- **UpgradeSettingsFields** - Main upgrade policy and scheduling configuration
- **UpgradeScheduleSelection** - Day and time selection for automatic updates
- **PodDistruptionBudgetGraceSelect** - Grace period configuration (Classic only)

### Architecture Modes
- **ROSA Classic** - Shows node draining configuration with grace period selection
- **ROSA Hosted** - Hides node draining section, control plane updates only

### Configuration Options
- **Individual updates** - Manual update scheduling
- **Recurring updates** - Automatic update scheduling with day/time selection
- **Node draining grace period** - For Classic mode, configures how long to respect pod disruption budgets
- **Critical security updates** - Information about emergency Red Hat SRE updates

### Key Differences
- **ROSA Classic**: "Individual updates" appears first, includes node draining section
- **ROSA Hosted**: "Recurring updates" appears first, no node draining section
- **Update behavior**: Classic updates entire cluster, Hosted updates control plane only
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
    upgradePolicy: {
      control: 'select',
      options: ['manual', 'automatic'],
      description: 'Upgrade policy selection',
    },
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

const baseArgs = {
  showInWizardFramework: true,
  hypershiftMode: false,
  upgradePolicy: 'automatic',
};

export const RosaClassic: Story = {
  name: 'ROSA Classic',
  args: {
    ...baseArgs,
    hypershiftMode: false,
    upgradePolicy: 'automatic',
  },
  parameters: {
    docs: {
      description: {
        story:
          'ROSA Classic cluster update configuration. Shows "Individual updates" first in radio buttons, includes node draining section with grace period selection for worker nodes.',
      },
    },
  },
};

export const RosaHosted: Story = {
  name: 'ROSA Hosted',
  args: {
    ...baseArgs,
    hypershiftMode: true,
    upgradePolicy: 'automatic',
  },
  parameters: {
    docs: {
      description: {
        story:
          'ROSA Hosted (Hypershift) cluster update configuration. Shows "Recurring updates" first in radio buttons, hides node draining section since only control plane is managed.',
      },
    },
  },
};

export const ManualUpdates: Story = {
  name: 'Manual Updates',
  args: {
    ...baseArgs,
    hypershiftMode: false,
    upgradePolicy: 'manual',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Manual update configuration showing "Individual updates" selected. Schedule picker is hidden, only shows node draining section for Classic mode.',
      },
    },
  },
};
