import { Capability } from '~/types/accounts_mgmt.v1';

import { subscriptionCapabilities } from '../subscriptionCapabilities';

const capabilitiesWithExternalAuthentication: Capability[] = [
  {
    inherited: false,
    name: subscriptionCapabilities.HCP_ALLOW_EXTERNAL_AUTHENTICATION,
    value: 'true',
  },
  {
    inherited: false,
    name: subscriptionCapabilities.RESTRICT_OFFLINE_TOKENS,
    value: 'true',
  },
  {
    inherited: false,
    name: subscriptionCapabilities.SUBSCRIBED_OCP,
    value: 'true',
  },
];

const capabilitiesWithoutExternalAuthentication: Capability[] = [
  {
    inherited: false,
    name: subscriptionCapabilities.ENABLE_DATA_SOVEREIGN_REGIONS,
    value: 'true',
  },
  {
    inherited: false,
    name: subscriptionCapabilities.SUBSCRIBED_OCP,
    value: 'true',
  },
];

export { capabilitiesWithExternalAuthentication, capabilitiesWithoutExternalAuthentication };
