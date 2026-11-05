import mergeWith from 'lodash/mergeWith';

import { ClusterWithPermissions } from '~/types/types';

import { clusterCapabilities, haveCapabilities } from '../../../../common/capabilities';

export const canSubscribeOCPListFromClusters = (clusters: ClusterWithPermissions[] = []) => {
  const subscribeStandardOCPList = haveCapabilities(clusters, clusterCapabilities.SUBSCRIBED_OCP);
  const subscribeMarketplaceOCPList = haveCapabilities(
    clusters,
    clusterCapabilities.SUBSCRIBED_OCP_MARKETPLACE,
  );

  return mergeWith(
    subscribeStandardOCPList,
    subscribeMarketplaceOCPList,
    (objVal, srcVal) => objVal || srcVal,
  );
};
