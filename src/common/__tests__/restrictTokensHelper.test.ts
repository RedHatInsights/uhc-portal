import { clusterCapabilities, organizationCapabilities } from '../capabilities';
import { hasRestrictTokensCapability } from '../restrictTokensHelper';

describe('restrict tokens capability', () => {
  it('should return true if org has restrict offline tokens capability', () => {
    const capabilities = [
      {
        inherited: false,
        name: organizationCapabilities.HIBERNATE_CLUSTER,
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
    expect(hasRestrictTokensCapability(capabilities)).toEqual(true);
  });

  it('should return false if org does not have restrict offline tokens capability', () => {
    const capabilities = [
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
    expect(hasRestrictTokensCapability(capabilities)).toEqual(false);
  });
});
