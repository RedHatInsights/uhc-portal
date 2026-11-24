import { isMajorMinorEqualOrGreater } from '~/common/versionHelpers';
import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import type { Network } from '~/types/clusters_mgmt.v1';
import type { ClusterFromSubscription } from '~/types/types';

/* When changing, consider updating the COnfiguration and NetworkScreen components as well (they contain 4.13-specific logic */
export const canConfigureDayTwoManagedIngress = (clusterVersionRawId: string): boolean =>
  isMajorMinorEqualOrGreater(clusterVersionRawId, 4, 13);

export const canConfigureLoadBalancer = (
  clusterVersionRawId: string,
  isSTSEnabled: boolean,
): boolean => !isSTSEnabled || canConfigureDayTwoManagedIngress(clusterVersionRawId);

/**
 * Provisional OVN fields until clusters_mgmt Network schema is regenerated
 * (ROSAENG-62680). Names follow the existing SdnToOvnClusterMigration shape.
 */
export type NetworkWithOvnSubnets = Network & {
  join_ipv4?: string;
  transit_ipv4?: string;
  masquerade_ipv4?: string;
};

/** Min OCP version that returns Network type + OVN internal subnets for ROSA HCP. */
export const OVN_NETWORK_DETAILS_MIN_MAJOR = 4;
export const OVN_NETWORK_DETAILS_MIN_MINOR = 18;

/**
 * Whether Day-2 Overview/Networking may show Network type and OVN Join/Transit/Masquerade subnets.
 * Individual rows still require the API fields to be present on cluster.network.
 */
export const canShowOvnNetworkDetails = (cluster: ClusterFromSubscription): boolean => {
  if (!isHypershiftCluster(cluster)) {
    return false;
  }

  const clusterVersion = cluster.openshift_version || cluster.version?.raw_id || '';
  return isMajorMinorEqualOrGreater(
    clusterVersion,
    OVN_NETWORK_DETAILS_MIN_MAJOR,
    OVN_NETWORK_DETAILS_MIN_MINOR,
  );
};
