import { Capability } from '~/types/accounts_mgmt.v1';

import { subscriptionCapabilities } from './subscriptionCapabilities';

export const hasExternalAuthenticationCapability = (capabilities?: Capability[]) =>
  !!capabilities?.length &&
  capabilities.some(
    (capability) =>
      capability.name === subscriptionCapabilities.HCP_ALLOW_EXTERNAL_AUTHENTICATION &&
      capability.value === 'true',
  );
