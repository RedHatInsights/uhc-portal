import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

export type CloudProviders = 'rhm' | 'aws' | 'azure';

export type CloudAccount = {
  cloud_account_id: string;
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
