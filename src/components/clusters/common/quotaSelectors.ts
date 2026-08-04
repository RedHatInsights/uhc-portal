import get from 'lodash/get';

import { ANY, match, matchCaseInsensitively } from '~/common/matchUtils';
import {
  ConsumedQuotaBilling_model as ConsumedQuotaBillingModel,
  QuotaCost,
  QuotaCostList,
  RelatedResource,
  RelatedResourceBilling_model as RelatedResourceBillingModel,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
} from '~/types/accounts_mgmt.v1';
import { BillingModel } from '~/types/clusters_mgmt.v1/enums';
import { ClusterFromSubscription } from '~/types/types';

import {
  normalizedProducts,
  STANDARD_TRIAL_BILLING_MODEL_TYPE,
} from '../../../common/subscriptionTypes';

import { clusterBillingModelToRelatedResource } from './billingModelMapper';
import { BillingQuota, defaultQuotaQuery, QuotaParams, QuotaQuery } from './quotaModel';

/**
 * Performs an explicit mapping from a given billingModel to the billingModel which should be used to check quotas for
 */
/* eslint-disable camelcase */
const getBillingQuotaModel = (
  model: ConsumedQuotaBillingModel | any,
): RelatedResourceBillingModel => {
  switch (model) {
    case BillingModel.marketplace_aws:
      return RelatedResourceBillingModel.marketplace;
    default:
      return model;
  }
};
/* eslint-enable camelcase */

/**
 * Returns true if a QuotaCost.related_resources item matches given constraints.
 * query should consist of same fields as the resource; omitted fields are treated as 'ANY'.
 */
const relatedResourceMatches = (resource: RelatedResource, query: QuotaQuery): boolean =>
  match(resource.resource_type, query.resource_type || ANY) &&
  matchCaseInsensitively(resource.product, query.product || normalizedProducts.ANY) &&
  match(resource.billing_model, getBillingQuotaModel(query.billing_model || ANY)) &&
  match(resource.cloud_provider, query.cloud_provider || ANY) &&
  match(resource.byoc, query.byoc || ANY) &&
  matchCaseInsensitively(resource.availability_zone_type, query.availability_zone_type || ANY) &&
  match(resource.resource_name, query.resource_name || ANY);

/**
 * Returns remaining matching quota (integer, possibly 0 or Infinity) from a single QuotaCost item.
 * query should consist of same fields as the resource; omitted fields are treated as 'any'.
 */
const availableFromQuotaCostItem = (quotaCostItem: QuotaCost, query: QuotaQuery): number => {
  const matchingCosts: number[] =
    quotaCostItem.related_resources
      ?.filter((resource) => relatedResourceMatches(resource, query))
      .map((r) => r.cost) ?? [];
  if (matchingCosts.length === 0) {
    return 0;
  }
  const bestCost = Math.min(...matchingCosts);
  if (bestCost === 0) {
    return Infinity;
  }

  // If you're able to create half a node, you're still in "not enough quota" situation.
  const available = Math.floor((quotaCostItem.allowed - quotaCostItem.consumed) / bestCost);

  // Negative ResourceQuota does exist
  // For each quota cost item only consider the related resources with positive quota available
  // Otherwise for queries containing "any" selectors could match negative quota cost items
  // and incorrectly disable the item for a user when there may be another match that has
  // available quota
  return available > 0 ? available : 0;
};

const queryFromQuotaParams = (quotaParams: QuotaParams): QuotaQuery => ({
  ...defaultQuotaQuery,
  resource_type: quotaParams.resourceType || ANY,
  product: quotaParams.product || normalizedProducts.ANY,
  billing_model:
    quotaParams.billingModel?.toString() === STANDARD_TRIAL_BILLING_MODEL_TYPE // TODO: to remove standar trial billing model by OCMUI-2689
      ? RelatedResourceBillingModel.standard
      : quotaParams.billingModel || RelatedResourceBillingModel.any,
  cloud_provider: quotaParams.cloudProviderID || ANY,
  byoc: { true: 'byoc', false: 'rhinfra', undefined: ANY }[`${quotaParams.isBYOC}`], // TODO: this is inconsistent string vs boolean
  availability_zone_type: { true: 'multi', false: 'single', undefined: ANY }[
    `${quotaParams.isMultiAz}`
  ],
  resource_name: quotaParams.resourceName || ANY,
});

