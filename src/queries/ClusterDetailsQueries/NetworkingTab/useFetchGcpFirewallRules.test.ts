import { waitFor } from '@testing-library/react';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import clusterService from '~/services/clusterService';
import { renderHook } from '~/testUtils';

import { refetchGcpFirewallRules, useFetchGcpFirewallRules } from './useFetchGcpFirewallRules';

jest.mock('~/services/clusterService', () => ({
  __esModule: true,
  default: {
    getGcpFirewallRules: jest.fn(),
  },
}));

jest.mock('~/queries/helpers', () => ({
  formatErrorData: jest.fn(),
}));

jest.mock('~/components/App/queryClient', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}));

const getGcpFirewallRulesMock = clusterService.getGcpFirewallRules as jest.Mock;
const formatErrorDataMock = formatErrorData as jest.Mock;

const matchingRule = {
  id: 'fw-1',
  name: 'prod-byo-firewall',
  wif_config: { id: 'wif-1' },
  gcp_network: {
    project_id: 'project-1',
    vpc_name: 'vpc-1',
  },
};

const nonMatchingRule = {
  id: 'fw-2',
  name: 'other-firewall',
  wif_config: { id: 'wif-2' },
  gcp_network: {
    project_id: 'project-2',
    vpc_name: 'vpc-2',
  },
};

describe('useFetchGcpFirewallRules', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns filtered firewall rules for the current WIF config, project, and network', async () => {
    getGcpFirewallRulesMock.mockResolvedValue({
      data: { items: [matchingRule, nonMatchingRule] },
    });

    const { result } = renderHook(() =>
      useFetchGcpFirewallRules({
        profile: 'public',
        wifConfigId: 'wif-1',
        projectId: 'project-1',
        network: 'vpc-1',
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getGcpFirewallRulesMock).toHaveBeenCalledWith({ profile: 'public' });
    expect(result.current.data).toEqual([matchingRule]);
    expect(result.current.isError).toBe(false);
  });

  it('returns an empty list when API items are missing', async () => {
    getGcpFirewallRulesMock.mockResolvedValue({ data: {} });

    const { result } = renderHook(() =>
      useFetchGcpFirewallRules({
        profile: 'private',
        wifConfigId: 'wif-1',
        projectId: 'project-1',
        network: 'vpc-1',
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('does not fetch when wifConfigId is missing', async () => {
    const { result } = renderHook(() =>
      useFetchGcpFirewallRules({
        profile: 'public',
        projectId: 'project-1',
        network: 'vpc-1',
      }),
    );

    expect(getGcpFirewallRulesMock).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });

  it('does not fetch when isEnabled is false', async () => {
    const { result } = renderHook(() =>
      useFetchGcpFirewallRules({
        profile: 'public',
        wifConfigId: 'wif-1',
        projectId: 'project-1',
        network: 'vpc-1',
        isEnabled: false,
      }),
    );

    expect(getGcpFirewallRulesMock).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });

  it('returns formatted error data when the request fails', async () => {
    const apiError = { message: 'denied' };
    getGcpFirewallRulesMock.mockRejectedValue(apiError);
    formatErrorDataMock.mockReturnValue({ error: 'formatted error' });

    const { result } = renderHook(() =>
      useFetchGcpFirewallRules({
        profile: 'public',
        wifConfigId: 'wif-1',
        projectId: 'project-1',
        network: 'vpc-1',
      }),
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(formatErrorDataMock).toHaveBeenCalled();
    expect(result.current.error).toBe('formatted error');
    expect(result.current.data).toEqual([]);
  });

  it('invalidates the gcpFirewallRules query key on refresh', () => {
    refetchGcpFirewallRules();

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['gcpFirewallRules'],
    });
  });
});
