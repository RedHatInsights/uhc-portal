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

import {
  SchemaReportCost,
  SchemaSourcePagination,
  SchemaUserAccessListPagination,
} from '~/types/cost-management.v1';

import { getErrorState } from '../../common/errors';
import type { CostAction } from '../actions/costActions';
import { costConstants } from '../constants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../stateTypes';
import type { PromiseActionType } from '../types';

type State = {
  report: PromiseReducerState<SchemaReportCost>;
  sources: PromiseReducerState<SchemaSourcePagination>;
  userAccess: PromiseReducerState<SchemaUserAccessListPagination>;
};

const initialState: State = {
  report: {
    ...baseRequestState,
  },
  sources: {
    ...baseRequestState,
  },
  userAccess: {
    ...baseRequestState,
  },
};

function costReducer(state = initialState, action: PromiseActionType<CostAction>): State {
  // eslint-disable-next-line consistent-return
  return produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      // Report
      case REJECTED_ACTION(costConstants.GET_REPORT):
        draft.report = {
          ...initialState.report,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(costConstants.GET_REPORT):
        draft.report.pending = true;
        break;
      case FULFILLED_ACTION(costConstants.GET_REPORT):
        draft.report = {
          ...baseRequestState,
          fulfilled: true,
          ...action.payload.data,
        };
        break;

      // Sources
      case REJECTED_ACTION(costConstants.GET_SOURCES):
        draft.sources = {
          ...initialState.sources,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(costConstants.GET_SOURCES):
        draft.sources.pending = true;
        break;
      case FULFILLED_ACTION(costConstants.GET_SOURCES):
        draft.sources = {
          ...baseRequestState,
          fulfilled: true,
          ...action.payload.data,
        };
        break;

      // User access
      case REJECTED_ACTION(costConstants.GET_USER_ACCESS):
        draft.userAccess = {
          ...initialState.userAccess,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(costConstants.GET_USER_ACCESS):
        draft.userAccess.pending = true;
        break;
      case FULFILLED_ACTION(costConstants.GET_USER_ACCESS):
        draft.userAccess = {
          ...baseRequestState,
          fulfilled: true,
          ...action.payload.data,
        };
        break;
    }
  });
}
costReducer.initialState = initialState;

export { costReducer, initialState };

export default costReducer;
