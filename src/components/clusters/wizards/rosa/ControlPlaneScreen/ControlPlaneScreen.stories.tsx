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
import {
  RelatedResourceBilling_model as RelatedResourceBillingModel,
  // SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel, // Unused
} from '~/types/accounts_mgmt.v1';

import ControlPlaneScreen from './ControlPlaneScreen';

import '../createROSAWizard.scss';
import './controlPlaneScreen.scss';

const withState = (
  initialState: any,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
} => {
  const store = createMockStore([thunk, promiseMiddleware as any])(initialState);

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

const meta: Meta<typeof ControlPlaneScreen> = {
  title: 'Wizards/ROSA/Step 1: Control Plane',
  component: ControlPlaneScreen,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/ControlPlaneScreen/ControlPlaneScreen.tsx',
      componentType: 'wizard-step',
      usage: ['Hosted'],
      conditionalLogic: ['hasHostedProductQuota', 'isMultiRegionEnabled'],
      featureFlagDependencies: ['multiregion-preview', 'quota'],
      behaviors: [
        'quota-enforcement',
        'conditional-disable',
        'form-reset-on-change',
        'cross-field-dependencies',
      ],
      step: 1,
      sharedWith: ['wizard'],
      keyComponents: [
        'HostedTile',
        'StandAloneTile',
        'WelcomeMessage',
        'PrerequisitesInfoBox',
        'RosaArchitectureRenamingAlert',
      ],
      title: 'Control Plane Architecture Selection',
    },
  },
  render: (args: any, { parameters }) => {
    const { initialState } = parameters;
    const { Wrapper } = withState(initialState);

    return (
      <Wrapper>
        <div className="ocm-page" style={{ height: '100vh', padding: 0, margin: 0 }}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <Wizard height="100%" width="100%" className="rosa-wizard">
              <WizardStep name="Control Plane" id="step1">
                <WizardBody>
                  <ControlPlaneScreen {...args} />
                </WizardBody>
              </WizardStep>
            </Wizard>
          </Formik>
        </div>
      </Wrapper>
    );
  },
};

export default meta;

type Story = StoryObj<typeof ControlPlaneScreen>;

const baseInitialState = {
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
      },
      quotaList: {
        items: [],
      },
      timestamp: 0,
    },
  },
};

export const NoHCPQuota: Story = {
  name: 'No HCP Quota',
  parameters: {
    initialState: baseInitialState,
  },
};

export const HasHCPQuota: Story = {
  name: 'Has HCP Quota',
  parameters: {
    initialState: {
      userProfile: {
        ...baseInitialState.userProfile,
        organization: {
          ...baseInitialState.userProfile.organization,
          quotaList: {
            items: [
              {
                allowed: 1,
                consumed: 0,
                related_resources: [
                  {
                    product: normalizedProducts.ROSA,
                    billing_model: RelatedResourceBillingModel.marketplace,
                    resource_name: 'cluster-rosa-hcp',
                    resource_type: 'cluster',
                    cost: 1,
                  },
                ],
              },
            ],
          },
        },
      },
    },
  },
};
