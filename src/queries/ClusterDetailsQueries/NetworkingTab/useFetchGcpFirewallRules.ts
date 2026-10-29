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
  profile?: string,
  wifConfigId?: string,
  projectId?: string,
  network?: string,
) =>
  // Skip empty criteria so Shared VPC works while Host project ID / VPC name are
  // still being typed (strict '' === 'ocm-ui-dev' would hide all matches).
  // Also filter by profile client-side; the list API does not reliably honor profile.
  rules?.filter(
    (rule) =>
      (!profile || rule.profile === profile) &&
      (!wifConfigId || rule.wif_config?.id === wifConfigId) &&
      (!projectId || rule.gcp_network?.project_id === projectId) &&
      (!network || rule.gcp_network?.vpc_name === network),
  ) ?? [];

export const useFetchGcpFirewallRules = ({
  profile,
  wifConfigId,
  projectId,
  network,
  isEnabled = true,
}: UseFetchGcpFirewallRulesParams) => {
  // Query key is profile-only; without WIF (or when disabled) do not expose cached
  // results or a prior error — that would leak rules / stale failure UI.
  const hasRequiredContext = isEnabled && !!profile && !!wifConfigId;

  const { data, isLoading, isFetching, isError, error, isSuccess } = useQuery({
    queryKey: ['gcpFirewallRules', profile],
    queryFn: async () => {
      const response = await clusterService.getGcpFirewallRules({ profile });
      return response;
    },
    enabled: hasRequiredContext,
  });

  if (!hasRequiredContext) {
    return {
      data: [],
      isLoading,
      isFetching,
      isError: false,
      error: undefined,
      isSuccess: false,
    };
  }

  if (isError) {
    // Empty list + isError: UI shows fetch failure; do not restore unfiltered cache.
    const formattedError = formatErrorData(isLoading, isError, error);
    return {
      data: [],
      isLoading,
      isFetching,
      isError,
      error: formattedError.error,
      isSuccess,
    };
  }

  return {
    data: filterFirewallRules(data?.data?.items, profile, wifConfigId, projectId, network),
    isLoading,
    isFetching,
    isError,
    error,
    isSuccess,
  };
};
