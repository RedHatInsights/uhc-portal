import { produce } from 'immer';

import { getErrorState } from '~/common/errors';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '~/redux/reduxHelpers';
import type { PromiseReducerState } from '~/redux/state';
import type { PromiseActionType } from '~/redux/types';

import { DeleteProtectionActions, deleteProtectionConstants } from './deleteProtectionActions';

export type State = {
  updateDeleteProtection: PromiseReducerState<{}>;
};

const initialState: State = {
  updateDeleteProtection: {
    ...baseRequestState,
  },
};

// KKD - hoping we can remove this reducer

function deleteProtectionReducer(
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: PromiseActionType<DeleteProtectionActions>,
): State {
  // eslint-disable-next-line consistent-return
  return produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      // PATCH delete protection
      case PENDING_ACTION(deleteProtectionConstants.UPDATE_DELETE_PROTECTION):
        draft.updateDeleteProtection.pending = true;
        break;

      case FULFILLED_ACTION(deleteProtectionConstants.UPDATE_DELETE_PROTECTION):
        draft.updateDeleteProtection = {
          ...baseRequestState,
          fulfilled: true,
        };
        break;

      case REJECTED_ACTION(deleteProtectionConstants.UPDATE_DELETE_PROTECTION):
        draft.updateDeleteProtection = getErrorState(action);
        break;

      case deleteProtectionConstants.CLEAR_UPDATE_DELETE_PROTECTION_RESPONSE:
        draft.updateDeleteProtection = { ...initialState.updateDeleteProtection };
    }
  });
}
deleteProtectionReducer.initialState = initialState;

export { initialState, deleteProtectionReducer };

export default deleteProtectionReducer;
