import React from 'react';

import { subscriptionSettings } from '~/common/subscriptionTypes';
import { defaultSubscription } from '~/components/clusters/common/__tests__/defaultClusterFromSubscription.fixtures';
import {
  Subscription,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
  SubscriptionCommonFieldsService_level as SubscriptionCommonFieldsServiceLevel,
  SubscriptionCommonFieldsSupport_level as SubscriptionCommonFieldsSupportLevel,
  SubscriptionCommonFieldsSystem_units as SubscriptionCommonFieldsSystemUnits,
  SubscriptionCommonFieldsUsage,
} from '~/types/accounts_mgmt.v1';

import { getOptions, resetOptions } from '../optionUtils';

describe('getOptions', () => {
  describe('SUPPORT_LEVEL', () => {
    const expectedOptions = [
      {
        label: 'Premium',
        value: SubscriptionCommonFieldsSupportLevel.Premium,
        isChecked: true,
      },
      { label: 'Standard', value: SubscriptionCommonFieldsSupportLevel.Standard },
      { label: 'Self-Support', value: SubscriptionCommonFieldsSupportLevel.Self_Support },
    ];

    it('should return correct options for whatever the support_level field', () => {
      const subscription: Subscription = {
        ...defaultSubscription,
        id: '123',
        support_level: SubscriptionCommonFieldsSupportLevel.Premium,
      };
      const options = getOptions(subscription, subscriptionSettings.SUPPORT_LEVEL);

      expect(options).toEqual(expectedOptions);
    });

    it('should return correct options for whatever the support_level field and no subscription id', () => {
      const subscription: Subscription = {
        ...defaultSubscription,
        support_level: SubscriptionCommonFieldsSupportLevel.Premium,
      };
      const options = getOptions(subscription, subscriptionSettings.SUPPORT_LEVEL);

      expect(options).toEqual([
        ...expectedOptions,
        {
          label: 'Self-Support (unsupported)',
          value: SubscriptionCommonFieldsSupportLevel.Eval,
        },
      ]);
    });

    it('should return correct options for EVAL support_level field value', () => {
      const subscription: Subscription = {
        ...defaultSubscription,
        support_level: SubscriptionCommonFieldsSupportLevel.Eval,
      };
      const options = getOptions(subscription, subscriptionSettings.SUPPORT_LEVEL);

      expect(options).toEqual([
        {
          label: 'Premium',
          value: SubscriptionCommonFieldsSupportLevel.Premium,
        },
        { label: 'Standard', value: SubscriptionCommonFieldsSupportLevel.Standard },
        { label: 'Self-Support', value: SubscriptionCommonFieldsSupportLevel.Self_Support },
        {
          isChecked: true,
          label: 'Self-Support (unsupported)',
          value: SubscriptionCommonFieldsSupportLevel.Eval,
        },
      ]);
    });

    it('should return correct options for NONE support_level field value', () => {
      const subscription: Subscription = {
        ...defaultSubscription,
        id: '123',
        support_level: SubscriptionCommonFieldsSupportLevel.None,
      };
      const options = getOptions(subscription, subscriptionSettings.SUPPORT_LEVEL);

      expect(options).toEqual([
        {
          label: 'Premium',
          value: SubscriptionCommonFieldsSupportLevel.Premium,
        },
        { label: 'Standard', value: SubscriptionCommonFieldsSupportLevel.Standard },
        { label: 'Self-Support', value: SubscriptionCommonFieldsSupportLevel.Self_Support },
        {
          isChecked: true,
          label: <span className="subscription-settings expired-eval-option">Not supported</span>,
          value: SubscriptionCommonFieldsSupportLevel.None,
        },
      ]);
    });
  });

  it('should return correct options for USAGE', () => {
    const subscription: Subscription = {
      ...defaultSubscription,
      id: '123',
      usage: SubscriptionCommonFieldsUsage.Production,
    };
    const options = getOptions(subscription, subscriptionSettings.USAGE);

    expect(options).toEqual([
      {
        label: 'Production',
        value: SubscriptionCommonFieldsUsage.Production,
        isDefault: true,
        isChecked: true,
      },
      { label: 'Development/Test', value: SubscriptionCommonFieldsUsage.Development_Test },
      { label: 'Disaster Recovery', value: SubscriptionCommonFieldsUsage.Disaster_Recovery },
    ]);
  });

  it('should return correct options for SERVICE_LEVEL', () => {
    const subscription: Subscription = {
      ...defaultSubscription,
      id: '123',
    };
    const options = getOptions(subscription, subscriptionSettings.SERVICE_LEVEL);

    expect(options).toEqual([
      {
        isChecked: true,
        label: 'Red Hat support (L1-L3)',
        value: SubscriptionCommonFieldsServiceLevel.L1_L3,
        isDefault: true,
      },
      { label: 'Partner support (L3)', value: SubscriptionCommonFieldsServiceLevel.L3_only },
    ]);
  });

  it('should return correct options for SYSTEM_UNITS', () => {
    const subscription: Subscription = {
      ...defaultSubscription,
      id: '123',
    };
    const options = getOptions(subscription, subscriptionSettings.SYSTEM_UNITS);

    expect(options).toEqual([
      {
        isChecked: true,
        label: 'Cores or vCPUs',
        value: SubscriptionCommonFieldsSystemUnits.Cores_vCPU,
        isDefault: true,
      },
      { label: 'Sockets', value: SubscriptionCommonFieldsSystemUnits.Sockets },
    ]);
  });

  describe('CLUSTER_BILLING_MODEL', () => {
    it('should return correct options with marketplace and canSubscribeMarketplaceOCP true', () => {
      const subscription: Subscription = {
        ...defaultSubscription,
        id: '123',
        cluster_billing_model: SubscriptionCommonFieldsClusterBillingModel.marketplace,
      };
      const options = getOptions(subscription, subscriptionSettings.CLUSTER_BILLING_MODEL, true);

      expect(options).toEqual([
        {
          label: 'Annual: Fixed capacity subscription from Red Hat',
          value: SubscriptionCommonFieldsClusterBillingModel.standard,
        },
        {
          label: 'On-Demand (Hourly): Flexible usage billed through Red Hat Marketplace',
          value: SubscriptionCommonFieldsClusterBillingModel.marketplace,
          isDefault: true,
          isChecked: true,
        },
      ]);
    });
    it('should return correct options with standard and canSubscribeMarketplaceOCP false', () => {
      const subscription: Subscription = {
        ...defaultSubscription,
        id: '123',
        cluster_billing_model: SubscriptionCommonFieldsClusterBillingModel.standard,
      };
      const options = getOptions(subscription, subscriptionSettings.CLUSTER_BILLING_MODEL);

      expect(options).toEqual([
        {
          label: 'Annual: Fixed capacity subscription from Red Hat',
          value: SubscriptionCommonFieldsClusterBillingModel.standard,
          isDefault: true,
          isChecked: true,
        },
        {
          label: 'On-Demand (Hourly): Flexible usage billed through Red Hat Marketplace',
          value: SubscriptionCommonFieldsClusterBillingModel.marketplace,
        },
      ]);
    });
  });
});

