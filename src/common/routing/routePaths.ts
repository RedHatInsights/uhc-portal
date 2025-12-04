/**
 * Route path constants for the application.
 * Use these constants instead of hardcoding paths to ensure consistency
 * and make route changes easier to manage.
 */

import { TABBED_CLUSTERS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

/** Legacy cluster list path */
export const CLUSTER_LIST_PATH = '/cluster-list';

/** New tabbed cluster list path */
export const TABBED_CLUSTER_LIST_PATH = '/clusters/list';

/**
 * Hook that returns the appropriate cluster list path based on the TABBED_CLUSTERS feature flag.
 * Use this in React components instead of the static CLUSTER_LIST_PATH constant.
 *
 * @returns The cluster list path - '/clusters/list' if TABBED_CLUSTERS is enabled, '/cluster-list' otherwise
 */
export const useClusterListPath = (): string => {
  const isTabbedClustersEnabled = useFeatureGate(TABBED_CLUSTERS);
  return isTabbedClustersEnabled ? TABBED_CLUSTER_LIST_PATH : CLUSTER_LIST_PATH;
};
