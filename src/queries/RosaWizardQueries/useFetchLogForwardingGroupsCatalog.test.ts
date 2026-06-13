import axios from 'axios';

import { waitFor } from '@testing-library/react';

import apiRequest from '~/services/apiRequest';
import { renderHook } from '~/testUtils';
import type { LogForwarderGroupVersions } from '~/types/clusters_mgmt.v1';

import { useFetchLogForwardingGroupsCatalog } from './useFetchLogForwardingGroupsCatalog';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

const mockGroupVersionsItems: LogForwarderGroupVersions[] = [
  {
    name: 'API',
    enabled: true,
    versions: [{ id: '2', applications: ['audit', 'apiserver'] }],
  },
];

describe('useFetchLogForwardingGroupsCatalog', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a transformed group tree on a successful response', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: { items: mockGroupVersionsItems } });

    const { result } = renderHook(() => useFetchLogForwardingGroupsCatalog({ enabled: true }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual([
      {
        id: 'lfg:API',
        text: 'API',
        children: [
          { id: 'audit', text: 'audit' },
          { id: 'apiserver', text: 'apiserver' },
        ],
      },
    ]);
  });

  it('returns an empty array when the response contains no items', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useFetchLogForwardingGroupsCatalog({ enabled: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it('does not fetch when disabled', () => {
    const { result } = renderHook(() => useFetchLogForwardingGroupsCatalog({ enabled: false }));

    expect(result.current.isLoading).toBe(false);
    expect(apiRequestMock.get).not.toHaveBeenCalled();
  });

  it('sets isError when the request fails', async () => {
    apiRequestMock.get.mockRejectedValueOnce(new Error('Service unavailable'));

    const { result } = renderHook(() => useFetchLogForwardingGroupsCatalog({ enabled: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeTruthy();
  });
});
