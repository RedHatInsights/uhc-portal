import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import { renderHook, waitFor } from '~/testUtils';

import clusterService, { getClusterServiceForRegion } from '../../../../services/clusterService';

import {
  refetchIdentityProvidersWithHTPUsers,
  useFetchIDPsWithHTPUsers,
} from './useFetchIDPsWithHTPUsers';

jest.mock('../../../../services/clusterService', () => ({
  __esModule: true,
  default: {
    getIdentityProviders: jest.fn(),
  },
}));

jest.mock('../../../../services/clusterService', () => ({
  __esModule: true,
  default: {
    getHtpasswdUsers: jest.fn(),
  },
}));

jest.mock('../../../../services/clusterService', () => ({
  getClusterServiceForRegion: jest.fn(),
}));

jest.mock('~/components/App/queryClient', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}));

const clusterIDP = {
  kind: 'IdentityProviderList',
  page: 1,
  size: 1,
  total: 1,
  items: [
    {
      kind: 'IdentityProvider',
      type: 'HTPasswdIdentityProvider',
      id: 'idpId1',
      name: 'mockedIDPName',
      mapping_method: 'claim',
    },
  ],
};

const htpUsers = {
  items: [
    {
      kind: 'HTPasswdUser',
      id: 'userId2',
      username: 'user2',
    },
    {
      kind: 'HTPasswdUser',
      id: 'userId1',
      username: 'user1',
    },
  ],
};

const idpsWithHTPasswdUsers = [
  {
    kind: 'IdentityProvider',
    type: 'HTPasswdIdentityProvider',
    id: 'idpId1',
    name: 'mockedIDPName',
    mapping_method: 'claim',
    htpUsers: [
      {
        kind: 'HTPasswdUser',
        id: 'userId1',
        username: 'user1',
      },
      {
        kind: 'HTPasswdUser',
        id: 'userId2',
        username: 'user2',
      },
    ],
  },
];

describe('useFetchIDPsWithHTPUsers', () => {
  const mockGetIdentityProviders = jest.fn();
  const mockGetHtpasswdUsers = jest.fn();
  const mockedIDPsWithHTPUsers = jest.fn();
  const mockGetClusterServiceForRegion = getClusterServiceForRegion as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    clusterService.getIdentityProviders = mockGetIdentityProviders;
    clusterService.getHtpasswdUsers = mockGetHtpasswdUsers;
    mockGetClusterServiceForRegion.mockReturnValue({
      getIdentityProviders: mockGetIdentityProviders,
      getHtpasswdUsers: mockGetHtpasswdUsers,
    });
  });

  it('returns idps and users from apis', async () => {
    mockGetIdentityProviders.mockResolvedValueOnce({ data: clusterIDP });
    mockGetHtpasswdUsers.mockResolvedValueOnce({ data: htpUsers });

    mockedIDPsWithHTPUsers.mockResolvedValue({ data: idpsWithHTPasswdUsers });

    const { result } = renderHook(() => useFetchIDPsWithHTPUsers('myClusterId'));
    await waitFor(() => expect(result.current.isLoading).toBeTruthy());
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith(undefined);
    const { data, isError } = result.current;

    expect(isError).toBeFalsy();
    expect(data).toEqual(idpsWithHTPasswdUsers);
    expect(isError).toBeFalsy();
  });

  it.skip('displays error correctly', async () => {
    const clusterID = 'test-cluster';
    const mockError = new Error('test error');
    const mockFormattedError = formatErrorData as jest.Mock;

    mockGetIdentityProviders.mockResolvedValueOnce({ data: clusterIDP });

    mockGetHtpasswdUsers.mockRejectedValueOnce(mockError);
    mockedIDPsWithHTPUsers.mockResolvedValue(mockError);
    mockFormattedError.mockReturnValueOnce({ message: 'formatted error' });

    const { result } = renderHook(() => useFetchIDPsWithHTPUsers(clusterID));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual({ message: 'formatted error' });

    expect(mockFormattedError).toHaveBeenCalledWith(
      result.current.isPending,
      result.current.isError,
      mockError,
    );
  });

  it.each([
    ['clusterID only', undefined],
    ['clusterID and region', 'us-east-1'],
  ])('should invalidate queries with %s', (_title: string, region: string | undefined) => {
    const clusterID = 'test-cluster';

    refetchIdentityProvidersWithHTPUsers(clusterID, region);

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['fetchIDPsWithHTPUsers', clusterID, region],
    });
  });
});
