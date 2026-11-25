import React from 'react';

import { useGlobalState } from '~/redux/hooks';
import { render, screen } from '~/testUtils';

import fixtures from '../../__tests__/ClusterDetails.fixtures';

import Overview from './Overview';

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('~/hooks/useAnalytics', () => () => jest.fn());

jest.mock('./MissingOCMRoleAlert', () => ({
  MissingOCMRoleAlert: ({ awsAccountId }: { awsAccountId: string }) => (
    <div data-testid="missing-ocm-role-alert">OCM Role Alert {awsAccountId}</div>
  ),
}));

jest.mock('./InsightsAdvisor/InsightsAdvisor', () => () => null);
jest.mock('./CostBreakdownCard', () => () => null);
jest.mock('./DetailsLeft', () => () => <div>DetailsLeft</div>);
jest.mock('./DetailsRight', () => () => <div>DetailsRight</div>);
jest.mock('./SubscriptionSettings', () => () => null);
jest.mock('~/components/AIComponents/AIDetailCard', () => () => null);
jest.mock('../Monitoring/monitoringHelper', () => ({
  hasResourceUsageMetrics: () => false,
}));

const mockUseGlobalState = useGlobalState as jest.Mock;

const CLUSTER_ORG_ID = '1MKVU4otCIuogoLtgtyU6wajxjW';
const DIFFERENT_ORG_ID = 'differentOrgId123';

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
    organization_id: CLUSTER_ORG_ID,
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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows the OCM role alert when the user is in the same org as the cluster', () => {
    mockUseGlobalState.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        userProfile: { organization: { details: { id: CLUSTER_ORG_ID } } },
      }),
    );

    render(<Overview {...defaultProps} />);

    expect(screen.getByTestId('missing-ocm-role-alert')).toBeInTheDocument();
  });

  it('does not show the OCM role alert when the user is in a different org than the cluster', () => {
    mockUseGlobalState.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        userProfile: { organization: { details: { id: DIFFERENT_ORG_ID } } },
      }),
    );

    render(<Overview {...defaultProps} />);

    expect(screen.queryByTestId('missing-ocm-role-alert')).not.toBeInTheDocument();
  });

  it('does not show the OCM role alert when the user org ID is not yet loaded', () => {
    mockUseGlobalState.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        userProfile: { organization: { details: undefined } },
      }),
    );

    render(<Overview {...defaultProps} />);

    expect(screen.queryByTestId('missing-ocm-role-alert')).not.toBeInTheDocument();
  });
});
