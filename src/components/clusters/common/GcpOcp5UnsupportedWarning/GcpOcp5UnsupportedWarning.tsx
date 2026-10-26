import React from 'react';

import { Alert } from '@patternfly/react-core';

import { isOcp5MigrationWarningEnabledForOrg } from '~/components/clusters/common/Upgrades/UpgradeToV5Warning/UpgradeToV5WarningHelpers';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks/useGlobalState';

import {
  GCP_OCP5_RED_HAT_ACCOUNT_CREATION_WARNING,
  GCP_OCP5_SERVICE_ACCOUNT_CREATION_WARNING,
  GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING,
} from './gcpOcp5UnsupportedWarnings';

const GCP_OCP5_UNSUPPORTED_WARNING = {
  serviceAccountCreation: GCP_OCP5_SERVICE_ACCOUNT_CREATION_WARNING,
  redHatAccountCreation: GCP_OCP5_RED_HAT_ACCOUNT_CREATION_WARNING,
  upgrade: GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING,
};

type GcpOcp5UnsupportedWarningVariant = keyof typeof GCP_OCP5_UNSUPPORTED_WARNING;

const useIsOcp5MigrationWarningEnabled = (): boolean => {
  const isOcp5SupportEnabled = useFeatureGate(OCP5_SUPPORT);
  const organization = useGlobalState((state) => state.userProfile.organization.details);

  return isOcp5MigrationWarningEnabledForOrg({
    isOcp5SupportEnabled,
    organizationCapabilities: organization?.capabilities,
  });
};

const GcpOcp5UnsupportedWarning = ({ variant }: { variant: GcpOcp5UnsupportedWarningVariant }) => (
  <Alert variant="warning" isInline title={GCP_OCP5_UNSUPPORTED_WARNING[variant]} />
);

export {
  GCP_OCP5_RED_HAT_ACCOUNT_CREATION_WARNING,
  GCP_OCP5_SERVICE_ACCOUNT_CREATION_WARNING,
  GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING,
  GcpOcp5UnsupportedWarning,
  useIsOcp5MigrationWarningEnabled,
};
