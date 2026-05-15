import { waitFor } from '@testing-library/react';

import { queryClient } from '~/components/App/queryClient';
import { renderHook } from '~/testUtils';

import {
  mockedClusterResponse,
  mockedSubscriptionWithClusterType,
} from '../__mocks__/queryMockedData';
import { queryConstants } from '../queriesConstants';

import { invalidateClusterDetailsQueries, useFetchClusterDetails } from './useFetchClusterDetails';

jest.mock('axios'); // Mocking Axios to control its behavior in tests

jest.mock('./useFetchCluster', () => ({
  useFetchCluster: jest.fn(),
}));

jest.mock('../common/useFetchSubscription', () => ({
  useFetchSubscription: jest.fn(),
}));

jest.mock('./useFetchActionsPermissions', () => ({
  useFetchActionsPermissions: jest.fn(),
  useCanDeleteAccessReview: jest.fn(),
}));

// Mock queryClient.invalidateQueries
jest.mock('~/components/App/queryClient', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}));

describe('useClusterDetails hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useClusterDetails returns valid response', async () => {
    const subscriptionID = 'mockedSubscriptionID';

    // Mock the useFetchSubscription hook
    const useFetchSubscriptionMock = jest.requireMock('../common/useFetchSubscription');
    useFetchSubscriptionMock.useFetchSubscription.mockReturnValue({
      isLoading: false,
      data: mockedSubscriptionWithClusterType,
      isError: false,
      error: null,
    });

    const useFetchClusterMock = jest.requireMock('./useFetchCluster');
    useFetchClusterMock.useFetchCluster.mockReturnValue({
      isLoading: false,
      data: mockedClusterResponse,
      isError: false,
      error: null,
    });
    const useFetchActionsPermissionsMock = jest.requireMock('./useFetchActionsPermissions');
    useFetchActionsPermissionsMock.useFetchActionsPermissions.mockReturnValue({
      isLoading: false,
      canEdit: true,
      canEditClusterAutoscaler: true,
      canEditOCMRoles: true,
      canViewOCMRoles: true,
      canUpdateClusterResource: true,
      canUpdateDeleteProtection: true,
      kubeletConfigActions: { get: true },
      machinePoolsActions: { get: true },
      idpActions: { get: true },
      isError: false,
      error: null,
    });
    useFetchActionsPermissionsMock.useCanDeleteAccessReview.mockReturnValue({
      isLoading: false,
      canDeleteAccessreviewResponse: {
        data: {
          allowed: true,
        },
      },
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => useFetchClusterDetails(subscriptionID));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cluster?.id).toBe(mockedClusterResponse.data.id);
    expect(result.current.cluster?.canEdit).toBe(true);
  });

  it('useSubscription error results in useClusterDetails error response', async () => {
    const subscriptionID = 'mockedSubscriptionID';
    const axiosErrorMock = {
      response: {
        data: {
          erroMessage: 'Error message',
          errorCode: '401',
        },
      },
    };
    // Mock the useFetchSubscription hook
    const useFetchSubscriptionMock = jest.requireMock('../common/useFetchSubscription');
    useFetchSubscriptionMock.useFetchSubscription.mockReturnValue({
      isLoading: false,
      isError: true,
      error: {
        error: axiosErrorMock,
      },
    });

    const { result } = renderHook(() => useFetchClusterDetails(subscriptionID));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
  });
});

describe('Invalidate queries', () => {
  it('Should invalidate queries correctly', async () => {
    const invalidateQueriesMock = queryClient.invalidateQueries as jest.Mock;

    invalidateClusterDetailsQueries();

    // Assert that invalidateQueries is called with the correct query keys
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1); // Check the number of invocations
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      predicate: expect.any(Function),
    });

    // Test the predicate logic specifically
    const predicateFn = invalidateQueriesMock.mock.calls[0][0].predicate;

    const mockQuery = { queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY] };
    expect(predicateFn(mockQuery)).toBe(true); // Should return true when key matches

    const nonMatchingQuery = { queryKey: ['someOtherQueryKey'] };
    expect(predicateFn(nonMatchingQuery)).toBe(false); // Should return false for other keys
  });
});
