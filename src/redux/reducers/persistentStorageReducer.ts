import { getErrorState } from '../../common/errors';
import { PersistentStorageAction } from '../actions/persistentStorageActions';
import { persistentStorageConstants } from '../constants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../stateTypes';
import { PromiseActionType } from '../types';

type State = PromiseReducerState<{
  values: number[];
}>;

const initialState: State = {
  ...baseRequestState,
  values: [],
};

function persistentStorageReducer(
  state = initialState,
  action: PromiseActionType<PersistentStorageAction>,
): State {
  switch (action.type) {
    case REJECTED_ACTION(persistentStorageConstants.GET_PERSISTENT_STORAGE_VALUES):
      return {
        ...initialState,
        ...getErrorState(action),
      };
    case PENDING_ACTION(persistentStorageConstants.GET_PERSISTENT_STORAGE_VALUES):
      return {
        ...state,
        pending: true,
      };
    case FULFILLED_ACTION(persistentStorageConstants.GET_PERSISTENT_STORAGE_VALUES):
      return {
        ...baseRequestState,
        fulfilled: true,
        values: action.payload,
      };
    default:
      return state;
  }
}
persistentStorageReducer.initialState = initialState;

export { initialState, persistentStorageReducer };

export default persistentStorageReducer;
