import { waitFor } from '@testing-library/react';

import { formatErrorData } from '~/queries/helpers';
import clusterService from '~/services/clusterService';
import { renderHook } from '~/testUtils';

import { useFetchGcpFirewallRule } from './useFetchGcpFirewallRule';

jest.mock('~/services/clusterService', () => ({
  __esModule: true,
  default: {
    getGcpFirewallRule: jest.fn(),
  },
}));

jest.mock('~/queries/helpers', () => ({
  formatErrorData: jest.fn(),
}));

const getGcpFirewallRuleMock = clusterService.getGcpFirewallRule as jest.Mock;
const formatErrorDataMock = formatErrorData as jest.Mock;

const firewallRule = {
  id: 'fw-1',
  name: 'prod-byo-firewall',
};

describe('useFetchGcpFirewallRule', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches a firewall rule by id when enabled', async () => {
    getGcpFirewallRuleMock.mockResolvedValue({ data: firewallRule });

    const { result } = renderHook(() => useFetchGcpFirewallRule('fw-1', true));

    await waitFor(() => {
      expect(result.current.data).toEqual(firewallRule);
    });

    expect(getGcpFirewallRuleMock).toHaveBeenCalledWith('fw-1');
  });

  it('does not fetch when id is missing', async () => {
    const { result } = renderHook(() => useFetchGcpFirewallRule(undefined, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getGcpFirewallRuleMock).not.toHaveBeenCalled();
  });

  it('does not fetch when disabled', async () => {
    const { result } = renderHook(() => useFetchGcpFirewallRule('fw-1', false));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getGcpFirewallRuleMock).not.toHaveBeenCalled();
  });

  it('returns a formatted error and no data when the request fails', async () => {
    const apiError = new Error('network error');
    getGcpFirewallRuleMock.mockRejectedValue(apiError);
    formatErrorDataMock.mockReturnValue({ error: 'formatted error' });

    const { result } = renderHook(() => useFetchGcpFirewallRule('fw-1', true));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(formatErrorDataMock).toHaveBeenCalled();
    expect(result.current.error).toBe('formatted error');
    expect(result.current.data).toBeUndefined();
  });
});
