import { GlobalErrorAction } from '../actions/globalErrorActions';
import { CLEAR_GLOBAL_ERROR, SET_GLOBAL_ERROR } from '../constants/globalErrorConstants';

type State = {
  errorMessage?: string;
  errorTitle?: string;
  sourceComponent?: string;
};

const initialState: State = {
  errorMessage: undefined,
  errorTitle: undefined,
  sourceComponent: undefined,
};

// eslint-disable-next-line default-param-last
function globalErrorReducer(state = initialState, action: GlobalErrorAction): State {
  switch (action.type) {
    case SET_GLOBAL_ERROR:
      return action.payload;
    case CLEAR_GLOBAL_ERROR:
      /*
      The "Clear" action suppots two modes - if requestingComponent is set, this is
      for calling when a component is mounted, so it'll only want to clear the error
      state if it is the one that set it in the first place.

      When requestingComponent is not set, clear the state uncodintionally - this is for
      allowing the user to close the error alert by clicking the X button.
      */
      if (!action.payload || action.payload === state.sourceComponent) {
        return initialState;
      }
      return state;
    default:
      return state;
  }
}

export default globalErrorReducer;
