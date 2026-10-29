import {
  hasAllowOcp5InstallCapability,
  hasAllowOcp5UpgradeCapability,
} from '~/common/subscriptionCapabilities';
import {
  isAWS,
  isHypershiftCluster,
  isOSD,
  isROSA,
} from '~/components/clusters/common/clusterStates';
import { Capability } from '~/types/accounts_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

interface Ocp5MigrationWarningOrgParams {
  isOcp5SupportEnabled: boolean;
  organizationCapabilities: Capability[] | undefined;
}

interface ShowUpgradeToV5WarningParams extends Ocp5MigrationWarningOrgParams {
  cluster: AugmentedCluster | undefined;
}

const isOcp5InstallWarningEnabledForOrg = ({
  isOcp5SupportEnabled,
  organizationCapabilities,
}: Ocp5MigrationWarningOrgParams): boolean =>
  isOcp5SupportEnabled && !hasAllowOcp5InstallCapability(organizationCapabilities);

const isOcp5UpgradeWarningEnabledForOrg = ({
  isOcp5SupportEnabled,
  organizationCapabilities,
}: Ocp5MigrationWarningOrgParams): boolean =>
  isOcp5SupportEnabled && !hasAllowOcp5UpgradeCapability(organizationCapabilities);

const shouldShowUpgradeToV5Warning = ({
  cluster,
  isOcp5SupportEnabled,
  organizationCapabilities,
}: ShowUpgradeToV5WarningParams): boolean => {
  if (
    !cluster ||
    !isOcp5UpgradeWarningEnabledForOrg({ isOcp5SupportEnabled, organizationCapabilities })
  ) {
    return false;
  }

  if (isHypershiftCluster(cluster)) {
    return false;
  }

  if (isROSA(cluster)) {
    return true;
  }

  return isOSD(cluster) && isAWS(cluster);
};

export {
  isOcp5InstallWarningEnabledForOrg,
  isOcp5UpgradeWarningEnabledForOrg,
  shouldShowUpgradeToV5Warning,
};
