import { hasCapability, subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import {
  defaultClusterFromSubscription,
  defaultSubscription,
} from '~/components/clusters/common/__tests__/defaultClusterFromSubscription.fixtures';
import { GlobalState } from '~/redux/stateTypes';
import { ClusterFromSubscription } from '~/types/types';

import {
  canTransferClusterOwnershipMultiRegion,
  canTransferClusterOwnershipSelector,
} from '../transferClusterOwnershipDialogSelectors';

// Mock the hasCapability function
jest.mock('../../../../../../common/subscriptionCapabilities', () => ({
  hasCapability: jest.fn(),
  subscriptionCapabilities: {
    RELEASE_OCP_CLUSTERS: 'RELEASE_OCP_CLUSTERS',
  },
}));

const hasCapabilityMock = hasCapability as jest.Mock;

describe('Utility functions', () => {
  describe('canTransferClusterOwnershipSelector', () => {
    it('should return true when the subscription has the RELEASE_OCP_CLUSTERS capability', () => {
      const state = {
        clusters: {
          details: {
            cluster: {
              subscription: {
                capabilities: [subscriptionCapabilities.RELEASE_OCP_CLUSTERS],
              },
            },
          },
        },
      } as any as GlobalState;
      hasCapabilityMock.mockReturnValue(true);

      const result = canTransferClusterOwnershipSelector(state);
      expect(result).toBe(true);
      expect(hasCapability).toHaveBeenCalledWith(
        { capabilities: [subscriptionCapabilities.RELEASE_OCP_CLUSTERS] },
        subscriptionCapabilities.RELEASE_OCP_CLUSTERS,
      );
    });

    it('should return false when the subscription does not have the RELEASE_OCP_CLUSTERS capability', () => {
      const state = {
        clusters: {
          details: {
            cluster: {
              subscription: {
                capabilities: [],
              },
            },
          },
        },
      } as any as GlobalState;
      hasCapabilityMock.mockReturnValue(false);

      const result = canTransferClusterOwnershipSelector(state);
      expect(result).toBe(false);
      expect(hasCapability).toHaveBeenCalledWith(
        { capabilities: [] },
        subscriptionCapabilities.RELEASE_OCP_CLUSTERS,
      );
    });
  });

  describe('canTransferClusterOwnershipMultiRegion', () => {
    it('should return true when the subscription has the RELEASE_OCP_CLUSTERS capability', () => {
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        subscription: {
          ...defaultSubscription,
          capabilities: [
            { name: subscriptionCapabilities.RELEASE_OCP_CLUSTERS, inherited: false, value: '' },
          ],
        },
      };
      hasCapabilityMock.mockReturnValue(true);

      const result = canTransferClusterOwnershipMultiRegion(cluster);
      expect(result).toBe(true);
      expect(hasCapability).toHaveBeenCalledWith(
        cluster.subscription,
        subscriptionCapabilities.RELEASE_OCP_CLUSTERS,
      );
    });

    it('should return false when the subscription does not have the RELEASE_OCP_CLUSTERS capability', () => {
      const cluster = {
        ...defaultClusterFromSubscription,
        subscription: {
          ...defaultSubscription,
          capabilities: [],
        },
      };
      hasCapabilityMock.mockReturnValue(false);

      const result = canTransferClusterOwnershipMultiRegion(cluster);
      expect(result).toBe(false);
      expect(hasCapability).toHaveBeenCalledWith(
        { capabilities: [], managed: false },
        subscriptionCapabilities.RELEASE_OCP_CLUSTERS,
      );
    });
  });
});
