import getOCPLifeCycleStatus from '~/services/productLifeCycleService';
import { mockUseFeatureGate, renderHook, waitFor } from '~/testUtils';

import { OCP5_SUPPORT } from './featureGates/featureConstants';
import { useOCPLifeCycleStatus } from './useOCPLifeCycleStatus';

jest.mock('~/services/productLifeCycleService');

const getOCPLifeCycleStatusMock = getOCPLifeCycleStatus as jest.Mock;

const mockVersionsResponse = (versions: object[]) =>
  getOCPLifeCycleStatusMock.mockResolvedValue({
    data: { data: [{ versions }] },
  });

describe('useOCPLifeCycleStatus', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns versions on successful fetch (flag OFF → v1)', async () => {
    mockVersionsResponse([
      { name: '4.16', type: 'Full Support' },
      { name: '4.15', type: 'Maintenance Support' },
    ]);

    const { result } = renderHook(() => useOCPLifeCycleStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.versions).toHaveLength(2);
    expect(result.current.versions?.[0].name).toBe('4.16');
    expect(getOCPLifeCycleStatusMock).toHaveBeenCalledWith(false);
  });

  it('calls the v2 endpoint when OCP5_SUPPORT is enabled', async () => {
    mockUseFeatureGate([[OCP5_SUPPORT, true]]);
    mockVersionsResponse([
      { name: '5.0', type: 'Full Support' },
      { name: '4.16', type: 'Full Support' },
    ]);

    const { result } = renderHook(() => useOCPLifeCycleStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(getOCPLifeCycleStatusMock).toHaveBeenCalledWith(true);
    expect(result.current.versions?.[0].name).toBe('5.0');
  });

  it('exposes isError when the API call fails', async () => {
    getOCPLifeCycleStatusMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useOCPLifeCycleStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.versions).toBeUndefined();
  });

  it('starts in the loading state', () => {
    mockVersionsResponse([]);

    const { result } = renderHook(() => useOCPLifeCycleStatus());

    expect(result.current.isLoading).toBe(true);
  });
});
