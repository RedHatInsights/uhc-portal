import { Capability, Subscription, SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import { ClusterFromSubscription } from '../types/types';

/**
 * capabilities
 * Capabilities must contain 3 sections, separated by "."
 * capability.{type}.{name}
 */
const clusterCapabilities = {
  MANAGE_CLUSTER_ADMIN: 'capability.cluster.manage_cluster_admin',
  SUBSCRIBED_OCP: 'capability.cluster.subscribed_ocp',
  SUBSCRIBED_OCP_MARKETPLACE: 'capability.cluster.subscribed_ocp_marketplace',
  RELEASE_OCP_CLUSTERS: 'capability.cluster.release_ocp_clusters',
  AUTOSCALE_CLUSTERS: 'capability.cluster.autoscale_clusters',
};

const organizationCapabilities = {
  HCP_ALLOW_EXTERNAL_AUTHENTICATION: 'capability.organization.hcp_allow_external_authentication',
  RESTRICT_OFFLINE_TOKENS: 'capability.organization.restrict_offline_tokens',
  NON_STABLE_CHANNEL_GROUP: 'capability.organization.non_stable_channel_group',
  HIBERNATE_CLUSTER: 'capability.organization.hibernate_cluster',
  BYPASS_PIDS_LIMITS: 'capability.organization.bypass_pids_limits',
  ROSA_OSD_ALLOW_OCP_5: 'capability.organization.rosa_osd_allow_ocp_5',
};

const hasCapabilityValue = (capabilities: Capability[] | undefined, name: string): boolean => {
  if (name === clusterCapabilities.RELEASE_OCP_CLUSTERS) {
    return true;
  }

  return (capabilities ?? []).some(
    (capability) => capability.name === name && capability.value === 'true',
  );
};

const hasSubscribedOcpMarketplaceCapability = (subscription: Subscription | undefined): boolean => {
  // subscribed_ocp_marketplace does not apply to disconnected clusters
  if (subscription?.status === SubscriptionCommonFieldsStatus.Disconnected) {
    return false;
  }
  // sub must have already been created
  if (!subscription?.id) {
    return false;
  }

  return hasCapabilityValue(
    subscription?.capabilities,
    clusterCapabilities.SUBSCRIBED_OCP_MARKETPLACE,
  );
};

const haveCapabilities = (
  clusters: ClusterFromSubscription[],
  name: string,
): { [clusterId: string]: boolean } =>
  clusters.reduce<{ [clusterId: string]: boolean }>(
    (acc, cluster) => ({
      ...acc,
      [`${cluster.id}`]:
        name === clusterCapabilities.SUBSCRIBED_OCP_MARKETPLACE
          ? hasSubscribedOcpMarketplaceCapability(cluster.subscription)
          : hasCapabilityValue(cluster.subscription?.capabilities, name),
    }),
    {},
  );

export {
  clusterCapabilities,
  hasCapabilityValue,
  hasSubscribedOcpMarketplaceCapability,
  haveCapabilities,
  organizationCapabilities,
};
