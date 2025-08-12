/*
Copyright (c) 2020 Red Hat, Inc.

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

import { AccessProtection } from '~/types/access_transparency.v1';

import { getErrorState } from '../../common/errors';
import { AccessProtectionAction } from '../actions/accessProtectionActions';
import { accessRequestConstants } from '../constants';
import {
  RESET_ACCESS_PROTECTION,
  RESET_ORGANIZATION_ACCESS_PROTECTION,
} from '../constants/accessRequestConstants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import type { PromiseActionType } from '../types';

type State = {
  accessProtection: PromiseReducerState<AccessProtection>;
  organizationAccessProtection: PromiseReducerState<AccessProtection>;
};

const initialState: State = {
  accessProtection: {
    ...baseRequestState,
  },
  organizationAccessProtection: {
    ...baseRequestState,
  },
};

function accessProtectionReducer(
  state = initialState,
  action: PromiseActionType<AccessProtectionAction>,
): State {
  // eslint-disable-next-line consistent-return
  return produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      // GET_ACCESS_PROTECTION
      case REJECTED_ACTION(accessRequestConstants.GET_ACCESS_PROTECTION):
        draft.accessProtection = {
          ...initialState.accessProtection,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(accessRequestConstants.GET_ACCESS_PROTECTION):
        draft.accessProtection.pending = true;
        break;
      case FULFILLED_ACTION(accessRequestConstants.GET_ACCESS_PROTECTION):
        draft.accessProtection = {
          ...baseRequestState,
          fulfilled: true,
          ...action.payload.data,
        };
        break;

      // GET_ORGANIZATION_ACCESS_PROTECTION
      case REJECTED_ACTION(accessRequestConstants.GET_ORGANIZATION_ACCESS_PROTECTION):
        draft.organizationAccessProtection = {
          ...initialState.organizationAccessProtection,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(accessRequestConstants.GET_ORGANIZATION_ACCESS_PROTECTION):
        draft.organizationAccessProtection.pending = true;
        break;
      case FULFILLED_ACTION(accessRequestConstants.GET_ORGANIZATION_ACCESS_PROTECTION):
        draft.organizationAccessProtection = {
          ...baseRequestState,
          fulfilled: true,
          ...action.payload.data,
        };
        break;

      case RESET_ACCESS_PROTECTION:
        draft.accessProtection = initialState.accessProtection;
        break;

      case RESET_ORGANIZATION_ACCESS_PROTECTION:
        draft.organizationAccessProtection = initialState.organizationAccessProtection;
        break;
    }
  });
}
accessProtectionReducer.initialState = initialState;

export { accessProtectionReducer, initialState };

export default accessProtectionReducer;
