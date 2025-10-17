import React from 'react';
import * as reactRedux from 'react-redux';

import * as useGetAccessProtection from '~/queries/AccessRequest/useGetAccessProtection';
import * as useGetOrganizationalPendingRequests from '~/queries/AccessRequest/useGetOrganizationalPendingRequests';
import * as useFetchClusters from '~/queries/ClusterListQueries/useFetchClusters';
import type {
  CloudProvidersState,
  MachineTypesState,
  OrganizationState,
} from '~/redux/reducerProviderStateTypes';
import type { PromiseReducerState } from '~/redux/stateTypes';
import { mockRestrictedEnv, screen, within, withState } from '~/testUtils';

import { normalizedProducts } from '../../../common/subscriptionTypes';
import { viewConstants } from '../../../redux/constants';
import { SET_TOTAL_ITEMS } from '../../../redux/constants/viewPaginationConstants';
import fixtures, { funcs } from '../ClusterDetailsMultiRegion/__tests__/ClusterDetails.fixtures';

import ClusterListTab from './ClusterListTab';

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
const refetch = jest.fn();

describe('<ClusterListTab />', () => {
  const props = {
    cloudProviders: fixtures.cloudProviders as CloudProvidersState,
    machineTypes: {
      fulfilled: true,
      pending: false,
      error: false,
    } as MachineTypesState,
    organization: fixtures.organization as PromiseReducerState<OrganizationState>,
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

  it('shows empty state when done loading and no clusters is returned', () => {
    mockedGetFetchedClusters.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isFetching: false,
      errors: [],
      refetch,
    } as any);
    withState({}, true).render(<ClusterListTab {...props} />);

    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'Loading cluster list data' }),
    ).not.toBeInTheDocument(); // loading spinner
    expect(screen.getByText(emptyStateText)).toBeInTheDocument();
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
    } as any);
    withState({}, true).render(<ClusterListTab {...props} />);

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
    } as any);
    withState({ viewOptions: { CLUSTERS_VIEW: { totalCount: 1 } } }, true).render(
      <ClusterListTab {...props} />,
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
        refetch,
      } as any);

      mockedUseGetAccessProtection.mockReturnValue({
        enabled: true,
      } as any);

      mockedUseGetOrganizationalPendingRequests.mockReturnValue({
        total: 3,
        items: [
          { id: 'myRequest1', subscription_id: 'mySubscriptionId1' },
          { id: 'myRequest2', subscription_id: 'mySubscriptionId2' },
          { id: 'myRequest3', subscription_id: 'mySubscriptionId3' },
        ],
      } as any);

      withState({}, true).render(<ClusterListTab {...props} />);

      expect(screen.getByText('Pending Access Requests')).toBeInTheDocument();
    });

    it('hides access alert if no pending requests', () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [fixtures.clusterDetails.cluster], itemsCount: 1 },
        isLoading: false,
        isFetching: false,
        errors: [],
        refetch,
      } as any);

      mockedUseGetAccessProtection.mockReturnValue({
        enabled: false,
      } as any);

      mockedUseGetOrganizationalPendingRequests.mockReturnValue({
        total: 0,
        items: [],
      } as any);

      withState({}, true).render(<ClusterListTab {...props} />);

      expect(screen.queryByText('Pending Access Requests')).not.toBeInTheDocument();
    });
  });

  describe('Errors', () => {
    const alertText = 'Some operations are unavailable, try again later';
    const errorDetailsToggleText = 'Error details';

    it('Shows errors when getting global clusters without operation id', async () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [fixtures.clusterDetails.cluster] },
        isFetched: true,
        isError: true,
        errors: [{ reason: 'There was an error' }],
        refetch,
      } as any);
      const { user } = withState({}, true).render(<ClusterListTab {...props} />);
      expect(within(screen.getByRole('alert')).getByText(alertText)).toBeInTheDocument();

      await user.click(screen.getByText(errorDetailsToggleText));
      expect(within(screen.getByRole('alert')).getByText('There was an error.'));
    });

    it('Shows errors when getting global clusters', async () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [fixtures.clusterDetails.cluster] },
        isFetched: true,
        isError: true,
        errors: [{ reason: 'There was an error', operation_id: '1234' }],
        refetch,
      } as any);
      const { user } = withState({}, true).render(<ClusterListTab {...props} />);
      expect(within(screen.getByRole('alert')).getByText(alertText)).toBeInTheDocument();

      await user.click(screen.getByText(errorDetailsToggleText));
      expect(
        within(screen.getByRole('alert')).getByText('There was an error. (Operation ID: 1234)'),
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
        refetch,
      } as any);
      const { user } = withState({}, true).render(<ClusterListTab {...props} />);
      expect(within(screen.getByRole('alert')).getByText(alertText)).toBeInTheDocument();

      await user.click(screen.getByText(errorDetailsToggleText));
      expect(
        within(screen.getByRole('alert')).getByText(
          'There was an error. While getting clusters for myRegion. (Operation ID: 1234)',
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
        refetch,
      } as any);
      withState({}, true).render(<ClusterListTab {...props} />);

      expect(screen.getByText('This page is temporarily unavailable')).toBeInTheDocument();
    });
  });

  describe('in restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();
    const onListFlagsSet = jest.fn();
    const props = {
      onListFlagsSet,
      cloudProviders: fixtures.cloudProviders as CloudProvidersState,
      machineTypes: {
        fulfilled: true,
        pending: false,
        error: false,
      } as MachineTypesState,
      organization: fixtures.organization as PromiseReducerState<OrganizationState>,
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
      withState({}, true).render(<ClusterListTab {...props} />);
      expect(mockedDispatch).toHaveBeenCalled();

      const args = mockedDispatch.mock.calls[0];

      expect(args[0].type).toEqual('VIEW_SET_LIST_FLAGS');

      expect(args[0].payload.key).toBe('subscriptionFilter');
      expect(args[0].payload.value).toStrictEqual({ plan_id: [normalizedProducts.ROSA] });
      expect(args[0].payload.viewType).toBe(viewConstants.CLUSTERS_VIEW);

      expect(await screen.findByRole('button', { name: 'Create cluster' })).toBeInTheDocument();
    });

    it('does not render filtering', async () => {
      const { rerender } = withState({}, true).render(<ClusterListTab {...props} />);
      expect(screen.queryByTestId('cluster-list-filter-dropdown')).toBeInTheDocument();

      isRestrictedEnv.mockReturnValue(true);
      rerender(<ClusterListTab {...props} />);
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
        refetch,
      } as any);

      const { user } = withState({}, true).render(<ClusterListTab {...props} />);

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
        refetch,
      } as any);

      // Act
      withState(
        { viewOptions: { CLUSTERS_VIEW: { flags: { subscriptionFilter: { plan_id: ['OSD'] } } } } },
        true,
      ).render(<ClusterListTab {...props} />);

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
        refetch,
      } as any);
      const { unmount } = withState({}, true).render(<ClusterListTab {...props} />);

      jest.clearAllMocks();

      expect(mockedClearGlobalError).not.toHaveBeenCalled();
      expect(mockedCloseModal).not.toHaveBeenCalled();
      unmount();

      expect(mockedClearGlobalError.mock.calls).toEqual([['clusterList'], ['clusterDetails']]);
      expect(mockedCloseModal).toHaveBeenCalled();
    });
  });
});
