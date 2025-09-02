import { normalizedProducts } from '~/common/subscriptionTypes';
import { ClusterFromSubscription } from '~/types/types';

enum SupportedFeature {
  SECURITY_GROUPS = 'securityGroups',
  AWS_SHARED_VPC = 'sharedVPC',
  AUTO_CLUSTER_TRANSFER_OWNERSHIP = 'autoClusterTransferOwnership',
}
type ClusterParams = Partial<ClusterFromSubscription>;

const checkAWSSecurityGroupsCompatibility = (clusterParams: ClusterParams) => {
  const cloudProvider = clusterParams?.cloud_provider?.id;
  if (cloudProvider !== 'aws') {
    return false;
  }

  // Narrowing it down to AWS BYO-VPC clusters
  const byoVPCSubnets = clusterParams?.aws?.subnet_ids || [];
  if (!byoVPCSubnets?.length) {
    return false;
  }
  return true;
};

const checkAutoClusterTransferOwnershipCompatibility = (clusterParams: ClusterParams) => {
  if (clusterParams?.hypershift?.enabled) return false; // Hypershift clusters are not supported for now

  // Milesstone 1: only ROSA clusters are supported

  // Milesstone 2: add ARO and OCP cluster support
  // normalizedProducts.OCP
  // normalizedProducts.ARO

  // Milesstone 3: add OSD (only gcp can xfer across orgs, otherwise transfer within same org) and RHOIC cluster support
  // normalizedProducts.OSD
  // normalizedProducts.RHOIC

  const allowedProducts = [normalizedProducts.ROSA]; // Milestone 1: only ROSA clusters are supported

  if (clusterParams?.product?.id && allowedProducts.includes(clusterParams?.product?.id)) {
    return true;
  }

  return false;
};
/**
 * Checks is a given feature is compatible with the provided options
 * @param feature feature to validate for compatibility
 * @param clusterParams cluster features necessary to determine compatibility
 * @param options when not provided an option, it's assumed it doesn't affect the compatibility status
 */
const isCompatibleFeature = (feature: SupportedFeature, clusterParams: ClusterParams) => {
  switch (feature) {
    case SupportedFeature.SECURITY_GROUPS:
      return checkAWSSecurityGroupsCompatibility(clusterParams);
    case SupportedFeature.AUTO_CLUSTER_TRANSFER_OWNERSHIP:
      return checkAutoClusterTransferOwnershipCompatibility(clusterParams);
    default:
      return false;
  }
};

export { isCompatibleFeature, SupportedFeature };
