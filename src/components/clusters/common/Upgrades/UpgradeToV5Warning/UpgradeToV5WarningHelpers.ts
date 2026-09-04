import { hasAllowOcp5Capability } from '~/common/subscriptionCapabilities';
import { splitVersion } from '~/common/versionHelpers';
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
  if (!isOcp5SupportEnabled || !cluster) {
    return false;
  }

  if (!isROSA(cluster) && !isOSD(cluster)) {
    return false;
  }

  if (isHypershiftCluster(cluster)) {
    const rawId = cluster.version?.raw_id;
    return isROSA(cluster) && !!rawId && splitVersion(rawId)[0] === 4;
  }

  if (hasAllowOcp5Capability(organizationCapabilities)) {
    return false;
  }

  return true;
};

export { shouldShowUpgradeToV5Warning };
