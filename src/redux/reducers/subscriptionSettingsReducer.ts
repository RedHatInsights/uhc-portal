/*
Copyright (c) 2018 Red Hat, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { produce } from 'immer';

import { getErrorState } from '../../common/errors';
import { Subscription } from '../../types/clusters_mgmt.v1';
import { SubscriptionSettingsAction } from '../actions/subscriptionSettingsActions';
import { subscriptionSettingsConstants } from '../constants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import { PromiseActionType } from '../types';

// TODO requestState separated from data is inconsistent with other reducers
// although the separation is a better pattern
type State = {
  requestState: PromiseReducerState;
  data: Subscription;
};

const initialState: State = {
  requestState: baseRequestState,
  data: {},
};

function subscriptionSettingsReducer(
  state = initialState,
  action: PromiseActionType<SubscriptionSettingsAction>,
): State {
  // eslint-disable-next-line consistent-return
  return produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      // EDIT_SUBSCRIPTION_SETTINGS
      case PENDING_ACTION(subscriptionSettingsConstants.EDIT_SUBSCRIPTION_SETTINGS):
        draft.requestState = { ...baseRequestState, pending: true };
        break;

      case REJECTED_ACTION(subscriptionSettingsConstants.EDIT_SUBSCRIPTION_SETTINGS):
        draft.requestState = getErrorState(action);
        break;

      case FULFILLED_ACTION(subscriptionSettingsConstants.EDIT_SUBSCRIPTION_SETTINGS):
        draft.requestState = { ...baseRequestState, fulfilled: true };
        draft.data = action.payload.data;
        break;

      // CLEAR_EDIT_SUBSCRIPTION_SETTINGS_RESPONSE
      case subscriptionSettingsConstants.CLEAR_EDIT_SUBSCRIPTION_SETTINGS_RESPONSE:
        draft.requestState = baseRequestState;
        draft.data = {};
        break;
    }
  });
}

subscriptionSettingsReducer.initialState = initialState;

export { initialState, subscriptionSettingsReducer };

export default subscriptionSettingsReducer;
