import { produce } from 'immer';

import { getErrorState } from '../../common/errors';
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
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';

const initialState = {
  getAWSAccountIDsResponse: {
    ...baseRequestState,
  },
  getAWSAccountRolesARNsResponse: {
    ...baseRequestState,
  },
  getOCMRoleResponse: {
    ...baseRequestState,
  },
  getUserRoleResponse: {
    ...baseRequestState,
  },
  getAWSBillingAccountsResponse: {
    ...baseRequestState,
  },
  offlineToken: undefined,
};

function rosaReducer(state = initialState, action) {
  // eslint-disable-next-line consistent-return
  return produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      // LIST_ASSOCIATED_AWS_IDS
      case PENDING_ACTION(LIST_ASSOCIATED_AWS_IDS):
        draft.getAWSAccountIDsResponse.pending = true;
        break;

      case FULFILLED_ACTION(LIST_ASSOCIATED_AWS_IDS):
        draft.getAWSAccountIDsResponse = {
          ...baseRequestState,
          fulfilled: true,
          data: action.payload,
        };
        break;

      case REJECTED_ACTION(LIST_ASSOCIATED_AWS_IDS):
        draft.getAWSAccountIDsResponse = {
          ...baseRequestState,
          ...getErrorState(action),
          data: {},
        };
        break;

      // GET_AWS_ACCOUNT_ROLES_ARNS
      case PENDING_ACTION(GET_AWS_ACCOUNT_ROLES_ARNS):
        draft.getAWSAccountRolesARNsResponse.pending = true;
        break;

      case FULFILLED_ACTION(GET_AWS_ACCOUNT_ROLES_ARNS):
        draft.getAWSAccountRolesARNsResponse = {
          ...baseRequestState,
          fulfilled: true,
          data: action.payload,
        };
        break;

      case REJECTED_ACTION(GET_AWS_ACCOUNT_ROLES_ARNS):
        draft.getAWSAccountRolesARNsResponse = {
          ...baseRequestState,
          ...getErrorState(action),
          data: {},
        };
        break;

      // GET_AWS_BILLING_ACCOUNTS
      case PENDING_ACTION(GET_AWS_BILLING_ACCOUNTS):
        draft.getAWSBillingAccountsResponse.pending = true;
        break;

      case FULFILLED_ACTION(GET_AWS_BILLING_ACCOUNTS):
        draft.getAWSBillingAccountsResponse = {
          ...baseRequestState,
          fulfilled: true,
          data: action.payload,
        };
        break;

      case REJECTED_ACTION(GET_AWS_BILLING_ACCOUNTS):
        draft.getAWSBillingAccountsResponse = {
          ...baseRequestState,
          ...getErrorState(action),
          data: {},
        };
        break;

      // GET_OCM_ROLE
      case PENDING_ACTION(GET_OCM_ROLE):
        draft.getOCMRoleResponse.pending = true;
        break;

      case FULFILLED_ACTION(GET_OCM_ROLE):
        draft.getOCMRoleResponse = {
          ...baseRequestState,
          fulfilled: true,
          data: action.payload,
        };
        break;

      case REJECTED_ACTION(GET_OCM_ROLE):
        draft.getOCMRoleResponse = {
          ...baseRequestState,
          ...getErrorState(action),
          data: {},
        };
        break;

      // GET_USER_ROLE
      case PENDING_ACTION(GET_USER_ROLE):
        draft.getUserRoleResponse.pending = true;
        break;

      case FULFILLED_ACTION(GET_USER_ROLE):
        draft.getUserRoleResponse = {
          ...baseRequestState,
          fulfilled: true,
          data: action.payload,
        };
        break;

      case REJECTED_ACTION(GET_USER_ROLE):
        draft.getUserRoleResponse = {
          ...baseRequestState,
          ...getErrorState(action),
          data: {},
        };
        break;

      // CLEARs
      case CLEAR_GET_AWS_ACCOUNT_ROLES_ARNS_RESPONSE:
        draft.getAWSAccountRolesARNsResponse = {
          ...baseRequestState,
        };
        break;

      case CLEAR_GET_AWS_ACCOUNT_IDS_RESPONSE:
        draft.getAWSAccountIDsResponse = {
          ...baseRequestState,
        };
        break;

      case CLEAR_GET_OCM_ROLE_RESPONSE:
        draft.getOCMRoleResponse = {
          ...baseRequestState,
          data: {},
        };
        break;

      case CLEAR_GET_USER_ROLE_RESPONSE:
        draft.getUserRoleResponse = {
          ...baseRequestState,
          data: {},
        };
        break;

      case SET_OFFLINE_TOKEN:
        draft.offlineToken = action.payload;
        break;
    }
  });
}

rosaReducer.initialState = initialState;

export { initialState };

export default rosaReducer;
