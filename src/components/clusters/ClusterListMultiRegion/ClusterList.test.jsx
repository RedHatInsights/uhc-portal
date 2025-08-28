import React from 'react';
import * as reactRedux from 'react-redux';

import * as useGetAccessProtection from '~/queries/AccessRequest/useGetAccessProtection';
import * as useGetOrganizationalPendingRequests from '~/queries/AccessRequest/useGetOrganizationalPendingRequests';
import * as useFetchClusters from '~/queries/ClusterListQueries/useFetchClusters';
import { mockRestrictedEnv, screen, within, withState } from '~/testUtils';

import { normalizedProducts } from '../../../common/subscriptionTypes';
import { viewConstants } from '../../../redux/constants';
import { SET_TOTAL_ITEMS } from '../../../redux/constants/viewPaginationConstants';
import fixtures, { funcs } from '../ClusterDetailsMultiRegion/__tests__/ClusterDetails.fixtures';

import ClusterList from './ClusterList';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mocking hooks due to the complexity of this custom hook
// Each hook has its own unit tests to ensure it returns the correct values
const mockedGetFetchedClusters = jest.spyOn(useFetchClusters, 'useFetchClusters');
const mockedUseGetAccessProtection = jest.spyOn(useGetAccessProtection, 'useGetAccessProtection');
const mockedUseGetOrganizationalPendingRequests = jest.spyOn(
  useGetOrganizationalPendingRequests,
  'useGetOrganizationalPendingRequests',
);

const mockedClearGlobalError = jest.fn();
const mockedCloseModal = jest.fn();

