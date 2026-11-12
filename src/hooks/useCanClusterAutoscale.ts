import { clusterCapabilities, hasCapabilityValue } from '~/common/capabilities';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { hasOrgLevelAutoscaleCapability } from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/machinePoolsSelectors';
import {
  ClusterBillingModel,
  isGcpMarketplaceBilling,
} from '~/components/clusters/common/billingModelMapper';
import { useGlobalState } from '~/redux/hooks';
import {
  Capability,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
} from '~/types/accounts_mgmt.v1';
import { Product } from '~/types/clusters_mgmt.v1';

const useCanClusterAutoscale = (
  product: Product['id'],
  billingModel: ClusterBillingModel | undefined,
  clusterLevelCapabilities?: Array<Capability>,
) => {
  const hasClusterLevelAutoscaleCapability = hasCapabilityValue(
    clusterLevelCapabilities,
    clusterCapabilities.AUTOSCALE_CLUSTERS,
  );

  const hasAutoScaleCapability = useGlobalState(
    (state) =>
      hasOrgLevelAutoscaleCapability(state.userProfile.organization.details) ||
      hasClusterLevelAutoscaleCapability,
  );

  return (
    product === normalizedProducts.ROSA ||
    (product === normalizedProducts.OSD &&
      (billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace_aws ||
        isGcpMarketplaceBilling(billingModel) ||
        hasAutoScaleCapability))
  );
};

export default useCanClusterAutoscale;
