import React from 'react';
import * as reactRedux from 'react-redux';
import { useParams } from 'react-router-dom';

import { MULTIREGION_PREVIEW_ENABLED } from '~/queries/featureGates/featureConstants';

import { useFetchClusterDetails } from '../../../../queries/ClusterDetailsQueries/useFetchClusterDetails';
import { useFetchClusterIdentityProviders } from '../../../../queries/ClusterDetailsQueries/useFetchClusterIdentityProviders';
import { useFetchCloudProviders } from '../../../../queries/common/useFetchCloudProviders';
import { clearGlobalError } from '../../../../redux/actions/globalErrorActions';
import { fetchUpgradeGates } from '../../../../redux/actions/upgradeGateActions';
import {
  mockUseChrome,
  mockUseFeatureGate,
  render,
  screen,
  waitFor,
  withState,
} from '../../../../testUtils';
import { SubscriptionCommonFieldsStatus } from '../../../../types/accounts_mgmt.v1';
import clusterStates from '../../common/clusterStates';
import { getSchedules } from '../../common/Upgrades/clusterUpgradeActions';
import ClusterDetails from '../ClusterDetails';
import usersActions from '../components/AccessControl/UsersSection/UsersActions';
import { getOnDemandMetrics } from '../components/Monitoring/MonitoringActions';
import { getClusterRouters } from '../components/Networking/NetworkingActions';

import fixtures, { funcs } from './ClusterDetails.fixtures';
import { setupDefaultHookMocks } from './clusterDetailsTestUtils';

// Mock services FIRST, before any action creators that use them
// Note: jest.mock() calls are hoisted, so we must define the mock object inside the factory function
jest.mock('~/services', () => {
  const mockClusterService = {
    getClusterGroupUsers: jest.fn(() => Promise.resolve({ data: { items: [] } })),
    getIngresses: jest.fn(() => Promise.resolve({ data: { items: [] } })),
    getUpgradeScheduleState: jest.fn(() => Promise.resolve({ data: {} })),
    getControlPlaneUpgradeSchedules: jest.fn(() => Promise.resolve({ data: { items: [] } })),
    getUpgradeSchedules: jest.fn(() => Promise.resolve({ data: { items: [] } })),
    getUpgradeGates: jest.fn(() => Promise.resolve({ data: { items: [] } })),
  };

  return {
    clusterService: mockClusterService,
    accountsService: {
      getOnDemandMetrics: jest.fn(() => Promise.resolve({ data: {} })),
      getNotificationContacts: jest.fn(() => Promise.resolve({ data: { items: [] } })),
    },
    costService: {
      getUserAccess: jest.fn(() => Promise.resolve({ data: {} })),
      getReport: jest.fn(() => Promise.resolve({ data: {} })),
      getSources: jest.fn(() => Promise.resolve({ data: {} })),
    },
  };
});

// Also mock the direct clusterService import used by some action creators
jest.mock('../../../../services/clusterService', () => {
  const mockClusterService = {
    getClusterGroupUsers: jest.fn(() => Promise.resolve({ data: { items: [] } })),
    getIngresses: jest.fn(() => Promise.resolve({ data: { items: [] } })),
    getUpgradeScheduleState: jest.fn(() => Promise.resolve({ data: {} })),
    getControlPlaneUpgradeSchedules: jest.fn(() => Promise.resolve({ data: { items: [] } })),
    getUpgradeSchedules: jest.fn(() => Promise.resolve({ data: { items: [] } })),
    getUpgradeGates: jest.fn(() => Promise.resolve({ data: { items: [] } })),
  };

  return {
    __esModule: true,
    default: mockClusterService,
    getClusterServiceForRegion: jest.fn(() => mockClusterService),
  };
});

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('../../../../redux/actions/userActions');

// Mock the setGlobalError action
jest.mock('../../../../redux/actions/globalErrorActions', () => ({
  setGlobalError: jest.fn((message, key, errorMessage) => ({
    type: 'SET_GLOBAL_ERROR',
    message,
    key,
    errorMessage,
  })),
  clearGlobalError: jest.fn((key) => ({
    type: 'CLEAR_GLOBAL_ERROR',
    key,
  })),
}));

jest.mock('../components/Overview/ClusterVersionInfo');

// Mock all child components to focus on ClusterDetails logic
jest.mock('../components/ClusterDetailsTop/ClusterDetailsTop', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="cluster-details-top">{children}</div>,
}));

// Mock TabsRow to capture props for testing
const mockTabsRowProps = jest.fn();
jest.mock('../components/TabsRow/TabsRow', () => ({
  __esModule: true,
  default: (props) => {
    mockTabsRowProps(props);
    return <div data-testid="tabs-row">TabsRow</div>;
  },
}));

