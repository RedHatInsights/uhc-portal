import { queryClient } from '~/components/App/queryClient';
import { queryConstants } from '~/queries/queriesConstants';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import { act, renderHook, waitFor } from '~/testUtils';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';

import { invalidateAllLogForwarderQueries, invalidateLogForwarder } from './invalidateLogForwarder';
import { useCreateLogForwarder } from './useCreateLogForwarder';
import { useDeleteLogForwarder } from './useDeleteLogForwarder';
import { useEditLogForwarder } from './useEditLogForwarder';
import { useFetchLogForwarders } from './useFetchLogForwarders';

jest.mock('~/components/App/queryClient', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}));

jest.mock('~/services/clusterService', () => ({
  __esModule: true,
  default: {
    getClusterControlPlaneLogForwarders: jest.fn(),
    postClusterControlPlaneLogForwarder: jest.fn(),
    patchClusterControlPlaneLogForwarder: jest.fn(),
    deleteClusterControlPlaneLogForwarder: jest.fn(),
  },
  getClusterServiceForRegion: jest.fn(),
}));

const mockClusterService = clusterService as jest.Mocked<typeof clusterService>;
const mockGetClusterServiceForRegion = getClusterServiceForRegion as jest.Mock;

describe('invalidateLogForwarder', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates the cluster control plane log forwarders query', () => {
    invalidateLogForwarder('cluster-1', 'us-east-1');

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [
        queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS,
        'cluster-1',
        'us-east-1',
      ],
    });
  });
});

describe('invalidateAllLogForwarderQueries', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates all control plane log forwarder queries', () => {
    invalidateAllLogForwarderQueries();

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      predicate: expect.any(Function),
    });
    const { predicate } = (queryClient.invalidateQueries as jest.Mock).mock.calls[0][0];
    expect(
      predicate({ queryKey: [queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS, 'c-1'] }),
    ).toBe(true);
    expect(predicate({ queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY] })).toBe(false);
  });
});

describe('useFetchLogForwarders', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches forwarders for a cluster in a region', async () => {
    const items: LogForwarder[] = [{ id: 'lf-1', s3: { bucket_name: 'bucket' } }];
    const regionalGet = jest.fn().mockResolvedValue({ data: { items } });
    mockGetClusterServiceForRegion.mockReturnValue({
      getClusterControlPlaneLogForwarders: regionalGet,
    } as unknown as ReturnType<typeof getClusterServiceForRegion>);

    const { result } = renderHook(() => useFetchLogForwarders('cluster-1', 'us-east-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith('us-east-1');
    expect(regionalGet).toHaveBeenCalledWith('cluster-1');
    expect(result.current.data).toEqual(items);
    expect(result.current.isError).toBe(false);
  });

  it('uses the default cluster service when region is not provided', async () => {
    mockClusterService.getClusterControlPlaneLogForwarders.mockResolvedValueOnce({
      data: { items: [] },
    } as unknown as Awaited<ReturnType<typeof clusterService.getClusterControlPlaneLogForwarders>>);

    const { result } = renderHook(() => useFetchLogForwarders('cluster-1', undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetClusterServiceForRegion).not.toHaveBeenCalled();
    expect(mockClusterService.getClusterControlPlaneLogForwarders).toHaveBeenCalledWith(
      'cluster-1',
    );
    expect(result.current.data).toEqual([]);
  });

  it('does not fetch when cluster id is missing', () => {
    const { result } = renderHook(() => useFetchLogForwarders(undefined, 'us-east-1'));

    expect(result.current.isLoading).toBe(false);
    expect(mockGetClusterServiceForRegion).not.toHaveBeenCalled();
    expect(mockClusterService.getClusterControlPlaneLogForwarders).not.toHaveBeenCalled();
  });

  it('exposes formatted error when the request fails', async () => {
    const regionalGet = jest.fn().mockRejectedValue(new Error('network error'));
    mockGetClusterServiceForRegion.mockReturnValue({
      getClusterControlPlaneLogForwarders: regionalGet,
    } as unknown as ReturnType<typeof getClusterServiceForRegion>);

    const { result } = renderHook(() => useFetchLogForwarders('cluster-1', 'us-east-1'));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });
});

