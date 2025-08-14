import { produce } from 'immer';

import { getErrorState } from '~/common/errors';
import {
  CLEAR_TOGGLE_SUBSCRIPTION_RELEASED_RESPONSE,
  TOGGLE_SUBSCRIPTION_RELEASED,
} from '~/components/clusters/common/TransferClusterOwnershipDialog/models/subscriptionReleasedConstants';
import { Subscription } from '~/types/accounts_mgmt.v1';

import { SubscriptionReleasedActions } from '../actions/subscriptionReleasedActions';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import { PromiseActionType } from '../types';

type State = {
  requestState: PromiseReducerState;
  data: Subscription;
};

const initialState: State = {
  requestState: baseRequestState,
  data: {} as Subscription,
};

const subscriptionReleasedReducer = (
  state = initialState,
  action: PromiseActionType<SubscriptionReleasedActions>,
): State =>
  // eslint-disable-next-line consistent-return
  produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case PENDING_ACTION(TOGGLE_SUBSCRIPTION_RELEASED):
        draft.requestState = { ...baseRequestState, pending: true };
        break;

      case REJECTED_ACTION(TOGGLE_SUBSCRIPTION_RELEASED):
        draft.requestState = getErrorState(action);
        break;

      case FULFILLED_ACTION(TOGGLE_SUBSCRIPTION_RELEASED):
        draft.requestState = { ...baseRequestState, fulfilled: true };
        draft.data = action.payload.data;
        break;

      // CLEAR_TOGGLE_SUBSCRIPTION_RELEASED_RESPONSE
      case CLEAR_TOGGLE_SUBSCRIPTION_RELEASED_RESPONSE:
        return initialState;
    }
  });

subscriptionReleasedReducer.initialState = initialState;

export { initialState, subscriptionReleasedReducer };

export default subscriptionReleasedReducer;
