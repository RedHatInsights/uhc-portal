import { useMutation } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import clusterService from '~/services/clusterService';
import { GcpFirewallRule } from '~/types/clusters_mgmt.v1';

import { refetchGcpFirewallRules } from './useFetchGcpFirewallRules';

export const useCreateGcpFirewallRule = () => {
  const { data, isPending, isError, error, mutate, reset, isSuccess } = useMutation({
    mutationKey: ['createGcpFirewallRule'],
    mutationFn: async (firewallRule: GcpFirewallRule) =>
      clusterService.createGcpFirewallRule(firewallRule),
    onSuccess: () => {
      refetchGcpFirewallRules();
    },
  });

  return {
    data,
    isPending,
    isError,
    error: formatErrorData(isPending, isError, error)?.error,
    isSuccess,
    reset,
    mutate,
  };
};
