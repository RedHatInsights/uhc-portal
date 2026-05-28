import {
  RelatedResourceBilling_model as RelatedResourceBillingModel,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
} from '~/types/accounts_mgmt.v1';
import { BillingModel } from '~/types/clusters_mgmt.v1/enums';

import {
  clusterBillingModelToRelatedResource,
  isGcpMarketplaceBilling,
} from './billingModelMapper';

describe('billingModelMapper', () => {
  describe('clusterBillingModelToRelatedResource', () => {
    it.each([
      [undefined, undefined],
      ['', undefined],
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
      ['any', RelatedResourceBillingModel.any],
      ['whatever', undefined],
    ])(
      'when -%p- then %p',
      (
        clusterBillingModel: BillingModel | string | undefined,
        expected: RelatedResourceBillingModel | string | undefined,
      ) => expect(clusterBillingModelToRelatedResource(clusterBillingModel)).toBe(expected),
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
