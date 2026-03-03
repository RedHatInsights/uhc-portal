import axios from 'axios';

import { waitFor } from '@testing-library/react';

import apiRequest from '~/services/apiRequest';
import { renderHook } from '~/testUtils';

import { mockedExistingSearchedCluster } from '../__mocks__/queryMockedData';

import { useFetchSearchClusterName } from './useFetchSearchClusterName';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('useFetchSearchClusterName hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Get useFetchSearchClusterName valid response', async () => {
    const search = 'existing-cluster-name';

    // Mock the network request using axios
    // searchClusters uses POST, and returns { data: { items: [...] } }
    apiRequestMock.post.mockResolvedValueOnce({ data: mockedExistingSearchedCluster });

    const { result } = renderHook(() => useFetchSearchClusterName(search, undefined));

    // Initial fetching state
    expect(result.current.isFetching).toBe(true);

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    // The hook returns !!response?.data?.items?.length, which is true when items exist
    expect(result.current.data).toBe(true);
  });
});
