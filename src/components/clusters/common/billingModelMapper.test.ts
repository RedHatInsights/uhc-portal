import {
  RelatedResourceBilling_model as RelatedResourceBillingModel,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
} from '~/types/accounts_mgmt.v1';

import {
  ClusterBillingModel,
  clusterBillingModelToRelatedResource,
  isGcpMarketplaceBilling,
} from './billingModelMapper';

describe('billingModelMapper', () => {
  describe('clusterBillingModelToRelatedResource', () => {
    it.each([
      [undefined, undefined],
      [
        SubscriptionCommonFieldsClusterBillingModel.marketplace,
        RelatedResourceBillingModel.marketplace,
      ],
      [
        SubscriptionCommonFieldsClusterBillingModel.marketplace_aws,
        RelatedResourceBillingModel.marketplace,
      ],
      [
        SubscriptionCommonFieldsClusterBillingModel.marketplace_azure,
        RelatedResourceBillingModel.marketplace,
      ],
      [
        SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp,
        RelatedResourceBillingModel.marketplace,
      ],
      [SubscriptionCommonFieldsClusterBillingModel.standard, RelatedResourceBillingModel.standard],
      ['any', undefined],
      ['whatever', undefined],
    ] as const)('when -%p- then %p', (clusterBillingModel, expected) =>
      expect(
        clusterBillingModelToRelatedResource(
          clusterBillingModel as ClusterBillingModel | undefined,
        ),
      ).toBe(expected),
    );
  });
  describe('isGcpMarketplaceBilling', () => {
    it.each([
      [SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp, true],
      [SubscriptionCommonFieldsClusterBillingModel.marketplace_aws, false],
      [SubscriptionCommonFieldsClusterBillingModel.standard, false],
      [undefined, false],
    ])('when billing model is %p returns %p', (billingModel, expected) => {
      expect(isGcpMarketplaceBilling(billingModel)).toBe(expected);
    });
  });
});
