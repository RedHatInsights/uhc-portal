import axios from 'axios';

import { waitFor } from '@testing-library/react';

import apiRequest from '~/services/apiRequest';
import { renderHook } from '~/testUtils';
import type { LogForwarderGroupVersions } from '~/types/clusters_mgmt.v1';

import { useFetchLogForwardingGroups } from './useFetchLogForwardingGroups';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

/** Raw API items as returned by GET /log_forwarding/groups */
const mockGroupVersionsItems: LogForwarderGroupVersions[] = [
  {
    name: 'API',
    enabled: true,
    versions: [
      { id: '1', applications: ['api-audit'] },
      { id: '2', applications: ['api-audit', 'api-server'] },
    ],
  },
  {
    name: 'Authentication',
    enabled: true,
    versions: [{ id: '1', applications: ['auth-kube-apiserver', 'auth-konnectivity-agent'] }],
  },
  {
    name: 'Disabled group',
    enabled: false,
    versions: [{ id: '1', applications: ['disabled-app'] }],
  },
];

describe('useFetchLogForwardingGroups hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a transformed group tree on a successful response', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: { items: mockGroupVersionsItems } });

    const { result } = renderHook(() => useFetchLogForwardingGroups({ s3On: false, cwOn: true }));

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    // logForwardingGroupVersionsListToTree picks the latest version and sorts alphabetically;
    // disabled groups are excluded.
    expect(result.current.data).toEqual([
      {
        id: 'lfg:API',
        text: 'API',
        children: [
          { id: 'api-audit', text: 'api-audit' },
          { id: 'api-server', text: 'api-server' },
        ],
      },
      {
        id: 'lfg:Authentication',
        text: 'Authentication',
        children: [
          { id: 'auth-kube-apiserver', text: 'auth-kube-apiserver' },
          { id: 'auth-konnectivity-agent', text: 'auth-konnectivity-agent' },
        ],
      },
    ]);
  });

  it('returns an empty array when the response contains no items', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useFetchLogForwardingGroups({ s3On: true, cwOn: false }));

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it('sets isError and exposes the error on a failed request', async () => {
    const networkError = { name: 500, message: 'Internal Server Error' };
    apiRequestMock.get.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useFetchLogForwardingGroups({ s3On: true, cwOn: true }));

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeTruthy();
  });

  it('does not fetch when neither S3 nor CloudWatch is enabled', () => {
    const { result } = renderHook(() => useFetchLogForwardingGroups({ s3On: false, cwOn: false }));

    expect(result.current.isFetching).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(apiRequestMock.get).not.toHaveBeenCalled();
  });
});
