import { hasAllowOcp5Capability } from '~/common/subscriptionCapabilities';
import {
  isAWS,
  isGCP,
  isHypershiftCluster,
  isOSD,
  isROSA,
  isWIFCluster,
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

const isOcp5MigrationWarningEnabledForOrg = ({
  isOcp5SupportEnabled,
  organizationCapabilities,
}: Ocp5MigrationWarningOrgParams): boolean =>
  isOcp5SupportEnabled && !hasAllowOcp5Capability(organizationCapabilities);

const shouldShowUpgradeToV5Warning = ({
  cluster,
  isOcp5SupportEnabled,
  organizationCapabilities,
}: ShowUpgradeToV5WarningParams): boolean => {
  if (
    !cluster ||
    !isOcp5MigrationWarningEnabledForOrg({ isOcp5SupportEnabled, organizationCapabilities })
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

const shouldShowGcpOcp5UnsupportedUpgradeWarning = ({
  cluster,
  isOcp5SupportEnabled,
  organizationCapabilities,
}: ShowUpgradeToV5WarningParams): boolean => {
  if (
    !cluster ||
    !isOcp5MigrationWarningEnabledForOrg({ isOcp5SupportEnabled, organizationCapabilities })
  ) {
    return false;
  }

  if (!isOSD(cluster) || !isGCP(cluster) || isHypershiftCluster(cluster)) {
    return false;
  }

  return !isWIFCluster(cluster);
};

export {
  isOcp5MigrationWarningEnabledForOrg,
  shouldShowGcpOcp5UnsupportedUpgradeWarning,
  shouldShowUpgradeToV5Warning,
};
