import { useSelector } from 'react-redux';
import semver from 'semver';

import { updateStartedSelectorMultiRegion } from '~/components/clusters/common/Upgrades/upgradeHelpers';
import { GlobalState } from '~/redux/stateTypes';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import { NodePool } from '~/types/clusters_mgmt.v1';
import { ScheduleType, UpgradeType } from '~/types/clusters_mgmt.v1/enums';
import { UpgradePolicyWithState } from '~/types/types';

import { NodePoolWithUpgradePolicies } from '../machinePoolCustomTypes';

export const controlPlaneIdSelector = (state: GlobalState) =>
  state.clusters.details.cluster.id || '';

export const controlPlaneVersionSelector = (state: GlobalState) =>
  state.clusters.details.cluster?.version?.id || '';

export const displayControlPlaneVersion = (controlPlaneVersion: string | undefined) =>
  semver.coerce(controlPlaneVersion)?.version;

type Schedules = {
  items: UpgradePolicyWithState[];
  fulfilled: boolean;
  error: boolean;
  pending: boolean;
};
// Needed due to removal of index file and entire state is no longer being passed
export const isHCPControlPlaneUpdatingMultiRegion = (
  clusterUpgradesSchedules: Schedules,
  controlPlaneVersion: string,
  isMachinePoolError: boolean,
  isHypershift: boolean,
) => {
  const controlPlaneUpgradeStarted = updateStartedSelectorMultiRegion(clusterUpgradesSchedules);
  return !isHypershift || !controlPlaneVersion || controlPlaneUpgradeStarted || isMachinePoolError;
};

export const useHCPControlPlaneUpdating = (
  controlPlaneVersion: string,
  isMachinePoolError: boolean,
  isHypershift: boolean,
) =>
  useSelector((state: GlobalState) =>
    isHCPControlPlaneUpdatingMultiRegion(
      state.clusterUpgrades.schedules,
      controlPlaneVersion,
      isMachinePoolError,
      isHypershift,
    ),
  );

export const compareIsMachinePoolBehindControlPlane = (
  controlPlaneRawVersion?: string,
  machinePoolRawVersion?: string,
) => {
  if (!controlPlaneRawVersion || !machinePoolRawVersion) {
    return false;
  }

  return semver.gt(
    semver.coerce(controlPlaneRawVersion, { includePrerelease: true })?.version || '',
    semver.coerce(machinePoolRawVersion, { includePrerelease: true })?.version || '',
  );
};

export const isMachinePoolBehindControlPlane = (
  state: GlobalState,
  machinePool: NodePoolWithUpgradePolicies,
) => {
  if (!machinePool || !machinePool.version?.raw_id) {
    return false;
  }
  const controlPlaneVersion = controlPlaneVersionSelector(state);

  return compareIsMachinePoolBehindControlPlane(controlPlaneVersion, machinePool.version.raw_id);
};
export const isMachinePoolBehindControlPlaneMulti = (
  controlPlaneRawVersion: string,
  machinePool: NodePoolWithUpgradePolicies,
) => {
  if (!machinePool || !machinePool.version?.raw_id) {
    return false;
  }

  return compareIsMachinePoolBehindControlPlane(controlPlaneRawVersion, machinePool.version.raw_id);
};

export const useMachinePoolBehindControlPlane = (machinePool: NodePoolWithUpgradePolicies) =>
  useSelector((state: GlobalState) => isMachinePoolBehindControlPlane(state, machinePool));

export const updateAllMachinePools = async (
  machinePools: NodePool[],
  clusterId: string,
  toBeRawVersion: string,
  region?: string,
) => {
  // NOTE this results of this helper does NOT put the information into Redux
  // because it isn't needed - we just need to know if the update policy was created

  const errors: string[] = [];

  // In theory, this should never be called because we check for a version before calling this method
  if (!toBeRawVersion || toBeRawVersion === '') {
    return ['Machine pools could not be updated because control plane version is unknown'];
  }

  const promisesArray = machinePools.map((pool: NodePool) => {
    const MINUTES_IN_MS = 1000 * 60;

    const schedule = {
      schedule_type: ScheduleType.manual,
      next_run: new Date(new Date().getTime() + 6 * MINUTES_IN_MS).toISOString(),
      version: semver.coerce(toBeRawVersion, { includePrerelease: true })?.version,
      node_pool_id: pool.id,
      upgrade_type: UpgradeType.NodePool,
    };

    if (region) {
      const clusterService = getClusterServiceForRegion(region);
      return clusterService.postNodePoolUpgradeSchedule(clusterId, pool.id || '', schedule);
    }
    return clusterService.postNodePoolUpgradeSchedule(clusterId, pool.id || '', schedule);
  });

  const results = await Promise.allSettled(promisesArray);

  results.forEach((result) => {
    if (result.status === 'rejected') {
      errors.push(`${result.reason.response.data.code} - ${result.reason.response.data.reason}`);
    }
  });
  return errors;
};

export const isControlPlaneValidForMachinePool = (
  machinePool: NodePool,
  controlPlaneRawVersion: string,
) => {
  const availableVersions = machinePool?.version?.available_upgrades;
  if (!controlPlaneRawVersion || !availableVersions) {
    return true; // we are returning true so the API can verify
  }

  return availableVersions.some((version: string) => controlPlaneRawVersion === version);
};

export const useIsControlPlaneValidForMachinePool = (
  machinePool: NodePool,
  controlPlaneRawVersion: string,
): boolean => isControlPlaneValidForMachinePool(machinePool, controlPlaneRawVersion || '');

export const isMachinePoolUpgrading = (machinePool: NodePoolWithUpgradePolicies) =>
  !!machinePool.upgradePolicies?.items?.length;

export const isMachinePoolScheduleError = (machinePool: NodePoolWithUpgradePolicies) =>
  !!machinePool.upgradePolicies?.errorMessage;

export const canMachinePoolBeUpgradedSelector = (
  clusterUpgradesSchedules: Schedules,
  controlPlaneVersion: string,
  machinePool: NodePoolWithUpgradePolicies,
  isMachinePoolError: boolean,
  isHypershift: boolean,
  controlPlaneRawVersion?: string,
) =>
  !isHCPControlPlaneUpdatingMultiRegion(
    clusterUpgradesSchedules,
    controlPlaneVersion,
    isMachinePoolError,
    isHypershift,
  ) &&
  isMachinePoolBehindControlPlaneMulti(controlPlaneRawVersion || '', machinePool) &&
  !isMachinePoolScheduleError(machinePool) &&
  isControlPlaneValidForMachinePool(machinePool, controlPlaneRawVersion || '') &&
  !isMachinePoolUpgrading(machinePool);
