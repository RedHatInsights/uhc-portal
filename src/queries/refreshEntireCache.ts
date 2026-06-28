import { queryClient } from '~/components/App/queryClient';

import { invalidateAllLogForwarderQueries } from './ClusterDetailsQueries/invalidateLogForwarder';
import { queryConstants } from './queriesConstants';

export const refreshQueries = () => {
  queryClient.invalidateQueries();
};

export const refreshClusterDetails = () => {
  queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
  });
  invalidateAllLogForwarderQueries();
};
