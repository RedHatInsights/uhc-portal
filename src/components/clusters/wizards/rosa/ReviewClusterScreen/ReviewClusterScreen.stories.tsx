import React from 'react';
import { Form, Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { Wizard, WizardBody, WizardContext, WizardStep } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import ReviewClusterScreen from './ReviewClusterScreen';

import '../createROSAWizard.scss';

const withState = (
  initialValues: any,
  mockProps: any = {},
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: React.FC<{ children: React.ReactNode }>;
} => {
  const middlewares = [thunk, promiseMiddleware] as any[];
  const mockStore = createMockStore(middlewares);
  const store = mockStore({
    userProfile: {
      organization: {
        details: {
          capabilities: [{ name: 'capability.cluster.autoscale_clusters', value: 'true' }],
        },
      },
      keycloakProfile: {
        username: 'test-user',
      },
    },
    featureGates: {},
    modal: {
      modalName: null,
      data: {},
    },
  });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const mockWizardContext = {
    activeStep: { index: 6, name: 'Review and create' },
    steps: [],
    currentStepIndex: 6,
    goToStepByIndex: (index: number) => console.log(`Navigate to step ${index}`),
    goToStepById: (stepId: string) => console.log(`Navigate to step ${stepId}`),
    goToStepByName: (stepName: string) => console.log(`Navigate to step ${stepName}`),
    goToNextStep: () => console.log('Go to next step'),
    goToPrevStep: () => console.log('Go to previous step'),
    close: () => console.log('Close wizard'),
    footer: null,
    setFooter: () => {},
    getStep: () => null,
    hasBodyPadding: true,
    height: undefined,
    width: undefined,
  } as any;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <WizardContext.Provider value={mockWizardContext}>
          <Formik initialValues={initialValues} onSubmit={() => {}}>
            <Form>{children}</Form>
          </Formik>
        </WizardContext.Provider>
      </QueryClientProvider>
    </Provider>
  );

  return { store, Wrapper };
};

const defaultProps = {
  getUserRole: () => {},
  getOCMRole: () => {},
  getOCMRoleResponse: () => ({
    fulfilled: true,
    pending: false,
    error: false,
    data: [
      {
        aws_id: '123456789012',
        role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-OCM-Role',
      },
    ],
  }),
  getUserRoleResponse: {
    fulfilled: true,
    pending: false,
    error: false,
    data: [
      {
        aws_id: '123456789012',
        role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-User-Role',
      },
    ],
  },
  clearGetUserRoleResponse: () => {},
  clearGetOcmRoleResponse: () => {},
  createCluster: () => {},
  isSubmitPending: false,
  createClusterResponse: {
    fulfilled: false,
    error: false,
    errorMessage: '',
    pending: false,
    cluster: null,
  },
};

type StoryWrapperProps = {
  showInWizardFramework?: boolean;
  formValues?: any;
  isSubmitPending?: boolean;
  getUserRoleResponse?: any;
  getOCMRoleResponse?: any;
  createClusterResponse?: any;
};

