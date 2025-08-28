import * as clusterService from '~/services/clusterService';
import { renderHook, waitFor } from '~/testUtils';

import { useDeleteHtpasswdUser } from './useDeleteHtpasswdUser';

const mockGetClusterServiceForRegion = jest.spyOn(clusterService, 'getClusterServiceForRegion');
const mockedDeleteHtpasswdUser = jest.fn();

describe('useDeleteHtpasswdUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const clusterID = 'clusterID1';
  const idpID = 'idpId1';
  const htpasswdUserId = 'userId1';

  it('does not call regional service when region does not exist', async () => {
    const region = undefined;
    // @ts-ignore
    mockGetClusterServiceForRegion.mockReturnValue({
      deleteHtpasswdUser: mockedDeleteHtpasswdUser,
    });
    mockedDeleteHtpasswdUser.mockResolvedValue({});

    const { result } = renderHook(() => useDeleteHtpasswdUser(clusterID, idpID));

    result.current.mutate({ clusterID, region });

    await waitFor(() => {
      expect(mockedDeleteHtpasswdUser).not.toHaveBeenCalled();
    });
    expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith(undefined);
    expect(mockedDeleteHtpasswdUser).not.toHaveBeenCalledWith(clusterID);
  });

  it('calls regional service when region exists', async () => {
    const region = 'aws.ap-southeast-1.stage';
    // @ts-ignore
    mockGetClusterServiceForRegion.mockReturnValue({
      deleteHtpasswdUser: mockedDeleteHtpasswdUser,
    });
    mockedDeleteHtpasswdUser.mockResolvedValue({});

    const { result } = renderHook(() => useDeleteHtpasswdUser(clusterID, idpID, region));

    result.current.mutate(htpasswdUserId);

    await waitFor(() => {
      expect(mockedDeleteHtpasswdUser).toHaveBeenCalled();
    });
    expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith(region);
    expect(mockedDeleteHtpasswdUser).toHaveBeenCalledWith(clusterID, idpID, htpasswdUserId);
  });
});
