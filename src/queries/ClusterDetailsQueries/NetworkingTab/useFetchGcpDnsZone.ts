import { useQuery } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import clusterService from '~/services/clusterService';

export const useFetchGcpDnsZone = (id: string, isGcp: boolean) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['gcpDnsZone', id],
    queryFn: async () => {
      const response = await clusterService.getGcpDnsDomains({ id });
      return response;
    },
    enabled: !!id && isGcp,
  });

  // Always return a single zone (or undefined), including on error
  const dnsZone = data?.data?.items?.[0];

  if (isError) {
    const formattedError = formatErrorData(isLoading, isError, error);
    return {
      data: dnsZone,
      isLoading,
      isError,
      error: formattedError.error,
    };
  }

  return {
    data: dnsZone,
    isLoading,
    isError,
    error,
  };
};