const StoryWrapper = ({
  showInWizardFramework = true,
  formValues = {},
  ...props
}: StoryWrapperProps) => {
  const { Wrapper } = withState(formValues, props);

  const reviewProps = {
    ...defaultProps,
    ...props,
    formValues,
  };

  if (showInWizardFramework) {
    // Show in wizard framework
    return (
      <Wrapper>
        <div className="ocm-page" style={{ height: '100vh', padding: 0, margin: 0 }}>
          <Wizard height="100%" width="100%" className="rosa-wizard">
            <WizardStep name="Review and create" id="review-create">
              <WizardBody>
                <ReviewClusterScreen {...reviewProps} />
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
        <ReviewClusterScreen {...reviewProps} />
      </div>
    </Wrapper>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Step 7: Review and create',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/ReviewClusterScreen/ReviewClusterScreen.jsx',
      componentType: 'wizard-step',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['isHypershift', 'isSubmitPending', 'hasValidationErrors'],
      featureFlagDependencies: [],
      behaviors: [
        'form-validation',
        'async-submission',
        'error-handling',
        'navigation-blocking',
        'summary-display',
      ],
      step: 7,
      sharedWith: ['wizard'],
      keyComponents: [
        'ReviewClusterForm',
        'ClusterConfigurationSummary',
        'SubmitButton',
        'ValidationErrorsDisplay',
        'WizardNavigation',
      ],
      title: 'Review and Create Cluster',
    },
    docs: {
      description: {
        component:
          'Step 7 of the ROSA cluster creation wizard - Review and create cluster. Features full wizard framework integration with left navigation panel and right content area. Includes comprehensive mocking for Redux state (userProfile.organization), React Query, Formik form context, and PatternFly Wizard context. Form values include proper data structures for all valueTransform functions (arrays for node_labels, complete VPC objects with aws_subnets, etc.). Use the "Show In Wizard Framework" control to toggle between full wizard view and standalone component view.',
      },
    },
  },
  argTypes: {
    showInWizardFramework: {
      control: 'boolean',
      description: 'Show the step within the full wizard framework with left navigation panel',
    },
    isSubmitPending: {
      control: 'boolean',
      description: 'Whether cluster creation is in progress',
    },
    formValues: {
      control: 'object',
      description: 'Form values for review',
    },
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;
type Story = StoryObj<typeof StoryWrapper>;

const rosaClassicSingleAzFormValues = {
  [FieldId.Product]: 'rosa',
  [FieldId.BillingModel]: 'standard',
  [FieldId.Hypershift]: 'false',
  [FieldId.ClusterName]: 'my-rosa-classic-single-az',
  [FieldId.ClusterVersion]: { raw_id: '4.14.8', id: 'openshift-v4.14.8', channel_group: 'stable' },
  [FieldId.CloudProvider]: 'aws',
  [FieldId.Region]: 'us-east-1',
  [FieldId.MultiAz]: 'false',
  [FieldId.AssociatedAwsId]: '123456789012',
  [FieldId.InstallerRoleArn]: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
  [FieldId.SupportRoleArn]: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Support-Role',
  [FieldId.ControlPlaneRoleArn]:
    'arn:aws:iam::123456789012:role/ManagedOpenShift-ControlPlane-Role',
  [FieldId.WorkerRoleArn]: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Worker-Role',
  [FieldId.MachineType]: 'm5.xlarge',
  [FieldId.AutoscalingEnabled]: false,
  [FieldId.NodesCompute]: 3,
  [FieldId.NodeLabels]: [
    { key: 'environment', value: 'production' },
    { key: 'team', value: 'platform' },
  ],
  [FieldId.InstallToVpc]: 'true',
  [FieldId.MachinePoolsSubnets]: [
    {
      privateSubnetId: 'subnet-private-1a',
      availabilityZone: 'us-east-1a',
      publicSubnetId: 'subnet-public-1a',
    },
  ],
  [FieldId.SelectedVpc]: {
    id: 'vpc-single-az',
    name: 'Single AZ VPC',
    cidr_block: '10.0.0.0/16',
    aws_subnets: [
      {
        subnet_id: 'subnet-private-1a',
        name: 'Private Subnet 1A',
        availability_zone: 'us-east-1a',
        cidr_block: '10.0.10.0/24',
      },
      {
        subnet_id: 'subnet-public-1a',
        name: 'Public Subnet 1A',
        availability_zone: 'us-east-1a',
        cidr_block: '10.0.1.0/24',
      },
    ],
    aws_security_groups: [
      {
        id: 'sg-test-ui',
        name: 'test-ui',
        description: 'Test UI security group for ROSA Classic',
      },
      {
        id: 'sg-default-vpc',
        name: 'default-vpc-sg',
        description: 'Default VPC security group',
      },
    ],
  },
  [FieldId.SecurityGroups]: {
    applyControlPlaneToAll: true,
    controlPlane: ['sg-test-ui', 'sg-default-vpc'],
    infra: [],
    worker: [],
  },
  [FieldId.ClusterPrivacy]: 'public',
  [FieldId.NetworkMachineCidr]: '10.0.0.0/16',
  [FieldId.NetworkServiceCidr]: '172.30.0.0/16',
  [FieldId.NetworkPodCidr]: '10.128.0.0/14',
  [FieldId.NetworkHostPrefix]: '23',
  [FieldId.ApplicationIngress]: 'default',
  [FieldId.RosaRolesProviderCreationMode]: 'auto',
  [FieldId.CustomOperatorRolesPrefix]: 'rosa-cluster',
  [FieldId.UpgradePolicy]: 'manual',
  [FieldId.NodeDrainGracePeriod]: '60',
  [FieldId.EnableUserWorkloadMonitoring]: false,
  [FieldId.EtcdEncryption]: false,
  [FieldId.FipsCryptography]: false,
  [FieldId.ConfigureProxy]: false,
  [FieldId.HasDomainPrefix]: false,
  [FieldId.HttpProxyUrl]: '',
  [FieldId.HttpsProxyUrl]: '',
  [FieldId.NoProxyDomains]: [],
  [FieldId.AdditionalTrustBundle]: '',
};

const rosaClassicMultiAzFormValues = {
  ...rosaClassicSingleAzFormValues,
  [FieldId.ClusterName]: 'my-rosa-classic-multi-az',
  [FieldId.MultiAz]: 'true',
  [FieldId.NodesCompute]: 9, // 3 nodes per zone × 3 zones
  [FieldId.MachinePoolsSubnets]: [
    {
      privateSubnetId: 'subnet-private-1a',
      availabilityZone: 'us-east-1a',
      publicSubnetId: 'subnet-public-1a',
    },
    {
      privateSubnetId: 'subnet-private-1b',
      availabilityZone: 'us-east-1b',
      publicSubnetId: 'subnet-public-1b',
    },
    {
      privateSubnetId: 'subnet-private-1c',
      availabilityZone: 'us-east-1c',
      publicSubnetId: 'subnet-public-1c',
    },
  ],
  [FieldId.SelectedVpc]: {
    id: 'vpc-multi-az',
    name: 'Multi AZ VPC',
    cidr_block: '10.0.0.0/16',
    aws_subnets: [
      {
        subnet_id: 'subnet-private-1a',
        name: 'Private Subnet 1A',
        availability_zone: 'us-east-1a',
        cidr_block: '10.0.10.0/24',
      },
      {
        subnet_id: 'subnet-public-1a',
        name: 'Public Subnet 1A',
        availability_zone: 'us-east-1a',
        cidr_block: '10.0.1.0/24',
      },
      {
        subnet_id: 'subnet-private-1b',
        name: 'Private Subnet 1B',
        availability_zone: 'us-east-1b',
        cidr_block: '10.0.20.0/24',
      },
      {
        subnet_id: 'subnet-public-1b',
        name: 'Public Subnet 1B',
        availability_zone: 'us-east-1b',
        cidr_block: '10.0.2.0/24',
      },
      {
        subnet_id: 'subnet-private-1c',
        name: 'Private Subnet 1C',
        availability_zone: 'us-east-1c',
        cidr_block: '10.0.30.0/24',
      },
      {
        subnet_id: 'subnet-public-1c',
        name: 'Public Subnet 1C',
        availability_zone: 'us-east-1c',
        cidr_block: '10.0.3.0/24',
      },
    ],
    aws_security_groups: [
      {
        id: 'sg-test-ui',
        name: 'test-ui',
        description: 'Test UI security group for ROSA Classic Multi AZ',
      },
      {
        id: 'sg-default-vpc',
        name: 'default-vpc-sg',
        description: 'Default VPC security group',
      },
      {
        id: 'sg-multi-az-worker',
        name: 'multi-az-worker-sg',
        description: 'Multi AZ worker nodes security group',
      },
    ],
  },
  [FieldId.SecurityGroups]: {
    applyControlPlaneToAll: false,
    controlPlane: ['sg-test-ui'],
    infra: ['sg-default-vpc'],
    worker: ['sg-test-ui', 'sg-multi-az-worker'],
  },
};

const rosaHostedFormValues = {
  ...rosaClassicSingleAzFormValues,
  [FieldId.Hypershift]: 'true',
  [FieldId.ClusterName]: 'my-rosa-hosted-cluster',
  [FieldId.BillingAccountId]: '987654321098',
  [FieldId.SelectedVpc]: {
    id: 'vpc-12345678',
    name: 'ROSA VPC',
    cidr_block: '10.0.0.0/16',
    aws_subnets: [
      {
        subnet_id: 'subnet-private1',
        name: 'Private Subnet 1A',
        availability_zone: 'us-east-1a',
        cidr_block: '10.0.10.0/24',
      },
      {
        subnet_id: 'subnet-private2',
        name: 'Private Subnet 1B',
        availability_zone: 'us-east-1b',
        cidr_block: '10.0.20.0/24',
      },
      {
        subnet_id: 'subnet-private3',
        name: 'Private Subnet 1C',
        availability_zone: 'us-east-1c',
        cidr_block: '10.0.30.0/24',
      },
    ],
  },
  [FieldId.MachinePoolsSubnets]: [
    {
      privateSubnetId: 'subnet-private1',
      availabilityZone: 'us-east-1a',
      publicSubnetId: '',
    },
    {
      privateSubnetId: 'subnet-private2',
      availabilityZone: 'us-east-1b',
      publicSubnetId: '',
    },
    {
      privateSubnetId: 'subnet-private3',
      availabilityZone: 'us-east-1c',
      publicSubnetId: '',
    },
  ],
  [FieldId.UpgradePolicy]: 'automatic',
  [FieldId.AutomaticUpgradeSchedule]: '0 2 * * 0',
  // Note: No NodeDrainGracePeriod for Hypershift
};

const autoscalingFormValues = {
  ...rosaClassicSingleAzFormValues,
  [FieldId.AutoscalingEnabled]: true,
  [FieldId.MinReplicas]: 3,
  [FieldId.MaxReplicas]: 10,
  [FieldId.NodeLabels]: [
    { key: 'autoscaling', value: 'enabled' },
    { key: 'environment', value: 'test' },
  ],
};

export const ROSAClassicSingleAZ: Story = {
  args: {
    formValues: rosaClassicSingleAzFormValues,
    getUserRoleResponse: {
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-User-Role',
        },
      ],
    },
    getOCMRoleResponse: () => ({
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-OCM-Role',
        },
      ],
    }),
  },
};

