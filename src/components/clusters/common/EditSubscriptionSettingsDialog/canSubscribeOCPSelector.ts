import { GlobalState } from '~/redux/stateTypes';
import { Subscription } from '~/types/accounts_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import {
  clusterCapabilities,
  hasCapabilityValue,
  hasSubscribedOcpMarketplaceCapability,
} from '../../../../common/capabilities';

const canSubscribeOCP = (subscription?: Subscription) =>
  hasCapabilityValue(subscription?.capabilities, clusterCapabilities.SUBSCRIBED_OCP) ||
  hasSubscribedOcpMarketplaceCapability(subscription);

const canSubscribeOCPSelector = (state: GlobalState) =>
  canSubscribeOCP(state?.clusters?.details?.cluster?.subscription);

// Handles canSubscribeOCP for usecase with React Query
// Eventually should replace canSubscribeOCPSelector
const canSubscribeOCPMultiRegion = (cluster: ClusterFromSubscription) =>
  canSubscribeOCP(cluster?.subscription);

export { canSubscribeOCPSelector, canSubscribeOCPMultiRegion };
