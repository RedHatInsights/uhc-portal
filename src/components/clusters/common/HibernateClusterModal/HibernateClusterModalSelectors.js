import get from 'lodash/get';

import { hasCapabilityValue, organizationCapabilities } from '~/common/capabilities';
import { useGlobalState } from '~/redux/hooks';

const userCanHibernateClustersSelector = (state) => {
  const capabilities = get(state, 'userProfile.organization.details.capabilities', []);

  return hasCapabilityValue(capabilities, organizationCapabilities.HIBERNATE_CLUSTER);
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
