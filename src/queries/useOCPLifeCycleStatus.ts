import { useQuery } from '@tanstack/react-query';

import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import getOCPLifeCycleStatus from '~/services/productLifeCycleService';

export const OCP_LIFECYCLE_QUERY_KEY = 'ocpLifeCycleStatus';

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

  const { data, isLoading, isError } = useQuery({
    queryKey: [OCP_LIFECYCLE_QUERY_KEY, isOcp5SupportEnabled],
    queryFn: () => getOCPLifeCycleStatus(isOcp5SupportEnabled),
    staleTime: 5 * 60 * 1000, // lifecycle data is stable; avoid unnecessary refetches
  });

  return {
    versions: data?.data?.data?.[0]?.versions,
    isLoading,
    isError,
  };
};
