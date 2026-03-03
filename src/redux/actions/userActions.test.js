import { userConstants } from '../constants';

import { userActions } from './userActions';

jest.mock('../../services/accountsService');

// See also quotaSelectors.test.js checking processQuota -> selectors together.

describe('clustersActions', () => {
  let mockDispatch;
  beforeEach(() => {
    mockDispatch = jest.fn();
  });

  describe('getOrganizationAndQuota', () => {
    it('dispatches successfully', () => {
      const mockGetState = jest.fn().mockImplementation(() => ({}));
      userActions.getOrganizationAndQuota({})(mockDispatch, mockGetState);
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: expect.anything(),
        type: userConstants.GET_ORGANIZATION,
      });
    });
  });
});
