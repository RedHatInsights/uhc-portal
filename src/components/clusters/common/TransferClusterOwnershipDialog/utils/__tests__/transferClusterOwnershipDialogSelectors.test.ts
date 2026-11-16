import { clusterCapabilities, hasCapabilityValue } from '~/common/capabilities';
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

// Mock the hasCapabilityValue function
jest.mock('../../../../../../common/capabilities', () => ({
  hasCapabilityValue: jest.fn(),
  haveCapabilities: jest.fn(),
  clusterCapabilities: {
    RELEASE_OCP_CLUSTERS: 'RELEASE_OCP_CLUSTERS',
  },
}));

const hasCapabilityValueMock = hasCapabilityValue as jest.Mock;

describe('Utility functions', () => {
  describe('canTransferClusterOwnershipSelector', () => {
    it('should return true when the subscription has the RELEASE_OCP_CLUSTERS capability', () => {
      const state = {
        clusters: {
          details: {
            cluster: {
              subscription: {
                capabilities: [clusterCapabilities.RELEASE_OCP_CLUSTERS],
              },
            },
          },
        },
      } as any as GlobalState;
      hasCapabilityValueMock.mockReturnValue(true);

      const result = canTransferClusterOwnershipSelector(state);
      expect(result).toBe(true);
      expect(hasCapabilityValue).toHaveBeenCalledWith(
        [clusterCapabilities.RELEASE_OCP_CLUSTERS],
        clusterCapabilities.RELEASE_OCP_CLUSTERS,
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
      hasCapabilityValueMock.mockReturnValue(false);

      const result = canTransferClusterOwnershipSelector(state);
      expect(result).toBe(false);
      expect(hasCapabilityValue).toHaveBeenCalledWith([], clusterCapabilities.RELEASE_OCP_CLUSTERS);
    });
  });

  describe('canTransferClusterOwnershipMultiRegion', () => {
    it('should return true when the subscription has the RELEASE_OCP_CLUSTERS capability', () => {
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        subscription: {
          ...defaultSubscription,
          capabilities: [
            { name: clusterCapabilities.RELEASE_OCP_CLUSTERS, inherited: false, value: '' },
          ],
        },
      };
      hasCapabilityValueMock.mockReturnValue(true);

      const result = canTransferClusterOwnershipMultiRegion(cluster);
      expect(result).toBe(true);
      expect(hasCapabilityValue).toHaveBeenCalledWith(
        cluster.subscription?.capabilities,
        clusterCapabilities.RELEASE_OCP_CLUSTERS,
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
      hasCapabilityValueMock.mockReturnValue(false);

      const result = canTransferClusterOwnershipMultiRegion(cluster);
      expect(result).toBe(false);
      expect(hasCapabilityValue).toHaveBeenCalledWith([], clusterCapabilities.RELEASE_OCP_CLUSTERS);
    });
  });
});
