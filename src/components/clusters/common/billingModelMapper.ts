import { ANY } from '~/common/matchUtils';
import {
  RelatedResourceBilling_model as RelatedResourceBillingModel,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
} from '~/types/accounts_mgmt.v1';
import { BillingModel } from '~/types/clusters_mgmt.v1/enums';

export const clusterBillingModelToRelatedResource = (
  clusterBillingModel?: SubscriptionCommonFieldsClusterBillingModel | BillingModel | string,
): RelatedResourceBillingModel | undefined => {
  switch (true) {
    case clusterBillingModel?.toLowerCase().startsWith('marketplace'):
      return RelatedResourceBillingModel.marketplace;
    case clusterBillingModel === SubscriptionCommonFieldsClusterBillingModel.standard:
      return RelatedResourceBillingModel.standard;
    case clusterBillingModel === ANY:
      return RelatedResourceBillingModel.any;
    default:
      return undefined;
  }
};

export const isGcpMarketplaceBilling = (
  billingModel?: SubscriptionCommonFieldsClusterBillingModel | BillingModel | string | undefined,
): boolean => billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp;
