import { action, ActionType } from 'typesafe-actions';

import { CLEAR_GLOBAL_ERROR, SET_GLOBAL_ERROR } from '../constants/globalErrorConstants';

const setGlobalError = (errorTitle: string, sourceComponent: string, errorMessage: string) =>
  action(SET_GLOBAL_ERROR, { errorTitle, errorMessage, sourceComponent });

const clearGlobalError = (requestingComponent?: string) =>
  action(CLEAR_GLOBAL_ERROR, requestingComponent);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actions = {
  setGlobalError,
  clearGlobalError,
};

type GlobalErrorAction = ActionType<typeof actions>;

export { setGlobalError, clearGlobalError, GlobalErrorAction };
