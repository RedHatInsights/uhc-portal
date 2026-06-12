import { queryClient } from '~/components/App/queryClient';
import { queryConstants } from '~/queries/queriesConstants';

export function invalidateLogForwarder(clusterID: string, region?: string): void {
  queryClient.invalidateQueries({
    queryKey: [queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS, clusterID, region],
  });
}
