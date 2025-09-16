/* eslint-disable camelcase */
import { GlobalState } from '~/redux/stateTypes';
import { AugmentedCluster, UpgradePolicyWithState } from '~/types/types';

export const hasAvailableUpdates = (cluster: AugmentedCluster) => {
  const availableUpdates = cluster?.version?.available_upgrades;
  return availableUpdates && availableUpdates.length > 0;
};

export const hasAvailableUpdatesSelector = (state: GlobalState) =>
  hasAvailableUpdates(state.clusters.details.cluster);

export const updateStartedSelector = (state: GlobalState) => {
  const { schedules } = state.clusterUpgrades;
  const scheduledUpdate = schedules.items.find(
    (schedule: UpgradePolicyWithState) =>
      schedule.upgrade_type === 'OSD' &&
      (schedule.schedule_type === 'manual' || schedule.schedule_type === 'automatic'),
  );

  // @ts-ignore - still reports scheduledUpdate as never
  const upgradeState = scheduledUpdate && scheduledUpdate?.state?.value;

  return upgradeState && (upgradeState === 'started' || upgradeState === 'delayed');
};
type Schedules = {
  items: UpgradePolicyWithState[];
  fulfilled: boolean;
  error: boolean;
  pending: boolean;
};
// Needed since it no longer passes entire state object dues to removal of index file
export const updateStartedSelectorMultiRegion = (clusterUpgradesSchedules: Schedules) => {
  const scheduledUpdate = clusterUpgradesSchedules.items.find(
    (schedule: UpgradePolicyWithState) =>
      schedule.upgrade_type === 'OSD' &&
      (schedule.schedule_type === 'manual' || schedule.schedule_type === 'automatic'),
  );

  // @ts-ignore - still reports scheduledUpdate as never
  const upgradeState = scheduledUpdate && scheduledUpdate?.state?.value;

  return upgradeState && (upgradeState === 'started' || upgradeState === 'delayed');
};
