import React from 'react';
import { findIndex, get } from 'lodash';

import { subscriptionSettings } from '~/common/subscriptionTypes';
import {
  Subscription,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
  SubscriptionCommonFieldsService_level as SubscriptionCommonFieldsServiceLevel,
  SubscriptionCommonFieldsSupport_level as SubscriptionCommonFieldsSupportLevel,
  SubscriptionCommonFieldsSystem_units as SubscriptionCommonFieldsSystemUnits,
  SubscriptionCommonFieldsUsage,
} from '~/types/accounts_mgmt.v1';

import { EditSubcriptionOption } from './model/EditSubcriptionOption';
import { SubcriptionOptionType } from './model/SubcriptionOptionType';
import {
  MARKETPLACE_BILLING_MODEL_LABEL,
  OPTIONS,
  STANDARD_BILLING_MODEL_LABEL,
} from './constants';

const getOptions = (
  subscription: Subscription,
  setting: SubcriptionOptionType,
  canSubscribeMarketplaceOCP?: boolean,
): EditSubcriptionOption[] => {
  const value = get(subscription, setting);
  let options: EditSubcriptionOption[] = [];
  switch (setting) {
    case subscriptionSettings.SUPPORT_LEVEL:
      options = [
        { label: 'Premium', value: SubscriptionCommonFieldsSupportLevel.Premium },
        { label: 'Standard', value: SubscriptionCommonFieldsSupportLevel.Standard },
        { label: 'Self-Support', value: SubscriptionCommonFieldsSupportLevel.Self_Support },
      ];
      if (value === SubscriptionCommonFieldsSupportLevel.Eval || !subscription.id) {
        options.push({
          label: 'Self-Support 60-day evaluation',
          value: SubscriptionCommonFieldsSupportLevel.Eval,
        });
      } else if (value === SubscriptionCommonFieldsSupportLevel.None) {
        options.push({
          label: (
            <span className="subscription-settings expired-eval-option">Expired evaluation</span>
          ),
          value: SubscriptionCommonFieldsSupportLevel.None,
        });
      }
      break;
    case subscriptionSettings.USAGE:
      options = [
        { label: 'Production', value: SubscriptionCommonFieldsUsage.Production, isDefault: true },
        { label: 'Development/Test', value: SubscriptionCommonFieldsUsage.Development_Test },
        { label: 'Disaster Recovery', value: SubscriptionCommonFieldsUsage.Disaster_Recovery },
      ];
      break;
    case subscriptionSettings.SERVICE_LEVEL:
      options = [
        {
          label: 'Red Hat support (L1-L3)',
          value: SubscriptionCommonFieldsServiceLevel.L1_L3,
          isDefault: true,
        },
        { label: 'Partner support (L3)', value: SubscriptionCommonFieldsServiceLevel.L3_only },
      ];
      break;
    case subscriptionSettings.SYSTEM_UNITS:
      options = [
        {
          label: 'Cores or vCPUs',
          value: SubscriptionCommonFieldsSystemUnits.Cores_vCPU,
          isDefault: true,
        },
        { label: 'Sockets', value: SubscriptionCommonFieldsSystemUnits.Sockets },
      ];
      break;
    case subscriptionSettings.CLUSTER_BILLING_MODEL:
      options = [
        {
          label: STANDARD_BILLING_MODEL_LABEL,
          value: SubscriptionCommonFieldsClusterBillingModel.standard,
        },
        {
          label: MARKETPLACE_BILLING_MODEL_LABEL,
          value: SubscriptionCommonFieldsClusterBillingModel.marketplace,
        },
      ];
      if (canSubscribeMarketplaceOCP) {
        options[1].isDefault = true;
      } else {
        // default to standard if both are missing
        options[0].isDefault = true;
      }
      break;
    default:
  }

  const i = findIndex(options, { value });
  if (i >= 0) {
    options[i].isChecked = true;
  } else {
    // fallback to default
    const j = findIndex(options, 'isDefault');
    if (j >= 0) {
      options[j].isChecked = true;
    }
  }
  return options;
};

const resetOptions = (
  subscription: Subscription,
): { [index: string]: EditSubcriptionOption[] | number } =>
  OPTIONS.reduce(
    (acc, setting) => ({ ...acc, [`${setting}`]: getOptions(subscription, setting) }),
    {},
  );

// getOptions is exported only for testing
export { getOptions, resetOptions };
