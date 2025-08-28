import { AxiosResponse } from 'axios';
import { Dispatch } from 'redux';
import { action } from 'typesafe-actions';

import { UpgradePolicy, UpgradePolicyState } from '~/types/clusters_mgmt.v1';

import clusterService, { getClusterServiceForRegion } from '../../../../services/clusterService';

const POST_UPGRADE_SCHEDULE = 'POST_UPGRADE_SCHEDULE';
const GET_UPGRADE_SCHEDULES = 'GET_UPGRADE_SCHEDULES';
const SET_CLUSTER_UPGRADE_POLICY = 'SET_CLUSTER_UPGRADE_POLICY';

const { getUpgradeScheduleState, getControlPlaneUpgradeSchedules, getUpgradeSchedules } =
  clusterService;

const getSchedules = (clusterID: string, isHypershift: boolean) =>
  action(
    GET_UPGRADE_SCHEDULES,
    isHypershift
      ? getControlPlaneUpgradeSchedules(clusterID)
      : getUpgradeSchedules(clusterID).then((schedulesResponse) => {
          const items = schedulesResponse.data.items || [];
          const promises: Promise<void | AxiosResponse<UpgradePolicyState>>[] = [];
          items.forEach((schedule) => {
            if (schedule.cluster_id && schedule.id) {
              promises.push(
                getUpgradeScheduleState(schedule.cluster_id, schedule.id).then((stateResponse) => {
                  // TODO: schedule.state does not exist on UpgradePolicy
                  // eslint-disable-next-line no-param-reassign
                  (schedule as any).state = stateResponse.data;
                }),
              );
            }
          });
          return Promise.all(promises).then(() => {
            // eslint-disable-next-line no-param-reassign
            schedulesResponse.data.items = items;
            return schedulesResponse;
          });
        }),
  );

const postSchedule =
  (clusterID: string, schedule: UpgradePolicy, isHypershift: boolean, regionalId?: string) =>
  (dispatch: Dispatch) => {
    const clusterServiceFunc = regionalId ? getClusterServiceForRegion(regionalId) : clusterService;
    const requestPost = isHypershift
      ? clusterServiceFunc.postControlPlaneUpgradeSchedule
      : clusterServiceFunc.postUpgradeSchedule;

    dispatch({
      type: POST_UPGRADE_SCHEDULE,
      payload: requestPost(clusterID, schedule).then((response) => {
        dispatch(getSchedules(clusterID, isHypershift)); // refresh schedules after posting
        return response;
      }),
    });
  };

const setAutomaticUpgradePolicy = (upgradePolicy: UpgradePolicy) => ({
  type: SET_CLUSTER_UPGRADE_POLICY,
  payload: upgradePolicy,
});

export {
  POST_UPGRADE_SCHEDULE,
  GET_UPGRADE_SCHEDULES,
  SET_CLUSTER_UPGRADE_POLICY,
  postSchedule,
  getSchedules,
  setAutomaticUpgradePolicy,
};
