import {
  clusterCapabilities,
  hasCapabilityValue,
  hasSubscribedOcpMarketplaceCapability,
} from '~/common/capabilities';
import { Subscription } from '~/types/accounts_mgmt.v1';

import { canSubscribeOCPMultiRegion, canSubscribeOCPSelector } from '../canSubscribeOCPSelector';

jest.mock('~/common/capabilities');

const hasCapabilityValueMock = hasCapabilityValue as jest.Mock;
const hasSubscribedOcpMarketplaceCapabilityMock =
  hasSubscribedOcpMarketplaceCapability as jest.Mock;

describe('canSubscribeOCPSelector', () => {
  afterEach(() => jest.clearAllMocks());

  describe.each([
    [
      'canSubscribeOCPSelector method',
      {
        clusters: { details: { cluster: { subscription: 'whatever' as any as Subscription } } },
      },
      canSubscribeOCPSelector,
    ],
    [
      'canSubscribeOCPMultiRegion method',
      { subscription: 'whatever' as any as Subscription },
      canSubscribeOCPMultiRegion,
    ],
  ])('%s', (_title: string, argument1: any, methodToExecute: (param: any) => boolean) => {
    it('returns false and also checks the marketplace capability when the standard capability is false', () => {
      hasCapabilityValueMock.mockReturnValue(false);
      hasSubscribedOcpMarketplaceCapabilityMock.mockReturnValue(false);

      const result = methodToExecute(argument1);

      expect(result).toBe(false);
      expect(hasCapabilityValueMock).toHaveBeenCalledWith(
        undefined,
        clusterCapabilities.SUBSCRIBED_OCP,
      );
      expect(hasSubscribedOcpMarketplaceCapabilityMock).toHaveBeenCalledTimes(1);
    });

    it('returns true from the standard OCP capability without checking the marketplace capability', () => {
      hasCapabilityValueMock.mockReturnValue(true);

      const result = methodToExecute(argument1);

      expect(result).toBe(true);
      expect(hasSubscribedOcpMarketplaceCapabilityMock).not.toHaveBeenCalled();
    });

    it('returns true from the marketplace capability when the standard capability is false', () => {
      hasCapabilityValueMock.mockReturnValue(false);
      hasSubscribedOcpMarketplaceCapabilityMock.mockReturnValue(true);

      const result = methodToExecute(argument1);

      expect(result).toBe(true);
      expect(hasSubscribedOcpMarketplaceCapabilityMock).toHaveBeenCalledTimes(1);
    });
  });
});
