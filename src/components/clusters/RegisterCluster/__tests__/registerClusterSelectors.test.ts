import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';

import { hasOrgLevelsubscribeOCPCapability } from '../registerClusterSelectors'; // Replace 'yourModule' with the actual module name

describe('hasOrgLevelsubscribeOCPCapability', () => {
  it('returns true when state object and necessary nested properties exist and capability value is "true"', () => {
    const state = {
      userProfile: {
        organization: {
          details: {
            capabilities: [{ name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'true' }],
          },
        },
      },
    };
    expect(hasOrgLevelsubscribeOCPCapability(state as any)).toBe(true);
  });

  it.each([
    ['state object is missing', {}],
    ['organization object is missing', { userProfile: {} }],
    ['details object is missing', { userProfile: { organization: {} } }],
    [
      'when state object and necessary nested properties exist but capability value is not "true"',
      {
        userProfile: {
          organization: {
            details: {
              capabilities: [{ name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'false' }],
            },
          },
        },
      },
    ],
    [
      'capabilities array is empty',
      {
        userProfile: {
          organization: {
            details: {
              capabilities: [],
            },
          },
        },
      },
    ],
  ])('returns false when %p', (title: string, state: any) =>
    expect(hasOrgLevelsubscribeOCPCapability(state)).toBe(false),
  );
});
