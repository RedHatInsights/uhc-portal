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

import { getErrorState } from '~/common/errors';
import { getCompleteFormClusterAutoscaling } from '~/components/clusters/common/clusterAutoScalingValues';
import { ClusterAutoscalerAction } from '~/redux/actions/clusterAutoscalerActions';
import { ClusterAutoscaler } from '~/types/clusters_mgmt.v1';

import { clusterAutoscalerConstants } from '../constants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../stateTypes';
import type { PromiseActionType } from '../types';

export type State = {
  editAction: PromiseReducerState<{}>;
  getAutoscaler: PromiseReducerState<{ data: ClusterAutoscaler | undefined }>;
  hasAutoscaler: boolean;
};

const initialState: State = {
  hasAutoscaler: false,
  getAutoscaler: {
    ...baseRequestState,
    data: undefined,
  },
  editAction: {
    ...baseRequestState,
  },
};

function clusterAutoscalerReducer(
  state = initialState,
  action: PromiseActionType<ClusterAutoscalerAction>,
): State {
  // eslint-disable-next-line consistent-return
  return produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case clusterAutoscalerConstants.SET_HAS_INITIAL_AUTOSCALER:
        draft.hasAutoscaler = action.payload;
        break;

      case clusterAutoscalerConstants.CLEAR_LAST_ACTION_RESULT:
        draft.editAction = initialState.editAction;
        break;

      case clusterAutoscalerConstants.CLEAR_GET_CLUSTER_AUTOSCALER_RESPONSE:
        return initialState;

      // GET cluster autoscaler details
      case PENDING_ACTION(clusterAutoscalerConstants.GET_CLUSTER_AUTOSCALER):
        draft.getAutoscaler.pending = true;
        draft.getAutoscaler.data = undefined;

        draft.hasAutoscaler = false;
        break;

      case FULFILLED_ACTION(clusterAutoscalerConstants.GET_CLUSTER_AUTOSCALER):
        draft.getAutoscaler.fulfilled = true;
        draft.getAutoscaler.pending = false;
        draft.getAutoscaler.data = getCompleteFormClusterAutoscaling(action.payload);

        draft.hasAutoscaler = true;
        break;

      case REJECTED_ACTION(clusterAutoscalerConstants.GET_CLUSTER_AUTOSCALER):
        draft.getAutoscaler.data = undefined;
        draft.getAutoscaler.pending = false;
        draft.getAutoscaler.fulfilled = false;
        draft.getAutoscaler.error = true;

        draft.hasAutoscaler = false;
        break;

      // Write actions on the cluster autoscaler details (CREATE, DELETE, EDIT)
      case PENDING_ACTION(clusterAutoscalerConstants.ENABLE_CLUSTER_AUTOSCALER):
      case PENDING_ACTION(clusterAutoscalerConstants.DISABLE_CLUSTER_AUTOSCALER):
      case PENDING_ACTION(clusterAutoscalerConstants.UPDATE_CLUSTER_AUTOSCALER):
        draft.editAction = {
          pending: true,
          fulfilled: false,
          error: false,
        };
        break;

      case FULFILLED_ACTION(clusterAutoscalerConstants.ENABLE_CLUSTER_AUTOSCALER):
      case FULFILLED_ACTION(clusterAutoscalerConstants.DISABLE_CLUSTER_AUTOSCALER):
      case FULFILLED_ACTION(clusterAutoscalerConstants.UPDATE_CLUSTER_AUTOSCALER):
        if (
          action.type === FULFILLED_ACTION(clusterAutoscalerConstants.DISABLE_CLUSTER_AUTOSCALER)
        ) {
          draft.getAutoscaler.data = undefined;
          draft.hasAutoscaler = false;
        } else {
          draft.getAutoscaler.data = getCompleteFormClusterAutoscaling(action.payload);
          draft.hasAutoscaler = true;
        }
        draft.editAction = {
          pending: false,
          fulfilled: true,
          error: false,
        };
        break;

      case REJECTED_ACTION(clusterAutoscalerConstants.ENABLE_CLUSTER_AUTOSCALER):
      case REJECTED_ACTION(clusterAutoscalerConstants.DISABLE_CLUSTER_AUTOSCALER):
      case REJECTED_ACTION(clusterAutoscalerConstants.UPDATE_CLUSTER_AUTOSCALER):
        draft.editAction = getErrorState(action);
        break;
    }
  });
}
clusterAutoscalerReducer.initialState = initialState;

export { initialState, clusterAutoscalerReducer };

export default clusterAutoscalerReducer;
