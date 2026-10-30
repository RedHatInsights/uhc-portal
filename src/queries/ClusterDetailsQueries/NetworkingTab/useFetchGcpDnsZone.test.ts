import { waitFor } from '@testing-library/react';

import { formatErrorData } from '~/queries/helpers';
import clusterService from '~/services/clusterService';
import { renderHook } from '~/testUtils';

import { useFetchGcpDnsZone } from './useFetchGcpDnsZone';

jest.mock('~/services/clusterService', () => ({
  __esModule: true,
  default: {
    getGcpDnsDomains: jest.fn(),
  },
}));

jest.mock('~/queries/helpers', () => ({
  formatErrorData: jest.fn(),
}));

const getGcpDnsDomainsMock = clusterService.getGcpDnsDomains as jest.Mock;
const formatErrorDataMock = formatErrorData as jest.Mock;

const dnsZone = {
  id: 'wnsb.s2.devshift.org',
  gcp: { domain_prefix: 'prefix1' },
};

describe('useFetchGcpDnsZone', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the first DNS zone on success', async () => {
    getGcpDnsDomainsMock.mockResolvedValue({
      data: { items: [dnsZone, { id: 'other' }] },
    });

    const { result } = renderHook(() => useFetchGcpDnsZone('wnsb.s2.devshift.org', true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(dnsZone);
    expect(Array.isArray(result.current.data)).toBe(false);
  });

  it('returns a single DNS zone (not an array) when the request fails', async () => {
    getGcpDnsDomainsMock.mockRejectedValue({ message: 'denied' });
    formatErrorDataMock.mockReturnValue({ error: 'formatted error' });

    const { result } = renderHook(() => useFetchGcpDnsZone('wnsb.s2.devshift.org', true));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe('formatted error');
    expect(Array.isArray(result.current.data)).toBe(false);
  });

  it('does not fetch when isGcp is false', () => {
    renderHook(() => useFetchGcpDnsZone('wnsb.s2.devshift.org', false));

    expect(getGcpDnsDomainsMock).not.toHaveBeenCalled();
  });
});
