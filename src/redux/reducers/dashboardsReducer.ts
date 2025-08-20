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

import { OneMetric, Subscription, SummaryVector } from '~/types/accounts_mgmt.v1';

import { getErrorState } from '../../common/errors';
import type { DashboardsAction } from '../actions/dashboardsActions';
import { dashboardsConstants } from '../constants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../stateTypes';
import type { PromiseActionType } from '../types';

// not an ideal union type for metrics
type ModifiedSubscription = Omit<Subscription, 'metrics'> & { metrics: Partial<OneMetric> };

type State = {
  summary: PromiseReducerState<{
    metrics: {
      [name: string]: SummaryVector[];
    };
  }>;
  unhealthyClusters: PromiseReducerState<{
    subscriptions: ModifiedSubscription[];
  }>;
};

const initialState: State = {
  summary: {
    ...baseRequestState,
  },
  unhealthyClusters: {
    ...baseRequestState,
    subscriptions: [],
  },
};

function dashboardsReducer(
  state = initialState,
  action: PromiseActionType<DashboardsAction>,
): State {
  // eslint-disable-next-line consistent-return
  return produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      // Overview dashboard data.
      case REJECTED_ACTION(dashboardsConstants.GET_SUMMARY_DASHBOARD):
        draft.summary = {
          ...initialState.summary,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(dashboardsConstants.GET_SUMMARY_DASHBOARD):
        draft.summary.pending = true;
        break;
      case FULFILLED_ACTION(dashboardsConstants.GET_SUMMARY_DASHBOARD):
        draft.summary = {
          ...baseRequestState,
          fulfilled: true,
          metrics: action.payload.summary,
        };
        break;

      // Unhealthy Clusters table.
      case REJECTED_ACTION(dashboardsConstants.GET_UNHEALTHY_CLUSTERS):
        draft.unhealthyClusters = {
          ...initialState.unhealthyClusters,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(dashboardsConstants.GET_UNHEALTHY_CLUSTERS):
        draft.unhealthyClusters.pending = true;
        break;
      case FULFILLED_ACTION(dashboardsConstants.GET_UNHEALTHY_CLUSTERS): {
        // convert metrics array to its first item
        const items = action.payload.data.items?.map((item) => {
          const metrics = item?.metrics?.[0] ?? {};
          return {
            ...item,
            metrics,
          };
        });
        draft.unhealthyClusters = {
          ...baseRequestState,
          fulfilled: true,
          subscriptions: items ?? [],
        };
        break;
      }
    }
  });
}

dashboardsReducer.initialState = initialState;

export { dashboardsReducer, initialState };

export default dashboardsReducer;
