import {
  CLEAR_GET_AWS_ACCOUNT_IDS_RESPONSE,
  CLEAR_GET_AWS_ACCOUNT_ROLES_ARNS_RESPONSE,
  CLEAR_GET_OCM_ROLE_RESPONSE,
  CLEAR_GET_USER_ROLE_RESPONSE,
  GET_AWS_ACCOUNT_ROLES_ARNS,
  GET_AWS_BILLING_ACCOUNTS,
  GET_OCM_ROLE,
  GET_USER_ROLE,
  LIST_ASSOCIATED_AWS_IDS,
  SET_OFFLINE_TOKEN,
} from '../../components/clusters/wizards/rosa/rosaConstants';
import { FULFILLED_ACTION, PENDING_ACTION, REJECTED_ACTION } from '../reduxHelpers';

import reducer, { initialState } from './rosaReducer';

const clearedState = {
  error: false,
  pending: false,
  fulfilled: false,
};

describe('rosaReducer', () => {
  describe('should not handle unrelated actions', () => {
    it('leaves the state unmodified', () => {
      const action = { type: 'UNRELATED_TYPE' };
      const result = reducer(initialState, action as any);

      expect(result).toEqual(initialState);
    });
  });

  describe('LIST_ASSOCIATED_AWS_IDS', () => {
    it('handles fulfilled action', () => {
      const mockPayload = ['id1', 'id2', 'id3', 'id4'];
      const action = {
        type: FULFILLED_ACTION(LIST_ASSOCIATED_AWS_IDS),
        payload: mockPayload,
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getAWSAccountIDsResponse');
      expect(result.getAWSAccountIDsResponse.fulfilled).toEqual(true);
      // @ts-ignore
      expect(result.getAWSAccountIDsResponse.data).toEqual(mockPayload);
    });

    it('handles pending action', () => {
      const action = {
        type: PENDING_ACTION(LIST_ASSOCIATED_AWS_IDS),
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getAWSAccountIDsResponse');
      expect(result.getAWSAccountIDsResponse.fulfilled).toEqual(false);
      expect(result.getAWSAccountIDsResponse.pending).toEqual(true);
    });

    it('handles rejected action', () => {
      const action = {
        error: new Error('hi'),
        payload: 'some error',
        type: REJECTED_ACTION(LIST_ASSOCIATED_AWS_IDS),
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getAWSAccountIDsResponse');
      expect(result.getAWSAccountIDsResponse.fulfilled).toEqual(false);
      expect(result.getAWSAccountIDsResponse.error).toEqual(true);
      // @ts-ignore
      expect(result.getAWSAccountIDsResponse.errorMessage).toEqual('some error');
    });

    it('handles clear action', () => {
      const action = {
        type: CLEAR_GET_AWS_ACCOUNT_IDS_RESPONSE,
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getAWSAccountIDsResponse');
      expect(result.getAWSAccountIDsResponse).toEqual(clearedState);
    });
  });

  describe('GET_AWS_ACCOUNT_ROLES_ARNS', () => {
    it('handles fulfilled action', () => {
      const mockPayload = ['arn1', 'arn2', 'arn3', 'arn4'];
      const action = {
        type: FULFILLED_ACTION(GET_AWS_ACCOUNT_ROLES_ARNS),
        payload: mockPayload,
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getAWSAccountRolesARNsResponse');
      expect(result.getAWSAccountRolesARNsResponse.fulfilled).toEqual(true);
      // @ts-ignore
      expect(result.getAWSAccountRolesARNsResponse.data).toEqual(mockPayload);
    });

    it('handles pending action', () => {
      const action = {
        type: PENDING_ACTION(GET_AWS_ACCOUNT_ROLES_ARNS),
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getAWSAccountRolesARNsResponse');
      expect(result.getAWSAccountRolesARNsResponse.fulfilled).toEqual(false);
      expect(result.getAWSAccountRolesARNsResponse.pending).toEqual(true);
    });

    it('handles rejected action', () => {
      const action = {
        error: new Error('hi'),
        payload: 'some error',
        type: REJECTED_ACTION(GET_AWS_ACCOUNT_ROLES_ARNS),
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getAWSAccountRolesARNsResponse');
      expect(result.getAWSAccountRolesARNsResponse.fulfilled).toEqual(false);
      expect(result.getAWSAccountRolesARNsResponse.error).toEqual(true);
      // @ts-ignore
      expect(result.getAWSAccountRolesARNsResponse.errorMessage).toEqual('some error');
    });

    it('handles clear action', () => {
      const action = {
        type: CLEAR_GET_AWS_ACCOUNT_ROLES_ARNS_RESPONSE,
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getAWSAccountRolesARNsResponse');
      expect(result.getAWSAccountRolesARNsResponse).toEqual(clearedState);
    });
  });

  describe('GET_AWS_BILLING_ACCOUNTS', () => {
    it('handles fulfilled action', () => {
      const mockPayload = ['account1', 'account2', 'account3', 'account4'];
      const action = {
        type: FULFILLED_ACTION(GET_AWS_BILLING_ACCOUNTS),
        payload: mockPayload,
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getAWSBillingAccountsResponse');
      expect(result.getAWSBillingAccountsResponse.fulfilled).toEqual(true);
      // @ts-ignore
      expect(result.getAWSBillingAccountsResponse.data).toEqual(mockPayload);
    });

    it('handles pending action', () => {
      const action = {
        type: PENDING_ACTION(GET_AWS_BILLING_ACCOUNTS),
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getAWSBillingAccountsResponse');
      expect(result.getAWSBillingAccountsResponse.fulfilled).toEqual(false);
      expect(result.getAWSBillingAccountsResponse.pending).toEqual(true);
    });

    it('handles rejected action', () => {
      const action = {
        error: new Error('hi'),
        payload: 'some error',
        type: REJECTED_ACTION(GET_AWS_BILLING_ACCOUNTS),
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getAWSBillingAccountsResponse');
      expect(result.getAWSBillingAccountsResponse.fulfilled).toEqual(false);
      expect(result.getAWSBillingAccountsResponse.error).toEqual(true);
      // @ts-ignore
      expect(result.getAWSBillingAccountsResponse.errorMessage).toEqual('some error');
    });
  });

  describe('GET_OCM_ROLE', () => {
    it('handles fulfilled action', () => {
      const mockPayload = ['role1', 'role2', 'role3', 'role4'];
      const action = {
        type: FULFILLED_ACTION(GET_OCM_ROLE),
        payload: mockPayload,
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getOCMRoleResponse');
      expect(result.getOCMRoleResponse.fulfilled).toEqual(true);
      // @ts-ignore
      expect(result.getOCMRoleResponse.data).toEqual(mockPayload);
    });

    it('handles pending action', () => {
      const action = {
        type: PENDING_ACTION(GET_OCM_ROLE),
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getOCMRoleResponse');
      expect(result.getOCMRoleResponse.fulfilled).toEqual(false);
      expect(result.getOCMRoleResponse.pending).toEqual(true);
    });

    it('handles rejected action', () => {
      const action = {
        error: new Error('hi'),
        payload: 'some error',
        type: REJECTED_ACTION(GET_OCM_ROLE),
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getOCMRoleResponse');
      expect(result.getOCMRoleResponse.fulfilled).toEqual(false);
      expect(result.getOCMRoleResponse.error).toEqual(true);
      // @ts-ignore
      expect(result.getOCMRoleResponse.errorMessage).toEqual('some error');
    });

    it('handles clear action', () => {
      const newClearedState = { ...clearedState, data: {} };
      const action = {
        type: CLEAR_GET_OCM_ROLE_RESPONSE,
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getOCMRoleResponse');
      expect(result.getOCMRoleResponse).toEqual(newClearedState);
    });
  });

  describe('GET_USER_ROLE', () => {
    it('handles fulfilled action', () => {
      const mockPayload = ['role1', 'role2', 'role3', 'role4'];
      const action = {
        type: FULFILLED_ACTION(GET_USER_ROLE),
        payload: mockPayload,
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getUserRoleResponse');
      expect(result.getUserRoleResponse.fulfilled).toEqual(true);
      // @ts-ignore
      expect(result.getUserRoleResponse.data).toEqual(mockPayload);
    });

    it('handles pending action', () => {
      const action = {
        type: PENDING_ACTION(GET_USER_ROLE),
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getUserRoleResponse');
      expect(result.getUserRoleResponse.fulfilled).toEqual(false);
      expect(result.getUserRoleResponse.pending).toEqual(true);
    });

    it('handles rejected action', () => {
      const action = {
        error: new Error('hi'),
        payload: 'some error',
        type: REJECTED_ACTION(GET_USER_ROLE),
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getUserRoleResponse');
      expect(result.getUserRoleResponse.fulfilled).toEqual(false);
      expect(result.getUserRoleResponse.error).toEqual(true);
      // @ts-ignore
      expect(result.getUserRoleResponse.errorMessage).toEqual('some error');
    });

    it('handles clear action', () => {
      const newClearedState = { ...clearedState, data: {} };
      const action = {
        type: CLEAR_GET_USER_ROLE_RESPONSE,
      };
      const result = reducer(initialState, action as any);

      expect(result).toHaveProperty('getUserRoleResponse');
      expect(result.getUserRoleResponse).toEqual(newClearedState);
    });
  });

  it('sets offline token', () => {
    const mockPayload = 'token1';
    const action = {
      type: SET_OFFLINE_TOKEN,
      payload: mockPayload,
    };
    const result = reducer(initialState, action as any);

    expect(result.offlineToken).toEqual(mockPayload);
  });
});
