import type { AxiosResponse } from 'axios';

import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import { act, renderHook, waitFor } from '~/testUtils';

import { useAddAddOn } from './useAddAddOn';

const apiResponse = {
  data: { id: '123' },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
} as AxiosResponse<{ id: string }>;

jest.mock('~/services/clusterService', () => ({
  __esModule: true,
  getClusterServiceForRegion: jest.fn(),
  default: {
    addClusterAddOn: jest.fn(),
  },
}));

const mockGetClusterServiceForRegion = getClusterServiceForRegion as jest.Mock;
const mockClusterService = clusterService as jest.Mocked<typeof clusterService>;

describe('useAddAddOn', () => {
  const addClusterAddOnMock = jest.fn(() => new Promise(() => {}));

  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    clusterID: 'myClusterId',
    clusterAddOn: { name: 'addonName' },
    region: 'us-west-1',
  };

  it('should return initial state', () => {
    const { result } = renderHook(() =>
      useAddAddOn(defaultProps.clusterID, defaultProps.clusterAddOn, defaultProps.region),
    );

    expect(result.current).toEqual({
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
    });
  });

  it('should return pending state with region', async () => {
    mockGetClusterServiceForRegion.mockReturnValue({
      addClusterAddOn: addClusterAddOnMock,
    });

    const { result } = renderHook(() =>
      useAddAddOn(defaultProps.clusterID, defaultProps.clusterAddOn, defaultProps.region),
    );

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    expect(result.current).toEqual({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
    });
  });

  it('should return pending state without region', async () => {
    mockClusterService.addClusterAddOn.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() =>
      useAddAddOn(defaultProps.clusterID, defaultProps.clusterAddOn),
    );

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    expect(result.current).toEqual({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
    });
  });

  it('should return error state when API call fails with region', async () => {
    mockGetClusterServiceForRegion.mockReturnValue({
      addClusterAddOn: jest.fn(() => Promise.reject(new Error('Network Error'))),
    });

    const { result } = renderHook(() =>
      useAddAddOn(defaultProps.clusterID, defaultProps.clusterAddOn, defaultProps.region),
    );

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isPending).toBeFalsy();
    });

    expect(result.current).toEqual({
      data: undefined,
      isPending: false,
      isError: true,
      error: expect.objectContaining({ message: 'Network Error' }),
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
    });
  });

  it('should return error state when API call fails without region', async () => {
    mockClusterService.addClusterAddOn.mockReturnValue(Promise.reject(new Error('Network Error')));

    const { result } = renderHook(() =>
      useAddAddOn(defaultProps.clusterID, defaultProps.clusterAddOn),
    );

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isPending).toBeFalsy();
    });

    expect(result.current).toEqual({
      data: undefined,
      isPending: false,
      isError: true,
      error: expect.objectContaining({ message: 'Network Error' }),
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
    });
  });

  it('should return success state with region when API call succeeds', async () => {
    mockGetClusterServiceForRegion.mockReturnValue({
      addClusterAddOn: jest.fn(() => Promise.resolve(apiResponse)),
    });

    const { result } = renderHook(() =>
      useAddAddOn(defaultProps.clusterID, defaultProps.clusterAddOn, defaultProps.region),
    );

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isPending).toBeFalsy();
    });

    expect(result.current).toEqual({
      data: apiResponse,
      isPending: false,
      isError: false,
      error: null,
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
    });
  });

  it('should return success state without region when API call succeeds', async () => {
    mockClusterService.addClusterAddOn.mockReturnValue(Promise.resolve(apiResponse));

    const { result } = renderHook(() =>
      useAddAddOn(defaultProps.clusterID, defaultProps.clusterAddOn),
    );

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isPending).toBeFalsy();
    });

    expect(result.current).toEqual({
      data: apiResponse,
      isPending: false,
      isError: false,
      error: null,
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
    });
  });
});
