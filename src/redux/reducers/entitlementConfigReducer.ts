import type { TokensAction } from '../actions/tokensActions';
import CREATE_ENTITLEMENT_CONFIG from '../constants/entitlementConfigConstants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../stateTypes';
import type { PromiseActionType } from '../types';

type State = PromiseReducerState;

const initialState: State = {
  ...baseRequestState,
};

function entitlementConfigReducer(
  state = initialState,
  action: PromiseActionType<TokensAction>,
): State {
  switch (action.type) {
    case REJECTED_ACTION(CREATE_ENTITLEMENT_CONFIG):
      return {
        ...initialState,
        // can't use getErrorState here - this is not using an OCM api.
        error: true,
        errorCode: -1,
        fulfilled: false,
        errorMessage: '',
      };

    case PENDING_ACTION(CREATE_ENTITLEMENT_CONFIG):
      return {
        ...state,
        pending: true,
      };

    case FULFILLED_ACTION(CREATE_ENTITLEMENT_CONFIG):
      return {
        ...baseRequestState,
        fulfilled: true,
      };
    default:
      return state;
  }
}

export { initialState };
export default entitlementConfigReducer;
