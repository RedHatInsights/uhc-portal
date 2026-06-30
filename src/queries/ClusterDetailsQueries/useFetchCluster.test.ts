import React from 'react';
import axios from 'axios';

import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook as rtlRenderHook, waitFor } from '@testing-library/react';

import { queryClient } from '~/components/App/queryClient';
import apiRequest from '~/services/apiRequest';
import clusterService, * as clusterServiceModule from '~/services/clusterService';
import { renderHook } from '~/testUtils';
import { Subscription, SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import { mockedCluster, mockSubscriptionData } from '../__mocks__/queryMockedData';
import { queryConstants } from '../queriesConstants';

import { useFetchCluster } from './useFetchCluster';
import { invalidateClusterDetailsQueries } from './useFetchClusterDetails';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;
const mockGetClusterServiceForRegion = jest.spyOn(
  clusterServiceModule,
  'getClusterServiceForRegion',
);

const MAIN_QUERY_KEY = 'clusterDetails';

const subscriptionWithRegion: Subscription = {
  ...mockSubscriptionData,
  rh_region_id: 'us-east-1',
};

const queryClientWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: queryClient }, children);

describe('useFetchCluster hook', () => {
  beforeEach(() => {
    mockGetClusterServiceForRegion.mockReturnValue(clusterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Get useGetClusterDetails valid response', async () => {
    const clusterID = 'mockedClusterID';
    const isAROCluster = false;

    // Mock the network request using axios
    apiRequestMock.get.mockResolvedValueOnce({ data: mockedCluster });

    const { result } = renderHook(() =>
      useFetchCluster(clusterID, mockSubscriptionData, isAROCluster, MAIN_QUERY_KEY),
    );

    // Initial loading state
    expect(apiRequest.get).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(undefined);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);

    // Assert results
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data?.data.kind).toEqual(mockedCluster.kind);
  });

  it('Get useGetClusterDetails error response', async () => {
    const clusterID = 'mockedClusterID';
    const isAROCluster = false;
    // Mock the network request to simulate an error
    apiRequestMock.get.mockRejectedValueOnce({
      name: 403,
      message: 'Cluster does not exist',
    });
    // Render the hook
    const { result } = renderHook(() =>
      useFetchCluster(clusterID, mockSubscriptionData, isAROCluster, MAIN_QUERY_KEY),
    );

    // Initial loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(undefined);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);

    // Assert results
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toBe(undefined);
    expect(result.current.isError).toBe(true);
    expect(result.current.error?.name).toEqual(403);
    expect(result.current.error?.message).toEqual('Cluster does not exist');
  });

  it('fetches cluster details using default clusterService when rh_region_id is absent', async () => {
    const clusterID = 'mockedClusterID';
    const isAROCluster = false;

    apiRequestMock.get.mockResolvedValueOnce({ data: mockedCluster });

    const { result } = renderHook(() =>
      useFetchCluster(clusterID, mockSubscriptionData, isAROCluster, MAIN_QUERY_KEY),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetClusterServiceForRegion).not.toHaveBeenCalled();
    expect(apiRequest.get).toHaveBeenCalledTimes(1);
    expect(result.current.isError).toBe(false);
    expect(result.current.data?.data.kind).toEqual(mockedCluster.kind);
  });

  it('does not refetch cluster details when subscription changes but rh_region_id stays the same', async () => {
    const clusterID = 'mockedClusterID';
    const isAROCluster = false;

    apiRequestMock.get.mockResolvedValue({ data: mockedCluster });

    const { result, rerender } = renderHook(
      ({ subscription }: { subscription: Subscription }) =>
        useFetchCluster(clusterID, subscription, isAROCluster, MAIN_QUERY_KEY),
      { initialProps: { subscription: subscriptionWithRegion } },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(apiRequest.get).toHaveBeenCalledTimes(1);

    rerender({
      subscription: {
        ...subscriptionWithRegion,
        status: SubscriptionCommonFieldsStatus.Disconnected,
        display_name: 'Updated subscription',
      },
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });
    expect(apiRequest.get).toHaveBeenCalledTimes(1);
  });

  it('is invalidated by invalidateClusterDetailsQueries', async () => {
    const clusterID = 'mockedClusterID';
    const isAROCluster = false;

    queryClient.clear();
    apiRequestMock.get.mockResolvedValue({ data: mockedCluster });

    const { result } = rtlRenderHook(
      () =>
        useFetchCluster(
          clusterID,
          subscriptionWithRegion,
          isAROCluster,
          queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
        ),
      { wrapper: queryClientWrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(apiRequest.get).toHaveBeenCalledTimes(1);

    invalidateClusterDetailsQueries();

    await waitFor(() => {
      expect(apiRequest.get).toHaveBeenCalledTimes(2);
    });
  });
});
