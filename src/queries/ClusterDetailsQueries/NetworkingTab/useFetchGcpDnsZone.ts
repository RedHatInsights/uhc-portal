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

  if (isError) {
    const formattedError = formatErrorData(isLoading, isError, error);
    return {
      data: data?.data?.items,
      isLoading,
      isError,
      error: formattedError.error,
    };
  }

  return {
    data: data?.data?.items?.[0],
    isLoading,
    isError,
    error,
  };
};
