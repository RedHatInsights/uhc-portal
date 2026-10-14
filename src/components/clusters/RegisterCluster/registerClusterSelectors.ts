import get from 'lodash/get';

import { clusterCapabilities, hasCapabilityValue } from '~/common/capabilities';
import { GlobalState } from '~/redux/stateTypes';
import { Capability } from '~/types/accounts_mgmt.v1';

const hasOrgLevelsubscribeOCPCapability = (state: GlobalState): boolean => {
  const capabilites: Array<Capability> = get(
    state,
    'userProfile.organization.details.capabilities',
    [],
  );

  return hasCapabilityValue(capabilites, clusterCapabilities.SUBSCRIBED_OCP);
};

export { hasOrgLevelsubscribeOCPCapability };
