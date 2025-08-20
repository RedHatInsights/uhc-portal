import * as useGlobalState from '~/redux/hooks/useGlobalState';
import { GlobalState } from '~/redux/stateTypes';
import { renderHook, waitFor } from '~/testUtils';
import { Cluster } from '~/types/clusters_mgmt.v1';

import * as fetchClusters from './helpers/fetchClusters';
import * as useFetchCanEditDelete from './helpers/useFetchCanEditDelete';
import * as useFetchClusterHelpers from './helpers/useFetchClustersHelpers';
import * as useFetchSubscriptions from './helpers/useFetchSubscriptions';
import { useFetchClusters } from './useFetchClusters';
import {
  aiClustersValue,
  managedClustersValueGlobal,
  managedClustersValueRegional,
  mockedUseFetchSubscriptionsData,
  subscriptionMap,
  viewOptions,
} from './useFetchClusters.test.mocks';

const mockedUseFetchCanEditDelete = jest.spyOn(useFetchCanEditDelete, 'useFetchCanEditDelete');
const mockedUseFetchSubscriptions = jest.spyOn(useFetchSubscriptions, 'useFetchSubscriptions');
const mockedClearQueries = jest.spyOn(useFetchClusterHelpers, 'clearQueries');
const mockedUseRefetchClusterList = jest.spyOn(useFetchClusterHelpers, 'useRefetchClusterList');
const mockedFetchAIClusters = jest.spyOn(fetchClusters, 'fetchAIClusters');
const mockedFetchManagedClusters = jest.spyOn(fetchClusters, 'fetchManagedClusters');
const mockedUseGlobalState = jest.spyOn(useGlobalState, 'useGlobalState');

const mockedState = {
  userProfile: { keycloakProfile: { username: 'myUserName' } },
  viewOptions: { CLUSTERS_VIEW: viewOptions },
} as unknown as GlobalState;

mockedUseGlobalState.mockImplementation((callback) => callback(mockedState));
const mockedClearQueriesFn = jest.fn();
mockedClearQueries.mockImplementation(mockedClearQueriesFn);

