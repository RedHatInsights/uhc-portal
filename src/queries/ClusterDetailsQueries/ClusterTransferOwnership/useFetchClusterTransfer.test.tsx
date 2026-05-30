import * as reactRedux from 'react-redux';

import { queryClient } from '~/components/App/queryClient';
import { queryConstants } from '~/queries/queriesConstants';
import { viewConstants, viewPaginationConstants } from '~/redux/constants';
import { useGlobalState } from '~/redux/hooks';
import { accountsService } from '~/services';
import { renderHook, waitFor } from '~/testUtils';
import { ViewOptions } from '~/types/types';

import { refetchFetchClusterTransfer, useFetchClusterTransfer } from './useFetchClusterTransfer';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

const useGlobalStateMock = useGlobalState as jest.Mock;

const defaultViewOptions: ViewOptions = {
  currentPage: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
  filter: '',
  sorting: {
    sortIndex: 0,
    sortField: 'created_at',
    isAscending: false,
  },
  flags: {},
};

describe('useFetchClusterTransfer', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  let getClusterTransferByExternalIDSpy: jest.SpyInstance;
  let searchClusterTransfersSpy: jest.SpyInstance;

  beforeEach(() => {
    useDispatchMock.mockReturnValue(mockedDispatch);
    mockedDispatch.mockClear();
    useGlobalStateMock.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({
        viewOptions: {
          [viewConstants.CLUSTER_TRANSFER_VIEW]: defaultViewOptions,
        },
      }),
    );
    getClusterTransferByExternalIDSpy = jest.spyOn(
      accountsService,
      'getClusterTransferByExternalID',
    );
    searchClusterTransfersSpy = jest.spyOn(accountsService, 'searchClusterTransfers');
  });

  afterEach(() => {
    getClusterTransferByExternalIDSpy.mockRestore();
    searchClusterTransfersSpy.mockRestore();
  });

  it('does not fetch when transferID, clusterExternalID, and filter are all missing', async () => {
    const { result } = renderHook(() => useFetchClusterTransfer({}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getClusterTransferByExternalIDSpy).not.toHaveBeenCalled();
    expect(searchClusterTransfersSpy).not.toHaveBeenCalled();
  });

  it('fetches by cluster external ID and returns list data', async () => {
    const listPayload = {
      items: [{ id: 't1', cluster_uuid: 'ext-1', status: 'completed' }],
      total: 1,
    };
    getClusterTransferByExternalIDSpy.mockResolvedValueOnce({
      data: listPayload,
    });

    const { result } = renderHook(() => useFetchClusterTransfer({ clusterExternalID: 'ext-1' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getClusterTransferByExternalIDSpy).toHaveBeenCalledWith('ext-1');
    expect(searchClusterTransfersSpy).not.toHaveBeenCalled();
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual(listPayload);
    expect(mockedDispatch).not.toHaveBeenCalled();
  });

  it('searches by transfer ID with pagination options from view state', async () => {
    const searchResponse = { data: { items: [], total: 0 } };
    searchClusterTransfersSpy.mockResolvedValueOnce(searchResponse);

    const { result } = renderHook(() => useFetchClusterTransfer({ transferID: 'tr-99' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(searchClusterTransfersSpy).toHaveBeenCalledWith({
      filter: `id='tr-99'`,
      page: 1,
      size: 20,
      orderBy: 'created_at desc',
    });
    expect(getClusterTransferByExternalIDSpy).not.toHaveBeenCalled();
    expect(result.current.data).toEqual(searchResponse.data);
  });

  it('uses updated_at desc when sort field is empty', async () => {
    useGlobalStateMock.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({
        viewOptions: {
          [viewConstants.CLUSTER_TRANSFER_VIEW]: {
            ...defaultViewOptions,
            sorting: { ...defaultViewOptions.sorting, sortField: '' },
          },
        },
      }),
    );
    searchClusterTransfersSpy.mockResolvedValueOnce({ data: { items: [], total: 0 } });

    const { result } = renderHook(() => useFetchClusterTransfer({ transferID: 't-sort' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(searchClusterTransfersSpy).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: 'updated_at desc' }),
    );
    expect(result.current.isError).toBe(false);
  });

  it('uses ascending order when view sort is ascending', async () => {
    useGlobalStateMock.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({
        viewOptions: {
          [viewConstants.CLUSTER_TRANSFER_VIEW]: {
            ...defaultViewOptions,
            sorting: {
              ...defaultViewOptions.sorting,
              sortField: 'name',
              isAscending: true,
            },
          },
        },
      }),
    );
    searchClusterTransfersSpy.mockResolvedValueOnce({ data: { items: [], total: 0 } });

    const { result } = renderHook(() => useFetchClusterTransfer({ transferID: 't-asc' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(searchClusterTransfersSpy).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: 'name asc' }),
    );
    expect(result.current.isError).toBe(false);
  });

  it('falls back to page 1 and size 20 when view options are zero', async () => {
    useGlobalStateMock.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({
        viewOptions: {
          [viewConstants.CLUSTER_TRANSFER_VIEW]: {
            ...defaultViewOptions,
            currentPage: 0,
            pageSize: 0,
          },
        },
      }),
    );
    searchClusterTransfersSpy.mockResolvedValueOnce({ data: { items: [], total: 0 } });

    const { result } = renderHook(() => useFetchClusterTransfer({ filter: `id='x'` }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(searchClusterTransfersSpy).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, size: 20 }),
    );
    expect(result.current.isError).toBe(false);
  });

  it('uses custom filter when provided', async () => {
    searchClusterTransfersSpy.mockResolvedValueOnce({ data: { items: [], total: 0 } });

    const { result } = renderHook(() => useFetchClusterTransfer({ filter: `owner='org-1'` }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(searchClusterTransfersSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: `owner='org-1'`,
      }),
    );
    expect(result.current.isError).toBe(false);
  });

  it('dispatches total count for list/search mode when total is present', async () => {
    searchClusterTransfersSpy.mockResolvedValueOnce({
      data: { items: [], total: 42 },
    });

    const { result } = renderHook(() => useFetchClusterTransfer({ transferID: 't1' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(mockedDispatch).toHaveBeenCalled();
    });

    expect(mockedDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: viewPaginationConstants.SET_TOTAL_ITEMS,
        payload: expect.objectContaining({
          viewType: viewConstants.CLUSTER_TRANSFER_VIEW,
          totalCount: 42,
        }),
      }),
    );
  });

  it('returns pending transfer items when showPendingTransfer is true', async () => {
    const pendingItem = {
      id: 'tp',
      cluster_uuid: 'ext-p',
      status: 'pending',
    };
    getClusterTransferByExternalIDSpy.mockResolvedValueOnce({
      data: {
        items: [pendingItem, { id: 'other', cluster_uuid: 'ext-p', status: 'completed' }],
        total: 2,
      },
    });

    const { result } = renderHook(() =>
      useFetchClusterTransfer({
        clusterExternalID: 'ext-p',
        showPendingTransfer: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({ items: [pendingItem] });
  });

  it('returns accepted transfer items when showPendingTransfer matches accepted status', async () => {
    const acceptedItem = {
      id: 'ta',
      cluster_uuid: 'ext-a',
      status: 'accepted',
    };
    getClusterTransferByExternalIDSpy.mockResolvedValueOnce({
      data: { items: [acceptedItem], total: 1 },
    });

    const { result } = renderHook(() =>
      useFetchClusterTransfer({
        clusterExternalID: 'ext-a',
        showPendingTransfer: true,
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual({ items: [acceptedItem] });
  });

  it('returns empty object in items when showPendingTransfer finds no pending or accepted row', async () => {
    getClusterTransferByExternalIDSpy.mockResolvedValueOnce({
      data: {
        items: [{ id: 'done', cluster_uuid: 'ext-z', status: 'completed' }],
        total: 1,
      },
    });

    const { result } = renderHook(() =>
      useFetchClusterTransfer({
        clusterExternalID: 'ext-z',
        showPendingTransfer: true,
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual({ items: [{}] });
  });

  it('does not dispatch total when search response has no total field', async () => {
    searchClusterTransfersSpy.mockResolvedValueOnce({ data: { items: [] } });

    const { result } = renderHook(() => useFetchClusterTransfer({ transferID: 'no-total' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(result.current.data).toEqual({ items: [] });
  });

  it('returns formatted error when the request fails', async () => {
    getClusterTransferByExternalIDSpy.mockRejectedValueOnce({
      name: 403,
      message: 'Forbidden',
    });

    const { result } = renderHook(() => useFetchClusterTransfer({ clusterExternalID: 'ext-err' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(
      expect.objectContaining({
        isError: true,
        error: expect.objectContaining({
          message: 'Forbidden',
        }),
      }),
    );
  });
});

describe('refetchFetchClusterTransfer', () => {
  it('invalidates cluster transfer queries', () => {
    const spy = jest.spyOn(queryClient, 'invalidateQueries');
    refetchFetchClusterTransfer();
    expect(spy).toHaveBeenCalledWith({
      queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY, 'fetchClusterTransfer'],
    });
    spy.mockRestore();
  });
});
