import getOCPLifeCycleStatus from '~/services/productLifeCycleService';

import GET_SUPPORT_STATUS from '../constants/supportStatusConstants';

import { getSupportStatus } from './supportStatusActions';

jest.mock('~/services/productLifeCycleService');

describe('getSupportStatus action', () => {
  it('dispatches successfully', () => {
    // Arrange
    (getOCPLifeCycleStatus as jest.Mock).mockReturnValueOnce('whatever the result');

    // Act
    const returnedAction = getSupportStatus(false);

    // Assert
    expect(returnedAction).toEqual({
      type: GET_SUPPORT_STATUS,
      payload: 'whatever the result',
    });
  });
});
