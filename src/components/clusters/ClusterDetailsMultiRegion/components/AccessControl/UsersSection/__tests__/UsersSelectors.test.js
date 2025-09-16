import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';

import { normalizedProducts } from '../../../../../../../common/subscriptionTypes';
import clusterStates from '../../../../../common/clusterStates';
import canAllowAdminSelector from '../UsersSelector';

describe('canAllowAdminSelector', () => {
  it('should return false when user has no capability to allow cluster admins', () => {
    const stateWithNoCapability = {
      clusters: {
        details: {
          cluster: {
            state: clusterStates.ready,
            managed: true,
            ccs: { enabled: false },
            product: { id: normalizedProducts.OSD },
            subscription: {
              plan: { id: normalizedProducts.OSD },
              capabilities: [
                { name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'true', inherited: true },
                {
                  name: subscriptionCapabilities.MANAGE_CLUSTER_ADMIN,
                  value: 'false',
                  inherited: false,
                },
              ],
            },
          },
        },
      },
    };

    const result = canAllowAdminSelector(stateWithNoCapability);

    expect(result).toBe(false);
  });

  it('should return false when cluster is not ready', () => {
    const stateWithNoCapability = {
      clusters: {
        details: {
          cluster: {
            state: clusterStates.installing,
            managed: true,
            ccs: { enabled: false },
            subscription: {
              capabilities: [],
            },
          },
        },
      },
    };

    const result = canAllowAdminSelector(stateWithNoCapability);

    expect(result).toBe(false);
  });

  it('should return false for rhmi', () => {
    const stateWithNoCapability = {
      clusters: {
        details: {
          cluster: {
            state: clusterStates.ready,
            managed: true,
            ccs: { enabled: false },
            product: { id: normalizedProducts.RHMI },
            subscription: {
              plan: { id: normalizedProducts.RHMI },
              capabilities: [
                { name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'true', inherited: true },
                {
                  name: subscriptionCapabilities.MANAGE_CLUSTER_ADMIN,
                  value: 'false',
                  inherited: false,
                },
              ],
            },
          },
        },
      },
    };

    const result = canAllowAdminSelector(stateWithNoCapability);

    expect(result).toBe(false);
  });

  it('should return true when user has capability to allow cluster admins', () => {
    const stateWithCapability = {
      clusters: {
        details: {
          cluster: {
            state: clusterStates.ready,
            managed: true,
            ccs: { enabled: false },
            product: { id: normalizedProducts.OSD },
            subscription: {
              plan: { id: normalizedProducts.OSD },
              capabilities: [
                { name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'true', inherited: true },
                {
                  name: subscriptionCapabilities.MANAGE_CLUSTER_ADMIN,
                  value: 'true',
                  inherited: false,
                },
              ],
            },
          },
        },
      },
    };

    const result = canAllowAdminSelector(stateWithCapability);

    expect(result).toBe(true);
  });

  it('should allow adding cluster admins for ccs clusters', () => {
    const stateWithCapability = {
      clusters: {
        details: {
          cluster: {
            state: clusterStates.ready,
            managed: true,
            ccs: { enabled: true },
            product: { id: normalizedProducts.OSD },
            subscription: {
              plan: { id: normalizedProducts.OSD },
              capabilities: [
                { name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'true', inherited: true },
                {
                  name: subscriptionCapabilities.MANAGE_CLUSTER_ADMIN,
                  value: 'true',
                  inherited: false,
                },
              ],
            },
          },
        },
      },
    };

    const result = canAllowAdminSelector(stateWithCapability);

    expect(result).toBe(true);
  });
});
