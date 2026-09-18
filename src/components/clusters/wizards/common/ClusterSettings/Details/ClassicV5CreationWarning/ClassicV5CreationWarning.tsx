import React from 'react';

import { UpgradeToV5Warning } from '~/components/clusters/common/Upgrades/UpgradeToV5Warning/UpgradeToV5Warning';
import { isOcp5MigrationWarningEnabledForOrg } from '~/components/clusters/common/Upgrades/UpgradeToV5Warning/UpgradeToV5WarningHelpers';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks/useGlobalState';

export const ClassicV5CreationWarning = () => {
  const isOcp5SupportEnabled = useFeatureGate(OCP5_SUPPORT);
  const organization = useGlobalState((state) => state.userProfile.organization.details);

  if (
    !isOcp5MigrationWarningEnabledForOrg({
      isOcp5SupportEnabled,
      organizationCapabilities: organization?.capabilities,
    })
  ) {
    return null;
  }

  return <UpgradeToV5Warning data-testid="classic-v5-creation-warning" />;
};
