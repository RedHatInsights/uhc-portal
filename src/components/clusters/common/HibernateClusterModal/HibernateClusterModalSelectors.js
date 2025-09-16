import get from 'lodash/get';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { useGlobalState } from '~/redux/hooks';

const userCanHibernateClustersSelector = (state) => {
  const capabilities = get(state, 'userProfile.organization.details.capabilities', []);
  const canHibernateCluster = capabilities.find(
    (capability) => capability.name === subscriptionCapabilities.HIBERNATE_CLUSTER,
  );
  return canHibernateCluster?.value === 'true';
};

export const useCanHibernateClusterListFromClusters = (clusters) => {
  const canHibernateClusters = useGlobalState((state) => userCanHibernateClustersSelector(state));

  const canHibernateClusterList = {};
  if (canHibernateClusters) {
    clusters.forEach((cluster) => {
      canHibernateClusterList[cluster.id] = true;
    });
  }

  return canHibernateClusterList;
};

export { userCanHibernateClustersSelector };
