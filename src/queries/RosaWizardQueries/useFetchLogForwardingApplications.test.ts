import axios from 'axios';

import { waitFor } from '@testing-library/react';

import apiRequest from '~/services/apiRequest';
import { renderHook } from '~/testUtils';
import type { LogForwarderApplication } from '~/types/clusters_mgmt.v1';

import { useFetchLogForwardingApplications } from './useFetchLogForwardingApplications';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

const mockApplications: LogForwarderApplication[] = [
  { name: 'kube-apiserver', enabled: true },
  { name: 'kube-controller-manager', enabled: true },
  { name: 'audit', enabled: false },
];

describe('useFetchLogForwardingApplications hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns applications on a successful response', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: { items: mockApplications } });

    const { result } = renderHook(() => useFetchLogForwardingApplications());

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual(mockApplications);
  });

  it('returns an empty array when the response contains no items', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useFetchLogForwardingApplications());

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it('sets isError and exposes the error on a failed request', async () => {
    const networkError = { name: 500, message: 'Internal Server Error' };
    apiRequestMock.get.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useFetchLogForwardingApplications());

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeTruthy();
  });

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(() => useFetchLogForwardingApplications({ enabled: false }));

    expect(result.current.isFetching).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(apiRequestMock.get).not.toHaveBeenCalled();
  });
});
