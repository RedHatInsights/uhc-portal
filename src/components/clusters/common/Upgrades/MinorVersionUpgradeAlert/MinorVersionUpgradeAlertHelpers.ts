import { splitVersion } from '~/common/versionHelpers';
import { UpgradePolicy } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import { getFromVersionFromHelper } from '../UpgradeAcknowledge/UpgradeAcknowledgeHelpers';

export const isNextMinorVersionAvailableHelper = (cluster: AugmentedCluster): boolean => {
  const fromVersion = getFromVersionFromHelper(cluster);
  if (!fromVersion) return false;

  const [fromMajor, fromMinor] = splitVersion(fromVersion);

  const availableUpgrades = cluster?.version?.available_upgrades || [];

  return availableUpgrades.some((version) => {
    const [major, minor] = splitVersion(version);
    return major === fromMajor && minor > fromMinor;
  });
};

export const getEnableMinorVersionUpgrades = (schedules: UpgradePolicy[]): boolean => {
  const automatic = schedules?.find((item) => item.schedule_type === 'automatic');
  if (!automatic) return true;
  return automatic.enable_minor_version_upgrades ?? false;
};
