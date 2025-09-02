import { ViewOptions } from '~/types/types';

import accessRequestService from '../../services/accessTransparency/accessRequestService';
import { accessRequestConstants } from '../constants';

import { accessRequestActions } from './accessRequestActions';

jest.mock('../../services/accessTransparency/accessRequestService', () => ({
  getAccessRequests: jest.fn(),
  getAccessRequest: jest.fn(),
  postAccessRequestDecision: jest.fn(),
}));

const mockedViewOptions: ViewOptions = {
  currentPage: 2,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
  filter: {
    description: '',
    loggedBy: '',
    timestampFrom: ">= '2024-05-01T00:00:00.000Z'",
    timestampTo: "<= '2024-09-17T23:59:59.999Z'",
  },
  sorting: {
    isAscending: false,
    sortField: 'timestamp',
    sortIndex: 5,
  },
  flags: {},
};

describe('accessRequestActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const subscriptionId = 'subscriptionId1';

  describe('getAccessRequests', () => {
    it('dispatches successfully', () => {
      // Arrange
      (accessRequestService.getAccessRequests as jest.Mock).mockReturnValue([
        'request1',
        'request2',
        'request3',
      ]);

      // Act
      const result = accessRequestActions.getAccessRequests(subscriptionId, mockedViewOptions);

      // Assert
      expect(result).toEqual({
        payload: ['request1', 'request2', 'request3'],
        type: accessRequestConstants.GET_ACCESS_REQUESTS,
      });
    });

    it('calls accessProtectionService.getAccessProtection', () => {
      accessRequestActions.getAccessRequests(subscriptionId, mockedViewOptions);
      expect(accessRequestService.getAccessRequests).toHaveBeenCalled();
    });
  });
});
