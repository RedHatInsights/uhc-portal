import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { hasOrgLevelAutoscaleCapability } from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/machinePoolsSelectors';
import { useGlobalState } from '~/redux/hooks';
import {
  Capability,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
} from '~/types/accounts_mgmt.v1';
import { Product } from '~/types/clusters_mgmt.v1';

const useCanClusterAutoscale = (
  product: Product['id'],
  billingModel: string | undefined /* TO-DO: should use type from openAPI once it's updated */,
  clusterLevelCapabilities?: Array<Capability>,
) => {
  const hasClusterLevelAutoscaleCapability = !!clusterLevelCapabilities?.find(
    (capability) => capability.name === subscriptionCapabilities.AUTOSCALE_CLUSTERS,
  );

  const hasAutoScaleCapability = useGlobalState(
    (state) =>
      hasOrgLevelAutoscaleCapability(state.userProfile.organization.details) ||
      hasClusterLevelAutoscaleCapability,
  );

  return (
    product === normalizedProducts.ROSA ||
    (product === normalizedProducts.OSD &&
      (billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace ||
        billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace_aws ||
        billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp ||
        hasAutoScaleCapability))
  );
};

export default useCanClusterAutoscale;
