import { hasAllowOcp5Capability } from '~/common/subscriptionCapabilities';
import { isHypershiftCluster, isOSD, isROSA } from '~/components/clusters/common/clusterStates';
import { Capability } from '~/types/accounts_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

interface ShowUpgradeToV5WarningParams {
  cluster: AugmentedCluster | undefined;
  isOcp5SupportEnabled: boolean;
  organizationCapabilities: Capability[] | undefined;
}

const shouldShowUpgradeToV5Warning = ({
  cluster,
  isOcp5SupportEnabled,
  organizationCapabilities,
}: ShowUpgradeToV5WarningParams): boolean => {
  if (
    !isOcp5SupportEnabled ||
    isHypershiftCluster(cluster) ||
    hasAllowOcp5Capability(organizationCapabilities)
  ) {
    return false;
  }

  return isROSA(cluster) || (!!cluster && isOSD(cluster));
};

export { shouldShowUpgradeToV5Warning };
