import { queryClient } from '~/components/App/queryClient';
import { queryConstants } from '~/queries/queriesConstants';
import * as useGlobalState from '~/redux/hooks/useGlobalState';
import { renderHook, waitFor } from '~/testUtils';
import { ClusterWithPermissions, ViewOptions } from '~/types/types';

import {
  clearQueries,
  combineClusterQueries,
  createQueryKey,
  isExistingQuery,
  useRefetchClusterList,
} from './useFetchClustersHelpers';

describe('useFetchClustersHelpers', () => {
  afterEach(() => {
    queryClient.removeQueries();
  });

  const defaultViewOptions = {
    currentPage: 1,
    pageSize: 20,
    totalCount: 100,
    totalPages: 5,
    filter: 'myNameFilter',
    sorting: {
      sortField: 'mySortField',
      isAscending: true,
      sortIndex: 0,
    },
    flags: {
      showArchived: false,
      showMyClustersOnly: true,
      subscriptionFilter: {
        plan_id: ['planType1', 'planType2'],
      },
    },
  };

  describe('createQueryKey', () => {
    it('creates key with sort and filtering fields', () => {
      const expects = [
        queryConstants.FETCH_CLUSTERS_QUERY_KEY,
        'Active',
        'clusters',
        '-',
        '1',
        '20',
        'mySortField',
        'asc',
        'myNameFilter',
        'only_my_clusters',
        'planType1',
        'planType2',
      ];

      const myKey = createQueryKey({ type: 'clusters', viewOptions: defaultViewOptions });
      expect(myKey).toEqual(expects);
    });

    it('creates key without sort and filtering fields', () => {
      const viewOptions = {
        ...defaultViewOptions,
        filter: '',
        sorting: undefined,
        flags: undefined,
      } as unknown as ViewOptions;

      const expects = [
        queryConstants.FETCH_CLUSTERS_QUERY_KEY,
        'Active',
        'subscriptions',
        '-',
        '1',
        '20',
        'no_sort_field',
        'desc',
        'no_name_filter',
        'all_clusters',
      ];

      const myKey = createQueryKey({ type: 'subscriptions', viewOptions });
      expect(myKey).toEqual(expects);
    });

    it('creates key with type/region', () => {
      const myKey = createQueryKey({
        type: 'clusters',
        viewOptions: defaultViewOptions,
        clusterTypeOrRegion: 'myRegion',
      });
      expect(myKey[3]).toEqual('myRegion');
    });

    it('creates key without type/region', () => {
      const myKey = createQueryKey({
        type: 'clusters',
        viewOptions: defaultViewOptions,
      });
      expect(myKey[3]).toEqual('-');
    });
  });

  describe('isExistingQuery', () => {
    const queries = [
      { queryKey: ['option1-1', 'option1-2', 'option1-3'] },
      { queryKey: ['option2-1'] },
    ];
    it('returns false when there is not a match', () => {
      expect(isExistingQuery(queries, ['option3-1'])).toBeFalsy();
      expect(isExistingQuery(queries, ['option2-1', 'option2-2'])).toBeFalsy();
      expect(isExistingQuery(queries, ['option1-1', 'option1-3'])).toBeFalsy();
      expect(isExistingQuery(queries, [])).toBeFalsy();
    });

    it('returns true when there is  a match', () => {
      expect(isExistingQuery(queries, ['option1-1', 'option1-2', 'option1-3'])).toBeTruthy();
      expect(isExistingQuery(queries, ['option2-1'])).toBeTruthy();
    });
  });

  describe('useRefetchClusterList', () => {
    let mockInvalidateQueries: jest.SpyInstance;
    const mockedUseGlobalState = jest.spyOn(useGlobalState, 'useGlobalState');

    beforeEach(() => {
      jest.useFakeTimers();
      jest.clearAllMocks();

      jest.spyOn(global, 'setInterval');
      jest.spyOn(global, 'clearInterval');

      // Mock queryClient.invalidateQueries
      mockInvalidateQueries = jest
        .spyOn(queryClient, 'invalidateQueries')
        .mockResolvedValue(undefined);

      // Mock document.visibilityState
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        value: 'visible',
      });

      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });

    afterEach(() => {
      jest.useRealTimers();
      mockInvalidateQueries.mockRestore();
    });

    it('provides functions that set the refresh schedule', async () => {
      mockedUseGlobalState.mockImplementation((callback) =>
        callback({ modal: { modalName: null } } as any),
      );

      const { result } = renderHook(() => useRefetchClusterList(false));

      // Verify functions are returned
      expect(result.current.refetch).toBeDefined();
      expect(result.current.setRefetchSchedule).toBeDefined();
      expect(result.current.clearRefetch).toBeDefined();

      // Call setRefetchSchedule and verify interval is set
      result.current.setRefetchSchedule();
      expect(setInterval).toHaveBeenCalled();

      // Advance time enough to trigger the interval (60 seconds)
      jest.advanceTimersByTime(60000);

      // Verify invalidateQueries was called
      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalled();
      });

      // Verify clearRefetch clears the interval
      result.current.clearRefetch();
      expect(clearInterval).toHaveBeenCalled();
    });

    it('does not auto reload data when modal is open', async () => {
      // Start with modal closed
      mockedUseGlobalState.mockImplementation((callback) =>
        callback({ modal: { modalName: null } } as any),
      );

      const { result, rerender } = renderHook(() => useRefetchClusterList(false));

      // Set up the refetch schedule
      result.current.setRefetchSchedule();

      // Open modal
      mockedUseGlobalState.mockImplementation((callback) =>
        callback({ modal: { modalName: 'someModal' } } as any),
      );
      rerender();

      // Wait for the effect to update savedIsModalOpen
      await waitFor(() => {
        // The ref should be updated by the useEffect
      });

      // Clear previous calls
      mockInvalidateQueries.mockClear();

      // Advance time to trigger the interval
      jest.advanceTimersByTime(60000);

      // Verify invalidateQueries was NOT called because modal is open
      await waitFor(() => {
        expect(mockInvalidateQueries).not.toHaveBeenCalled();
      });

      // Close modal
      mockedUseGlobalState.mockImplementation((callback) =>
        callback({ modal: { modalName: null } } as any),
      );
      rerender();

      // Wait for the effect to update
      await waitFor(() => {
        // The ref should be updated by the useEffect
      });

      // Clear previous calls
      mockInvalidateQueries.mockClear();

      // Advance time to trigger the interval again
      jest.advanceTimersByTime(60000);

      // Now verify invalidateQueries WAS called because modal is closed
      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalled();
      });
    });
  });

  describe('clearQueries', () => {
    it('removes cluster fetch queries and invalidates access transparency queries', async () => {
      await queryClient.fetchQuery({
        queryKey: [queryConstants.FETCH_CLUSTERS_QUERY_KEY, 'Active', 'subscriptions'],
        queryFn: () => 'hello world',
      });

      await queryClient.fetchQuery({
        queryKey: [queryConstants.FETCH_ACCESS_TRANSPARENCY, 'another key'],
        queryFn: () => 'hello world',
      });

      expect(queryClient.getQueryCache().getAll()).toHaveLength(2);

      const setQueries = (callBack: () => void) => {
        callBack();
      };
      const clearRefetch = jest.fn();

      clearQueries(setQueries, clearRefetch, false);

      const queriesAfterClear = queryClient.getQueryCache().getAll();
      expect(queriesAfterClear).toHaveLength(1);

      expect(queriesAfterClear[0].state.isInvalidated).toBeTruthy();
    });
  });

  describe('combineClusterQueries', () => {
    it('returns undefined if no clusters are provided', () => {
      expect(combineClusterQueries([], {}, {})).toBeUndefined();
    });

    it('returns expected array of clusters', () => {
      const clusters = [
        { partialCS: true, id: 'partialCSClusterId', subscription: { status: 'Active' } },
        { partialCS: false, id: 'clusterNoEditNoDelete', subscription: { status: 'Active' } },
        { partialCS: false, id: 'clusterEditNoDelete', subscription: { status: 'Active' } },
        { partialCS: false, id: 'clusterNoEditDelete', subscription: { status: 'Active' } },
        { partialCS: false, id: 'myCluster', subscription: { status: 'Active' } },
      ] as ClusterWithPermissions[];

      const canEditList = { partialCSClusterId: true, clusterEditNoDelete: true, myCluster: true };
      const canDeleteList = {
        partialCSClusterId: true,
        clusterNoEditDelete: true,
        myCluster: true,
      };
      const expected = [
        {
          partialCS: true,
          id: 'partialCSClusterId',
          canEdit: false,
          canDelete: false,
          subscription: { status: 'Active' },
        },
        {
          partialCS: false,
          id: 'clusterNoEditNoDelete',
          canEdit: false,
          canDelete: false,
          subscription: { status: 'Active' },
        },
        {
          partialCS: false,
          id: 'clusterEditNoDelete',
          canEdit: true,
          canDelete: false,
          subscription: { status: 'Active' },
        },
        {
          partialCS: false,
          id: 'clusterNoEditDelete',
          canEdit: false,
          canDelete: true,
          subscription: { status: 'Active' },
        },
        {
          partialCS: false,
          id: 'myCluster',
          canEdit: true,
          canDelete: true,
          subscription: { status: 'Active' },
        },
      ] as ClusterWithPermissions[];

      expect(combineClusterQueries(clusters, canEditList, canDeleteList)).toEqual(expected);
    });

    it('returns expected when canDelte and canEdit contain "*"', () => {
      const clusters = [
        { partialCS: true, id: 'partialCSClusterId', subscription: { status: 'Active' } },
        { partialCS: false, id: 'myCluster1', subscription: { status: 'Active' } },
        { partialCS: false, id: 'myCluster2', subscription: { status: 'Active' } },
      ] as ClusterWithPermissions[];

      const canEditList = { '*': true };
      const canDeleteList = {
        '*': true,
      };

      const expected = [
        {
          partialCS: true,
          id: 'partialCSClusterId',
          canEdit: false,
          canDelete: false,
          subscription: { status: 'Active' },
        },
        {
          partialCS: false,
          id: 'myCluster1',
          canEdit: true,
          canDelete: true,
          subscription: { status: 'Active' },
        },
        {
          partialCS: false,
          id: 'myCluster2',
          canEdit: true,
          canDelete: true,
          subscription: { status: 'Active' },
        },
      ] as ClusterWithPermissions[];

      expect(combineClusterQueries(clusters, canEditList, canDeleteList)).toEqual(expected);
    });
  });
});