export const ROSAClassicMultiAZ: Story = {
  args: {
    formValues: rosaClassicMultiAzFormValues,
    getUserRoleResponse: {
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-User-Role',
        },
      ],
    },
    getOCMRoleResponse: () => ({
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-OCM-Role',
        },
      ],
    }),
  },
};

export const ROSAHosted: Story = {
  args: {
    formValues: rosaHostedFormValues,
    getUserRoleResponse: {
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-User-Role',
        },
      ],
    },
    getOCMRoleResponse: () => ({
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-OCM-Role',
        },
      ],
    }),
  },
};

export const WithAutoscaling: Story = {
  args: {
    formValues: autoscalingFormValues,
    getUserRoleResponse: {
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-User-Role',
        },
      ],
    },
    getOCMRoleResponse: () => ({
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-OCM-Role',
        },
      ],
    }),
  },
};

export const SubmittingCluster: Story = {
  args: {
    formValues: rosaClassicSingleAzFormValues,
    isSubmitPending: true,
    getUserRoleResponse: {
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-User-Role',
        },
      ],
    },
    getOCMRoleResponse: () => ({
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-OCM-Role',
        },
      ],
    }),
  },
};

export const AWSRoleValidationError: Story = {
  args: {
    formValues: rosaClassicSingleAzFormValues,
    getUserRoleResponse: {
      fulfilled: false,
      pending: false,
      error: true,
      data: [], // Empty array to prevent .find() errors but still show error state
    },
    getOCMRoleResponse: () => ({
      fulfilled: false,
      pending: false,
      error: true,
      data: [], // Empty array to prevent .find() errors but still show error state
    }),
  },
};