describe('useCreateLogForwarder', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('posts a log forwarder and invalidates the forwarders query', async () => {
    const body: LogForwarder = { id: 'lf-new', s3: { bucket_name: 'bucket' } };
    const postMock = jest.fn().mockResolvedValue({ data: body });
    mockGetClusterServiceForRegion.mockReturnValue({
      postClusterControlPlaneLogForwarder: postMock,
    } as unknown as ReturnType<typeof getClusterServiceForRegion>);

    const { result } = renderHook(() => useCreateLogForwarder('cluster-1', 'us-east-1'));

    await act(async () => {
      result.current.mutate(body);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(postMock).toHaveBeenCalledWith('cluster-1', body);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [
        queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS,
        'cluster-1',
        'us-east-1',
      ],
    });
  });

  it('formats errors from failed create requests', async () => {
    const postMock = jest.fn().mockRejectedValue(new Error('create failed'));
    mockGetClusterServiceForRegion.mockReturnValue({
      postClusterControlPlaneLogForwarder: postMock,
    } as unknown as ReturnType<typeof getClusterServiceForRegion>);

    const { result } = renderHook(() => useCreateLogForwarder('cluster-1', 'us-east-1'));

    await act(async () => {
      result.current.mutate({ s3: { bucket_name: 'bucket' } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });

  it('uses the default cluster service when region is not provided', async () => {
    const body: LogForwarder = { s3: { bucket_name: 'bucket' } };
    mockClusterService.postClusterControlPlaneLogForwarder.mockResolvedValueOnce({
      data: body,
    } as unknown as Awaited<ReturnType<typeof clusterService.postClusterControlPlaneLogForwarder>>);

    const { result } = renderHook(() => useCreateLogForwarder('cluster-1'));

    await act(async () => {
      result.current.mutate(body);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetClusterServiceForRegion).not.toHaveBeenCalled();
    expect(mockClusterService.postClusterControlPlaneLogForwarder).toHaveBeenCalledWith(
      'cluster-1',
      body,
    );
  });
});

describe('useEditLogForwarder', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('patches a log forwarder and invalidates the forwarders query', async () => {
    const body: LogForwarder = { s3: { bucket_name: 'updated' } };
    const patchMock = jest.fn().mockResolvedValue({ data: body });
    mockGetClusterServiceForRegion.mockReturnValue({
      patchClusterControlPlaneLogForwarder: patchMock,
    } as unknown as ReturnType<typeof getClusterServiceForRegion>);

    const { result } = renderHook(() => useEditLogForwarder('cluster-1', 'us-east-1'));

    await act(async () => {
      result.current.mutate({ logForwarderID: 'lf-1', body });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(patchMock).toHaveBeenCalledWith('cluster-1', 'lf-1', body);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [
        queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS,
        'cluster-1',
        'us-east-1',
      ],
    });
  });

  it('formats errors from failed edit requests', async () => {
    const patchMock = jest.fn().mockRejectedValue(new Error('edit failed'));
    mockGetClusterServiceForRegion.mockReturnValue({
      patchClusterControlPlaneLogForwarder: patchMock,
    } as unknown as ReturnType<typeof getClusterServiceForRegion>);

    const { result } = renderHook(() => useEditLogForwarder('cluster-1', 'us-east-1'));

    await act(async () => {
      result.current.mutate({ logForwarderID: 'lf-1', body: { s3: { bucket_name: 'bucket' } } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});

describe('useDeleteLogForwarder', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deletes a log forwarder and invalidates the forwarders query', async () => {
    const deleteMock = jest.fn().mockResolvedValue({});
    mockGetClusterServiceForRegion.mockReturnValue({
      deleteClusterControlPlaneLogForwarder: deleteMock,
    } as unknown as ReturnType<typeof getClusterServiceForRegion>);

    const { result } = renderHook(() => useDeleteLogForwarder('cluster-1', 'us-east-1'));

    await act(async () => {
      result.current.mutate('lf-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(deleteMock).toHaveBeenCalledWith('cluster-1', 'lf-1');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [
        queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS,
        'cluster-1',
        'us-east-1',
      ],
    });
  });

  it('formats errors from failed delete requests', async () => {
    const deleteMock = jest.fn().mockRejectedValue(new Error('delete failed'));
    mockGetClusterServiceForRegion.mockReturnValue({
      deleteClusterControlPlaneLogForwarder: deleteMock,
    } as unknown as ReturnType<typeof getClusterServiceForRegion>);

    const { result } = renderHook(() => useDeleteLogForwarder('cluster-1', 'us-east-1'));

    await act(async () => {
      result.current.mutate('lf-1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});
