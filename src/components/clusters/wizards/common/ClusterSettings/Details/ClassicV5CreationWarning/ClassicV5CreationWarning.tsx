import React from 'react';

import { hasAllowOcp5Capability } from '~/common/subscriptionCapabilities';
import { UpgradeToV5Warning } from '~/components/clusters/common/Upgrades/UpgradeToV5Warning/UpgradeToV5Warning';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks/useGlobalState';

export const ClassicV5CreationWarning = () => {
  const isOcp5SupportEnabled = useFeatureGate(OCP5_SUPPORT);
  const organization = useGlobalState((state) => state.userProfile.organization.details);
  const hasOcp5Capability = hasAllowOcp5Capability(organization?.capabilities);

  if (!isOcp5SupportEnabled || hasOcp5Capability) {
    return null;
  }

  return <UpgradeToV5Warning data-testid="classic-v5-creation-warning" />;
};
