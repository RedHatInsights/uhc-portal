import {
  RelatedResourceBilling_model as RelatedResourceBillingModel,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
} from '~/types/accounts_mgmt.v1';
import type { BillingModel } from '~/types/clusters_mgmt.v1';

export type ClusterBillingModel = SubscriptionCommonFieldsClusterBillingModel | BillingModel;

export const clusterBillingModelToRelatedResource = (
  clusterBillingModel?: ClusterBillingModel,
): RelatedResourceBillingModel | undefined => {
  switch (true) {
    case clusterBillingModel?.toLowerCase().startsWith('marketplace'):
      return RelatedResourceBillingModel.marketplace;
    case clusterBillingModel === SubscriptionCommonFieldsClusterBillingModel.standard:
      return RelatedResourceBillingModel.standard;
    default:
      return undefined;
  }
};

export const isGcpMarketplaceBilling = (billingModel?: ClusterBillingModel): boolean =>
  billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp;
