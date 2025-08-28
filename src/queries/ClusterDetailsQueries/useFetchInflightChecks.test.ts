import axios from 'axios';

import { waitFor } from '@testing-library/react';

import apiRequest from '~/services/apiRequest';
import { renderHook } from '~/testUtils';

import {
  mockedInflightChecks,
  mockedSubscriptionWithClusterType,
} from '../__mocks__/queryMockedData';

import { useFetchInflightChecks } from './useFetchInflightChecks';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

const MAIN_QUERY_KEY = 'clusterDetails';

describe('useGetInflightChecks hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Get useGetInflightCheks valid response', async () => {
    const clusterID = 'mockedClusterID';

    // Mock the network request using axios
    apiRequestMock.get.mockResolvedValueOnce(mockedInflightChecks);
    const { result } = renderHook(() =>
      useFetchInflightChecks(clusterID, mockedSubscriptionWithClusterType),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual(mockedInflightChecks);
  });

  it('Get useGetInflightChecks error response', async () => {
    const clusterID = 'mockedClusterID';

    // Mock the network request using axios
    apiRequestMock.get.mockRejectedValueOnce({
      name: 403,
      message: 'No data',
    });
    const { result } = renderHook(() =>
      useFetchInflightChecks(clusterID, mockedSubscriptionWithClusterType, MAIN_QUERY_KEY),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toBe(undefined);
    expect(result.current.isError).toBe(true);
  });
});
