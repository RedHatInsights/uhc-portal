import accessProtectionService from '../../services/accessTransparency/accessProtectionService';
import { accessRequestConstants } from '../constants';

import { accessProtectionActions } from './accessProtectionActions';

jest.mock('../../services/accessTransparency/accessProtectionService', () => ({
  getAccessProtection: jest.fn(),
}));

describe('accessProtectionActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const subscriptionId = 'subscriptionId1';

  describe('getAccessProtection', () => {
    it('dispatches successfully', () => {
      // Arrange
      (accessProtectionService.getAccessProtection as jest.Mock).mockReturnValue(
        'access protection',
      );

      // Act
      const result = accessProtectionActions.getAccessProtection(subscriptionId);

      // Assert
      expect(result).toEqual({
        payload: 'access protection',
        type: accessRequestConstants.GET_ACCESS_PROTECTION,
      });
    });

    it('calls accessProtectionService.getAccessProtection', () => {
      accessProtectionActions.getAccessProtection(subscriptionId);
      expect(accessProtectionService.getAccessProtection).toHaveBeenCalledWith({ subscriptionId });
    });
  });

  describe('getOrganizationAccessProtection', () => {
    const organizationId = 'organizationId1';

    it('dispatches successfully', () => {
      // Arrange
      (accessProtectionService.getAccessProtection as jest.Mock).mockReturnValue(
        'access protection',
      );

      // Act
      const result = accessProtectionActions.getOrganizationAccessProtection(organizationId);

      // Assert
      expect(result).toEqual({
        payload: 'access protection',
        type: accessRequestConstants.GET_ORGANIZATION_ACCESS_PROTECTION,
      });
    });

    it('calls accessProtectionService.getAccessProtection', () => {
      accessProtectionActions.getOrganizationAccessProtection(organizationId);
      expect(accessProtectionService.getAccessProtection).toHaveBeenCalledWith({ organizationId });
    });
  });

  it('dispatches resetAccessProtection', () => {
    const result = accessProtectionActions.resetAccessProtection();
    expect(result).toEqual({
      type: accessRequestConstants.RESET_ACCESS_PROTECTION,
    });
  });

  it('dispatches resetOrganizationAccessProtection', () => {
    const result = accessProtectionActions.resetOrganizationAccessProtection();
    expect(result).toEqual({
      type: accessRequestConstants.RESET_ORGANIZATION_ACCESS_PROTECTION,
    });
  });
});