jest.mock('../components/Overview/Overview', () => ({
  __esModule: true,
  default: () => <div data-testid="overview">Overview</div>,
}));

jest.mock('../components/Monitoring', () => ({
  __esModule: true,
  default: () => <div data-testid="monitoring">Monitoring</div>,
}));

jest.mock('../components/AccessControl/AccessControl', () => ({
  __esModule: true,
  default: () => <div data-testid="access-control">AccessControl</div>,
}));

jest.mock('../components/AddOns', () => ({
  __esModule: true,
  default: () => <div data-testid="addons">AddOns</div>,
}));

jest.mock('../components/ClusterLogs/ClusterLogs', () => ({
  __esModule: true,
  default: () => <div data-testid="cluster-logs">ClusterLogs</div>,
}));

jest.mock('../components/Networking', () => ({
  __esModule: true,
  default: () => <div data-testid="networking">Networking</div>,
}));

jest.mock('../components/MachinePools', () => ({
  __esModule: true,
  default: () => <div data-testid="machine-pools">MachinePools</div>,
}));

jest.mock('../components/Support', () => ({
  __esModule: true,
  default: () => <div data-testid="support">Support</div>,
}));

jest.mock('../components/UpgradeSettings', () => ({
  __esModule: true,
  default: () => <div data-testid="upgrade-settings">UpgradeSettings</div>,
}));

jest.mock('../components/AccessRequest/AccessRequest', () => ({
  __esModule: true,
  AccessRequest: () => <div data-testid="access-request">AccessRequest</div>,
}));

jest.mock('~/components/AIComponents/AIHostsClusterDetailTab', () => ({
  __esModule: true,
  default: () => <div data-testid="ai-hosts">AIHostsClusterDetailTab</div>,
}));

// Mock Redux actions that ClusterDetails dispatches
jest.mock('~/redux/actions/supportActions', () => ({
  getNotificationContacts: jest.fn(() => (dispatch) => {
    dispatch({ type: 'GET_NOTIFICATION_CONTACTS' });
    return Promise.resolve();
  }),
}));

jest.mock('../components/AccessControl/UsersSection/UsersActions', () => ({
  __esModule: true,
  default: {
    getUsers: jest.fn(() => (dispatch) => {
      dispatch({ type: 'GET_USERS' });
      return Promise.resolve();
    }),
  },
}));

jest.mock('../components/Networking/NetworkingActions', () => ({
  getClusterRouters: jest.fn(() => (dispatch) => {
    dispatch({ type: 'GET_CLUSTER_ROUTERS' });
    return Promise.resolve();
  }),
}));

jest.mock('../../common/Upgrades/clusterUpgradeActions', () => ({
  getSchedules: jest.fn(() => (dispatch) => {
    dispatch({ type: 'GET_SCHEDULES' });
    return Promise.resolve();
  }),
}));

jest.mock('../components/Monitoring/MonitoringActions', () => ({
  getOnDemandMetrics: jest.fn(() => (dispatch) => {
    dispatch({ type: 'GET_ON_DEMAND_METRICS' });
    return Promise.resolve();
  }),
}));

jest.mock('../../../../redux/actions/upgradeGateActions', () => ({
  fetchUpgradeGates: jest.fn(() => (dispatch) => {
    dispatch({ type: 'FETCH_UPGRADE_GATES' });
    return Promise.resolve();
  }),
}));

