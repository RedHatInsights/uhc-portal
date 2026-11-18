import { waitFor } from '@testing-library/react';

import authorizationsService from '~/services/authorizationsService';
import { renderHook } from '~/testUtils';

import { mockSubscriptionData } from '../__mocks__/queryMockedData';

import { useCanDeleteAccessReview, useFetchActionsPermissions } from './useFetchActionsPermissions';

jest.mock('axios'); // Mocking Axios to control its behavior in tests

jest.mock('~/services/authorizationsService', () => ({
  selfAccessReview: jest.fn(),
}));

const MAIN_QUERY_KEY = 'clusterDetails';

describe('useGetInflightChecks hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('useFetchActionsAndPermissions returns valid response', async () => {
    const subscriptionID = 'mockedSubscriptionID';
    const subscritpionStatus = 'Active';
    (authorizationsService.selfAccessReview as jest.Mock).mockResolvedValue({
      data: {
        allowed: true, // Set the value as per your test case
      },
    });

    const { result } = renderHook(() =>
      useFetchActionsPermissions(subscriptionID, subscritpionStatus),
    );

    expect(result.current.isActionQueriesLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isActionQueriesLoading).toBe(false);
    });
    expect(result.current.canUpdateSubscription).toBe(true);
    expect(result.current.canEditClusterAutoscaler).toBe(true);
    expect(result.current.canEditOCMRoles).toBe(true);
    expect(result.current.canViewOCMRoles).toBe(true);
  });

  it('useFetchActionsAndPermissions returns error response', async () => {
    const subscriptionID = 'mockedSubscriptionID';
    const subscritpionStatus = 'Active';
    (authorizationsService.selfAccessReview as jest.Mock).mockResolvedValueOnce({
      status: 403,
      response: { data: 'errorResp' },
    });

    const { result } = renderHook(() =>
      useFetchActionsPermissions(subscriptionID, subscritpionStatus),
    );

    expect(result.current.isActionQueriesLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isActionQueriesLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
  });

  it('useCanDeleteAccessReview returns valid response', async () => {
    const clusterID = 'mockedClusterID';
    const subscriptionResponseMock = {
      isAROCluster: false,
      isROSACluster: true,
      isOSDCluster: false,
      subscription: mockSubscriptionData,
    };

    (authorizationsService.selfAccessReview as jest.Mock).mockResolvedValue({
      data: { allowed: false }, // Set the value as per your test case
    });

    const { result } = renderHook(() =>
      useCanDeleteAccessReview(clusterID, subscriptionResponseMock, MAIN_QUERY_KEY),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data?.data.allowed).toBe(false);
  });

  it('useCanDeleteAccessReview returns error response', async () => {
    const clusterID = 'mockedClusterID';
    const subscriptionResponseMock = {
      isAROCluster: false,
      isROSACluster: true,
      isOSDCluster: false,
      subscription: mockSubscriptionData,
    };

    (authorizationsService.selfAccessReview as jest.Mock).mockRejectedValue({
      status: 403,
      response: { data: 'errorResp' },
    });

    const { result } = renderHook(() =>
      useCanDeleteAccessReview(clusterID, subscriptionResponseMock, MAIN_QUERY_KEY),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isError).toBe(true);
  });
});
