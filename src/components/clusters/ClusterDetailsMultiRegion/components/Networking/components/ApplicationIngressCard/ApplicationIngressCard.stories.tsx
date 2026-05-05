import React from 'react';
import { Provider } from 'react-redux';

import { configureStore, type Reducer } from '@reduxjs/toolkit';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import modalReducer from '~/components/common/Modal/ModalReducer';
import { GCP_EXCLUDE_NAMESPACE_SELECTORS } from '~/queries/featureGates/featureConstants';
import { Ingress } from '~/types/clusters_mgmt.v1';
import { ClusterWithPermissions } from '~/types/types';

import ApplicationIngressCard from './ApplicationIngressCard';

const FEATURE_GATE_QUERY_KEY = 'featureGate' as const;

function buildQueryClient(excludeNamespaceSelectorsEnabled: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData([FEATURE_GATE_QUERY_KEY, GCP_EXCLUDE_NAMESPACE_SELECTORS], {
    data: { enabled: excludeNamespaceSelectorsEnabled },
  });
  return queryClient;
}

function buildStore() {
  return configureStore({
    reducer: { modal: modalReducer as Reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  });
}

const clusterResource = {
  total: { unit: '', value: 0 },
  updated_timestamp: '',
  used: { unit: '', value: 0 },
};

const gcpCluster: ClusterWithPermissions = {
  openshift_version: '4.13.4',
  cloud_provider: { id: 'gcp' },
  console: { url: 'consoleURL' },
  canEdit: true,
  status: { configuration_mode: 'full' },
  aws: { sts: { enabled: false } },
  state: 'ready',
  hypershift: { enabled: false },
  metrics: {
    cloud_provider: 'gcp',
    cluster_type: 'osd',
    compute_nodes_cpu: clusterResource,
    compute_nodes_memory: clusterResource,
    compute_nodes_sockets: clusterResource,
    console_url: '',
    cpu: clusterResource,
    critical_alerts_firing: 0,
    memory: clusterResource,
    nodes: {},
    non_virt_nodes: 0,
    openshift_version: '4.13.4',
    operating_system: '',
    operators_condition_failing: 0,
    region: '',
    sockets: clusterResource,
    state: 'ready',
    state_description: '',
    storage: clusterResource,
    subscription_cpu_total: 0,
    subscription_obligation_exists: 0,
    subscription_socket_total: 0,
    upgrade: {},
  },
};

const baseIngress: Ingress = {
  default: true,
  dns_name: 'apps.osd-gcp-1.devshift.org',
  id: 'v7m8',
  kind: 'Ingress',
  listening: 'external',
};

const ingressWithSelectors: Ingress[] = [
  {
    ...baseIngress,
    excluded_namespace_selectors: [
      { key: 'department', values: ['finance', 'HR'] },
      { key: 'type', values: ['customer'] },
    ],
  },
];

const ingressWithoutSelectors: Ingress[] = [baseIngress];

type StoryShellProps = {
  cluster?: ClusterWithPermissions;
  clusterRoutersData?: Ingress[];
  provider?: string;
  excludeNamespaceSelectorsFeatureGate?: boolean;
};

function ApplicationIngressCardStoryShell({
  cluster = gcpCluster,
  clusterRoutersData = ingressWithSelectors,
  provider = 'gcp',
  excludeNamespaceSelectorsFeatureGate = false,
}: StoryShellProps) {
  const store = React.useMemo(() => buildStore(), []);
  const queryClient = React.useMemo(
    () => buildQueryClient(excludeNamespaceSelectorsFeatureGate),
    [excludeNamespaceSelectorsFeatureGate],
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ApplicationIngressCard
          cluster={cluster}
          clusterRoutersData={clusterRoutersData}
          provider={provider}
          refreshCluster={() => {}}
        />
      </QueryClientProvider>
    </Provider>
  );
}

const meta = {
  title: 'ClusterDetails/Networking/ApplicationIngressCard',
  component: ApplicationIngressCardStoryShell,
  decorators: [
    (Story) => (
      <div style={{ margin: '0 .5em 2em', maxWidth: '56rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ApplicationIngressCardStoryShell>;

export default meta;

type Story = StoryObj<typeof ApplicationIngressCardStoryShell>;

export const GcpWithSelectors: Story = {
  name: 'GCP + gate ON + selectors configured',
  args: {
    excludeNamespaceSelectorsFeatureGate: true,
    clusterRoutersData: ingressWithSelectors,
  },
};

export const GcpNoSelectors: Story = {
  name: 'GCP + gate ON + no selectors',
  args: {
    excludeNamespaceSelectorsFeatureGate: true,
    clusterRoutersData: ingressWithoutSelectors,
  },
};

export const GcpGateOff: Story = {
  name: 'GCP + gate OFF (selectors hidden)',
  args: {
    excludeNamespaceSelectorsFeatureGate: false,
  },
};

export const AwsGateOn: Story = {
  name: 'AWS + gate ON (selectors hidden)',
  args: {
    excludeNamespaceSelectorsFeatureGate: true,
    provider: 'aws',
    cluster: {
      ...gcpCluster,
      cloud_provider: { id: 'aws' },
    },
  },
};
