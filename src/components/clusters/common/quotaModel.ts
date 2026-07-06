import { ANY } from '~/common/matchUtils';
import {
  CloudAccount,
  RelatedResource,
  RelatedResourceBilling_model as RelatedResourceBillingModel,
} from '~/types/accounts_mgmt.v1';

/**
 * Known quota resourceType values.
 */
export const QuotaTypes = {
  ADD_ON: 'add-on',
  CLUSTER: 'cluster',
  NODE: 'compute.node',
  LOAD_BALANCER: 'network.loadbalancer',
  STORAGE: 'pv.storage',
};

export type QuotaParams = {
  resourceType?: string;
  resourceName?: string;
  product?: string;
  billingModel?: RelatedResourceBillingModel;
  cloudProviderID?: string;
  isBYOC?: boolean;
  isMultiAz?: boolean;
};

export type QuotaQuery = Omit<RelatedResource, 'cost'>;

export type BillingQuotaCloudAccounts = {
  aws: CloudAccount[];
  azure: CloudAccount[];
};

export type BillingQuota = {
  standard?: {
    allowed: number;
    consumed: number;
    cost: number;
  };
  marketplace?: {
    allowed: number;
    consumed: number;
    cost: number;
    cloudAccounts: BillingQuotaCloudAccounts;
  };
};

export const defaultQuotaQuery: QuotaQuery = {
  resource_type: ANY,
  availability_zone_type: ANY,
  billing_model: RelatedResourceBillingModel.any,
  byoc: ANY,
  cloud_provider: ANY,
  product: ANY,
};
