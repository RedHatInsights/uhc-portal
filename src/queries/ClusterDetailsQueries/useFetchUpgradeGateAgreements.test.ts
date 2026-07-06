import axios from 'axios';

import { waitFor } from '@testing-library/react';

import apiRequest from '~/services/apiRequest';
import clusterService, * as clusterServiceModule from '~/services/clusterService';
import { renderHook } from '~/testUtils';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import {
  mockedSubscriptionWithClusterType,
  mockSubscriptionData,
} from '../__mocks__/queryMockedData';
import { queryConstants } from '../queriesConstants';
import { SubscriptionResponseType } from '../types';

import { useFetchUpgradeGateAgreements } from './useFetchUpgradeGateAgreements';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;
const mockGetClusterServiceForRegion = jest.spyOn(
  clusterServiceModule,
  'getClusterServiceForRegion',
);

const MAIN_QUERY_KEY = queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY;
const clusterID = 'mockedClusterID';

const mockedGateAgreements = {
  data: {
    kind: 'VersionGateAgreementList',
    page: 1,
    size: 1,
    total: 1,
    items: [
      {
        kind: 'VersionGateAgreement',
        id: 'mocked-gate-agreement-id',
        version_gate: {
          id: 'mocked-version-gate-id',
        },
      },
    ],
  },
};

const subscriptionWithRegion: SubscriptionResponseType = {
  ...mockedSubscriptionWithClusterType,
  subscription: {
    ...mockSubscriptionData,
    rh_region_id: 'us-east-1',
  },
};

describe('useFetchUpgradeGateAgreements', () => {
  beforeEach(() => {
    mockGetClusterServiceForRegion.mockReturnValue(clusterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns gate agreements data on valid response', async () => {
    apiRequestMock.get.mockResolvedValueOnce(mockedGateAgreements);

    const { result } = renderHook(() =>
      useFetchUpgradeGateAgreements(clusterID, mockedSubscriptionWithClusterType, MAIN_QUERY_KEY),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(undefined);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockedGateAgreements);
    expect(result.current.data?.data.items?.[0]?.id).toEqual('mocked-gate-agreement-id');
  });

  it('fetches gate agreements using default clusterService when rh_region_id is absent', async () => {
    apiRequestMock.get.mockResolvedValueOnce(mockedGateAgreements);

    const { result } = renderHook(() =>
      useFetchUpgradeGateAgreements(clusterID, mockedSubscriptionWithClusterType, MAIN_QUERY_KEY),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetClusterServiceForRegion).not.toHaveBeenCalled();
    expect(apiRequest.get).toHaveBeenCalledTimes(1);
    expect(apiRequest.get).toHaveBeenCalledWith(
      `/api/clusters_mgmt/v1/clusters/${clusterID}/gate_agreements`,
    );
    expect(result.current.data).toEqual(mockedGateAgreements);
  });

  it('does not refetch gate agreements when subscription changes but rh_region_id stays the same', async () => {
    apiRequestMock.get.mockResolvedValue(mockedGateAgreements);

    const { result, rerender } = renderHook(
      ({ subscription }: { subscription: SubscriptionResponseType }) =>
        useFetchUpgradeGateAgreements(clusterID, subscription, MAIN_QUERY_KEY),
      { initialProps: { subscription: subscriptionWithRegion } },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(apiRequest.get).toHaveBeenCalledTimes(1);
    expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith('us-east-1');

    rerender({
      subscription: {
        ...subscriptionWithRegion,
        subscription: {
          ...subscriptionWithRegion.subscription,
          status: SubscriptionCommonFieldsStatus.Disconnected,
          display_name: 'Updated subscription',
        },
      },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(apiRequest.get).toHaveBeenCalledTimes(1);
  });

  it('refetches gate agreements when rh_region_id changes', async () => {
    apiRequestMock.get.mockResolvedValue(mockedGateAgreements);

    const { result, rerender } = renderHook(
      ({ subscription }: { subscription: SubscriptionResponseType }) =>
        useFetchUpgradeGateAgreements(clusterID, subscription, MAIN_QUERY_KEY),
      { initialProps: { subscription: subscriptionWithRegion } },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(apiRequest.get).toHaveBeenCalledTimes(1);
    expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith('us-east-1');

    rerender({
      subscription: {
        ...subscriptionWithRegion,
        subscription: {
          ...subscriptionWithRegion.subscription,
          rh_region_id: 'us-west-2',
        },
      },
    });

    await waitFor(() => {
      expect(apiRequest.get).toHaveBeenCalledTimes(2);
    });
    expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith('us-west-2');
  });
});
