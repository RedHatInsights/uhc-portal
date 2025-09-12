import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Wizard, WizardBody, WizardStep } from '@patternfly/react-core';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { baseRequestState } from '~/redux/reduxHelpers';

import AccountsRolesScreen from './AccountsRolesScreen';

import '../createROSAWizard.scss';

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

type StoryWrapperProps = {
  showInWizardFramework?: boolean;
  // All the AccountsRolesScreen props
  organizationID: string;
  getAWSAccountIDs: () => void;
  getAWSAccountRolesARNs: () => void;
  clearGetAWSAccountIDsResponse: () => void;
  clearGetAWSAccountRolesARNsResponse: () => void;
  clearGetUserRoleResponse: () => void;
  getAWSAccountIDsResponse: any;
  getAWSAccountRolesARNsResponse: any;
  getUserRoleResponse: any;
  isHypershiftEnabled: boolean;
  isHypershiftSelected: boolean;
};

const StoryWrapper = ({
  showInWizardFramework = true,
  ...accountsRolesProps
}: StoryWrapperProps) => {
  const { Wrapper } = withState({
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
    machineTypesByRegion: {
      ...baseRequestState,
      fulfilled: true,
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
        data: ['123456789012', '987654321098'],
      },
    },
  });

  if (showInWizardFramework) {
    // Show in wizard framework
    return (
      <Wrapper>
        <div className="ocm-page" style={{ height: '100vh', padding: 0, margin: 0 }}>
          <Wizard height="100%" width="100%" className="rosa-wizard">
            <WizardStep name="Accounts and roles" id="accounts-and-roles">
              <WizardBody>
                <Formik initialValues={{}} onSubmit={() => {}}>
                  <AccountsRolesScreen {...accountsRolesProps} />
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
        <Formik initialValues={{}} onSubmit={() => {}}>
          <AccountsRolesScreen {...accountsRolesProps} />
        </Formik>
      </div>
    </Wrapper>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 2: Accounts and Roles',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/AccountsRolesScreen/AccountsRolesScreen.tsx',
      componentType: 'wizard-step',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['isHypershiftSelected', 'isHypershiftEnabled'],
      featureFlagDependencies: ['hcp-use-unmanaged'],
      behaviors: [
        'async-validation',
        'conditional-disable',
        'form-reset-on-change',
        'cross-field-dependencies',
        'error-handling',
      ],
      step: 2,
      sharedWith: ['wizard'],
      keyComponents: [
        'AWSAccountSelection',
        'AWSBillingAccount',
        'AccountRolesARNsSection',
        'WelcomeMessage',
        'PrerequisitesInfoBox',
        'AssociateAWSAccountDrawer',
      ],
      title: 'AWS Accounts and Roles Configuration',
    },
  },
  argTypes: {
    showInWizardFramework: {
      control: 'boolean',
      description: 'Show the step within the full wizard framework with left navigation panel',
    },
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

const baseArgs = {
  showInWizardFramework: true, // Enable wizard framework by default
  organizationID: '123',
  getAWSAccountIDs: () => {},
  getAWSAccountRolesARNs: () => {},
  clearGetAWSAccountIDsResponse: () => {},
  clearGetAWSAccountRolesARNsResponse: () => {},
  clearGetUserRoleResponse: () => {},
  getAWSAccountIDsResponse: {
    ...baseRequestState,
    fulfilled: true,
    data: ['123456789012', '987654321098'],
  },
  getAWSAccountRolesARNsResponse: {
    ...baseRequestState,
    fulfilled: true,
    data: [],
  },
  getUserRoleResponse: {
    ...baseRequestState,
    fulfilled: true,
    data: [],
  },
};

export const RosaHosted: Story = {
  name: 'ROSA Hosted',
  args: {
    ...baseArgs,
    isHypershiftEnabled: true,
    isHypershiftSelected: true,
    getUserRoleResponse: {
      ...baseRequestState,
      fulfilled: true,
      data: [
        { aws_id: '123456789012' }, // Matches first account in getAWSAccountIDsResponse
        { aws_id: '987654321098' }, // Matches second account for completeness
      ],
    },
    getAWSAccountRolesARNsResponse: {
      ...baseRequestState,
      fulfilled: true,
      data: [
        {
          prefix: 'ManagedOpenShift',
          managedPolicies: true,
          hcpManagedPolicies: true,
          version: '4.13.0',
          Installer: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
          Support: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Support-Role',
          Worker: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
        },
        {
          prefix: 'incompleteARNset',
          managedPolicies: true,
          hcpManagedPolicies: true,
          version: '4.13.0',
          Installer: 'arn:aws:iam::123456789012:role/incompleteARNset-HCP-ROSA-Installer-Role',
          Worker: 'arn:aws:iam::123456789012:role/incompleteARNset-HCP-ROSA-Worker-Role',
        },
        {
          prefix: 'oldARNset',
          managedPolicies: true,
          hcpManagedPolicies: true,
          version: '4.11.0',
          Installer: 'arn:aws:iam::123456789012:role/oldARNset-HCP-ROSA-Installer-Role',
          Support: 'arn:aws:iam::123456789012:role/oldARNset-HCP-ROSA-Support-Role',
          Worker: 'arn:aws:iam::123456789012:role/oldARNset-HCP-ROSA-Worker-Role',
        },
      ],
    },
  },
};

export const RosaClassic: Story = {
  name: 'ROSA Classic',
  args: {
    ...baseArgs,
    isHypershiftEnabled: false,
    isHypershiftSelected: false,
    getUserRoleResponse: {
      ...baseRequestState,
      fulfilled: true,
      data: [
        { aws_id: '123456789012' }, // Matches first account in getAWSAccountIDsResponse
        { aws_id: '987654321098' }, // Matches second account for completeness
      ],
    },
    getAWSAccountRolesARNsResponse: {
      ...baseRequestState,
      fulfilled: true,
      data: [
        {
          prefix: 'ManagedOpenShift',
          managedPolicies: false, // Classic ROSA: false for unmanaged policies
          hcpManagedPolicies: false, // Classic ROSA doesn't use HCP managed policies
          version: '4.14.15',
          Installer: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
          Support: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Support-Role',
          Worker: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Worker-Role',
          ControlPlane: 'arn:aws:iam::123456789012:role/ManagedOpenShift-ControlPlane-Role',
        },
        {
          prefix: 'CustomRoles',
          managedPolicies: false, // Classic ROSA: false for unmanaged policies
          hcpManagedPolicies: false,
          version: '4.14.15',
          Installer: 'arn:aws:iam::123456789012:role/CustomRoles-Installer-Role',
          Support: 'arn:aws:iam::123456789012:role/CustomRoles-Support-Role',
          Worker: 'arn:aws:iam::123456789012:role/CustomRoles-Worker-Role',
          ControlPlane: 'arn:aws:iam::123456789012:role/CustomRoles-ControlPlane-Role',
        },
      ],
    },
  },
};

export const RosaHostedNoAssociatedAWSAccountError: Story = {
  name: 'ROSA Hosted - No associated AWS account error',
  args: {
    ...baseArgs,
    isHypershiftEnabled: true,
    isHypershiftSelected: true,
    getAWSAccountIDsResponse: {
      ...baseRequestState,
      fulfilled: false,
      error: {
        message: 'Failed to fetch AWS account IDs',
      },
    },
  },
};

export const RosaHostedMissingRoleErrors: Story = {
  name: 'ROSA Hosted - Missing roles errors',
  args: {
    ...baseArgs,
    isHypershiftEnabled: true,
    isHypershiftSelected: true,
    getAWSAccountRolesARNsResponse: {
      fulfilled: false,
      error: true,
      pending: false,
      errorCode: 400,
      internalErrorCode: 'CLUSTERS-MGMT-400',
      errorMessage:
        "CLUSTERS-MGMT-400:\nFailed to assume role with ARN 'arn:aws:iam::624905445251:role/ManagedOpenShift-OCM-Role-15212158': operation error STS: AssumeRole, https response error StatusCode: 403, RequestID: 40314369-b5e1-4d1a-94f1-5014b7419dea, api error AccessDenied: User: arn:aws:sts::644306948063:assumed-role/RH-Managed-OpenShift-Installer/OCM is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::624905445251:role/ManagedOpenShift-OCM-Role-15212158",
    },
  },
};

export const RosaHostedNoARNsError: Story = {
  name: 'ROSA Hosted - Missing ARNs error',
  args: {
    ...baseArgs,
    isHypershiftEnabled: true,
    isHypershiftSelected: true,
    getAWSAccountRolesARNsResponse: {
      ...baseRequestState,
      fulfilled: true,
      data: [
        {
          prefix: 'myManagedRoles',
          managedPolicies: true,
          hcpManagedPolicies: true,
          version: '4.13.0',
          Installer: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Installer-Role',
          Support: undefined,
          Worker: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Worker-Role',
        },
      ],
    },
  },
};
