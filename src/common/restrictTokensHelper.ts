import { Capability } from '~/types/accounts_mgmt.v1';

import { subscriptionCapabilities } from './subscriptionCapabilities';

// in case of error when checking if using offline tokens is restricted, default to showing offline tokens.
const defaultToOfflineTokens = true;

const hasRestrictTokensCapability = (capabilities: Array<Capability>) =>
  !!capabilities?.length &&
  capabilities.some(
    (capability) =>
      capability.name === subscriptionCapabilities.RESTRICT_OFFLINE_TOKENS &&
      capability.value === 'true',
  );

export { defaultToOfflineTokens, hasRestrictTokensCapability };
