import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { AugmentedCluster } from '~/types/types';

import { normalizedProducts } from '../../../../../../common/subscriptionTypes';
import clusterStates from '../../../../common/clusterStates';

const canAllowAdminHelper = (cluster: AugmentedCluster) => {
  const product = cluster.subscription?.plan?.type || normalizedProducts.OSD;
  const clusterState = cluster.state;

  if (product === normalizedProducts.RHMI || clusterState !== clusterStates.ready) {
    return false;
  }
  const isCssEnabled = cluster.ccs?.enabled || false;
  if (isCssEnabled) {
    return true;
  }

  const capabilites = cluster.subscription?.capabilities || [];
  const manageClusterAdminCapability = capabilites.find(
    (capability) => capability.name === subscriptionCapabilities.MANAGE_CLUSTER_ADMIN,
  );

  return !!(manageClusterAdminCapability && manageClusterAdminCapability.value === 'true');
};

export default canAllowAdminHelper;