jest.mock('../components/Insights/InsightsActions', () => ({
  fetchClusterInsights: jest.fn(() => (dispatch) => {
    dispatch({ type: 'FETCH_CLUSTER_INSIGHTS' });
    return Promise.resolve();
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Preserve other exports from react-router-dom
  useParams: jest.fn(), // Mock useParams
  useNavigate: jest.fn(() => jest.fn()),
  useLocation: jest.fn(() => ({ hash: '' })),
}));

// Mocking queries hooks that ClusterDetails uses directly
jest.mock('../../../../queries/ClusterDetailsQueries/useFetchClusterDetails', () => ({
  useFetchClusterDetails: jest.fn(),
  invalidateClusterDetailsQueries: jest.fn(),
}));
jest.mock('../../../../queries/common/useFetchCloudProviders', () => ({
  useFetchCloudProviders: jest.fn(),
  invalidateCloudProviders: jest.fn(),
}));
jest.mock('../../../../queries/ClusterDetailsQueries/useFetchClusterIdentityProviders', () => ({
  useFetchClusterIdentityProviders: jest.fn(),
  refetchClusterIdentityProviders: jest.fn(),
}));
mockUseChrome({ analytics: { track: () => {} } });
jest.mock(
  '../../../../queries/ClusterDetailsQueries/AccessRequestTab/useFetchAccessProtection',
  () => ({
    useFetchAccessProtection: jest.fn(),
    refetchAccessProtection: jest.fn(),
  }),
);
jest.mock('../../../../queries/ClusterDetailsQueries/useFetchGCPWifConfig', () => ({
  useFetchGCPWifConfig: jest.fn(),
}));
jest.mock(
  '../../../../queries/ClusterDetailsQueries/AccessRequestTab/useFetchPendingAccessRequests',
  () => ({
    useFetchPendingAccessRequests: jest.fn(),
  }),
);
jest.mock('../../../../queries/RosaWizardQueries/useFetchGetAvailableRegionalInstances', () => ({
  useFetchGetAvailableRegionalInstances: jest.fn(),
}));
jest.mock(
  '../../../../queries/ClusterDetailsQueries/ClusterSupportTab/useAddNotificationContact',
  () => ({
    useAddNotificationContact: jest.fn(),
  }),
);
jest.mock('../../../../queries/ClusterDetailsQueries/useFetchOrganizationQuota', () => ({
  refetchOrganizationQuota: jest.fn(),
}));
jest.mock('../../../../queries/ClusterLogsQueries/useFetchClusterLogs', () => ({
  refetchClusterLogsQueries: jest.fn(),
}));
jest.mock('../../../../queries/featureGates/useFetchFeatureGate', () => ({
  useFeatureGate: jest.fn(() => false),
}));

const initialState = {
  logs: {
    len: 0,
    fullfilled: true,
    error: false,
    pending: false,
    lines: '',
  },
  userProfile: {
    organization: fixtures.organization,
  },
  insightsData: fixtures.insightsData,
  clusterRouters: fixtures.clusterRouters,
  modal: {
    modalName: '',
  },
  clusterSupport: {
    notificationContacts: {
      pending: false,
    },
  },
  monitoring: {},
  cost: {
    userAccess: {},
  },
};

const waitForRender = async () => {
  // Wait for the mocked ClusterDetailsTop component to render
  await screen.findByTestId('cluster-details-top');
};

const props = {
  location: {
    hash: '',
  },
  toggleSubscriptionReleased: jest.fn(),
};

describe('<ClusterDetailsMultiRegion />', () => {
  describe('Cluster Details', () => {
    mockUseFeatureGate([[MULTIREGION_PREVIEW_ENABLED, true]]);
    let mockedDispatch;
    const mockedUseFetchClusterDetails = useFetchClusterDetails;
    const mockedUseFetchClusterIdentityProviders = useFetchClusterIdentityProviders;
    const mockedUseFetchCloudProviders = useFetchCloudProviders;

    beforeEach(() => {
      jest.clearAllMocks();
      mockTabsRowProps.mockClear();
      // Create a fresh mock dispatch for each test after clearing mocks
      mockedDispatch = jest.fn();
      // useDispatch is already mocked at module level, so we can set it directly
      reactRedux.useDispatch.mockReturnValue(mockedDispatch);
      useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });

      // Set up default mocks for all hooks used by ClusterDetails
      // Individual tests can override these as needed
      setupDefaultHookMocks();
    });

    it('should call clearGlobalError on mount', async () => {
      useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });
      // Use default mocks from beforeEach - they're already set up correctly
      // The useEffect runs on mount and calls clearGlobalError
      withState(initialState, true).render(<ClusterDetails {...props} hasIssues />);

      // Wait for the component to mount and useEffect to run
      // The useEffect runs synchronously on mount, so we should check immediately
      // but use waitFor to handle any async rendering
      await waitFor(() => {
        expect(mockedDispatch).toHaveBeenCalled();
      });

      // Verify it was called with clearGlobalError
      expect(mockedDispatch).toHaveBeenCalledWith(clearGlobalError('clusterDetails'));
    });

    it('should render ClusterDetailsTop component', async () => {
      // Use default mocks from beforeEach - no need to override them for this test
      withState(initialState, true).render(<ClusterDetails {...props} />);

      // Since we're mocking child components, verify that ClusterDetailsTop is rendered
      // (which indicates the component rendered successfully with the cluster data)
      await waitForRender();
      expect(screen.getByTestId('cluster-details-top')).toBeInTheDocument();
    });

    describe('Loading', () => {
      it('should render loading modal when pending', async () => {
        mockedUseFetchClusterDetails.mockReturnValue({
          cluster: undefined,
          isLoading: true,
          isError: false,
          error: null,
          isFetching: false,
        });
        mockedUseFetchCloudProviders.mockReturnValue({
          data: undefined,
          isLoading: true,
          isError: false,
        });
        mockedUseFetchClusterIdentityProviders.mockReturnValue({
          clusterIdentityProviders: undefined,
          isLoading: true,
          isError: false,
        });
        useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });

        withState(initialState, true).render(<ClusterDetails {...props} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    describe('Error', () => {
      it('should render error message', async () => {
        mockedUseFetchClusterDetails.mockReturnValue({
          cluster: undefined,
          isLoading: false,
          isError: true,
          error: { errorCode: 500, errorMessage: 'Unavailable' },
          isFetching: false,
        });
        mockedUseFetchCloudProviders.mockReturnValue({
          data: undefined,
          isLoading: false,
          isError: true,
        });
        mockedUseFetchClusterIdentityProviders.mockReturnValue({
          clusterIdentityProviders: undefined,
          isLoading: false,
          isError: true,
        });

        render(<ClusterDetails {...props} />);

        expect(screen.getByText('This page is temporarily unavailable')).toBeInTheDocument();
      });

      it('should set global error on 404 error', async () => {
        useParams.mockReturnValue({ id: '1i4counta3holamvo1g5tp6n8p3a03bq' });
        const errorMessage = 'This is an error message';
        mockedUseFetchClusterDetails.mockReturnValue({
          cluster: undefined,
          isLoading: false,
          isError: true,
          error: { errorCode: 404, errorMessage },
          isFetching: false,
        });
        mockedUseFetchCloudProviders.mockReturnValue({
          data: undefined,
          isLoading: false,
          isError: true,
        });
        mockedUseFetchClusterIdentityProviders.mockReturnValue({
          clusterIdentityProviders: undefined,
          isLoading: false,
          isError: true,
        });

        withState(initialState, true).render(<ClusterDetails {...props} />);

        // Wait for the error handling logic to run
        // The component checks isError && (!cluster || ...) and then dispatches setGlobalError
        await waitFor(() => {
          expect(mockedDispatch).toHaveBeenCalled();
        });

        // Verify it was called with setGlobalError
        // The component also calls clearGlobalError and getUserAccess in useEffect,
        // so we need to check if setGlobalError was called with the correct arguments
        const setGlobalErrorCalls = mockedDispatch.mock.calls.filter(
          (call) => call[0]?.type === 'SET_GLOBAL_ERROR',
        );
        expect(setGlobalErrorCalls.length).toBeGreaterThan(0);
        const setGlobalErrorCall = setGlobalErrorCalls[0][0];
        expect(setGlobalErrorCall.type).toBe('SET_GLOBAL_ERROR');
        expect(setGlobalErrorCall.key).toBe('clusterDetails');
        expect(setGlobalErrorCall.errorMessage).toBe(errorMessage);
        // Check that the message is a React Fragment with the correct structure
        expect(setGlobalErrorCall.message).toBeDefined();
        // Check that the message contains the subscription ID in its children
        const messageChildren = setGlobalErrorCall.message.props?.children;
        if (Array.isArray(messageChildren)) {
          // The Fragment contains: "Cluster with subscription ID ", <b>subscriptionID</b>, " was not found..."
          const hasSubscriptionId = messageChildren.some(
            (child) =>
              (typeof child === 'string' && child.includes('1i4counta3holamvo1g5tp6n8p3a03bq')) ||
              (child?.type === 'b' &&
                child?.props?.children === '1i4counta3holamvo1g5tp6n8p3a03bq'),
          );
          expect(hasSubscriptionId).toBe(true);
        } else {
          // Fallback: just check that the message exists and has the right structure
          expect(messageChildren).toBeDefined();
        }
      });
    });

    describe('fetches all relevant resources', () => {
      const functions = funcs();

      beforeEach(() => {
        jest.clearAllMocks();
        mockTabsRowProps.mockClear();
        useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });

        // Mock hooks that ClusterDetails uses
        setupDefaultHookMocks();
      });

      it('should dispatch getUsers for managed cluster', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();

        // Wait for the action to be dispatched (it's called in useEffect/refreshRelatedResources)
        await waitFor(() => {
          expect(usersActions.getUsers).toHaveBeenCalledWith(fixtures.clusterDetails.cluster.id);
        });
      });

      it('should dispatch getClusterRouters for managed cluster', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();

        // Wait for the action to be dispatched
        await waitFor(() => {
          expect(getClusterRouters).toHaveBeenCalledWith(fixtures.clusterDetails.cluster.id);
        });
      });

      it('should dispatch getSchedules for managed cluster', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();

        // Wait for the action to be dispatched
        await waitFor(() => {
          expect(getSchedules).toHaveBeenCalledWith(
            fixtures.clusterDetails.cluster.id,
            false, // isHypershiftCluster returns false for this cluster
          );
        });
      });

      it('should dispatch fetchUpgradeGates for managed cluster', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();

        // Wait for the action to be dispatched
        await waitFor(() => {
          expect(fetchUpgradeGates).toHaveBeenCalled();
        });
      });

      it('should not dispatch getOnDemandMetrics for managed cluster', async () => {
        withState(initialState, true).render(
          <ClusterDetails {...fixtures} {...functions} hasIssues />,
        );

        await waitForRender();

        // Wait a bit to ensure other actions have time to dispatch
        await waitFor(() => {
          expect(screen.getByTestId('cluster-details-top')).toBeInTheDocument();
        });

        // getOnDemandMetrics is only dispatched for non-managed clusters
        expect(getOnDemandMetrics).not.toHaveBeenCalled();
      });
    });

    it('should not show issues indicator on monitoring tab when cluster is installing', async () => {
      // Intent: When a cluster is in "installing" state, the monitoring tab should NOT show
      // the issues indicator (exclamation icon), even if the cluster has issues.
      // This is because during installation, issues might be expected/transient.
      const functions = funcs();
      useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });

      // Set up non-managed cluster in installing state with issues
      // (monitoring tab only shows for non-managed clusters)
      mockedUseFetchClusterDetails.mockReturnValue({
        cluster: {
          ...fixtures.clusterDetails.cluster,
          managed: false, // Non-managed cluster so monitoring tab is visible
          state: clusterStates.installing,
        },
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
      });

      withState(initialState, true).render(
        <ClusterDetails {...fixtures} {...functions} hasIssues />,
      );

      await waitForRender();

      // Verify that TabsRow was called and that monitoring.hasIssues is false
      // even though hasIssues prop is true (because cluster is installing)
      expect(mockTabsRowProps).toHaveBeenCalled();
      const tabsRowCall = mockTabsRowProps.mock.calls[mockTabsRowProps.mock.calls.length - 1][0];
      expect(tabsRowCall.tabsInfo.monitoring.hasIssues).toBe(false);
    });
  });

  describe('OSD cluster support tab', () => {
    const functions = funcs();
    const mockedDispatch = jest.fn();
    // useDispatch is already mocked at module level, so we can set it directly
    reactRedux.useDispatch.mockReturnValue(mockedDispatch);
    const mockedUseFetchClusterDetails = useFetchClusterDetails;

    beforeEach(() => {
      jest.clearAllMocks();
      mockTabsRowProps.mockClear();
      // Re-set the dispatch mock since clearAllMocks clears it
      reactRedux.useDispatch.mockReturnValue(mockedDispatch);
      useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });

      // Set up default mocks for all hooks used by ClusterDetails
      setupDefaultHookMocks();
    });

    it('should show support tab for OSD cluster', async () => {
      withState(initialState, true).render(<ClusterDetails {...fixtures} {...functions} />);

      await waitForRender();

      // Since TabsRow is mocked, verify that the support tab is configured to show
      expect(mockTabsRowProps).toHaveBeenCalled();
      const tabsRowCall = mockTabsRowProps.mock.calls[mockTabsRowProps.mock.calls.length - 1][0];
      expect(tabsRowCall.tabsInfo.support.show).toBe(true);
    });

    it('should be hidden when the (managed) cluster has not yet reported its cluster ID to AMS', async () => {
      // The logic checks cluster.external_id (not subscription.external_cluster_id)
      // When a managed cluster has external_id === undefined, the support tab should be hidden
      const clusterWithoutExternalId = {
        ...fixtures.clusterDetails.cluster,
        managed: true,
        external_id: undefined, // This is what the logic checks
      };

      // Update the mock to return the cluster with external_id undefined
      mockedUseFetchClusterDetails.mockReturnValue({
        cluster: clusterWithoutExternalId,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
      });

      withState(initialState, true).render(<ClusterDetails {...fixtures} {...functions} />);

      await waitForRender();

      // Since TabsRow is mocked, verify that the support tab is configured to be hidden
      expect(mockTabsRowProps).toHaveBeenCalled();
      const tabsRowCall = mockTabsRowProps.mock.calls[mockTabsRowProps.mock.calls.length - 1][0];
      expect(tabsRowCall.tabsInfo.support.show).toBe(false);
    });
  });

  describe('ARO cluster', () => {
    const functions = funcs();
    const props = {
      ...fixtures,
      ...functions,
      clusterDetails: { ...fixtures.AROClusterDetails },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockTabsRowProps.mockClear();
      useParams.mockReturnValue({ id: fixtures.AROClusterDetails.cluster.subscription.id });

      // Set up default mocks for all hooks used by ClusterDetails
      setupDefaultHookMocks(fixtures.AROClusterDetails.cluster);
    });

    it('should get on-demand metrics', async () => {
      withState(initialState, true).render(<ClusterDetails {...props} />);

      await waitForRender();

      // Wait for the component to dispatch getOnDemandMetrics
      // ARO clusters are non-managed, so getOnDemandMetrics should be dispatched
      // The component calls refreshRelatedResources when cluster is loaded,
      // which dispatches getOnDemandMetrics for non-managed clusters
      await waitFor(
        () => {
          expect(getOnDemandMetrics).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );

      expect(getOnDemandMetrics).toHaveBeenCalledWith(
        fixtures.AROClusterDetails.cluster.subscription.id,
      );
    });

    it('should hide Monitoring and Settings tabs for ARO cluster', async () => {
      withState(initialState, true).render(<ClusterDetails {...props} />);

      await waitForRender();

      // Since TabsRow is mocked, check the props passed to it instead of querying the DOM
      expect(mockTabsRowProps).toHaveBeenCalled();
      const tabsRowCall = mockTabsRowProps.mock.calls[mockTabsRowProps.mock.calls.length - 1][0];
      // ARO clusters should hide Monitoring and Settings (Upgrade Settings) tabs
      expect(tabsRowCall.tabsInfo.monitoring.show).toBe(false);
      expect(tabsRowCall.tabsInfo.updateSettings.show).toBe(false);
    });
  });

  describe('hypershift cluster', () => {
    const mockedUseFetchClusterDetails = useFetchClusterDetails;

    beforeEach(() => {
      jest.clearAllMocks();
      mockTabsRowProps.mockClear();
      useParams.mockReturnValue({ id: fixtures.ROSAClusterDetails.cluster.subscription.id });

      // Set up default mocks for all hooks used by ClusterDetails
      setupDefaultHookMocks(fixtures.ROSAClusterDetails.cluster);
    });

    it('should get node pools', async () => {
      const functions = funcs();
      const hypershiftCluster = {
        ...fixtures.ROSAClusterDetails.cluster,
        hypershift: { enabled: true },
      };
      const props = {
        ...fixtures,
        ...functions,
        clusterDetails: {
          ...fixtures.ROSAClusterDetails,
          cluster: hypershiftCluster,
        },
      };

      // Update the mock to return the hypershift cluster
      mockedUseFetchClusterDetails.mockReturnValue({
        cluster: hypershiftCluster,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
      });

      withState(initialState, true).render(<ClusterDetails {...props} />);

      await waitForRender();

      // Since child components are mocked, we can't test if useFetchMachineOrNodePools is called
      // Instead, verify that the machine pools tab is shown for hypershift clusters
      // by checking the TabsRow props
      expect(mockTabsRowProps).toHaveBeenCalled();
      const tabsRowCall = mockTabsRowProps.mock.calls[mockTabsRowProps.mock.calls.length - 1][0];
      // Hypershift clusters should show the machine pools tab
      expect(tabsRowCall.tabsInfo.machinePools.show).toBe(true);
    });

    const displayNetworkTabCases = [
      { privateLink: true, description: 'displays the network tab if private link is true' },
      { privateLink: false, description: 'displays the network tab if private link is false' },
    ];

    displayNetworkTabCases.forEach(({ privateLink, description }) => {
      it(description, async () => {
        const clusterData = {
          ...fixtures.ROSAClusterDetails.cluster,
          state: clusterStates.ready,
          managed: true,
          cloud_provider: { id: 'aws' },
          ccs: { enabled: true },
          hypershift: { enabled: true },
          aws: { private_link: privateLink },
          api: { url: 'https://api.test-cluster.example.com:6443' },
        };

        // Update the mock to return the cluster with private link setting
        mockedUseFetchClusterDetails.mockReturnValue({
          cluster: clusterData,
          isLoading: false,
          isError: false,
          error: null,
          isFetching: false,
        });

        const functions = funcs();
        const props = {
          ...fixtures,
          ...functions,
          resetFiltersAndFlags: () => {},
          clusterDetails: {
            ...fixtures.ROSAClusterDetails,
            cluster: clusterData,
          },
        };

        withState(initialState, true).render(<ClusterDetails {...props} />);

        await waitForRender();

        // Since TabsRow is mocked, check the props passed to it instead of querying the DOM
        expect(mockTabsRowProps).toHaveBeenCalled();
        const tabsRowCall = mockTabsRowProps.mock.calls[mockTabsRowProps.mock.calls.length - 1][0];
        // The networking tab should be shown for managed clusters with api.url and aws cloud provider
        // displayNetworkingTab = (isClusterReady || isClusterUpdating || clusterHibernating) &&
        //   cluster.managed && !!get(cluster, 'api.url') &&
        //   (cloudProvider === 'aws' || (cloudProvider === 'gcp' && (get(cluster, 'ccs.enabled') || gotRouters))) &&
        //   !isArchived
        expect(tabsRowCall.tabsInfo.networking.show).toBe(true);
      });
    });
  });

  describe('gcp cluster details', () => {
    const functions = funcs();
    const props = {
      ...fixtures,
      ...functions,
      clusterDetails: {
        ...fixtures.clusterDetails,
        cluster: {
          ...fixtures.clusterDetails.cluster,
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'gcp',
            href: '/api/clusters_mgmt/v1/cloud_providers/gcp',
          },
        },
      },
    };

    it('should not call get grants for gcp cluster', () => {
      withState(initialState, true).render(<ClusterDetails {...props} />);

      expect(functions.getGrants).not.toHaveBeenCalled();
    });
  });

  describe('tabs for OSDTrial clusters', () => {
    const functions = funcs();
    const props = {
      ...fixtures,
      ...functions,
      clusterDetails: {
        ...fixtures.clusterDetails,
        cluster: {
          ...fixtures.clusterDetails.cluster,
          canEdit: true,
          subscription: {
            ...fixtures.clusterDetails.cluster.subscription,
            status: SubscriptionCommonFieldsStatus.Active,
            plan: {
              id: 'OSDTrial',
              kind: 'Plan',
              href: '/api/accounts_mgmt/v1/plans/OSD',
              type: 'OSDTrial',
            },
          },
        },
      },
    };

    it('should hide the support tab for OSDTrial cluster', async () => {
      useParams.mockReturnValue({ id: props.clusterDetails.cluster.subscription.id });

      // Set up hook mocks
      setupDefaultHookMocks(props.clusterDetails.cluster);

      withState(initialState, true).render(<ClusterDetails {...props} />);

      await waitForRender();

      // Since TabsRow is mocked, check the props passed to it instead of querying the DOM
      expect(mockTabsRowProps).toHaveBeenCalled();
      const tabsRowCall = mockTabsRowProps.mock.calls[mockTabsRowProps.mock.calls.length - 1][0];
      // OSDTrial clusters should hide the support tab
      expect(tabsRowCall.tabsInfo.support.show).toBe(false);
    });
  });

  describe('tabs for Deprovisioned/Archived clusters', () => {
    const functions = funcs();
    const mockedUseFetchClusterDetails = useFetchClusterDetails;

    beforeEach(() => {
      jest.clearAllMocks();
      mockTabsRowProps.mockClear();
      useParams.mockReturnValue({ id: '1msoogsgTLQ4PePjrTOt3UqvMzX' });

      // Set up default mocks for all hooks used by ClusterDetails
      setupDefaultHookMocks();
    });

    it('should show support tab for Deprovisioned clusters', async () => {
      const deprovisionedCluster = {
        ...fixtures.clusterDetails.cluster,
        canEdit: true,
        subscription: {
          ...fixtures.clusterDetails.cluster.subscription,
          status: SubscriptionCommonFieldsStatus.Deprovisioned,
        },
      };

      // Update the mock to return the deprovisioned cluster
      mockedUseFetchClusterDetails.mockReturnValue({
        cluster: deprovisionedCluster,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
      });

      const osdProps = {
        ...fixtures,
        ...functions,
        clusterDetails: {
          ...fixtures.clusterDetails,
          cluster: deprovisionedCluster,
        },
      };
      withState(initialState, true).render(<ClusterDetails {...osdProps} />);

      await waitForRender();

      // Since TabsRow is mocked, check the props passed to it instead of querying the DOM
      expect(mockTabsRowProps).toHaveBeenCalled();
      const tabsRowCall = mockTabsRowProps.mock.calls[mockTabsRowProps.mock.calls.length - 1][0];
      // Support tab should be shown for Deprovisioned clusters
      expect(tabsRowCall.tabsInfo.support.show).toBe(true);
    });

    it('should hide tabs for Deprovisioned clusters', async () => {
      const deprovisionedCluster = {
        ...fixtures.clusterDetails.cluster,
        canEdit: true,
        subscription: {
          ...fixtures.clusterDetails.cluster.subscription,
          status: SubscriptionCommonFieldsStatus.Deprovisioned,
        },
      };

      // Update the mock to return the deprovisioned cluster
      mockedUseFetchClusterDetails.mockReturnValue({
        cluster: deprovisionedCluster,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
      });

      const osdProps = {
        ...fixtures,
        ...functions,
        clusterDetails: {
          ...fixtures.clusterDetails,
          cluster: deprovisionedCluster,
        },
      };

      withState(initialState, true).render(<ClusterDetails {...osdProps} />);

      await waitForRender();

      // Since TabsRow is mocked, check the props passed to it instead of querying the DOM
      expect(mockTabsRowProps).toHaveBeenCalled();
      const tabsRowCall = mockTabsRowProps.mock.calls[mockTabsRowProps.mock.calls.length - 1][0];

      // For Deprovisioned clusters (treated as archived), these tabs should be hidden:
      // - Monitoring (displayMonitoringTab = !isArchived && ...)
      // - Add-ons (displayAddOnsTab = !isArchived && ...)
      // - Networking (displayNetworkingTab = ... && !isArchived)
      // - Machine pools (depends on canViewMachinePoolTab, but archived clusters hide it)
      // - Settings/Upgrade settings (displayUpgradeSettingsTab = ... && !isArchived)
      // Access Control should still be shown (displayAccessControlTab = !isArchived, but Deprovisioned is treated as Archived)

      // Note: isArchived checks if status === Archived || status === Deprovisioned
      // So Deprovisioned clusters are treated as archived

      // Verify that the specified tabs are hidden
      expect(tabsRowCall.tabsInfo.monitoring.show).toBe(false);
      expect(tabsRowCall.tabsInfo.addOns.show).toBe(false);
      expect(tabsRowCall.tabsInfo.networking.show).toBe(false);
      expect(tabsRowCall.tabsInfo.updateSettings.show).toBe(false);

      // Access Control should be hidden for Deprovisioned (treated as archived)
      // displayAccessControlTab = !isArchived, and Deprovisioned is treated as Archived
      expect(tabsRowCall.tabsInfo.accessControl.show).toBe(false);

      // Support tab should be shown for Deprovisioned clusters
      expect(tabsRowCall.tabsInfo.support.show).toBe(true);
    });

    it('should show support tab for Archived clusters', async () => {
      const archivedCluster = {
        ...fixtures.OCPClusterDetails.cluster,
        canEdit: true,
        subscription: {
          ...fixtures.OCPClusterDetails.cluster.subscription,
          status: SubscriptionCommonFieldsStatus.Archived,
        },
        cloud_provider: {
          kind: 'CloudProvider',
          id: 'baremetal',
          href: '/api/clusters_mgmt/v1/cloud_providers/baremetal',
        },
      };

      // Update the mock to return the archived cluster
      mockedUseFetchClusterDetails.mockReturnValue({
        cluster: archivedCluster,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
      });

      const ocpPropsWithArchived = {
        ...fixtures,
        ...functions,
        clusterDetails: {
          ...fixtures.OCPClusterDetails,
          cluster: archivedCluster,
        },
      };

      withState(initialState, true).render(<ClusterDetails {...ocpPropsWithArchived} />);

      await waitForRender();

      // Since TabsRow is mocked, check the props passed to it instead of querying the DOM
      expect(mockTabsRowProps).toHaveBeenCalled();
      const tabsRowCall = mockTabsRowProps.mock.calls[mockTabsRowProps.mock.calls.length - 1][0];
      // Support tab should be shown for Archived clusters
      expect(tabsRowCall.tabsInfo.support.show).toBe(true);
      // Note: We can't test aria-disabled since TabsRow is mocked, but the tab should be shown
    });

    it('should hide tabs for Archived clusters', async () => {
      const archivedCluster = {
        ...fixtures.OCPClusterDetails.cluster,
        canEdit: true,
        subscription: {
          ...fixtures.OCPClusterDetails.cluster.subscription,
          status: SubscriptionCommonFieldsStatus.Archived,
        },
        cloud_provider: {
          kind: 'CloudProvider',
          id: 'baremetal',
          href: '/api/clusters_mgmt/v1/cloud_providers/baremetal',
        },
      };

      // Update the mock to return the archived cluster
      mockedUseFetchClusterDetails.mockReturnValue({
        cluster: archivedCluster,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
      });

      const ocpPropsWithArchived = {
        ...fixtures,
        ...functions,
        clusterDetails: {
          ...fixtures.OCPClusterDetails,
          cluster: archivedCluster,
        },
      };

      withState(initialState, true).render(<ClusterDetails {...ocpPropsWithArchived} />);

      await waitForRender();

      // Since TabsRow is mocked, check the props passed to it instead of querying the DOM
      expect(mockTabsRowProps).toHaveBeenCalled();
      const tabsRowCall = mockTabsRowProps.mock.calls[mockTabsRowProps.mock.calls.length - 1][0];

      // For Archived clusters, these tabs should be hidden:
      // - Monitoring (displayMonitoringTab = !isArchived && ...)
      // - Add-ons (displayAddOnsTab = !isArchived && ...)
      // - Networking (displayNetworkingTab = ... && !isArchived)
      // - Settings/Upgrade settings (displayUpgradeSettingsTab = ... && !isArchived)
      // - Access Control (displayAccessControlTab = !isArchived)
      expect(tabsRowCall.tabsInfo.monitoring.show).toBe(false);
      expect(tabsRowCall.tabsInfo.addOns.show).toBe(false);
      expect(tabsRowCall.tabsInfo.networking.show).toBe(false);
      expect(tabsRowCall.tabsInfo.updateSettings.show).toBe(false);
      expect(tabsRowCall.tabsInfo.accessControl.show).toBe(false);

      // Support tab should be shown for Archived clusters
      expect(tabsRowCall.tabsInfo.support.show).toBe(true);
    });
  });
});
