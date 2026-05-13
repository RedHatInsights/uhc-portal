import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData } from '~/queries/helpers';
import clusterService from '~/services/clusterService';

export const refetchGcpDnsZones = () => {
  queryClient.invalidateQueries({ queryKey: ['gcpDnsDomains'] });
};

export const useFetchGcpDnsDomains = (domainPrefix: string, organizationId: string) => {
  const { data, isLoading, isFetching, isError, error, isSuccess } = useQuery({
    queryKey: ['gcpDnsDomains'],
    queryFn: async () => {
      const response = await clusterService.getGcpDnsDomains();
      return response;
    },
    enabled: !!domainPrefix && !!organizationId,
  });

  const filteredDnsZones = (domainPrefix: string, organizationId: string) =>
    data?.data?.items?.filter(
      (dnsZone) =>
        dnsZone?.gcp?.domain_prefix === domainPrefix &&
        dnsZone?.organization?.id === organizationId,
    );

  if (isError) {
    const formattedError = formatErrorData(isLoading, isError, error);
    return {
      data: data?.data?.items,
      isLoading,
      isFetching,
      isError,
      error: formattedError.error,
      isSuccess,
    };
  }

  return {
    data: filteredDnsZones(domainPrefix, organizationId) ?? [],
    isLoading,
    isFetching,
    isError,
    error,
    isSuccess,
  };
};
