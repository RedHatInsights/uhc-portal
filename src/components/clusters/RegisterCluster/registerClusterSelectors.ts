import get from 'lodash/get';

import { GlobalState } from '~/redux/state';
import { Capability } from '~/types/accounts_mgmt.v1';

const hasOrgLevelsubscribeOCPCapability = (state: GlobalState): boolean => {
  const capabilites: Array<Capability> = get(
    state,
    'userProfile.organization.details.capabilities',
    [],
  );
  const subscribeOCP = capabilites.find(
    (capability) => capability.name === 'capability.cluster.subscribed_ocp',
  );

  return !!(subscribeOCP && subscribeOCP.value === 'true');
};

export { hasOrgLevelsubscribeOCPCapability };
