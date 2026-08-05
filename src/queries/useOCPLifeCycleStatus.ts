import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import getOCPLifeCycleStatus from '~/services/productLifeCycleService';

export const OCP_LIFECYCLE_QUERY_KEY = 'ocpLifeCycleStatus';

/**
 * Invalidates the OCP lifecycle status cache, forcing a refetch on next access.
 * Can be called from outside React components (e.g., refresh button handlers).
 */
export const refetchOCPLifeCycleStatus = () => {
  queryClient.invalidateQueries({ queryKey: [OCP_LIFECYCLE_QUERY_KEY] });
};

/**
 * Fetches OCP product lifecycle data from the Red Hat lifecycle API.
 * Uses the v2 endpoint when the OCP5_SUPPORT feature flag is enabled,
 * otherwise falls back to the v1 endpoint.
 *
 * TanStack Query handles caching, deduplication, and error state — preventing
 * the infinite-retry loop that the legacy Redux/useEffect pattern was susceptible to.
 */
export const useOCPLifeCycleStatus = () => {
  const isOcp5SupportEnabled = useFeatureGate(OCP5_SUPPORT);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [OCP_LIFECYCLE_QUERY_KEY, isOcp5SupportEnabled],
    queryFn: () => getOCPLifeCycleStatus(isOcp5SupportEnabled),
    staleTime: 5 * 60 * 1000, // lifecycle data is stable; avoid unnecessary refetches
    // Retry periodically when in error state so status recovers once API is available
    refetchInterval: (query) => (query.state.status === 'error' ? 60_000 : false),
  });

  return {
    versions: data?.data?.data?.[0]?.versions,
    isLoading,
    isError,
    refetch,
  };
};
