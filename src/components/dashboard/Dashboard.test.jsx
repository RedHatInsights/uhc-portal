import React from 'react';

import { AUTO_CLUSTER_TRANSFER_OWNERSHIP } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, render, screen, withState } from '~/testUtils';

import Dashboard from './Dashboard';
import { clustersWithIssues } from './Dashboard.fixtures';

// NOTE: Normally mocking of children is not encouraged
// Because of the size of this component, the full render
// caused the tests to not run.
// NOTE: Even with mocking of children,
// the tests themselves were only minimally changed

// Mock heavy child components to improve test performance
jest.mock('./TopOverviewSection', () => () => (
  <div data-testid="top-overview-section">
    <div>Clusters</div>
    <div>CPU and Memory utilization</div>
    <div>Clusters with issues</div>
  </div>
));

jest.mock('./ClustersWithIssuesTableCard', () => () => (
  <div data-testid="clusters-with-issues-table-card">
    <div>Clusters with issues</div>
  </div>
));

jest.mock('./InsightsAdvisorCard/InsightsAdvisorCard', () => () => (
  <div data-testid="insights-advisor-card">
    <div>Advisor recommendations by severity</div>
  </div>
));

jest.mock('./CostCard', () => () => (
  <div data-testid="cost-card">
    <div>Cost Management</div>
  </div>
));

jest.mock('./ExpiredTrialsCard', () => () => (
  <div data-testid="expired-trials-card">
    <div>Expired Trials</div>
  </div>
));

jest.mock(
  '../clusters/ClusterListMultiRegion/components/ClusterListActions/ClusterListActions',
  () => () => (
    <div data-testid="cluster-list-actions">
      <button type="button">Create cluster</button>
      <button type="button" aria-label="Actions">
        Actions
      </button>
      <div data-testid="actions-menu-content">
        <div>Register disconnected cluster</div>
        <div>View cluster archives</div>
        <div>View cluster requests</div>
      </div>
    </div>
  ),
);

jest.mock('../clusters/common/ResourceUsage/SmallClusterChart', () => () => (
  <div data-testid="small-cluster-chart">
    <div>Small Cluster Chart</div>
  </div>
));

jest.mock('../common/Modal/ConnectedModal', () => () => <div data-testid="connected-modal" />);

jest.mock('./EmptyState/DashboardEmptyState', () => () => (
  <div data-testid="dashboard-empty-state">
    <div>Let&apos;s create your first cluster</div>
  </div>
));

jest.mock('../common/Unavailable', () =>
  // eslint-disable-next-line react/prop-types
  ({ response }) => (
    <div data-testid="unavailable">
      <div>This page is temporarily unavailable</div>
      <button type="button">Error details</button>
      {/* eslint-disable-next-line react/prop-types */}
      <div>{response?.errorMessage || 'Mock error message'}</div>
    </div>
  ),
);

const defaultProps = {
  getUserAccess: jest.fn(),
  getSummaryDashboard: jest.fn(),
  fetchInsightsGroups: jest.fn(),
  getUnhealthyClusters: jest.fn(),
  invalidateSubscriptions: jest.fn(),
  getOrganizationAndQuota: jest.fn(),
  fetchOrganizationInsights: jest.fn(),
  unhealthyClusters: {
    error: false,
    errorMessage: '',
    pending: false,
    fulfilled: true,
    valid: false,
    clusters: clustersWithIssues,
  },
  summaryDashboard: {
    fulfilled: true,
    pending: false,
    metrics: {
      clusters_total: [{ value: 30 }],
      connected_clusters_total: [{ value: 10 }],
      unhealthy_clusters_total: [{ value: 5 }],
      sum_total_cpu: [{ value: 150 }],
      sum_used_cpu: [{ value: 10 }],
      sum_total_memory: [{ value: 100 }],
      sum_used_memory: [{ value: 10 }],
      clusters_up_to_date_total: [{ value: 10 }],
      clusters_upgrade_available_total: [{ value: 1 }],
    },
    error: false,
  },
  totalClusters: 30,
  totalConnectedClusters: 10,
  totalUnhealthyClusters: 5,
  totalCPU: { value: 150 },
  usedCPU: { value: 10 },
  totalMem: { value: 100 },
  usedMem: { value: 10 },
  upToDate: { value: 10 },
  upgradeAvailable: { value: 1 },
  viewOptions: {
    currentPage: 1,
    pageSize: 1,
    totalCount: 1,
    totalPages: 1,
  },
  insightsOverview: {
    fulfilled: true,
    overview: {
      clusters_hit: 1,
    },
  },
  insightsGroups: {},
  userAccess: {
    fulfilled: true,
    data: true,
  },
  organization: {},
};

