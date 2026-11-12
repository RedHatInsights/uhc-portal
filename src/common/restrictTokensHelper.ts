import { Capability } from '~/types/accounts_mgmt.v1';

import { hasCapabilityValue, organizationCapabilities } from './capabilities';

// in case of error when checking if using offline tokens is restricted, default to showing offline tokens.
const defaultToOfflineTokens = true;

const hasRestrictTokensCapability = (capabilities: Array<Capability>) =>
  hasCapabilityValue(capabilities, organizationCapabilities.RESTRICT_OFFLINE_TOKENS);

export { defaultToOfflineTokens, hasRestrictTokensCapability };
