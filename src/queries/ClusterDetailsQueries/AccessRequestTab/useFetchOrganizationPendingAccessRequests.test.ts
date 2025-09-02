import type axios from 'axios';

import { formatErrorData } from '~/queries/helpers';
import apiRequest from '~/services/apiRequest';
import { renderHook, waitFor } from '~/testUtils';

import { useFetchOrganizationPendingAccessRequests } from './useFetchOrganizationPendingAccessRequests';

const apiResponse = {
  total: 15,
};

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('useFetchOrganizationPendingAccessRequests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    organizationId: 'myOrganizationId',
    params: {
      page: 1,
      size: 20,
    },
  };

  it('should return initial state', () => {
    const { result } = renderHook(() =>
      useFetchOrganizationPendingAccessRequests(defaultProps.organizationId, defaultProps.params),
    );

    expect(result.current).toEqual({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
    });
  });

  it('should return error state when API call fails', async () => {
    apiRequestMock.get.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() =>
      useFetchOrganizationPendingAccessRequests(defaultProps.organizationId, defaultProps.params),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(result.current).toEqual({
      data: undefined,
      isLoading: false,
      isError: true,
      error: formatErrorData(false, true, new Error('Network Error')),
      isSuccess: false,
    });

    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(apiRequestMock.get).toHaveBeenLastCalledWith(
      '/api/access_transparency/v1/access_requests',
      {
        params: {
          page: defaultProps.params.page,
          size: defaultProps.params.size,
          search: `organization_id='${defaultProps.organizationId}' and status.state='Pending'`,
        },
      },
    );
  });

  it('should fetch pending access requests', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: apiResponse });

    const { result } = renderHook(() =>
      useFetchOrganizationPendingAccessRequests(defaultProps.organizationId, defaultProps.params),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(result.current).toEqual({
      data: { total: apiResponse.total },
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    });

    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(apiRequestMock.get).toHaveBeenLastCalledWith(
      '/api/access_transparency/v1/access_requests',
      {
        params: {
          page: defaultProps.params.page,
          size: defaultProps.params.size,
          search: `organization_id='${defaultProps.organizationId}' and status.state='Pending'`,
        },
      },
    );
  });
});
