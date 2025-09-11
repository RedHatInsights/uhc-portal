import get from 'lodash/get';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { GlobalState } from '~/redux/stateTypes';
import { Capability } from '~/types/accounts_mgmt.v1';

const hasOrgLevelsubscribeOCPCapability = (state: GlobalState): boolean => {
  const capabilites: Array<Capability> = get(
    state,
    'userProfile.organization.details.capabilities',
    [],
  );
  const subscribeOCP = capabilites.find(
    (capability) => capability.name === subscriptionCapabilities.SUBSCRIBED_OCP,
  );

  return !!(subscribeOCP && subscribeOCP.value === 'true');
};

export { hasOrgLevelsubscribeOCPCapability };