describe('resetOptions', () => {
  it('should reset options correctly', () => {
    const subscription: Subscription = {
      ...defaultSubscription,
      id: '123',
      support_level: SubscriptionCommonFieldsSupportLevel.Premium,
      usage: SubscriptionCommonFieldsUsage.Production,
      cluster_billing_model: SubscriptionCommonFieldsClusterBillingModel.standard,
      system_units: SubscriptionCommonFieldsSystemUnits.Cores_vCPU,
    };

    const reset = resetOptions(subscription);

    expect(reset).toEqual({
      service_level: [
        {
          isChecked: true,
          label: 'Red Hat support (L1-L3)',
          value: SubscriptionCommonFieldsServiceLevel.L1_L3,
          isDefault: true,
        },
        { label: 'Partner support (L3)', value: SubscriptionCommonFieldsServiceLevel.L3_only },
      ],
      support_level: [
        {
          label: 'Premium',
          value: SubscriptionCommonFieldsSupportLevel.Premium,
          isChecked: true,
        },
        { label: 'Standard', value: SubscriptionCommonFieldsSupportLevel.Standard },
        { label: 'Self-Support', value: SubscriptionCommonFieldsSupportLevel.Self_Support },
      ],
      usage: [
        {
          label: 'Production',
          value: SubscriptionCommonFieldsUsage.Production,
          isDefault: true,
          isChecked: true,
        },
        { label: 'Development/Test', value: SubscriptionCommonFieldsUsage.Development_Test },
        { label: 'Disaster Recovery', value: SubscriptionCommonFieldsUsage.Disaster_Recovery },
      ],
      cluster_billing_model: [
        {
          label: 'Annual: Fixed capacity subscription from Red Hat',
          value: SubscriptionCommonFieldsClusterBillingModel.standard,
          isDefault: true,
          isChecked: true,
        },
        {
          label: 'On-Demand (Hourly): Flexible usage billed through Red Hat Marketplace',
          value: SubscriptionCommonFieldsClusterBillingModel.marketplace,
        },
      ],
      system_units: [
        {
          label: 'Cores or vCPUs',
          value: SubscriptionCommonFieldsSystemUnits.Cores_vCPU,
          isDefault: true,
          isChecked: true,
        },
        { label: 'Sockets', value: SubscriptionCommonFieldsSystemUnits.Sockets },
      ],
    });
  });
});
