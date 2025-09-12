import React from 'react';
import { Formik } from 'formik';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// import { FormGroup } from '@patternfly/react-core'; // Unused
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FieldId } from '../constants';

import VersionSelection from './VersionSelection';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock data for different scenarios
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
  {
    id: 'openshift-v4.11.0',
    raw_id: '4.11.0',
    hosted_control_plane_enabled: false, // NOT Hypershift compatible - should be disabled
    rosa_enabled: true,
    channel_group: 'stable',
    enabled: true,
    default: false,
    end_of_life_timestamp: '2024-03-31T23:59:59Z',
  },
];

const mockVersionsWithUnstable = [
  ...mockVersionsHypershift,
  {
    id: 'openshift-v4.15.0-rc.1',
    raw_id: '4.15.0-rc.1',
    hosted_control_plane_enabled: true,
    rosa_enabled: true,
    channel_group: 'candidate', // Unstable version
    enabled: true,
    default: false,
    end_of_life_timestamp: '2025-09-31T23:59:59Z',
  },
];

const mockVersionsIncompatible = [
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
  {
    id: 'openshift-v4.9.0',
    raw_id: '4.9.0',
    hosted_control_plane_enabled: false, // Not Hypershift compatible
    rosa_enabled: true,
    channel_group: 'stable',
    enabled: true,
    default: false,
    end_of_life_timestamp: '2023-06-30T23:59:59Z',
  },
];

