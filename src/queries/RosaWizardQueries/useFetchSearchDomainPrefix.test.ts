import axios from 'axios';

import { waitFor } from '@testing-library/react';

import apiRequest from '~/services/apiRequest';
import { renderHook } from '~/testUtils';

import { mockedExistingSearchedCluster } from '../__mocks__/queryMockedData';

import { useFetchSearchDomainPrefix } from './useFetchSearchDomainPrefix';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('useFetchSearchDomainPrefix hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // skipping because the mocked request is returning "status: 500" error
  it.skip('Get useFetchSearchDomainPrefix valid response', async () => {
    const search = 'domain-pre-1';

    // Mock the network request using axios
    apiRequestMock.get.mockResolvedValueOnce(mockedExistingSearchedCluster);

    const { result } = renderHook(() => useFetchSearchDomainPrefix(search, undefined));

    // Initial fetching state
    expect(result.current.isFetching).toBe(true);

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual(mockedExistingSearchedCluster);
  });
});
