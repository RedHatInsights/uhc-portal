import type axios from 'axios';
import * as reactRedux from 'react-redux';

import { useGlobalState } from '~/redux/hooks';
import apiRequest from '~/services/apiRequest';
import { renderHook, waitFor } from '~/testUtils';
import { ViewOptions } from '~/types/types';

import { useFetchAccessRequests } from './useFetchAccessRequests';

const apiResponse = {
  total: 15,
  items: [
    { id: 'request-1', cluster_id: 'cluster-1', status: 'pending' },
    { id: 'request-2', cluster_id: 'cluster-2', status: 'approved' },
  ],
};

const subscriptionResponse = {
  items: [
    { cluster_id: 'cluster-1', display_name: 'Cluster One' },
    { cluster_id: 'cluster-2', display_name: 'Cluster Two' },
  ],
};

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('../useFetchSubscriptionsByClusterId', () => ({
  useFetchSubscriptionsByClusterId: jest.fn(),
}));

const useGlobalStateMock = useGlobalState as jest.Mock;

// Import after mocking
const { useFetchSubscriptionsByClusterId } = jest.requireMock(
  '../useFetchSubscriptionsByClusterId',
);
const useFetchSubscriptionsByClusterIdMock = useFetchSubscriptionsByClusterId as jest.Mock;

describe('useFetchAccessRequests', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  beforeEach(() => {
    useFetchSubscriptionsByClusterIdMock.mockReturnValue({ data: subscriptionResponse });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    subscriptionId: 'mySubscriptionId',
    params: {
      currentPage: 1,
      pageSize: 20,
      sorting: { sortField: 'mySortField', isAscending: true },
    },
    isAccessProtectionLoading: false,
    accessProtection: { enabled: true },
  };

  it('does not make an api call if isAccessProtection is loading', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: apiResponse });
    useGlobalStateMock.mockReturnValue({ totalCount: 10 });

    const newProps = { ...defaultProps, isAccessProtectionLoading: true };
    const { result } = renderHook(() =>
      useFetchAccessRequests({
        subscriptionId: newProps.subscriptionId,
        params: newProps.params as ViewOptions,
        isAccessProtectionLoading: newProps.isAccessProtectionLoading,
        accessProtection: newProps.accessProtection,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it('does not make an api call if accessProtection is not enabled', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: apiResponse });
    useGlobalStateMock.mockReturnValue({ totalCount: 10 });

    const newProps = { ...defaultProps, accessProtection: { enabled: false } };
    const { result } = renderHook(() =>
      useFetchAccessRequests({
        subscriptionId: newProps.subscriptionId,
        params: newProps.params as ViewOptions,
        isAccessProtectionLoading: newProps.isAccessProtectionLoading,
        accessProtection: newProps.accessProtection,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it('makes expected api call and returns filtered data', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: apiResponse });
    useGlobalStateMock.mockReturnValue({ totalCount: 10 });

    const { result } = renderHook(() =>
      useFetchAccessRequests({
        subscriptionId: defaultProps.subscriptionId,
        params: defaultProps.params as ViewOptions,
        isAccessProtectionLoading: defaultProps.isAccessProtectionLoading,
        accessProtection: defaultProps.accessProtection,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(result.current).toEqual({
      data: [
        { id: 'request-1', cluster_id: 'cluster-1', status: 'pending' },
        { id: 'request-2', cluster_id: 'cluster-2', status: 'approved' },
      ],
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    });

    // API is called
    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(apiRequestMock.get).toHaveBeenLastCalledWith(
      '/api/access_transparency/v1/access_requests',
      {
        params: {
          page: 1,
          size: 20,
          search: "subscription_id='mySubscriptionId'",
          orderBy: 'mySortField asc',
        },
      },
    );
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_TOTAL_ITEMS',
      payload: { totalCount: 15, viewType: 'ACCESS_REQUESTS_VIEW' },
    });
  });

  it('returns filtered data with cluster names', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: apiResponse });
    useGlobalStateMock.mockReturnValue({ totalCount: apiResponse.total });

    const { result } = renderHook(() =>
      useFetchAccessRequests({
        organizationId: 'myOrganizationId',
        params: defaultProps.params as ViewOptions,
        isAccessProtectionLoading: defaultProps.isAccessProtectionLoading,
        accessProtection: defaultProps.accessProtection,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(result.current).toEqual({
      data: [
        { id: 'request-1', cluster_id: 'cluster-1', status: 'pending', name: 'Cluster One' },
        { id: 'request-2', cluster_id: 'cluster-2', status: 'approved', name: 'Cluster Two' },
      ],
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    });

    // API is called
    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(apiRequestMock.get).toHaveBeenLastCalledWith(
      '/api/access_transparency/v1/access_requests',
      {
        params: {
          page: 1,
          size: 20,
          search:
            "organization_id='myOrganizationId' and status.state in ('Denied', 'Pending', 'Approved')",
          orderBy: 'mySortField asc',
        },
      },
    );

    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_TOTAL_ITEMS',
      payload: { totalCount: 15, viewType: 'ACCESS_REQUESTS_VIEW' },
    });
  });
});
