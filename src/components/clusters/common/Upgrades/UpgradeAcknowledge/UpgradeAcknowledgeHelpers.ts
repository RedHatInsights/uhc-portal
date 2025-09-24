import { splitVersion } from '~/common/versionHelpers';
import { UpgradePolicy } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster, UpgradePolicyWithState } from '~/types/types';

export const getFromVersionFromHelper = (cluster: AugmentedCluster): string | null =>
  cluster.version?.raw_id || null;

export const getToVersionFromHelper = (
  schedules: UpgradePolicy[],
  cluster: AugmentedCluster,
): string | null => {
  const scheduledUpdate = schedules?.find(
    (schedule) => schedule.version && schedule.version !== getFromVersionFromHelper(cluster),
  );
  if (!scheduledUpdate) {
    if (
      !cluster?.version?.available_upgrades ||
      cluster?.version?.available_upgrades.length === 0
    ) {
      return null;
    }
    const versionArray = cluster.version.available_upgrades;
    return versionArray[versionArray.length - 1];
  }
  return scheduledUpdate.version || null;
};

export const getHasScheduledManual = (
  schedules: UpgradePolicy[],
  cluster: AugmentedCluster,
): boolean =>
  !schedules?.some((policy) => policy.schedule_type === 'automatic') &&
  !!schedules?.some((schedule) => schedule.version !== getFromVersionFromHelper(cluster));

export const isManualUpdateSchedulingRequired = (
  schedules: UpgradePolicyWithState[],
  cluster: AugmentedCluster,
): boolean => {
  // is this a minor or greater version upgrade?
  const toVersion = getToVersionFromHelper([], cluster);
  const fromVersion = getFromVersionFromHelper(cluster);
  const [toMajor, toMinor] = splitVersion(toVersion || '');
  const [fromMajor, fromMinor] = splitVersion(fromVersion || '');
  if (!toMajor || !toMinor || !fromMajor || !fromMinor) {
    return false;
  }
  const minorPlusUpgrade = toMajor > fromMajor || toMinor > fromMinor;

  // is the ControlPlaneUpgradePolicy schedule type automatic and is enable_minor_version_upgrades true?
  const automaticUpdatePolicyExists = !!schedules?.find(
    (policy) => policy?.schedule_type === 'automatic',
  );
  const enableMinorVersionUpgrade = !!schedules?.find(
    (policy) => policy?.enable_minor_version_upgrades === true,
  );

  // is the ControlPlaneUpgradePolicy pending?
  // const upgradePolicyPending = !!schedules?.find((policy) => policy?.state?.value === 'pending');

  return minorPlusUpgrade && automaticUpdatePolicyExists && !enableMinorVersionUpgrade;
};
