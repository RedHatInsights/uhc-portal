import * as clusterService from '~/services/clusterService';
import { renderHook, waitFor } from '~/testUtils';

import { useEditChannelOnCluster } from './useEditChannelOnCluster';

const mockGetClusterServiceForRegion = jest.spyOn(clusterService, 'getClusterServiceForRegion');
const mockedEditCluster = jest.fn();

describe('useEditChannelOnCluster', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const clusterID = 'cluster-123';

  it('calls regional service when region is provided', async () => {
    const region = 'aws.ap-southeast-1.stage';
    // @ts-ignore
    mockGetClusterServiceForRegion.mockReturnValue({
      editCluster: mockedEditCluster,
    });
    mockedEditCluster.mockResolvedValue({});

    const { result } = renderHook(() => useEditChannelOnCluster());

    result.current.mutate({ clusterID, channel: 'eus-4.16', region });

    await waitFor(() => {
      expect(mockedEditCluster).toHaveBeenCalled();
    });
    expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith(region);
    expect(mockedEditCluster).toHaveBeenCalledWith(clusterID, { channel: 'eus-4.16' });
  });

  it('calls default service when region is not provided', async () => {
    // @ts-ignore
    mockGetClusterServiceForRegion.mockReturnValue({
      editCluster: mockedEditCluster,
    });
    mockedEditCluster.mockResolvedValue({});

    const { result } = renderHook(() => useEditChannelOnCluster());

    result.current.mutate({ clusterID, channel: 'stable-4.16' });

    await waitFor(() => {
      expect(mockedEditCluster).toHaveBeenCalled();
    });
    expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith(undefined);
    expect(mockedEditCluster).toHaveBeenCalledWith(clusterID, { channel: 'stable-4.16' });
  });
});
