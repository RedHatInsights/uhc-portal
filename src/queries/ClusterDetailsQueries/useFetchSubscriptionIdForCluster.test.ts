import type axios from 'axios';

import apiRequest from '~/services/apiRequest';
import { renderHook, waitFor } from '~/testUtils';

import { useFetchSubscriptionIdForCluster } from './useFetchSubscriptionIdForCluster';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('useFetchSubscriptionIdForCluster', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('returns subscription id for uuid', async () => {
    const uuid = 'c70eddae-f76c-4a27-9f08-07eb6d4de45d';

    apiRequestMock.get.mockResolvedValueOnce({
      data: { items: [{ id: 'mySubscriptionId' }] },
    });
    const { result } = renderHook(() => useFetchSubscriptionIdForCluster(uuid));

    await waitFor(() => {
      expect(result.current.isFetched).toBeTruthy();
    });

    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(apiRequestMock.get).toHaveBeenCalledWith(
      '/api/accounts_mgmt/v1/subscriptions',
      expect.objectContaining({
        params: expect.objectContaining({
          search: "external_cluster_id='c70eddae-f76c-4a27-9f08-07eb6d4de45d'",
        }),
      }),
    );

    expect(result.current.subscriptionID).toEqual('mySubscriptionId');
  });

  it('returns subscription id for cluster id', async () => {
    const clusterId = 'myClusterId';

    apiRequestMock.get.mockResolvedValueOnce({
      data: { items: [{ id: 'mySubscriptionId' }] },
    });
    const { result } = renderHook(() => useFetchSubscriptionIdForCluster(clusterId));

    await waitFor(() => {
      expect(result.current.isFetched).toBeTruthy();
    });
    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(apiRequestMock.get).toHaveBeenCalledWith(
      '/api/accounts_mgmt/v1/subscriptions',
      expect.objectContaining({
        params: expect.objectContaining({ search: "cluster_id='myClusterId'" }),
      }),
    );

    expect(result.current.subscriptionID).toEqual('mySubscriptionId');
  });

  it('returns an error', async () => {
    const errorResp = {
      kind: 'Error',
      operation_id: 'abcdef',
      reason: 'There was a random error',
    };

    apiRequestMock.get.mockRejectedValueOnce({ status: 403, response: { data: errorResp } });
    const clusterId = 'myClusterId';
    const { result } = renderHook(() => useFetchSubscriptionIdForCluster(clusterId));

    await waitFor(() => {
      expect(result.current.isFetched).toBeTruthy();
    });
    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(apiRequestMock.get).toHaveBeenCalledWith(
      '/api/accounts_mgmt/v1/subscriptions',
      expect.objectContaining({
        params: expect.objectContaining({ search: "cluster_id='myClusterId'" }),
      }),
    );

    expect(result.current.isError).toBeTruthy();
    expect(result.current.isFetched).toBeTruthy();
  });

  it('return subscription id as undefined if no matches found', async () => {
    const clusterId = 'myClusterId';

    apiRequestMock.get.mockResolvedValueOnce({
      data: { items: [] },
    });
    const { result } = renderHook(() => useFetchSubscriptionIdForCluster(clusterId));

    await waitFor(() => {
      expect(result.current.isFetched).toBeTruthy();
    });
    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(apiRequestMock.get).toHaveBeenCalledWith(
      '/api/accounts_mgmt/v1/subscriptions',
      expect.objectContaining({
        params: expect.objectContaining({ search: "cluster_id='myClusterId'" }),
      }),
    );

    expect(result.current.subscriptionID).toBeUndefined();
  });
});
