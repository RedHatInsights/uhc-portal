import axios from 'axios';

import { clusterService } from '~/services';
import apiRequest from '~/services/apiRequest';
import { act, renderHook, waitFor } from '~/testUtils';
import { Cluster } from '~/types/clusters_mgmt.v1';

import { formatErrorData } from '../helpers';

import { useEditCluster } from './useEditCluster';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

jest.mock('~/services/clusterService');
jest.mock('../helpers', () => ({
  formatErrorData: jest.fn(),
}));

describe('useEditCluster hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Patch useEditCluster valid response', async () => {
    // Mock the network request using axios
    apiRequestMock.patch.mockResolvedValueOnce({ data: 'TEST DATA' });

    const mockClusterService = {
      editCluster: jest.fn().mockResolvedValue({ data: 'mock data' }),
    };

    (clusterService.editCluster as jest.Mock).mockImplementation(mockClusterService.editCluster);

    const { result } = renderHook(() => useEditCluster());

    await act(async () => {
      await result.current.mutate({ clusterID: 'mockClusterID', cluster: {} as Cluster });
    });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.data).toEqual({ data: 'mock data' });
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockClusterService.editCluster).toHaveBeenCalledWith('mockClusterID', {});
  });

  it('Patch useEditCluster error response', async () => {
    // Mock the network request using axios
    const formattedError = { error: 'mocked Error message' };
    const mockClusterService = {
      editCluster: jest.fn().mockRejectedValue(new Error('mock error')),
    };
    (clusterService.editCluster as jest.Mock).mockImplementation(mockClusterService.editCluster);
    (formatErrorData as jest.Mock).mockReturnValue(formattedError);

    const { result } = renderHook(() => useEditCluster());

    await act(async () => {
      await result.current.mutate({ clusterID: 'mockClusterID', cluster: {} as Cluster });
    });

    await waitFor(() => result.current.isError === true);

    expect(result.current.isError).toBe(true);
    expect(mockClusterService.editCluster).toHaveBeenCalledWith('mockClusterID', {});
    expect(result.current.error).toBe('mocked Error message');
    expect(formatErrorData).toHaveBeenCalledWith(false, true, new Error('mock error'));
  });

  it('should set error when clusterID is undefined', async () => {
    const { result } = renderHook(() => useEditCluster());

    await act(async () => {
      result.current.mutate({} as any);
    });

    await waitFor(() => result.current.isError);
    expect(result.current.isError).toBe(true);
  });

  it('should set error when clusterID is empty string', async () => {
    const { result } = renderHook(() => useEditCluster());

    await act(async () => {
      result.current.mutate({ clusterID: '', cluster: {} as Cluster });
    });

    await waitFor(() => result.current.isError);
    expect(result.current.isError).toBe(true);
  });
});
