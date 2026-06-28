import { useQuery } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import clusterService from '~/services/clusterService';
import type { LogForwarderApplication } from '~/types/clusters_mgmt.v1';

import { queryConstants } from '../queriesConstants';

export function useFetchLogForwardingApplications({
  s3On,
  cwOn,
}: {
  s3On: boolean;
  cwOn: boolean;
}) {
  const { isLoading, data, isError, error, isFetching } = useQuery({
    queryKey: [queryConstants.FETCH_LOG_FORWARDING_APPLICATIONS],
    queryFn: async (): Promise<LogForwarderApplication[]> => {
      const { data: response } = await clusterService.getLogForwardingApplications({
        size: -1,
        search: "enabled='true'",
      });
      return response?.items ?? [];
    },
    staleTime: queryConstants.STALE_TIME_60_SEC,
    enabled: s3On || cwOn,
    retry: false,
  });

  const formattedError = isError ? formatErrorData(isLoading, isError, error) : null;

  return {
    data,
    isLoading,
    isError,
    error: formattedError?.error,
    isFetching,
  };
}
