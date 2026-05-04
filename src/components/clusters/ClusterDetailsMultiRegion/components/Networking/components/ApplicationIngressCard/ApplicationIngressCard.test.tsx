import React from 'react';

import { GCP_EXCLUDE_NAMESPACE_SELECTORS } from '~/queries/featureGates/featureConstants';
import { mockUseChrome, mockUseFeatureGate, render, screen } from '~/testUtils';
import { Ingress } from '~/types/clusters_mgmt.v1';
import { ClusterWithPermissions } from '~/types/types';

import ApplicationIngressCard from './ApplicationIngressCard';

mockUseChrome();

const clusterResource = {
  total: { unit: '', value: 0 },
  updated_timestamp: '',
  used: { unit: '', value: 0 },
};

const baseCluster: ClusterWithPermissions = {
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

const clusterRoutersWithoutSelectors: Ingress[] = [
  {
    default: true,
    dns_name: 'apps.osd-gcp-1.devshift.org',
    id: 'v7m8',
    kind: 'Ingress',
    listening: 'external',
  },
];

const clusterRoutersWithSelectors: Ingress[] = [
  {
    ...clusterRoutersWithoutSelectors[0],
    excluded_namespace_selectors: [
      { key: 'department', values: ['finance', 'HR'] },
      { key: 'type', values: ['customer'] },
    ],
  },
];

const defaultProps = {
  cluster: baseCluster,
  clusterRoutersData: clusterRoutersWithSelectors,
  provider: 'gcp',
  refreshCluster: jest.fn(),
};

describe('<ApplicationIngressCard /> – Exclude namespace selectors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFeatureGate([]);
  });

  it('renders the exclude namespace selectors field when feature flag is ON and provider is GCP', () => {
    mockUseFeatureGate([[GCP_EXCLUDE_NAMESPACE_SELECTORS, true]]);
    render(<ApplicationIngressCard {...defaultProps} />);

    expect(screen.getByText('Exclude namespace selectors')).toBeInTheDocument();
  });

  it('displays selectors in human-readable format', () => {
    mockUseFeatureGate([[GCP_EXCLUDE_NAMESPACE_SELECTORS, true]]);
    render(<ApplicationIngressCard {...defaultProps} />);

    const input = screen.getByDisplayValue('department=[finance, HR], type=customer');
    expect(input).toBeInTheDocument();
  });

  it('shows empty value when no selectors are configured', () => {
    mockUseFeatureGate([[GCP_EXCLUDE_NAMESPACE_SELECTORS, true]]);
    render(
      <ApplicationIngressCard
        {...defaultProps}
        clusterRoutersData={clusterRoutersWithoutSelectors}
      />,
    );

    expect(screen.getByText('Exclude namespace selectors')).toBeInTheDocument();
    const input = document.getElementById('defaultRouterExcludeNamespaceSelectors');
    expect(input).toHaveValue('');
  });

  it('does NOT render the field when feature flag is OFF', () => {
    render(<ApplicationIngressCard {...defaultProps} />);

    expect(screen.queryByText('Exclude namespace selectors')).not.toBeInTheDocument();
  });

  it('does NOT render the field when provider is AWS', () => {
    mockUseFeatureGate([[GCP_EXCLUDE_NAMESPACE_SELECTORS, true]]);
    const awsCluster = {
      ...baseCluster,
      cloud_provider: { id: 'aws' },
    };

    render(<ApplicationIngressCard {...defaultProps} cluster={awsCluster} provider="aws" />);

    expect(screen.queryByText('Exclude namespace selectors')).not.toBeInTheDocument();
  });
});
