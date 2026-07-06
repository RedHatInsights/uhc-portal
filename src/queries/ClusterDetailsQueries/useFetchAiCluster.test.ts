import { waitFor } from '@testing-library/react';

import * as normalizeModule from '~/common/normalize';
import { assistedService } from '~/services';
import { renderHook } from '~/testUtils';
import { Subscription, SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import { useFetchAiCluster } from './useFetchAiCluster';

jest.mock('~/common/normalize');

const CLUSTER_ID = 'test-cluster-id';
const MAIN_QUERY_KEY = 'clusterDetails';

const aiSubscription: Subscription = {
  cluster_id: CLUSTER_ID,
  plan: { id: 'OCP-AssistedInstall', type: 'OCP-AssistedInstall' },
  status: SubscriptionCommonFieldsStatus.Active,
  managed: false,
};

const nonAiSubscription: Subscription = {
  cluster_id: CLUSTER_ID,
  plan: { id: 'ROSA', type: 'ROSA' },
  status: SubscriptionCommonFieldsStatus.Active,
  managed: true,
};

const fakeBaseCluster = { id: CLUSTER_ID } as any;

describe('useFetchAiCluster', () => {
  const getAIClusterSpy = jest.spyOn(assistedService, 'getAICluster');
  const getAIFeatureSupportLevelsSpy = jest.spyOn(assistedService, 'getAIFeatureSupportLevels');
  const fakeClusterFromAISubscriptionMock =
    normalizeModule.fakeClusterFromAISubscription as jest.Mock;
  const fakeClusterFromSubscriptionMock = normalizeModule.fakeClusterFromSubscription as jest.Mock;

  beforeEach(() => {
    fakeClusterFromAISubscriptionMock.mockReturnValue({ ...fakeBaseCluster });
    fakeClusterFromSubscriptionMock.mockReturnValue({ ...fakeBaseCluster });
    getAIFeatureSupportLevelsSpy.mockResolvedValue(undefined as any);
  });

  it('returns cluster data with aiCluster populated when getAICluster succeeds', async () => {
    const mockAiCluster = { id: CLUSTER_ID, status: 'installed' };
    getAIClusterSpy.mockResolvedValueOnce({ data: mockAiCluster } as any);

    const { result } = renderHook(() =>
      useFetchAiCluster(CLUSTER_ID, MAIN_QUERY_KEY, aiSubscription),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.data?.aiCluster).toEqual(mockAiCluster);
    expect(fakeClusterFromAISubscriptionMock).toHaveBeenCalledWith(aiSubscription, mockAiCluster);
    expect(fakeClusterFromSubscriptionMock).not.toHaveBeenCalled();
  });

  it('falls back to fakeClusterFromSubscription and does not surface an error when getAICluster returns 403', async () => {
    const error403 = Object.assign(new Error('Request failed with status code 403'), {
      isAxiosError: true,
      response: {
        status: 403,
        statusText: 'Forbidden',
        data: { code: 403, message: 'Unauthorized to access route (access review failed)' },
      },
    });
    getAIClusterSpy.mockRejectedValueOnce(error403);

    const { result } = renderHook(() =>
      useFetchAiCluster(CLUSTER_ID, MAIN_QUERY_KEY, aiSubscription),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.aiCluster).toBeUndefined();
    expect(fakeClusterFromAISubscriptionMock).not.toHaveBeenCalled();
    expect(fakeClusterFromSubscriptionMock).toHaveBeenCalledWith(aiSubscription);
  });

  it('falls back to fakeClusterFromSubscription and does not surface an error when getAICluster returns a non-404 error', async () => {
    const error500 = Object.assign(new Error('Internal Server Error'), {
      isAxiosError: true,
      response: { status: 500, statusText: 'Internal Server Error' },
    });
    getAIClusterSpy.mockRejectedValueOnce(error500);

    const { result } = renderHook(() =>
      useFetchAiCluster(CLUSTER_ID, MAIN_QUERY_KEY, aiSubscription),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.aiCluster).toBeUndefined();
    expect(fakeClusterFromAISubscriptionMock).not.toHaveBeenCalled();
    expect(fakeClusterFromSubscriptionMock).toHaveBeenCalledWith(aiSubscription);
  });

  it('returns a fake cluster without calling getAICluster when subscription is not an AI subscription', async () => {
    const { result } = renderHook(() =>
      useFetchAiCluster(CLUSTER_ID, MAIN_QUERY_KEY, nonAiSubscription),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getAIClusterSpy).not.toHaveBeenCalled();
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeDefined();
    expect(fakeClusterFromSubscriptionMock).toHaveBeenCalledWith(nonAiSubscription);
  });

  it('is disabled and returns no data when subscription is undefined', () => {
    const { result } = renderHook(() => useFetchAiCluster(CLUSTER_ID, MAIN_QUERY_KEY, undefined));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(getAIClusterSpy).not.toHaveBeenCalled();
  });
});
