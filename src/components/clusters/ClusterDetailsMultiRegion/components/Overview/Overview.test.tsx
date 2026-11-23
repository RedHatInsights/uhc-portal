import React from 'react';

import { render, screen } from '~/testUtils';

import fixtures from '../../__tests__/ClusterDetails.fixtures';

import Overview from './Overview';

jest.mock('~/hooks/useAnalytics', () => () => jest.fn());

jest.mock(
  '~/components/clusters/ClusterDetailsMultiRegion/components/common/ClusterMissingOCMRoleAlert',
  () => ({
    ClusterMissingOCMRoleAlert: () => <div data-testid="cluster-missing-ocm-role-alert" />,
  }),
);

jest.mock('./InsightsAdvisor/InsightsAdvisor', () => () => null);
jest.mock('./CostBreakdownCard', () => () => null);
jest.mock('./DetailsLeft', () => () => <div>DetailsLeft</div>);
jest.mock('./DetailsRight', () => () => <div>DetailsRight</div>);
jest.mock('./SubscriptionSettings', () => () => null);
jest.mock('~/components/AIComponents/AIDetailCard', () => () => null);
jest.mock('../Monitoring/monitoringHelper', () => ({
  hasResourceUsageMetrics: () => false,
}));

const baseCluster = fixtures.ROSAManualClusterDetails.cluster as Record<string, unknown>;
const baseAws = baseCluster.aws as Record<string, unknown>;

const rosaSTSCluster = {
  ...baseCluster,
  aws: {
    ...baseAws,
    sts: { ...(baseAws.sts as Record<string, unknown>), enabled: true },
  },
  subscription: {
    ...fixtures.ROSAManualClusterDetails.cluster.subscription,
    organization_id: '1MKVU4otCIuogoLtgtyU6wajxjW',
    cloud_account_id: '123456789012',
  },
};

const defaultProps = {
  cluster: rosaSTSCluster,
  cloudProviders: fixtures.cloudProviders,
  refresh: jest.fn(),
  insightsData: undefined,
  userAccess: { fulfilled: false, data: false },
  subscription: rosaSTSCluster.subscription,
  canSubscribeOCP: false,
  clusterDetailsLoading: false,
  isSubscriptionSettingsRequestPending: false,
  clusterDetailsFetching: false,
  displayUpgradeSettingsTab: false,
  wifConfigData: undefined,
};

describe('<Overview /> - MissingOCMRoleAlert org check', () => {
  it('renders the shared cluster OCM role alert', () => {
    render(<Overview {...defaultProps} />);

    expect(screen.getByTestId('cluster-missing-ocm-role-alert')).toBeInTheDocument();
  });
});