const withState = (
  initialState: any,
): {
  store: any;
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
} => {
  const store = configureStore()({
    userProfile: {
      keycloakProfile: {
        username: 'test-user',
      },
      organization: {
        fulfilled: true,
        details: {
          id: '123',
          name: 'Test Org',
          capabilities: [{ name: 'capability.organization.unstable_versions', value: 'false' }],
        },
      },
    },
    clusters: {
      clusterVersions: {
        fulfilled: initialState.clusters?.clusterVersions?.fulfilled || true,
        pending: initialState.clusters?.clusterVersions?.pending || false,
        error: initialState.clusters?.clusterVersions?.error || null,
        errorMessage: initialState.clusters?.clusterVersions?.errorMessage || null,
        params: {
          product: 'hcp',
          isRosa: true,
          isHCP: true,
        },
        versions: initialState.clusters?.clusterVersions?.versions || mockVersionsHypershift,
      },
    },
    rosaReducer: {
      getAWSAccountRolesARNsResponse: {
        fulfilled: true,
        data: [],
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );

  return { store, Wrapper };
};

const meta: Meta<typeof VersionSelection> = {
  title: 'Wizards/ROSA/Step 3: Cluster settings/Details/VersionSelection',
  component: VersionSelection,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/ClusterSettings/VersionSelection.tsx',
      componentType: 'field',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: [
        'isHypershift',
        'unstableVersionsEnabled',
        'rosaMaxOsVersion',
        'arnCompatibility',
      ],
      featureFlagDependencies: ['ocmui-unstable-cluster-versions'],
      behaviors: [
        'version-filtering',
        'arn-compatibility-check',
        'grouping-by-support-level',
        'default-selection',
        'async-loading',
      ],
      sharedWith: ['wizard', 'cluster-details-step'],
      keyComponents: [
        'VersionDropdown',
        'VersionGrouping',
        'CompatibilityCheck',
        'LoadingState',
        'ErrorAlert',
      ],
      title: 'OpenShift Version Selection',
    },
  },
  render: (args: any, { parameters }: any) => {
    const { Wrapper } = withState({
      userProfile: {
        keycloakProfile: {
          username: 'test-user',
        },
        organization: {
          fulfilled: true,
          details: {
            id: '123',
            name: 'Test Org',
            capabilities: [{ name: 'capability.organization.unstable_versions', value: 'false' }],
          },
        },
      },
      clusters: {
        clusterVersions: {
          fulfilled: true,
          pending: false,
          error: null,
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
    });

    return (
      <Wrapper>
        <Formik
          initialValues={{
            [FieldId.ClusterVersion]: undefined,
            [FieldId.Hypershift]: 'true',
            [FieldId.RosaMaxOsVersion]: '4.14.0',
            [FieldId.InstallerRoleArn]: 'arn:aws:iam::123456789012:role/installer',
            [FieldId.SupportRoleArn]: 'arn:aws:iam::123456789012:role/support',
            [FieldId.WorkerRoleArn]: 'arn:aws:iam::123456789012:role/worker',
          }}
          onSubmit={() => {}}
        >
          <VersionSelection {...args} />
        </Formik>
      </Wrapper>
    );
  },
};

export default meta;

type Story = StoryObj<typeof VersionSelection>;

export const Default: Story = {
  name: 'Hosted',
  render: () => {
    const { store, Wrapper } = withState({
      clusters: {
        clusterVersions: {
          error: false,
          pending: false,
          fulfilled: true,
          versions: mockVersionsHypershift,
        },
      },
    });

    return (
      <Wrapper>
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
              Default Hypershift Version Selection
            </h4>
            <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Configuration:</strong> Hypershift: true,
                unstableVersions: false
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Shows:</strong> Only stable versions compatible
                with Hypershift (4.14.0 default, 4.11.0 disabled)
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Grouping:</strong> Versions categorized by
                "Full Support" vs "Maintenance Support"
              </p>
              <p style={{ margin: '0' }}>
                <strong style={{ color: '#495057' }}>Use case:</strong> Standard version selection
                for Hosted Control Plane clusters
              </p>
            </div>
          </div>

          <Formik
            initialValues={{
              [FieldId.ClusterVersion]: undefined,
              [FieldId.Hypershift]: 'true',
              [FieldId.RosaMaxOsVersion]: '4.14',
              [FieldId.InstallerRoleArn]: 'arn:aws:iam::123456789:role/Foo-Installer-Role',
              [FieldId.SupportRoleArn]: 'arn:aws:iam::123456789:role/Foo-Support-Role',
              [FieldId.WorkerRoleArn]: 'arn:aws:iam::123456789:role/Foo-Worker-Role',
            }}
            onSubmit={() => {}}
          >
            <QueryClientProvider client={queryClient}>
              <Provider store={store}>
                <VersionSelection label="Version" onChange={() => {}} />
              </Provider>
            </QueryClientProvider>
          </Formik>
        </div>
      </Wrapper>
    );
  },
};

export const WithUnstableVersionsEnabled: Story = {
  name: 'Hosted & Unstable Versions',
  render: () => {
    const { store, Wrapper } = withState({
      clusters: {
        clusterVersions: {
          error: false,
          pending: false,
          fulfilled: true,
          versions: mockVersionsWithUnstable,
        },
      },
    });

    return (
      <Wrapper>
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
              Unstable Versions Feature Gate Testing
            </h4>
            <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Configuration:</strong> Hypershift: true,
                unstableVersions: true (feature gate)
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Shows:</strong> Stable versions + unstable
                candidate/fast channel versions
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Testing:</strong> Feature gate
                'ocmui-unstable-cluster-versions' behavior
              </p>
              <p style={{ margin: '0' }}>
                <strong style={{ color: '#495057' }}>Use case:</strong> Developer/early access
                testing with pre-release versions
              </p>
            </div>
          </div>

          <Formik
            initialValues={{
              [FieldId.ClusterVersion]: undefined,
              [FieldId.Hypershift]: 'true',
              [FieldId.RosaMaxOsVersion]: '4.15',
              [FieldId.InstallerRoleArn]: 'arn:aws:iam::123456789:role/Foo-Installer-Role',
              [FieldId.SupportRoleArn]: 'arn:aws:iam::123456789:role/Foo-Support-Role',
              [FieldId.WorkerRoleArn]: 'arn:aws:iam::123456789:role/Foo-Worker-Role',
            }}
            onSubmit={() => {}}
          >
            <QueryClientProvider client={queryClient}>
              <Provider store={store}>
                <VersionSelection label="Version" onChange={() => {}} />
              </Provider>
            </QueryClientProvider>
          </Formik>
        </div>
      </Wrapper>
    );
  },
};

export const NoCompatibleVersions: Story = {
  name: 'No Compatible Versions',
  render: () => {
    const { store, Wrapper } = withState({
      clusters: {
        clusterVersions: {
          error: false,
          pending: false,
          fulfilled: true,
          versions: mockVersionsIncompatible,
        },
      },
    });

    return (
      <Wrapper>
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
              No Compatible Versions Scenario
            </h4>
            <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Configuration:</strong> All available versions
                incompatible with selected ARNs
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Shows:</strong> Error alert explaining no
                compatible versions found
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Cause:</strong> ARN version constraints exclude
                all available OpenShift versions
              </p>
              <p style={{ margin: '0' }}>
                <strong style={{ color: '#495057' }}>Use case:</strong> User needs to update ARNs or
                wait for compatible versions
              </p>
            </div>
          </div>

          <Formik
            initialValues={{
              [FieldId.ClusterVersion]: undefined,
              [FieldId.Hypershift]: 'true',
              [FieldId.RosaMaxOsVersion]: '4.14',
              [FieldId.InstallerRoleArn]: 'arn:aws:iam::123456789:role/Foo-Installer-Role',
              [FieldId.SupportRoleArn]: 'arn:aws:iam::123456789:role/Foo-Support-Role',
              [FieldId.WorkerRoleArn]: 'arn:aws:iam::123456789:role/Foo-Worker-Role',
            }}
            onSubmit={() => {}}
          >
            <QueryClientProvider client={queryClient}>
              <Provider store={store}>
                <VersionSelection label="Version" onChange={() => {}} />
              </Provider>
            </QueryClientProvider>
          </Formik>
        </div>
      </Wrapper>
    );
  },
};
