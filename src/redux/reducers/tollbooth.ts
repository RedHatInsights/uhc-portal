import { getErrorState } from '../../common/errors';
import type { AccessTokenCfg } from '../../types/accounts_mgmt.v1';
import { ErrorState } from '../../types/types';
import { ACTION_TYPE, TollboothAction } from '../actions/tollbooth';
import { FULFILLED_ACTION, REJECTED_ACTION } from '../reduxHelpers';
import { PromiseActionType } from '../types';

// TODO should follow the same pattern as other promise based reducers
// see https://issues.redhat.com/browse/HAC-485
export type State = {
  token: AccessTokenCfg | ErrorState;
};

const initialState: State = {
  token: {
    auths: {},
  },
};

const tollboothReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: PromiseActionType<TollboothAction>,
): State => {
  switch (action.type) {
    case FULFILLED_ACTION(ACTION_TYPE):
      return { ...state, token: action.payload.data };
    case REJECTED_ACTION(ACTION_TYPE):
      return {
        ...state,
        token: getErrorState(action) as ErrorState,
      };
    default:
      return state;
  }
};

export default tollboothReducer;
