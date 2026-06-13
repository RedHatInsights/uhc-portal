import { useQuery } from '@tanstack/react-query';

import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';

export function useFetchLogForwarders(clusterID: string | undefined, region?: string) {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS, clusterID, region],
    queryFn: async () => {
      const svc = region ? getClusterServiceForRegion(region) : clusterService;
      const response = await svc.getClusterControlPlaneLogForwarders(clusterID ?? '');
      return response.data?.items ?? ([] as LogForwarder[]);
    },
    staleTime: queryConstants.STALE_TIME_60_SEC,
    enabled: !!clusterID,
    retry: false,
  });

  const formattedError = isError ? formatErrorData(isLoading, isError, error) : null;

  return {
    data: data ?? [],
    isLoading,
    isError,
    error: formattedError?.error ?? error,
    isFetching,
  };
}
