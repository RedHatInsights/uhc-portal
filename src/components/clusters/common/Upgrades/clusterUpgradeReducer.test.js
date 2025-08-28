// const UpgradesRecuder = require('./UpgradesRecuder');
import { waitFor } from '@testing-library/react';

import { FULFILLED_ACTION, PENDING_ACTION, REJECTED_ACTION } from '../../../../redux/reduxHelpers';

import {
  GET_UPGRADE_SCHEDULES,
  POST_UPGRADE_SCHEDULE,
  setAutomaticUpgradePolicy,
} from './clusterUpgradeActions';
import { initialState, UpgradesRecuder } from './clusterUpgradeReducer';

// Mock action objects
const pendingPostUpgradeScheduleAction = {
  type: PENDING_ACTION(POST_UPGRADE_SCHEDULE),
};

const fulfilledPostUpgradeScheduleAction = {
  type: FULFILLED_ACTION(POST_UPGRADE_SCHEDULE),
  payload: {},
};

const rejectedPostUpgradeScheduleAction = {
  type: REJECTED_ACTION(POST_UPGRADE_SCHEDULE),
  payload: new Error('Test error'),
};

const pendingGetUpgradeSchedulesAction = {
  type: PENDING_ACTION(GET_UPGRADE_SCHEDULES),
};

const fulfilledGetUpgradeSchedulesAction = {
  type: FULFILLED_ACTION(GET_UPGRADE_SCHEDULES),
  payload: {
    data: {
      items: [{ next_run: '2022-03-01' }, { next_run: '2022-04-01' }],
    },
  },
};

const rejectedGetUpgradeSchedulesAction = {
  type: REJECTED_ACTION(GET_UPGRADE_SCHEDULES),
  error: new Error('Test error'),
};

describe('UpgradesRecuder', () => {
  test('handles PENDING_ACTION(POST_UPGRADE_SCHEDULE)', () => {
    const state = UpgradesRecuder(initialState, pendingPostUpgradeScheduleAction);
    expect(state.postedUpgradeSchedule.pending).toBe(true);
  });

  test('handles FULFILLED_ACTION(POST_UPGRADE_SCHEDULE)', async () => {
    const state = UpgradesRecuder(initialState, fulfilledPostUpgradeScheduleAction);

    await waitFor(() => expect(state.postedUpgradeSchedule.fulfilled).toBe(true));
  });

  test('handles REJECTED_ACTION(POST_UPGRADE_SCHEDULE)', () => {
    const state = UpgradesRecuder(initialState, rejectedPostUpgradeScheduleAction);
    expect(state.postedUpgradeSchedule.error).toBeTruthy();
  });

  test('handles PENDING_ACTION(GET_UPGRADE_SCHEDULES)', () => {
    const state = UpgradesRecuder(initialState, pendingGetUpgradeSchedulesAction);
    expect(state.schedules.pending).toBe(true);
  });

  test('handles FULFILLED_ACTION(GET_UPGRADE_SCHEDULES)', () => {
    const state = UpgradesRecuder(initialState, fulfilledGetUpgradeSchedulesAction);
    expect(state.schedules.fulfilled).toBe(true);
    expect(state.schedules.items).toEqual([{ next_run: '2022-03-01' }, { next_run: '2022-04-01' }]);
  });

  test('handles REJECTED_ACTION(GET_UPGRADE_SCHEDULES)', () => {
    const state = UpgradesRecuder(initialState, rejectedGetUpgradeSchedulesAction);
    expect(state.schedules.error).toBeTruthy();
  });

  test('handles SET_CLUSTER_UPGRADE_POLICY', () => {
    const state = UpgradesRecuder(
      {
        ...initialState,
        schedules: {
          items: [
            { cluster_id: 'myOtherCluster', schedule_type: 'other' },
            { cluster_id: 'myCluster', schedule_type: 'other' },
            { cluster_id: 'myCluster', schedule_type: 'myScheduleType' },
          ],
        },
      },
      setAutomaticUpgradePolicy({
        cluster_id: 'myCluster',
        schedule_type: 'myScheduleType',
        extra: 'policy_data',
      }),
    );
    expect(state.schedules.items).toEqual([
      { cluster_id: 'myOtherCluster', schedule_type: 'other' },
      { cluster_id: 'myCluster', schedule_type: 'other' },
      {
        cluster_id: 'myCluster',
        schedule_type: 'myScheduleType',
        extra: 'policy_data',
      },
    ]);
  });
});