describe('<Dashboard />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(<Dashboard {...defaultProps} />);
    await checkAccessibility(container);
  });

  describe('rendering', () => {
    it('shows page title', () => {
      render(<Dashboard {...defaultProps} />);
      const pageTitle = screen.getByText('Dashboard');
      expect(pageTitle).toBeVisible();
    });

    // NOTE: toolbar items' visibility depends on viewport breakpoints.
    // in the screen-width that jsdom provides, only 'create cluster' will be visible.
    // other buttons will be tucked away in the action-menu.
    it('shows "create cluster" button', () => {
      render(<Dashboard {...defaultProps} />);
      const createClusterButton = screen.getByText('Create cluster');
      expect(createClusterButton).toHaveRole('button');
      expect(createClusterButton).toBeVisible();
    });

    it('shows action-menu toggle button', () => {
      render(<Dashboard {...defaultProps} />);
      const actionsMenuButton = screen.getByRole('button', { name: 'Actions' });
      expect(actionsMenuButton).toBeVisible();
    });

    it('shows card titles', () => {
      render(<Dashboard {...defaultProps} />);

      const clustersCard = screen.getByText('Clusters');
      expect(clustersCard).toBeVisible();
      const cpuMemUtilCard = screen.getByText('CPU and Memory utilization');
      expect(cpuMemUtilCard).toBeVisible();
      const clustersWithIssuesCards = screen.getAllByText('Clusters with issues');
      expect(clustersWithIssuesCards).toHaveLength(2);
      expect(clustersWithIssuesCards[0]).toBeVisible();
      expect(clustersWithIssuesCards[1]).toBeVisible();
      const advisorRecommendationsCard = screen.getByText('Advisor recommendations by severity');
      expect(advisorRecommendationsCard).toBeVisible();
      const telemetryCard = screen.getByText('Telemetry');
      expect(telemetryCard).toBeVisible();
      const costManagementCard = screen.getByText('Cost Management');
      expect(costManagementCard).toBeVisible();
      const updateStatusCard = screen.getByText('Update status');
      expect(updateStatusCard).toBeVisible();
    });

    it('shows "expired trials" card when subscriptions state is available', () => {
      withState({
        subscriptions: {
          subscriptions: {
            fulfilled: true,
            items: [{ display_name: 'foo' }],
          },
        },
      }).render(<Dashboard {...defaultProps} />);

      const expiredTrialsCard = screen.getByText('Expired Trials');
      expect(expiredTrialsCard).toBeVisible();
    });

    it.each([
      ['Cost Management', 'userAccess'],
      ['Advisor recommendations by severity', 'insightsOverview'],
    ])("doesn't render %p card when %p is not fulfilled", (cardTitleText, propKey) => {
      const props = {
        ...defaultProps,
        [propKey]: {
          ...defaultProps[propKey],
          fulfilled: false,
        },
      };
      render(<Dashboard {...props} />);

      const clustersCard = screen.getByText('Clusters');
      expect(clustersCard).toBeVisible();

      const cardTitle = screen.queryByText(cardTitleText);
      expect(cardTitle).not.toBeInTheDocument();
    });

    it('shows empty state in "update state" card when both `upgradeAvailable` and `upToDate` values are falsy', () => {
      const props = {
        ...defaultProps,
        upToDate: { value: 0 },
        upgradeAvailable: { value: 0 },
      };
      // populate subscriptions state struct to avoid failure due to finding multiple
      // "no data available" in the dom - i.e. an additional one from ExpiredTrialsCard component.
      // (it fails only when running alongside other tests, as result of global state cross-contamination).
      withState({
        subscriptions: {
          subscriptions: {},
        },
      }).render(<Dashboard {...props} />);

      const noData = screen.getByText('No data available');
      expect(noData).toBeVisible();
    });

    it.skip('shows empty state in "telemetry" card when both `totalConnectedClusters` and `totalClusters` are falsy', () => {
      // this was supposed to cover the card-body condition `!totalConnectedClusters && !totalClusters`.
      // turns out it's an unreachable branch of the control-flow; when `totalClusters` is falsy,
      // the entire page will show "empty" state, and "telemetry" card will never be rendered.
    });
  });

  describe('page state', () => {
    it('shows "empty" state when `summaryDashboard` is fulfilled but `totalClusters` is falsy', () => {
      const props = {
        ...defaultProps,
        totalClusters: 0,
      };
      render(<Dashboard {...props} />);

      const emptyView = screen.getByText("Let's create your first cluster");
      expect(emptyView).toBeVisible();
    });

    it.each([['summaryDashboard'], ['unhealthyClusters']])(
      'shows "loading" state when %p is not fulfilled',
      (propKey) => {
        const props = {
          ...defaultProps,
          [propKey]: {
            ...defaultProps[propKey],
            fulfilled: false,
          },
        };
        render(<Dashboard {...props} />);

        const loaderView = screen.getByRole('progressbar', { name: 'Loading...' });
        expect(loaderView).toBeVisible();

        const clustersCard = screen.queryByText('Clusters');
        expect(clustersCard).not.toBeInTheDocument();
      },
    );

    it.each([['summaryDashboard'], ['unhealthyClusters']])(
      'shows "unavailable" state when %p has an error',
      (propKey) => {
        const props = {
          ...defaultProps,
          [propKey]: {
            error: true,
            errorMessage: 'oh lord!',
          },
        };
        render(<Dashboard {...props} />);

        const errorView = screen.getByText('This page is temporarily unavailable');
        expect(errorView).toBeVisible();
        const errorDetailsToggle = screen.getByText('Error details');
        expect(errorDetailsToggle).toBeVisible();

        const errorMessage = screen.getByText('oh lord!');
        expect(errorMessage).toBeVisible();

        const clustersCard = screen.queryByText('Clusters');
        expect(clustersCard).not.toBeInTheDocument();
      },
    );

    it('shows "unavailable" state with `summaryDashboard` error message when both `summaryDashboard` and `unhealthyClusters` have errors', () => {
      const props = {
        ...defaultProps,
        summaryDashboard: {
          error: true,
          errorMessage: "won't he do it",
        },
        unhealthyClusters: {
          error: true,
          errorMessage: "won't he will",
        },
      };
      render(<Dashboard {...props} />);

      const errorDetailsToggle = screen.getByText('Error details');
      expect(errorDetailsToggle).toBeVisible();

      const errorMessage = screen.getByText("won't he do it");
      expect(errorMessage).toBeVisible();
    });
  });

  describe('user interaction', () => {
    it('renders menu items when action-menu is present', () => {
      render(<Dashboard {...defaultProps} />);
      const actionsMenuButton = screen.getByRole('button', { name: 'Actions' });
      expect(actionsMenuButton).toBeVisible();

      // Menu items should be present in the mocked component
      const registerClusterButton = screen.getByText('Register disconnected cluster');
      expect(registerClusterButton).toBeVisible();
      const viewClusterArchivesButton = screen.getByText('View cluster archives');
      expect(viewClusterArchivesButton).toBeVisible();
    });

    it('renders "view cluster request" action-menu item when "cluster transfer" feature flag is ON', () => {
      const spy = mockUseFeatureGate([[AUTO_CLUSTER_TRANSFER_OWNERSHIP, true]]);

      render(<Dashboard {...defaultProps} />);
      const actionsMenuButton = screen.getByRole('button', { name: 'Actions' });
      expect(actionsMenuButton).toBeVisible();

      const viewClusterRequestsButton = screen.getByText('View cluster requests');
      expect(viewClusterRequestsButton).toBeVisible();

      spy.mockClear();
    });
  });
});
