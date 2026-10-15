import { formatErrorData } from '~/queries/helpers';
import clusterService from '~/services/clusterService';
import { renderHook, waitFor } from '~/testUtils';
import { GcpFirewallRule } from '~/types/clusters_mgmt.v1';

import { useCreateGcpFirewallRule } from './useCreateGcpFirewallRule';
import { refetchGcpFirewallRules } from './useFetchGcpFirewallRules';

jest.mock('~/services/clusterService', () => ({
  __esModule: true,
  default: {
    createGcpFirewallRule: jest.fn(),
  },
}));

jest.mock('~/queries/helpers');

jest.mock('./useFetchGcpFirewallRules', () => ({
  refetchGcpFirewallRules: jest.fn(),
}));

describe('useCreateGcpFirewallRule', () => {
  const createGcpFirewallRuleMock = clusterService.createGcpFirewallRule as jest.Mock;
  const formatErrorDataMock = formatErrorData as jest.Mock;
  const refetchGcpFirewallRulesMock = refetchGcpFirewallRules as jest.Mock;

  const firewallRule: GcpFirewallRule = {
    name: 'za-fw-ui',
    profile: 'public',
    wif_config: { id: 'wif-1' },
    gcp_network: {
      project_id: 'ocm-ui-dev',
      vpc_name: 'zac-vpc-6',
      machine_cidr: '10.0.0.0/16',
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a firewall rule and invalidates the firewall rules query on success', async () => {
    createGcpFirewallRuleMock.mockResolvedValue({ data: { id: 'fw-new' } });

    const { result } = renderHook(() => useCreateGcpFirewallRule());

    result.current.mutate(firewallRule);

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(createGcpFirewallRuleMock).toHaveBeenCalledWith(firewallRule);
    expect(refetchGcpFirewallRulesMock).toHaveBeenCalled();
  });

  it('returns a formatted error when the API call fails', async () => {
    const mockError = new Error('backend denied');
    createGcpFirewallRuleMock.mockRejectedValue(mockError);
    formatErrorDataMock.mockReturnValue({ error: { errorMessage: 'formatted error' } });

    const { result } = renderHook(() => useCreateGcpFirewallRule());

    result.current.mutate(firewallRule);

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
    });

    expect(result.current.error).toEqual({ errorMessage: 'formatted error' });
    expect(formatErrorDataMock).toHaveBeenCalledWith(
      result.current.isPending,
      result.current.isError,
      mockError,
    );
  });
});
