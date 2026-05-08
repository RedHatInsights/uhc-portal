import { useQuery } from '@tanstack/react-query';

import type { LogForwardingGroupTreeNode } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import { logForwardingGroupVersionsListToTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeFromApi';
import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import clusterService from '~/services/clusterService';

/**
 * Global log forwarding groups catalog (same tree shape as the create-cluster wizard).
 * Used for mapping stored forwarder ids to display labels on cluster details.
 */
export function useFetchLogForwardingGroupsCatalog(options?: { enabled?: boolean }) {
  const { isLoading, data, isError, error, isFetching } = useQuery({
    queryKey: [queryConstants.FETCH_LOG_FORWARDING_GROUPS_CATALOG],
    queryFn: async (): Promise<LogForwardingGroupTreeNode[]> => {
      const { data: response } = await clusterService.getLogForwardingGroups({ size: -1 });
      return logForwardingGroupVersionsListToTree(response?.items);
    },
    staleTime: queryConstants.STALE_TIME_60_SEC,
    enabled: options?.enabled ?? true,
    retry: false,
  });

  const formattedError = isError ? formatErrorData(isLoading, isError, error) : null;

  return {
    data,
    isLoading,
    isError,
    error: formattedError?.error ?? error,
    isFetching,
  };
}
