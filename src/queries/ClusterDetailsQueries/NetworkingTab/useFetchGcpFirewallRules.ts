import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import clusterService from '~/services/clusterService';
import { GcpFirewallRule } from '~/types/clusters_mgmt.v1';

export const refetchGcpFirewallRules = () =>
  queryClient.invalidateQueries({ queryKey: ['gcpFirewallRules'] });

type UseFetchGcpFirewallRulesParams = {
  profile: string;
  wifConfigId?: string;
  projectId?: string;
  network?: string;
  isEnabled?: boolean;
};

export const filterFirewallRules = (
  rules: GcpFirewallRule[] | undefined,
  wifConfigId?: string,
  projectId?: string,
  network?: string,
) =>
  rules?.filter(
    (rule) =>
      rule.wif_config?.id === wifConfigId &&
      rule.gcp_network?.project_id === projectId &&
      rule.gcp_network?.vpc_name === network,
  ) ?? [];

export const useFetchGcpFirewallRules = ({
  profile,
  wifConfigId,
  projectId,
  network,
  isEnabled = true,
}: UseFetchGcpFirewallRulesParams) => {
  const { data, isLoading, isFetching, isError, error, isSuccess } = useQuery({
    queryKey: ['gcpFirewallRules', profile],
    queryFn: async () => {
      const response = await clusterService.getGcpFirewallRules({ profile });
      return response;
    },
    enabled: isEnabled && !!profile && !!wifConfigId,
  });

  if (isError) {
    const formattedError = formatErrorData(isLoading, isError, error);
    return {
      data: data?.data?.items ?? [],
      isLoading,
      isFetching,
      isError,
      error: formattedError.error,
      isSuccess,
    };
  }

  return {
    data: filterFirewallRules(data?.data?.items, wifConfigId, projectId, network),
    isLoading,
    isFetching,
    isError,
    error,
    isSuccess,
  };
};
