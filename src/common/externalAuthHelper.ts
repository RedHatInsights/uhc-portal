import { Capability } from '~/types/accounts_mgmt.v1';

import { hasCapabilityValue, organizationCapabilities } from './capabilities';

export const hasExternalAuthenticationCapability = (capabilities?: Capability[]) =>
  hasCapabilityValue(capabilities, organizationCapabilities.HCP_ALLOW_EXTERNAL_AUTHENTICATION);
