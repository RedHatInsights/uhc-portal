import { normalizedProducts } from '~/common/subscriptionTypes';
import {
  RelatedResourceBilling_model as RelatedResourceBillingModel,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
} from '~/types/accounts_mgmt.v1';

// This is the quota we use in mockdata mode, pretty much everything is allowed.
import * as mockQuotaCost from '../../../../../mockdata/api/accounts_mgmt/v1/organizations/1HAXGgCYqHpednsRDiwWsZBmDlA/quota_cost.json';
import { userActions } from '../../../../redux/actions/userActions';
import { QuotaTypes } from '../quotaModel';

import * as quotaCostFixtures from './quota_cost.fixtures';

// Fragments of processed quotaList state

export const emptyQuota = {
  allowed: 0,
  consumed: 0,
  quota_id: 'quota_id',
};

export const mockQuotaList = userActions.processQuota({ data: mockQuotaCost });

export const emptyQuotaList = userActions.processQuota({ data: { items: [] } });

export const ROSAQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.unlimitedROSA },
});
export const CCSQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.dedicatedCCS },
});
export const CCSOneNodeRemainingQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.dedicatedCCSOneNodeRemaining },
});
export const TrialQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.dedicatedTrial },
});
export const ROSACCSQuotaList = userActions.processQuota({
  data: { items: [...quotaCostFixtures.unlimitedROSA, ...quotaCostFixtures.dedicatedCCS] },
});
export const CCSROSAQuotaList = userActions.processQuota({
  data: { items: [...quotaCostFixtures.dedicatedCCS, ...quotaCostFixtures.unlimitedROSA] },
});
export const TrialCCSQuotaList = userActions.processQuota({
  data: { items: [...quotaCostFixtures.dedicatedTrial, ...quotaCostFixtures.dedicatedCCS] },
});
export const CCSTrialQuotaList = userActions.processQuota({
  data: { items: [...quotaCostFixtures.dedicatedCCS, ...quotaCostFixtures.dedicatedTrial] },
});

export const rhQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.dedicatedRhInfra },
});

export const negativeQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.negativeQuotaList },
});

export const crcWorkspacesAddonQuota = userActions.processQuota({
  data: { items: quotaCostFixtures.crcWorkspacesAddon },
});

export const loggingAddonQuota = userActions.processQuota({
  data: { items: quotaCostFixtures.loggingAddon },
});

export const dbaAddonQuota = userActions.processQuota({
  data: { items: quotaCostFixtures.dbaAddon },
});

export const serviceMeshAddonQuota = userActions.processQuota({
  data: { items: quotaCostFixtures.serviceMeshAddon },
});

export const addonsQuotaList = userActions.processQuota({
  data: {
    items: [].concat(
      quotaCostFixtures.crcWorkspacesAddon,
      quotaCostFixtures.loggingAddon,
      quotaCostFixtures.dbaAddon,
      quotaCostFixtures.serviceMeshAddon,
      quotaCostFixtures.odhAddon,
    ),
  },
});

export const addonsQuotaListStandardBillingModel = userActions.processQuota({
  data: {
    items: [].concat(quotaCostFixtures.odhAddonStandardBillingModel),
  },
});

export const storageQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.storage },
});

export const loadBalancerQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.loadBalancers },
});

export const quotaWithAccounts = {
  items: [
    ...ROSACCSQuotaList.items,
    {
      allowed: 1080,
      cloud_accounts: [
        {
          cloud_account_id: '765374464689',
          cloud_provider_id: 'aws',
        },
        {
          cloud_account_id: 'fakeAzureAccount',
          cloud_provider_id: 'azure',
        },
        {
          cloud_account_id: 'fakeAwsAccount',
          cloud_provider_id: 'aws',
        },
      ],
      consumed: 1,
      href: '/api/accounts_mgmt/v1/organizations/1MK6ieFXd0eu1hERdENAPvpbi7x/quota_cost',
      kind: 'QuotaCost',
      organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
      quota_id: 'cluster|byoc|moa|marketplace',
      version: '7891248a-fc29-4d27-b6e6-870e9465c2ae',
    },
  ],
};

export const quotaWithoutAccounts = {
  items: [
    ...ROSACCSQuotaList.items,
    {
      allowed: 1080,
      cloud_accounts: [
        {
          cloud_account_id: 'fakeAzureAccount',
          cloud_provider_id: 'azure',
        },
      ],
      consumed: 1,
      href: '/api/accounts_mgmt/v1/organizations/1MK6ieFXd0eu1hERdENAPvpbi7x/quota_cost',
      kind: 'QuotaCost',
      organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
      quota_id: 'cluster|byoc|moa|marketplace',
      version: '7891248a-fc29-4d27-b6e6-870e9465c2ae',
    },
  ],
};

export const quotaWithAccountsExpected = [
  { cloud_account_id: '765374464689', cloud_provider_id: 'aws' },
  { cloud_account_id: 'fakeAwsAccount', cloud_provider_id: 'aws' },
];

export const paramsRhInfra = {
  product: normalizedProducts.OSD,
  cloudProviderID: 'aws',
  resourceName: 'standard-4',
  isMultiAz: true,
  isBYOC: false,
  billingModel: RelatedResourceBillingModel.standard,
};
export const paramsCCS = {
  product: normalizedProducts.OSD,
  cloudProviderID: 'aws',
  resourceName: 'standard-4',
  isMultiAz: true,
  isBYOC: true,
  billingModel: RelatedResourceBillingModel.standard,
};
export const paramsCCSOnDemand = {
  product: normalizedProducts.OSD,
  cloudProviderID: 'aws',
  resourceName: 'standard-4',
  isMultiAz: true,
  isBYOC: true,
  billingModel: RelatedResourceBillingModel.marketplace,
};
export const paramsTrial = {
  product: normalizedProducts.OSDTrial,
  cloudProviderID: 'aws',
  resourceName: 'standard-4',
  isMultiAz: true,
  isBYOC: true,
  billingModel: RelatedResourceBillingModel.standard,
};
export const paramsROSA = {
  ...paramsCCS,
  product: normalizedProducts.ROSA,
};
export const paramsGCP = {
  ...paramsRhInfra,
  billingModel: SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp,
};

export const paramsAddons = {
  ...paramsCCSOnDemand,
  resourceType: QuotaTypes.ADD_ON,
  resourceName: 'addon-open-data-hub',
};

export const paramsAddonsStandard = {
  ...paramsCCSOnDemand,
  resourceType: QuotaTypes.ADD_ON,
  resourceName: 'standard-resource-name',
};
