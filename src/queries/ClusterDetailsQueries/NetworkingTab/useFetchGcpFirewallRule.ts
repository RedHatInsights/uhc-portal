import { useQuery } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import clusterService from '~/services/clusterService';

export const useFetchGcpFirewallRule = (id: string | undefined, isEnabled: boolean) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['gcpFirewallRule', id],
    queryFn: async () => {
      const response = await clusterService.getGcpFirewallRule(id!);
      return response;
    },
    enabled: !!id && isEnabled,
  });

  if (isError) {
    const formattedError = formatErrorData(isLoading, isError, error);
    return {
      // Do not surface stale data from a prior successful fetch.
      data: undefined,
      isLoading,
      isError,
      error: formattedError.error,
    };
  }

  return {
    data: data?.data,
    isLoading,
    isError,
    error,
  };
};