describe('<ClusterList />', () => {
  const props = {
    cloudProviders: fixtures.cloudProviders,
    machineTypes: {
      fulfilled: true,
      pending: false,
    },
    organization: fixtures.organization,
    pendingOrganizationAccessRequests: {},
    organizationId: 'whateverTheOrganizationId',
    closeModal: mockedCloseModal,
    openModal: jest.fn(),
    clearGlobalError: mockedClearGlobalError,
    getOrganizationAndQuota: jest.fn(),
    getMachineTypes: jest.fn(),
    getCloudProviders: jest.fn(),
  };

  const emptyStateText = "Let's create your first cluster";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows skeleton while loading and no data is returned yet', () => {
    mockedGetFetchedClusters.mockReturnValue({
      data: undefined,
      isLoading: true,
      errors: [],
    });
    withState({}, true).render(<ClusterList {...props} />);

    const numberOfSkeletonRows = 10;

    expect(screen.getAllByTestId('skeleton')).toHaveLength(numberOfSkeletonRows);

    // the number of rows in the tbody tag matches the number of skeleton rows
    expect(within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')).toHaveLength(
      numberOfSkeletonRows,
    );

    expect(screen.getByRole('button', { name: 'Refresh' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    expect(
      screen.getByRole('progressbar', { name: 'Loading cluster list data' }),
    ).toBeInTheDocument(); // loading spinner

    expect(screen.queryByText(emptyStateText)).not.toBeInTheDocument();
  });

  it('shows empty state when done loading and no clusters is returned', () => {
    mockedGetFetchedClusters.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isFetching: false,
      errors: [],
    });
    withState({}, true).render(<ClusterList {...props} />);

    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'Loading cluster list data' }),
    ).not.toBeInTheDocument(); // loading spinner
    expect(screen.getByText(emptyStateText)).toBeInTheDocument();
  });

  it('shows data if still loading but clusters are available', () => {
    mockedGetFetchedClusters.mockReturnValue({
      data: { items: [fixtures.clusterDetails.cluster], itemsCount: 1 },
      isLoading: true,
      isFetching: true,
      isFetched: false,
      errors: [],
    });
    withState({}, true).render(<ClusterList {...props} />);

    expect(screen.getByRole('button', { name: 'Refresh' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    expect(
      screen.getByRole('progressbar', { name: 'Loading cluster list data' }),
    ).toBeInTheDocument(); // loading spinner
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();

    expect(
      screen.getByText(fixtures.clusterDetails.cluster.subscription.display_name),
    ).toBeInTheDocument();
  });

  it('shows data and loading icon if is fetching', () => {
    mockedGetFetchedClusters.mockReturnValue({
      data: { items: [fixtures.clusterDetails.cluster] },
      isFetching: true,
      errors: [],
    });
    withState({}, true).render(<ClusterList {...props} />);

    expect(screen.getByRole('button', { name: 'Refresh' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    expect(
      screen.getByRole('progressbar', { name: 'Loading cluster list data' }),
    ).toBeInTheDocument(); // loading spinner
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();

    expect(
      screen.getByText(fixtures.clusterDetails.cluster.subscription.display_name),
    ).toBeInTheDocument();
  });

  it('shows data if done loading', () => {
    mockedGetFetchedClusters.mockReturnValue({
      data: { items: [fixtures.clusterDetails.cluster] },
      errors: [],
    });
    withState({}, true).render(<ClusterList {...props} />);

    expect(screen.getByRole('button', { name: 'Refresh' })).not.toHaveAttribute('aria-disabled');

    expect(
      screen.queryByRole('progressbar', { name: 'Loading cluster list data' }),
    ).not.toBeInTheDocument(); // loading spinner
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();

    expect(
      screen.getByText(fixtures.clusterDetails.cluster.subscription.display_name),
    ).toBeInTheDocument();
  });

  it('refresh calls refresh function', async () => {
    const refetch = jest.fn();
    mockedGetFetchedClusters.mockReturnValue({
      data: { items: [fixtures.clusterDetails.cluster] },
      refetch,
      errors: [],
    });
    const { user } = withState({}, true).render(<ClusterList {...props} />);

    expect(refetch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(refetch).toHaveBeenCalled();
  });

  it('sets new cluster total into Redux', () => {
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
    const mockedDispatch = jest.fn();
    useDispatchMock.mockReturnValue(mockedDispatch);

    const refetch = jest.fn();
    mockedGetFetchedClusters.mockReturnValue({
      data: { items: [fixtures.clusterDetails.cluster], itemsCount: 1 },
      refetch,
      errors: [],
    });
    withState({}, true).render(<ClusterList {...props} />);

    expect(mockedDispatch).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual(SET_TOTAL_ITEMS);
    expect(mockedDispatch.mock.calls[0][0].payload).toEqual({
      totalCount: 1,
      viewType: 'CLUSTERS_VIEW',
    });
  });

  it('sets new cluster total when total is changed to 0', () => {
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
    const mockedDispatch = jest.fn();
    useDispatchMock.mockReturnValue(mockedDispatch);

    const refetch = jest.fn();
    mockedGetFetchedClusters.mockReturnValue({
      data: { items: [], itemsCount: 0 },
      refetch,
      errors: [],
    });
    withState({ viewOptions: { CLUSTERS_VIEW: { totalCount: 1 } } }, true).render(
      <ClusterList {...props} />,
    );

    expect(mockedDispatch).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual(SET_TOTAL_ITEMS);
    expect(mockedDispatch.mock.calls[0][0].payload).toEqual({
      totalCount: 0,
      viewType: 'CLUSTERS_VIEW',
    });
  });

  describe('Access Request Pending Alert', () => {
    it('shows access alert if there are pending requests', () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [fixtures.clusterDetails.cluster], itemsCount: 1 },
        isLoading: false,
        isFetching: false,
        errors: [],
      });

      mockedUseGetAccessProtection.mockReturnValue({
        enabled: true,
      });

      mockedUseGetOrganizationalPendingRequests.mockReturnValue({
        total: 3,
        items: [
          { id: 'myRequest1', subscription_id: 'mySubscriptionId1' },
          { id: 'myRequest2', subscription_id: 'mySubscriptionId2' },
          { id: 'myRequest3', subscription_id: 'mySubscriptionId3' },
        ],
      });

      withState({}, true).render(<ClusterList {...props} />);

      expect(screen.getByText('Pending Access Requests')).toBeInTheDocument();
    });

    it('hides access alert if no pending requests', () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [fixtures.clusterDetails.cluster], itemsCount: 1 },
        isLoading: false,
        isFetching: false,
        errors: [],
      });

      mockedUseGetAccessProtection.mockReturnValue({
        enabled: false,
      });

      mockedUseGetOrganizationalPendingRequests.mockReturnValue({
        total: 0,
        items: [],
      });

      withState({}, true).render(<ClusterList {...props} />);

      expect(screen.queryByText('Pending Access Requests')).not.toBeInTheDocument();
    });
  });

  describe('Errors', () => {
    const alertText = 'Some operations are unavailable, try again later';
    const errorDetailsToggleText = 'Error details';

    it('Error triangle shows if there is an error fetching clusters', async () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [fixtures.clusterDetails.cluster] },
        isFetched: true,
        isError: true,
        errors: [{ reason: 'There was an error', operation_id: '1234' }],
      });

      withState({}, true).render(<ClusterList {...props} />);
      expect(screen.getByTestId('error-triangle-icon')).toBeInTheDocument();
    });

    it('Shows errors when getting global clusters without operation id', async () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [fixtures.clusterDetails.cluster] },
        isFetched: true,
        isError: true,
        errors: [{ reason: 'There was an error' }],
      });
      const { user } = withState({}, true).render(<ClusterList {...props} />);
      expect(within(screen.getByRole('alert')).getByText(alertText)).toBeInTheDocument();

      await user.click(screen.getByText(errorDetailsToggleText));
      expect(within(screen.getByRole('alert')).getByText('"There was an error."'));
    });

    it('Shows errors when getting global clusters', async () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [fixtures.clusterDetails.cluster] },
        isFetched: true,
        isError: true,
        errors: [{ reason: 'There was an error', operation_id: '1234' }],
      });
      const { user } = withState({}, true).render(<ClusterList {...props} />);
      expect(within(screen.getByRole('alert')).getByText(alertText)).toBeInTheDocument();

      await user.click(screen.getByText(errorDetailsToggleText));
      expect(
        within(screen.getByRole('alert')).getByText('"There was an error. (Operation ID: 1234)"'),
      );
    });

    it('Shows errors when getting regional clusters', async () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [fixtures.clusterDetails.cluster] },
        isFetched: true,
        isError: true,
        errors: [
          { reason: 'There was an error', operation_id: '1234', region: { region: 'myRegion' } },
        ],
      });
      const { user } = withState({}, true).render(<ClusterList {...props} />);
      expect(within(screen.getByRole('alert')).getByText(alertText)).toBeInTheDocument();

      await user.click(screen.getByText(errorDetailsToggleText));
      expect(
        within(screen.getByRole('alert')).getByText(
          '"There was an error. While getting clusters for myRegion. (Operation ID: 1234)"',
        ),
      );
    });

    it('Shows error page if no clusters are returned', () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [] },
        isFetched: true,
        isError: true,
        errors: [
          { reason: 'There was an error', operation_id: '1234', region: { region: 'myRegion' } },
        ],
      });
      withState({}, true).render(<ClusterList {...props} />);

      expect(screen.getByText('This page is temporarily unavailable')).toBeInTheDocument();
    });
  });

  describe('in restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();
    const onListFlagsSet = jest.fn();
    const props = {
      onListFlagsSet,
      cloudProviders: fixtures.cloudProviders,
      machineTypes: {
        fulfilled: true,
        pending: false,
      },
      organization: fixtures.organization,
      fetchClusters: jest.fn(),
      viewOptions: {
        flags: {},
        currentPage: 1,
        sorting: {
          sortField: '',
        },
      },
      clusters: [fixtures.clusterDetails.cluster],
      meta: {},
      queryParams: {},
      features: {},
      valid: true,
      pending: false,
      errorMessage: '',
      error: false,
      username: 'myUserName',
      ...funcs(),
      clearClusterDetails: jest.fn(),
      setClusterDetails: jest.fn(),
      setListFlag: jest.fn(),
      setSorting: jest.fn(),
      getMachineTypes: jest.fn(),
    };
    afterEach(() => {
      isRestrictedEnv.mockReturnValue(false);
    });

    it('should call onListFlagsSet with ROSA filter', async () => {
      const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
      const mockedDispatch = jest.fn();
      useDispatchMock.mockReturnValue(mockedDispatch);

      isRestrictedEnv.mockReturnValue(true);
      withState({}, true).render(<ClusterList {...props} />);
      expect(mockedDispatch).toHaveBeenCalled();

      const args = mockedDispatch.mock.calls[0];

      expect(args[0].type).toEqual('VIEW_SET_LIST_FLAGS');

      expect(args[0].payload.key).toBe('subscriptionFilter');
      expect(args[0].payload.value).toStrictEqual({ plan_id: [normalizedProducts.ROSA] });
      expect(args[0].payload.viewType).toBe(viewConstants.CLUSTERS_VIEW);

      expect(await screen.findByRole('button', { name: 'Create cluster' })).toBeInTheDocument();
    });

    it('does not render filtering', async () => {
      const { rerender } = withState({}, true).render(<ClusterList {...props} />);
      expect(screen.queryByTestId('cluster-list-filter-dropdown')).toBeInTheDocument();

      isRestrictedEnv.mockReturnValue(true);
      rerender(<ClusterList {...props} />);
      expect(screen.queryByTestId('cluster-list-filter-dropdown')).not.toBeInTheDocument();

      expect(await screen.findByRole('button', { name: 'Create cluster' })).toBeInTheDocument();
    });
  });

  describe('cluster filter', () => {
    beforeEach(() => {
      mockNavigate.mockClear();
    });

    it('filter by clicking on cluster type', async () => {
      // Arrange
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [fixtures.clusterDetails.cluster] },
        errors: [],
      });

      const { user } = withState({}, true).render(<ClusterList {...props} />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Cluster type' }));
      await user.click(screen.getByText('ARO'));
      await user.click(screen.getByText('RHOIC'));

      // Assert
      expect(mockNavigate).toHaveBeenLastCalledWith(
        { search: 'plan_id=ARO,RHOIC' },
        { replace: true },
      );
    });

    it('filter by already set state and URL param reacts accordingly', async () => {
      // Arrange
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [fixtures.clusterDetails.cluster] },
        errors: [],
      });

      // Act
      withState(
        { viewOptions: { CLUSTERS_VIEW: { flags: { subscriptionFilter: { plan_id: ['OSD'] } } } } },
        true,
      ).render(<ClusterList {...props} />);

      // Assert
      expect(mockNavigate).toHaveBeenLastCalledWith({ search: 'plan_id=OSD' }, { replace: true });
    });
  });

  describe('unmount', () => {
    it('Clears global errors and closes modals', () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        isFetching: false,
        errors: [],
      });
      const { unmount } = withState({}, true).render(<ClusterList {...props} />);

      jest.clearAllMocks();

      expect(mockedClearGlobalError).not.toHaveBeenCalled();
      expect(mockedCloseModal).not.toHaveBeenCalled();
      unmount();

      expect(mockedClearGlobalError.mock.calls).toEqual([['clusterList'], ['clusterDetails']]);
      expect(mockedCloseModal).toHaveBeenCalled();
    });
  });
});
