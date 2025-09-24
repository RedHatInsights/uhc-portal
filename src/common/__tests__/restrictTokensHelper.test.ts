import { hasRestrictTokensCapability } from '../restrictTokensHelper';
import { subscriptionCapabilities } from '../subscriptionCapabilities';

describe('restrict tokens capability', () => {
  it('should return true if org has restrict offline tokens capability', () => {
    const capabilities = [
      {
        inherited: false,
        name: subscriptionCapabilities.ENABLE_DATA_SOVEREIGN_REGIONS,
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
    expect(hasRestrictTokensCapability(capabilities)).toEqual(true);
  });

  it('should return false if org does not have restrict offline tokens capability', () => {
    const capabilities = [
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
    expect(hasRestrictTokensCapability(capabilities)).toEqual(false);
  });
});
