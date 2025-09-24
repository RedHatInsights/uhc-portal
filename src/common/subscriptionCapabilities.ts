import { Subscription, SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import { ClusterFromSubscription } from '../types/types';

/**
 * capabilities
 * Capabilities must contain 3 sections, separated by "."
 * capability.{type}.{name}
 */
const subscriptionCapabilities = {
  CREATE_MOA_CLUSTERS: 'capability.account.create_moa_clusters',
  CREATE_ROSA_CLUSTERS: 'capability.account.create_rosa_clusters',
  MANAGE_CLUSTER_ADMIN: 'capability.cluster.manage_cluster_admin',
  ORGANIZATION_REGISTRATIONS_PER_HOUR: 'capability.organization.clusters_registrations_per_hour',
  SUBSCRIBED_OCP: 'capability.cluster.subscribed_ocp',
  SUBSCRIBED_OCP_MARKETPLACE: 'capability.cluster.subscribed_ocp_marketplace',
  BARE_METAL_INSTALLER_ADMIN: 'capability.account.bare_metal_installer_admin',
  RELEASE_OCP_CLUSTERS: 'capability.cluster.release_ocp_clusters',
  CREATE_GCP_NON_CCS_CLUSTER: 'capability.organization.create_gcp_non_ccs_cluster',
  HCP_ALLOW_EXTERNAL_AUTHENTICATION: 'capability.organization.hcp_allow_external_authentication',
  RESTRICT_OFFLINE_TOKENS: 'capability.organization.restrict_offline_tokens',
  AUTOSCALE_CLUSTERS: 'capability.cluster.autoscale_clusters',
  NON_STABLE_CHANNEL_GROUP: 'capability.organization.non_stable_channel_group',
  HIBERNATE_CLUSTER: 'capability.organization.hibernate_cluster',
  BYPASS_PIDS_LIMITS: 'capability.organization.bypass_pids_limits',
  ENABLE_DATA_SOVEREIGN_REGIONS: 'capability.organization.enable_data_sovereign_regions',
  ALLOW_ETCD_ENCRYPTION: 'capability.account.allow_etcd_encryption',
  ENABLE_ACCESS_PROTECTION: 'capability.cluster.enable_access_protection',
  ENABLE_TERMS_ENFORCEMENT: 'capability.account.enable_terms_enforcement',
};

const hasCapability = (subscription: Subscription | undefined, name: string): boolean => {
  if (name === subscriptionCapabilities.RELEASE_OCP_CLUSTERS) {
    return true;
  }

  if (name === subscriptionCapabilities.SUBSCRIBED_OCP_MARKETPLACE) {
    // subscribed_ocp_marketplace does not apply to disconnected clusters
    if (subscription?.status === SubscriptionCommonFieldsStatus.Disconnected) {
      return false;
    }
    // sub must have already been created
    if (!subscription?.id) {
      return false;
    }
  }

  const capabilities = subscription?.capabilities ?? [];
  const found = capabilities.find((capability) => capability.name === name);
  return found?.value === 'true';
};

const haveCapabilities = (
  clusters: ClusterFromSubscription[],
  name: string,
): { [clusterId: string]: boolean } =>
  clusters.reduce(
    (acc, cluster) => ({ ...acc, [`${cluster.id}`]: hasCapability(cluster.subscription, name) }),
    {},
  );

export { hasCapability, haveCapabilities, subscriptionCapabilities };
