import { formatErrorData } from '~/queries/helpers';
import { renderHook, waitFor } from '~/testUtils';

import clusterService, { getClusterServiceForRegion } from '../../../../services/clusterService';

import { useCreateHtpasswdUser } from './useCreateHtpasswdUser';

jest.mock('../../../../services/clusterService', () => ({
  __esModule: true,
  default: {
    createHtpasswdUser: jest.fn(),
  },
}));

jest.mock('../../../../services/clusterService', () => ({
  getClusterServiceForRegion: jest.fn(),
}));

jest.mock('~/queries/helpers');

describe('useCreateHtpasswdUser', () => {
  const mockAddUser = jest.fn();
  const mockGetClusterServiceForRegion = getClusterServiceForRegion as jest.Mock;
  const mockFormatErrorData = formatErrorData as jest.Mock;

  clusterService.createHtpasswdUser = mockAddUser;
  mockGetClusterServiceForRegion.mockReturnValue({
    createHtpasswdUser: mockAddUser,
  });

  const region = 'myRegion';
  const clusterId = 'myClusterId';
  const idpId = 'myIDPid';
  const username = 'myUserName';
  const password = 'myPassword';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sends correct information when making API call', async () => {
    mockAddUser.mockResolvedValue('success');
    const { result } = renderHook(() => useCreateHtpasswdUser(clusterId, idpId));

    await result.current.mutate({ username, password });
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });
    expect(getClusterServiceForRegion).toHaveBeenCalledWith(undefined);
    expect(mockAddUser).toHaveBeenCalledWith(clusterId, idpId, username, password);
  });

  it('makes regionalized call when region is passed', async () => {
    mockAddUser.mockResolvedValue('success');
    const { result } = renderHook(() => useCreateHtpasswdUser(clusterId, idpId, region));

    await result.current.mutate({ username, password });
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });
    expect(getClusterServiceForRegion).toHaveBeenCalledWith(region);
    expect(mockAddUser).toHaveBeenCalledWith(clusterId, idpId, username, password);
  });

  it('returns a formatted error when API call results in error', async () => {
    const mockError = new Error('test error');
    mockAddUser.mockRejectedValue(mockError);
    mockFormatErrorData.mockReturnValue({ error: { message: 'formatted error' } });

    const { result } = renderHook(() => useCreateHtpasswdUser(clusterId, idpId));

    await result.current.mutate({ username, password });

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
    });

    expect(result.current.error).toEqual({ message: 'formatted error' });
    expect(mockFormatErrorData).toHaveBeenCalledWith(
      result.current.isPending,
      result.current.isError,
      mockError,
    );
  });
});
