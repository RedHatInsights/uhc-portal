import { AxiosHeaders } from 'axios';

import { ANY } from '~/common/matchUtils';
import { userActions } from '~/redux/actions';
import {
  QuotaCost,
  QuotaCostList,
  RelatedResourceBilling_model as RelatedResourceBillingModel,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
} from '~/types/accounts_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import * as mockQuotaCost from '../../../../../mockdata/api/accounts_mgmt/v1/organizations/1HAXGgCYqHpednsRDiwWsZBmDlA/quota_cost.json';
import { defaultQuotaQuery, QuotaParams, QuotaQuery } from '../quotaModel';

import {
  defaultClusterFromSubscription,
  defaultSubscription,
} from './defaultClusterFromSubscription.fixtures';
import * as quotaCostFixtures from './quota_cost.fixtures';

export const simpleQuery: QuotaQuery = {
  ...defaultQuotaQuery,
  resource_name: 'params.resourceName',
  resource_type: 'params.resourceType',
  byoc: 'rhinfra',
};

export const quota1: QuotaCost = {
  kind: 'QuotaCost',
  href: '/api/accounts_mgmt/v1/organizations/1MK6ieFXd0eu1hERdENAPvpbi7x/qºuota_cost',
  organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
  quota_id: 'add-on|addon-crw-operator',
  allowed: 15,
  consumed: 0,
  related_resources: [
    {
      cloud_provider: ANY,
      resource_name: 'addon-crw-operator',
      resource_type: 'add-on',
      byoc: ANY,
      availability_zone_type: ANY,
      product: ANY,
      billing_model: RelatedResourceBillingModel.standard,
      cost: 1,
    },
  ],
};
export const quotaBillingModel: QuotaCost = {
  ...quotaCostFixtures.odhAddon[0],
  related_resources: [
    {
      ...quotaCostFixtures.odhAddon[0].related_resources[0],
      resource_name: 'standard-resource-name',
      billing_model: RelatedResourceBillingModel.standard,
    },
  ],
};

export const emptyQuotaCostList: QuotaCostList = {
  kind: 'string',
  page: 0,
  size: 0,
  total: 0,
  items: [],
};

export const ROSAQuotaList: QuotaCostList = {
  ...emptyQuotaCostList,
  items: quotaCostFixtures.unlimitedROSA as QuotaCost[],
};

export const CCSQuotaList: QuotaCostList = {
  ...emptyQuotaCostList,
  items: quotaCostFixtures.dedicatedCCS as QuotaCost[],
};

export const rhQuotaList: QuotaCostList = {
  ...emptyQuotaCostList,
  items: quotaCostFixtures.dedicatedRhInfra as QuotaCost[],
};

export const mockQuotaList = userActions.processQuota({
  data: {
    kind: '',
    page: 0,
    size: 0,
    total: 0,
    items: mockQuotaCost.items as QuotaCost[],
  },
  status: 0,
  statusText: '',
  headers: {},
  config: { headers: new AxiosHeaders() },
}) as QuotaCostList;

export const negativeQuotaList: QuotaCostList = {
  ...emptyQuotaCostList,
  items: quotaCostFixtures.negativeQuotaList as QuotaCost[],
};

export const quotaWithAccounts: QuotaCostList = {
  ...emptyQuotaCostList,
  items: [
    ...quotaCostFixtures.unlimitedROSA,
    ...quotaCostFixtures.dedicatedCCS,
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
  ] as QuotaCost[],
};

export const quotaWithoutAccounts: QuotaCostList = {
  ...emptyQuotaCostList,
  items: [
    ...quotaCostFixtures.unlimitedROSA,
    ...quotaCostFixtures.dedicatedCCS,
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
  ] as QuotaCost[],
};

export const addonsQuotaList: QuotaCostList = {
  ...emptyQuotaCostList,
  items: [
    ...quotaCostFixtures.crcWorkspacesAddon,
    ...quotaCostFixtures.loggingAddon,
    ...quotaCostFixtures.dbaAddon,
    ...quotaCostFixtures.serviceMeshAddon,
    ...quotaCostFixtures.odhAddon,
  ] as QuotaCost[],
};

export const addonsQuotaListStandardBillingModel: QuotaCostList = {
  ...emptyQuotaCostList,
  items: quotaCostFixtures.odhAddonStandardBillingModel as QuotaCost[],
};

export const TrialQuotaList: QuotaCostList = {
  ...emptyQuotaCostList,
  items: quotaCostFixtures.dedicatedTrial as QuotaCost[],
};

export const ROSACCSQuotaList = userActions.processQuota({
  data: {
    kind: '',
    page: 0,
    size: 0,
    total: 0,
    items: [...quotaCostFixtures.unlimitedROSA, ...quotaCostFixtures.dedicatedCCS] as QuotaCost[],
  },
  status: 0,
  statusText: '',
  headers: {},
  config: { headers: new AxiosHeaders() },
}) as QuotaCostList;

export const CCSROSAQuotaList = userActions.processQuota({
  data: {
    kind: '',
    page: 0,
    size: 0,
    total: 0,
    items: [...quotaCostFixtures.dedicatedCCS, ...quotaCostFixtures.unlimitedROSA] as QuotaCost[],
  },
  status: 0,
  statusText: '',
  headers: {},
  config: { headers: new AxiosHeaders() },
}) as QuotaCostList;

export const queryBillingModel: QuotaQuery = {
  ...defaultQuotaQuery,
  resource_name: 'standard-resource-name',
  resource_type: 'add-on',
  billing_model: RelatedResourceBillingModel.standard,
  byoc: 'byoc',
};

export const expectedAddons = {
  marketplace: {
    allowed: 15,
    consumed: 0,
    cost: 1,
    cloudAccounts: {
      aws: [],
      azure: [],
    },
  },
};

export const expectedAddonsBillingModel = {
  standard: {
    allowed: 15,
    consumed: 0,
    cost: 1,
  },
};

export const cluster: ClusterFromSubscription = {
  ...defaultClusterFromSubscription,
  subscription: {
    ...defaultSubscription,
    plan: {
      type: 'OCP',
    },
    cluster_billing_model: SubscriptionCommonFieldsClusterBillingModel.marketplace,
  },
  cloud_provider: {
    id: 'cloud_provider_id',
  },
  ccs: {
    enabled: true,
  },
};

export const clusterNonExistingBillingModel: ClusterFromSubscription = {
  ...defaultClusterFromSubscription,
  subscription: {
    ...defaultSubscription,
    cluster_billing_model: 'cluster_billing_model' as SubscriptionCommonFieldsClusterBillingModel,
  },
  ccs: {
    enabled: false,
  },
};

export const expectedDefault: QuotaParams = {
  product: undefined,
  billingModel: RelatedResourceBillingModel.standard,
  cloudProviderID: ANY,
  isBYOC: false,
  isMultiAz: false,
};

export const expectedNonDefault: QuotaParams = {
  product: 'OCP',
  billingModel: RelatedResourceBillingModel.marketplace,
  cloudProviderID: 'cloud_provider_id',
  isBYOC: true,
  isMultiAz: false,
};

export const expectedNonExistingBillingModel: QuotaParams = {
  product: undefined,
  billingModel: RelatedResourceBillingModel.standard,
  cloudProviderID: ANY,
  isBYOC: false,
  isMultiAz: false,
};
