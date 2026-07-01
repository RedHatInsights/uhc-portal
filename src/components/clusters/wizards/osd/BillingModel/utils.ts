import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import type { useGetBillingQuotas } from './useGetBillingQuotas';

export type BillingQuotas = ReturnType<typeof useGetBillingQuotas>;

export const getDefaultBillingModel = (
  quotas: BillingQuotas,
): SubscriptionCommonFieldsClusterBillingModel => {
  if (!quotas.standardOsd) {
    return SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp;
  }

  return SubscriptionCommonFieldsClusterBillingModel.standard;
};

export const getDefaultByoc = (quotas: BillingQuotas, billingModel: string): 'true' | 'false' => {
  const isMarketplace = billingModel.startsWith(
    SubscriptionCommonFieldsClusterBillingModel.marketplace,
  );
  const isByocQuotaDisabled = isMarketplace ? !quotas.marketplaceByoc : !quotas.byoc;
  const isRhInfraQuotaDisabled = isMarketplace ? !quotas.marketplaceRhInfra : !quotas.rhInfra;

  if (isByocQuotaDisabled && !isRhInfraQuotaDisabled) {
    return 'false';
  }

  return 'true';
};
