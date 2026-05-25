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

import {
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../../../../../redux/reduxHelpers';

import { GET_CLUSTER_INSIGHTS, GET_ORGANIZATION_INSIGHTS } from './InsightsConstants';

const initialState = {
  insightsData: {},
  groups: {
    groups: [],
    rejected: false,
    pending: false,
    fulfilled: false,
  },
  overview: {
    overview: null,
    rejected: false,
    pending: false,
    fulfilled: false,
  },
};

// eslint-disable-next-line default-param-last
function insightsReducer(state = initialState, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      // GET_CLUSTER_INSIGHTS
      case FULFILLED_ACTION(GET_CLUSTER_INSIGHTS):
        draft.insightsData[action.meta.clusterId] = {
          ...action.payload.insightsData,
          status: action.payload.status,
        };
        break;
      case REJECTED_ACTION(GET_CLUSTER_INSIGHTS):
        draft.insightsData[action.meta.clusterId] = {
          status: action.payload.response?.status,
        };
        break;
      // GET_ORGANIZATION_INSIGHTS
      case FULFILLED_ACTION(GET_ORGANIZATION_INSIGHTS):
        draft.overview.overview = action.payload.data.overview;
        draft.overview.fulfilled = true;
        draft.overview.pending = false;
        break;
      case PENDING_ACTION(GET_ORGANIZATION_INSIGHTS):
        draft.overview.pending = true;
        break;
      case REJECTED_ACTION(GET_ORGANIZATION_INSIGHTS):
        draft.overview.rejected = true;
        draft.overview.pending = false;
        break;
      default:
        break;
    }
  });
}

insightsReducer.initialState = initialState;

export default insightsReducer;