/**
 * Returns remaining matching quota (integer, possibly 0 or Infinity).
 * resourceType is required; other query fields may be omitted, default to 'any'.
 */
const availableQuota = (quotaList: QuotaCostList | undefined, quotaParams: QuotaParams): number => {
  if (!quotaList) {
    return 0;
  }

  const queryParams: QuotaParams = {
    ...quotaParams,
    billingModel:
      quotaParams.billingModel &&
      quotaParams.billingModel.startsWith(RelatedResourceBillingModel.marketplace)
        ? RelatedResourceBillingModel.marketplace
        : quotaParams.billingModel,
  };

  const query = queryFromQuotaParams(queryParams);
  return (quotaList?.items || []).reduce(
    (acc, curr) => acc + availableFromQuotaCostItem(curr, query),
    0,
  );
};

/**
 * Returns an object containing the addon's available billing options (standard/marketplace), quota cost information, and cloud accounts if applicable
 */
const addOnBillingQuota = (quotaList: QuotaCostList, quotaParams: QuotaParams): BillingQuota => {
  const models: BillingQuota = {};
  const query: QuotaQuery = {
    ...defaultQuotaQuery,
    resource_name: quotaParams.resourceName,
    resource_type: quotaParams.resourceType || ANY,
  };
  quotaList.items?.forEach((quotaCostItem) => {
    quotaCostItem.related_resources?.forEach((resource) => {
      if (relatedResourceMatches(resource, query)) {
        if (
          [ANY, SubscriptionCommonFieldsClusterBillingModel.standard].includes(
            resource.billing_model,
          )
        ) {
          if (!models.standard) {
            models.standard = {
              cost: resource.cost,
              allowed: quotaCostItem.allowed,
              consumed: quotaCostItem.consumed,
            };
          }
        } else if (
          resource.billing_model === RelatedResourceBillingModel.marketplace &&
          !models.marketplace
        ) {
          models.marketplace = {
            cost: resource.cost,
            cloudAccounts: {
              aws: quotaCostItem.cloud_accounts?.filter((m) => m.cloud_provider_id === 'aws') ?? [],
              azure:
                quotaCostItem.cloud_accounts?.filter((m) => m.cloud_provider_id === 'azure') ?? [],
            },
            allowed: quotaCostItem.allowed,
            consumed: quotaCostItem.consumed,
          };
        }
      }
    });
  });
  return models;
};

/**
 * Returns true if org has matching quota with cost 0 or allowed > 0, even if it's all consumed!
 * This is useful to show a specific resource (possibly greyed out) vs not show it at all.
 * resourceType is required; other query fields may be omitted, default to 'any'.
 */
const hasPotentialQuota = (quotaList: QuotaCostList, quotaParams: QuotaParams): boolean =>
  (quotaList.items ?? []).some((quotaCostItem) =>
    quotaCostItem.related_resources?.some(
      (resource) =>
        relatedResourceMatches(resource, queryFromQuotaParams(quotaParams)) &&
        (resource.cost === 0 || quotaCostItem.allowed > 0),
    ),
  );

/**
 * Returns partial query object for availableQuota() matching an existing cluster.
 */
const queryFromCluster = <E extends ClusterFromSubscription>(cluster: E): QuotaParams => ({
  product: cluster.subscription?.plan?.type,
  billingModel:
    clusterBillingModelToRelatedResource(cluster.subscription?.cluster_billing_model) ??
    RelatedResourceBillingModel.standard,
  cloudProviderID: cluster.cloud_provider?.id ?? ANY,
  isBYOC: cluster.ccs?.enabled === true,
  isMultiAz: get(cluster, 'multi_az', false), // TODO: multi_az?
});

const getAwsBillingAccountsFromQuota = (items?: QuotaCost[]) =>
  items
    ?.find((quota) => quota.quota_id === 'cluster|byoc|moa|marketplace')
    ?.cloud_accounts?.filter((account) => account.cloud_provider_id === 'aws') || [];

export {
  addOnBillingQuota,
  availableFromQuotaCostItem,
  availableQuota,
  getAwsBillingAccountsFromQuota,
  getBillingQuotaModel,
  hasPotentialQuota,
  queryFromCluster,
};