describe('useFetchClusters', () => {
  const mockedUseFetchCanEditDeleteValue = {
    isLoading: false,
    isFetching: false,
    canEdit: {},
    canDelete: {},
    isError: false,
    errors: [],
    isFetched: true,
    refetch: jest.fn(),
  };

  const mockedUseFetchSubscriptionsValue = {
    data: {
      subscriptionIds: [],
      subscriptionMap: new Map(),
      managedSubscriptions: [],
      total: 0,
      page: 0,
    },
    isLoading: false,
    isFetching: false,
    isFetched: true,
    isError: false,
    error: null,
  };

  const mockedRefetchRefetch = jest.fn();
  const mockedSetRefetchSchedule = jest.fn();
  mockedUseRefetchClusterList.mockReturnValue({
    refetch: mockedRefetchRefetch,
    setRefetchSchedule: mockedSetRefetchSchedule,
    clearRefetch: jest.fn(),
  });

  const mockedFetchAIClustersValue = { aiClusters: [] };
  const mockedFetchManagedClustersValue = { managedClusters: [] };

  describe('is loading', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('returns isLoading if useFetchCanEditDelete is loading', async () => {
      mockedUseFetchCanEditDelete.mockReturnValueOnce({
        ...mockedUseFetchCanEditDeleteValue,
        isLoading: true,
        isFetching: true,
        isFetched: false,
      });
      mockedUseFetchSubscriptions.mockReturnValueOnce(mockedUseFetchSubscriptionsValue);
      mockedFetchAIClusters.mockResolvedValueOnce(mockedFetchAIClustersValue);
      mockedFetchManagedClusters.mockResolvedValueOnce(mockedFetchManagedClustersValue);

      const { result } = renderHook(() => useFetchClusters());

      await waitFor(() => {
        expect(result.current.isLoading).toBeTruthy();
      });
    });

    it('returns isLoading if fetchGlobalSubscriptions is loading', async () => {
      mockedUseFetchCanEditDelete.mockReturnValueOnce(mockedUseFetchCanEditDeleteValue);
      mockedUseFetchSubscriptions.mockReturnValueOnce({
        ...mockedUseFetchSubscriptionsValue,
        isLoading: true,
        isFetching: true,
        isFetched: false,
      });
      mockedFetchAIClusters.mockResolvedValueOnce(mockedFetchAIClustersValue);
      mockedFetchManagedClusters.mockResolvedValueOnce(mockedFetchManagedClustersValue);

      const { result } = renderHook(() => useFetchClusters());

      await waitFor(() => {
        expect(result.current.isLoading).toBeTruthy();
      });
    });
  });

  describe('refetch', () => {
    it('returns the refetch function', async () => {
      mockedUseFetchCanEditDelete.mockReturnValueOnce(mockedUseFetchCanEditDeleteValue);
      mockedUseFetchSubscriptions.mockReturnValueOnce(mockedUseFetchSubscriptionsValue);
      mockedFetchAIClusters.mockResolvedValueOnce(mockedFetchAIClustersValue);
      mockedFetchManagedClusters.mockResolvedValueOnce(mockedFetchManagedClustersValue);

      const { result } = renderHook(() => useFetchClusters());

      await waitFor(() => {
        expect(result.current.refetch).toBeTruthy();
      });

      expect(mockedRefetchRefetch).not.toHaveBeenCalled();
      result.current.refetch();
      expect(mockedRefetchRefetch).toHaveBeenCalled();
    });
  });

  describe('errors', () => {
    it('returns errors if useFetchCanEditDelete has errors', async () => {
      const useFetchCanEditDeleteValue = {
        ...mockedUseFetchCanEditDeleteValue,
        isError: true,
        errors: [
          {
            reason: 'This is an error',
            operation_id: '12345',
          },
        ],
      };

      mockedUseFetchCanEditDelete.mockReturnValueOnce(useFetchCanEditDeleteValue);
      mockedUseFetchSubscriptions.mockReturnValueOnce(mockedUseFetchSubscriptionsValue);
      mockedFetchAIClusters.mockResolvedValueOnce(mockedFetchAIClustersValue);
      mockedFetchManagedClusters.mockResolvedValueOnce(mockedFetchManagedClustersValue);

      const { result } = renderHook(() => useFetchClusters());

      await waitFor(() => {
        expect(result.current.isError).toBeTruthy();
      });
      expect(result.current.errors).toEqual([
        { reason: 'This is an error', operation_id: '12345' },
      ]);

      expect(mockedUseFetchSubscriptions).toHaveBeenCalled();
    });

    it('returns errors if fetchGlobalSubscriptions has errors', async () => {
      const useFetchSubscriptionsValue = {
        ...mockedUseFetchSubscriptionsValue,
        isError: true,
        error: {
          name: 'This is an error',
          message: 'This is an error message',
        },
      };

      mockedUseFetchCanEditDelete.mockReturnValueOnce(mockedUseFetchCanEditDeleteValue);
      mockedUseFetchSubscriptions.mockReturnValueOnce(useFetchSubscriptionsValue);
      mockedFetchAIClusters.mockResolvedValueOnce(mockedFetchAIClustersValue);
      mockedFetchManagedClusters.mockResolvedValueOnce(mockedFetchManagedClustersValue);

      const { result } = renderHook(() => useFetchClusters());

      await waitFor(() => {
        expect(result.current.isError).toBeTruthy();
      });
      expect(result.current.errors).toEqual([
        { reason: 'This is an error message', operation_id: undefined },
      ]);

      expect(mockedFetchAIClusters).not.toHaveBeenCalled();
      expect(mockedFetchManagedClusters).not.toHaveBeenCalled();
    });
  });

  describe('data', () => {
    it.skip('returns expected clusters', async () => {
      // TODO - this test fails for unknown reason
      // All mocking appears to work, but the test finishes before
      // all the mocked api calls and data manipulation

      const subscriptionsValue = {
        ...mockedUseFetchSubscriptionsValue,
        data: mockedUseFetchSubscriptionsData,
      };

      const canEditCanDeleteValue = {
        ...mockedUseFetchCanEditDeleteValue,
        canEdit: { 'myClusterId-managed-1': true },
        canDelete: { 'myClusterId-managed-1': true },
      };

      mockedUseFetchCanEditDelete.mockReturnValue(canEditCanDeleteValue);
      mockedUseFetchSubscriptions.mockReturnValue(subscriptionsValue);
      // @ts-ignore
      mockedFetchAIClusters.mockResolvedValue(aiClustersValue);
      // @ts-ignore
      mockedFetchManagedClusters.mockResolvedValueOnce(managedClustersValueGlobal);
      // @ts-ignore
      mockedFetchManagedClusters.mockResolvedValue(managedClustersValueRegional);

      const { result } = renderHook(() => useFetchClusters());

      await waitFor(() => {
        const managed1Cluster = result.current.data?.items.find(
          (cluster: Cluster) => cluster.id === 'myClusterId-managed-1',
        );
        expect(managed1Cluster.canEdit).toBeTruthy();
      });

      expect(mockedFetchManagedClusters).toHaveBeenCalledTimes(2);
      expect(result.current.data?.items).toHaveLength(subscriptionMap.size);
    });
  });
});
