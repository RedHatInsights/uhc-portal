import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { AWS_TAGS_NEW_MP } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { ClusterFromSubscription } from '~/types/types';

import { canEditAwsTagsForVersion } from './awsTagsHelpers';

/**
 * Single source of truth for whether an existing machine pool's AWS tags can be edited:
 * a ROSA HCP cluster on 4.20+ with the machine pool AWS tags section enabled.
 * Used for the form validation, the tags section and the update request.
 */
export const useCanEditAwsTags = (cluster: ClusterFromSubscription): boolean => {
  const isAwsTagsSectionEnabled = useFeatureGate(AWS_TAGS_NEW_MP);
  const clusterVersion = cluster.openshift_version || cluster.version?.raw_id || '';
  return (
    isHypershiftCluster(cluster) &&
    isAwsTagsSectionEnabled &&
    canEditAwsTagsForVersion(clusterVersion)
  );
};
