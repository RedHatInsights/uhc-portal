import { Capability } from '~/types/accounts_mgmt.v1';

import { clusterCapabilities, organizationCapabilities } from '../capabilities';

const capabilitiesWithExternalAuthentication: Capability[] = [
  {
    inherited: false,
    name: organizationCapabilities.HCP_ALLOW_EXTERNAL_AUTHENTICATION,
    value: 'true',
  },
  {
    inherited: false,
    name: organizationCapabilities.RESTRICT_OFFLINE_TOKENS,
    value: 'true',
  },
  {
    inherited: false,
    name: clusterCapabilities.SUBSCRIBED_OCP,
    value: 'true',
  },
];

const capabilitiesWithoutExternalAuthentication: Capability[] = [
  {
    inherited: false,
    name: organizationCapabilities.HIBERNATE_CLUSTER,
    value: 'true',
  },
  {
    inherited: false,
    name: clusterCapabilities.SUBSCRIBED_OCP,
    value: 'true',
  },
];

export { capabilitiesWithExternalAuthentication, capabilitiesWithoutExternalAuthentication };
