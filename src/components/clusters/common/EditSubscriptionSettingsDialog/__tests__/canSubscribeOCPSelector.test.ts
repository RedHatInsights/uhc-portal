import { hasCapability, subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { GlobalState } from '~/redux/stateTypes';
import { Subscription } from '~/types/accounts_mgmt.v1';

import { canSubscribeOCPMultiRegion, canSubscribeOCPSelector } from '../canSubscribeOCPSelector';

jest.mock('~/common/subscriptionCapabilities');

const hasCapabilityMock = hasCapability as jest.Mock;

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
    it.each([
      ['without subscription', false, false, {}, { result: false, times: 2 }],
      [
        'with subscription',
        false,
        false,
        argument1,
        {
          result: false,
          times: 2,
          firstHasCapabilityName: 'whatever',
          secondHasCapabilityName: 'whatever',
        },
      ],
      [
        'has SUBSCRIBED_OCP',
        true,
        undefined,
        {},
        { result: true, times: 1, secondHasCapabilityName: null },
      ],
      [
        'has SUBSCRIBED_OCP_MARKETPLACE but SUBSCRIBED_OCP',
        false,
        true,
        {},
        { result: true, times: 2 },
      ],
    ])(
      '%s',
      (
        _title: string,
        firstHasCapabilityReturn: boolean,
        secondHasCapabilityReturn: boolean | undefined,
        canSubscribeOCPSelectorResult: any,
        expected: {
          result: boolean;
          times: number;
          firstHasCapabilityName?: any;
          secondHasCapabilityName?: any;
        },
      ) => {
        // Arrange
        hasCapabilityMock.mockReturnValueOnce(firstHasCapabilityReturn);
        if (secondHasCapabilityReturn !== undefined) {
          hasCapabilityMock.mockReturnValueOnce(secondHasCapabilityReturn);
        }

        // Act
        const result = methodToExecute(canSubscribeOCPSelectorResult as GlobalState);

        // Assert
        expect(result).toBe(expected.result);
        expect(hasCapabilityMock).toHaveBeenCalledTimes(expected.times);
        expect(hasCapabilityMock).toHaveBeenCalledWith(
          expected.firstHasCapabilityName,
          subscriptionCapabilities.SUBSCRIBED_OCP,
        );
        if (expected.secondHasCapabilityName !== null) {
          expect(hasCapabilityMock).toHaveBeenCalledWith(
            expected.secondHasCapabilityName,
            subscriptionCapabilities.SUBSCRIBED_OCP_MARKETPLACE,
          );
        } else {
          expect(hasCapabilityMock).not.toHaveBeenCalledWith(
            expect.anything(),
            subscriptionCapabilities.SUBSCRIBED_OCP_MARKETPLACE,
          );
        }
      },
    );
  });
});
