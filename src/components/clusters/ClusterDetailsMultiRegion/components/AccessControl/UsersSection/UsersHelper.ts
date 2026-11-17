import { clusterCapabilities, hasCapabilityValue } from '~/common/capabilities';
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

  return hasCapabilityValue(
    cluster.subscription?.capabilities,
    clusterCapabilities.MANAGE_CLUSTER_ADMIN,
  );
};

export default canAllowAdminHelper;
