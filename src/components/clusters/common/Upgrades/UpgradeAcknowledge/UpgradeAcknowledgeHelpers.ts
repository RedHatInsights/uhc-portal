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

type UpgradeVersionParts = {
  toMajor: number;
  toMinor: number;
  fromMajor: number;
  fromMinor: number;
};

const getUpgradeVersionParts = (cluster: AugmentedCluster): UpgradeVersionParts | null => {
  const toVersion = getToVersionFromHelper([], cluster);
  const fromVersion = getFromVersionFromHelper(cluster);
  const [toMajor, toMinor] = splitVersion(toVersion || '');
  const [fromMajor, fromMinor] = splitVersion(fromVersion || '');

  if (
    !Number.isFinite(toMajor) ||
    !Number.isFinite(toMinor) ||
    !Number.isFinite(fromMajor) ||
    !Number.isFinite(fromMinor)
  ) {
    return null;
  }

  return { toMajor, toMinor, fromMajor, fromMinor };
};

export const isManualUpdateSchedulingRequired = (
  schedules: UpgradePolicyWithState[],
  cluster: AugmentedCluster,
): boolean => {
  const versionParts = getUpgradeVersionParts(cluster);
  if (!versionParts) {
    return false;
  }

  const { toMajor, toMinor, fromMajor, fromMinor } = versionParts;
  const isMajorUpgrade = toMajor > fromMajor;
  const isMinorUpgrade = toMajor === fromMajor && toMinor > fromMinor;

  // is the ControlPlaneUpgradePolicy schedule type automatic and is enable_minor_version_upgrades true?
  const automaticUpdatePolicyExists = !!schedules?.find(
    (policy) => policy?.schedule_type === 'automatic',
  );
  const enableMinorVersionUpgrade = !!schedules?.find(
    (policy) => policy?.enable_minor_version_upgrades === true,
  );

  return (
    automaticUpdatePolicyExists &&
    (isMajorUpgrade || (isMinorUpgrade && !enableMinorVersionUpgrade))
  );
};

export const isMajorVersionUpgrade = (cluster: AugmentedCluster): boolean => {
  const versionParts = getUpgradeVersionParts(cluster);
  if (!versionParts) {
    return false;
  }

  return versionParts.toMajor > versionParts.fromMajor;
};
