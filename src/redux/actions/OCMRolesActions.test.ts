import { accountsService } from '../../services';
import OCMRolesConstants from '../constants/OCMRolesConstants';

import OCMRolesActions from './OCMRolesActions';

jest.mock('../../services', () => ({
  accountsService: {
    getSubscriptionRoleBindings: jest.fn(),
    createSubscriptionRoleBinding: jest.fn(),
    deleteSubscriptionRoleBinding: jest.fn(),
  },
}));

describe('OCMRolesActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const subId = '123456789';

  describe('getOCMRoles', () => {
    it('dispatches successfully', () => {
      // Arrange
      (accountsService.getSubscriptionRoleBindings as jest.Mock).mockReturnValue([
        'role1',
        'role2',
        'role3',
      ]);

      // Act
      const result = OCMRolesActions.getOCMRoles(subId);

      // Assert
      expect(result).toEqual({
        payload: ['role1', 'role2', 'role3'],
        type: OCMRolesConstants.GET_OCM_ROLES,
      });
    });

    it('calls accountsService.getSubscriptionRoleBindings', () => {
      OCMRolesActions.getOCMRoles(subId);
      expect(accountsService.getSubscriptionRoleBindings).toHaveBeenCalledWith(subId);
    });
  });

  describe('grantOCMRole', () => {
    const username = 'mockuser1';
    const roleId = 'roleId1';

    it('dispatches successfully', () => {
      // Arrange
      (accountsService.createSubscriptionRoleBinding as jest.Mock).mockReturnValue('granted role');

      // Act
      const result = OCMRolesActions.grantOCMRole(subId, username, roleId);

      // Assert
      expect(result).toEqual({
        payload: 'granted role',
        type: OCMRolesConstants.GRANT_OCM_ROLE,
      });
    });

    it('calls accountsService.createSubscriptionRoleBinding', () => {
      OCMRolesActions.grantOCMRole(subId, username, roleId);
      expect(accountsService.createSubscriptionRoleBinding).toHaveBeenCalledWith(
        subId,
        username,
        roleId,
      );
    });
  });

  describe('deleteOCMRole', () => {
    const roleBindingId = 'roleBindingId1';

    it('dispatches successfully', () => {
      // Arrange
      (accountsService.deleteSubscriptionRoleBinding as jest.Mock).mockReturnValue('deleted role');

      // Act
      const result = OCMRolesActions.deleteOCMRole(subId, roleBindingId);

      // Assert
      expect(result).toEqual({
        payload: 'deleted role',
        type: OCMRolesConstants.DELETE_OCM_ROLE,
      });
    });

    it('calls accountsService.deleteSubscriptionRoleBinding', () => {
      OCMRolesActions.deleteOCMRole(subId, roleBindingId);
      expect(accountsService.deleteSubscriptionRoleBinding).toHaveBeenCalledWith(
        subId,
        roleBindingId,
      );
    });
  });

  it('dispatches clearGetOCMRolesResponse', () => {
    const result = OCMRolesActions.clearGetOCMRolesResponse();
    expect(result).toEqual({
      type: OCMRolesConstants.CLEAR_GET_OCM_ROLES_RESPONSE,
    });
  });

  it('dispatches clearGrantOCMRoleResponse', () => {
    const result = OCMRolesActions.clearGrantOCMRoleResponse();
    expect(result).toEqual({
      type: OCMRolesConstants.CLEAR_GRANT_OCM_ROLE_RESPONSE,
    });
  });

  it('dispatches clearDeleteOCMRoleResponse', () => {
    const result = OCMRolesActions.clearDeleteOCMRoleResponse();
    expect(result).toEqual({
      type: OCMRolesConstants.CLEAR_DELETE_OCM_ROLE_RESPONSE,
    });
  });
});
