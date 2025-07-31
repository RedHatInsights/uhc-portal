import React from 'react';

import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';

import { UpgradePolicy, VersionGate } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import {
  getEnableMinorVersionUpgrades,
  isNextMinorVersionAvailableHelper,
} from '../MinorVersionUpgradeAlert/MinorVersionUpgradeAlertHelpers';

interface MinorVersionUpgradeConfirmProps {
  schedules: UpgradePolicy[];
  cluster: AugmentedCluster;
  unmetAcknowledgements?: VersionGate[];
}

const MinorVersionUpgradeConfirm = ({
  schedules,
  cluster,
  unmetAcknowledgements,
}: MinorVersionUpgradeConfirmProps) => {
  const isAutomatic = schedules?.some((policy) => policy.schedule_type === 'automatic');
  const isMinorVersionUpgradesEnabled = getEnableMinorVersionUpgrades(schedules);
  const isNextMinorVersionAvailable = isNextMinorVersionAvailableHelper(cluster);
  const hasVersionGates = (unmetAcknowledgements?.length || 0) > 0;
  if (
    isAutomatic ||
    !isNextMinorVersionAvailable ||
    !isMinorVersionUpgradesEnabled ||
    hasVersionGates
  ) {
    return null;
  }
  return (
    <div className="ocm-upgrade-additional-versions-available">
      <InfoCircleIcon />
      Next minor version update allowed.
    </div>
  );
};

export default MinorVersionUpgradeConfirm;
