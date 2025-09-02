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
import dayjs from 'dayjs';
import { produce } from 'immer';

import { getErrorState } from '../../../../common/errors';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../../../../redux/reduxHelpers';

import {
  GET_UPGRADE_SCHEDULES,
  POST_UPGRADE_SCHEDULE,
  SET_CLUSTER_UPGRADE_POLICY,
} from './clusterUpgradeActions';

const initialState = {
  versionInfo: {
    ...baseRequestState,
    version: undefined,
    availableUpgrades: [],
  },
  postedUpgradeSchedule: {
    ...baseRequestState,
  },

  schedules: {
    ...baseRequestState,
    items: [],
  },
};

// eslint-disable-next-line default-param-last
function UpgradesRecuder(state = initialState, action) {
  // eslint-disable-next-line consistent-return
  return produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case PENDING_ACTION(POST_UPGRADE_SCHEDULE):
        draft.postedUpgradeSchedule.pending = true;
        break;
      case FULFILLED_ACTION(POST_UPGRADE_SCHEDULE):
        draft.postedUpgradeSchedule = {
          ...initialState.upgradeSchedule,
          fulfilled: true,
        };
        break;
      case REJECTED_ACTION(POST_UPGRADE_SCHEDULE):
        draft.postedUpgradeSchedule = {
          ...initialState,
          ...getErrorState(action),
        };
        break;

      case PENDING_ACTION(GET_UPGRADE_SCHEDULES):
        draft.schedules.pending = true;
        break;
      case FULFILLED_ACTION(GET_UPGRADE_SCHEDULES): {
        const items = action.payload?.data?.items || [];

        items.sort((a, b) => dayjs(a.next_run).unix() - dayjs(b.next_run).unix());

        draft.schedules = {
          ...initialState.schedules,
          fulfilled: true,
          items,
        };
        break;
      }
      case REJECTED_ACTION(GET_UPGRADE_SCHEDULES):
        draft.schedules = {
          ...initialState.schedules,
          ...getErrorState(action),
        };
        break;

      case SET_CLUSTER_UPGRADE_POLICY: {
        draft.schedules.items = state.schedules.items.map((schedule) => {
          if (
            schedule.cluster_id === action.payload.cluster_id &&
            schedule.schedule_type === action.payload.schedule_type
          ) {
            return action.payload;
          }
          return schedule;
        });
        break;
      }
    }
  });
}

UpgradesRecuder.initialState = initialState;

export { initialState, UpgradesRecuder };

export default UpgradesRecuder;
