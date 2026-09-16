import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import { BillingQuotas, getDefaultBillingModel, getDefaultByoc } from './utils';

const defaultQuotas: BillingQuotas = {
  osdTrial: true,
  standardOsd: true,
  marketplace: true,
  gcpResources: true,
  awsResources: true,
  rhInfra: true,
  byoc: true,
  marketplaceRhInfra: true,
  marketplaceByoc: true,
};

describe('BillingModel utils', () => {
  describe('getDefaultBillingModel', () => {
    it('returns standard when standard OSD quota is available', () => {
      expect(getDefaultBillingModel(defaultQuotas)).toBe(
        SubscriptionCommonFieldsClusterBillingModel.standard,
      );
    });

    it('returns GCP Marketplace when standard OSD quota is unavailable', () => {
      expect(getDefaultBillingModel({ ...defaultQuotas, standardOsd: false })).toBe(
        SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp,
      );
    });
  });

  describe('getDefaultByoc', () => {
    it('returns true for GCP Marketplace even when marketplace BYOC quota is unavailable and RH infra is available', () => {
      const quotas = {
        ...defaultQuotas,
        marketplaceByoc: false,
        marketplaceRhInfra: true,
      };

      expect(
        getDefaultByoc(quotas, SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp),
      ).toBe('true');
    });

    it('returns true for GCP Marketplace when marketplace BYOC and RH infra quotas are unavailable', () => {
      const quotas = {
        ...defaultQuotas,
        marketplaceByoc: false,
        marketplaceRhInfra: false,
      };

      expect(
        getDefaultByoc(quotas, SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp),
      ).toBe('true');
    });

    it('returns false when BYOC quota is unavailable, RH infra is available and subscription is standard', () => {
      expect(
        getDefaultByoc(
          { ...defaultQuotas, byoc: false },
          SubscriptionCommonFieldsClusterBillingModel.standard,
        ),
      ).toBe('false');
    });

    it('returns true when BYOC quota is available and subscription is standard', () => {
      expect(
        getDefaultByoc(defaultQuotas, SubscriptionCommonFieldsClusterBillingModel.standard),
      ).toBe('true');
    });
  });
});