export const WithProxyConfiguration: Story = {
  args: {
    formValues: {
      ...rosaClassicSingleAzFormValues,
      [FieldId.ClusterName]: 'rosa-with-proxy',
      [FieldId.InstallToVpc]: 'true',
      [FieldId.ConfigureProxy]: true,
      [FieldId.HttpProxyUrl]: 'http://proxy.company.com:8080',
      [FieldId.HttpsProxyUrl]: 'https://proxy.company.com:8443',
      [FieldId.NoProxyDomains]: ['localhost', '127.0.0.1', '.company.com', '.cluster.local'],
      [FieldId.AdditionalTrustBundle]:
        '-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----',
      [FieldId.SelectedVpc]: {
        id: 'vpc-proxy123',
        name: 'Proxy VPC',
        cidr_block: '172.16.0.0/16',
        aws_subnets: [
          {
            subnet_id: 'subnet-proxy1',
            name: 'Proxy Private Subnet',
            availability_zone: 'us-east-1a',
            cidr_block: '172.16.10.0/24',
          },
        ],
      },
      [FieldId.MachinePoolsSubnets]: ['subnet-proxy1'],
    },
    getUserRoleResponse: {
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-User-Role',
        },
      ],
    },
    getOCMRoleResponse: () => ({
      fulfilled: true,
      pending: false,
      error: false,
      data: [
        {
          aws_id: '123456789012',
          role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-OCM-Role',
        },
      ],
    }),
  },
};
