import { GlobalState } from '~/redux/state';
import { Subscription } from '~/types/accounts_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import {
  hasCapability,
  subscriptionCapabilities,
} from '../../../../common/subscriptionCapabilities';

const canSubscribeOCP = (subscription?: Subscription) =>
  hasCapability(subscription, subscriptionCapabilities.SUBSCRIBED_OCP) ||
  hasCapability(subscription, subscriptionCapabilities.SUBSCRIBED_OCP_MARKETPLACE);

const canSubscribeOCPSelector = (state: GlobalState) =>
  canSubscribeOCP(state?.clusters?.details?.cluster?.subscription);

// Handles canSubscribeOCP for usecase with React Query
// Eventually should replace canSubscribeOCPSelector
const canSubscribeOCPMultiRegion = (cluster: ClusterFromSubscription) =>
  canSubscribeOCP(cluster?.subscription);

export { canSubscribeOCPSelector, canSubscribeOCPMultiRegion };
