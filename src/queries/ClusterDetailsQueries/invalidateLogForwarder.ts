import { queryClient } from '~/components/App/queryClient';
import { queryConstants } from '~/queries/queriesConstants';

export function invalidateLogForwarder(clusterID: string, region?: string): void {
  queryClient.invalidateQueries({
    queryKey: [queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS, clusterID, region],
  });
}

export function invalidateAllLogForwarderQueries(): void {
  queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS,
  });
}
