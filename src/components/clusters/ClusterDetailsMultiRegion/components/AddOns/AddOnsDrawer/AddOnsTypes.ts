import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

export type CloudProviders = 'aws' | 'azure';

export type CloudAccount = {
  // eslint-disable-next-line camelcase
  cloud_account_id: string;
  // eslint-disable-next-line camelcase
  cloud_provider_id: CloudProviders;
};

export const NO_QUOTA = 'no-quota';

export type SubscriptionModelAddOn = {
  addOn: string;
  billingModel: SubscriptionCommonFieldsClusterBillingModel | typeof NO_QUOTA;
  cloudAccount?: string;
};

export type SubscriptionModels = {
  [addOn: string]: SubscriptionModelAddOn;
};

export type SetSubscriptionModel = ({
  addOn: { addOn, billingModel, cloudAccount },
}: SubscriptionModels) => void;
