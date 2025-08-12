import get from 'lodash/get';

import { QuotaParams, QuotaTypes } from '~/components/clusters/common/quotaModel';
import { OrganizationState } from '~/redux/reducers/userReducer';
import { PromiseReducerState } from '~/redux/state';
import {
  Organization,
  QuotaCostList,
  RelatedResourceBilling_model as RelatedResourceBillingModel,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
} from '~/types/accounts_mgmt.v1';
import { MachineType } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { availableQuota } from '../../../common/quotaSelectors';

const hasNodesQuotaForType = <E extends ClusterFromSubscription>(
  machineType: MachineType,
  cluster: E,
  cloudProviderID: string,
  billingModel: RelatedResourceBillingModel,
  organization: PromiseReducerState<OrganizationState>,
) => {
  const quotaParams: QuotaParams = {
    product: cluster?.subscription?.plan?.type,
    cloudProviderID,
    isBYOC: !!cluster?.ccs?.enabled,
    isMultiAz: cluster.multi_az,
    resourceName: machineType.generic_name,
    billingModel,
  };

  return (
    availableQuota(organization?.quotaList as QuotaCostList, {
      ...quotaParams,
      resourceType: QuotaTypes.NODE,
    }) >= 1
  );
};

const hasMachinePoolsQuotaSelector = <E extends ClusterFromSubscription>(
  organizationState: PromiseReducerState<OrganizationState>,
  cluster: E | undefined,
  machineTypes: { [id: string]: MachineType[] } | undefined,
) => {
  if (!organizationState?.fulfilled) {
    return false;
  }

  const cloudProviderID = cluster?.cloud_provider?.id;
  const billingModel =
    RelatedResourceBillingModel[
      get(
        cluster,
        'subscription.cluster_billing_model',
        SubscriptionCommonFieldsClusterBillingModel.standard,
      ) as keyof typeof RelatedResourceBillingModel
    ];

  if (cloudProviderID && machineTypes) {
    const types: MachineType[] = get(machineTypes, cloudProviderID, []);
    return types.some((type) =>
      hasNodesQuotaForType(type, cluster, cloudProviderID, billingModel, organizationState),
    );
  }
  return false;
};

const hasOrgLevelAutoscaleCapability = (organization?: Organization) => {
  const capabilities = organization?.capabilities ?? [];
  const autoScaleClusters = capabilities.find(
    (capability) => capability.name === 'capability.cluster.autoscale_clusters',
  );

  return !!(autoScaleClusters && autoScaleClusters.value === 'true');
};

const hasOrgLevelBypassPIDsLimitCapability = (organization?: Organization) =>
  (organization?.capabilities ?? []).some(
    (capability) =>
      capability.name === 'capability.organization.bypass_pids_limits' &&
      capability.value === 'true',
  );

export {
  hasMachinePoolsQuotaSelector,
  hasOrgLevelAutoscaleCapability,
  hasOrgLevelBypassPIDsLimitCapability,
};
