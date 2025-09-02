import * as React from 'react';

import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { BillingQuotaCloudAccounts } from '~/components/clusters/common/quotaModel';
import ExternalLink from '~/components/common/ExternalLink';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import { CloudProviders, SetSubscriptionModel, SubscriptionModels } from './AddOnsTypes';

import './AddOnsSubscriptionCard.scss';

const SELECT_ACCOUNT_PLACEHOLDER = 'Select an account';
const marketplaceLinks: {
  [addOn: string]: {
    rhm?: string;
    aws?: string;
    azure?: string;
  };
} = {
  'managed-odh': {
    aws: 'https://aws.amazon.com/marketplace/search/results?searchTerms=OpenShift+Data+Science+enables',
  },
};

const AddOnsSubscriptionCard = ({
  subscriptionModels,
  setSubscriptionModel,
  activeCardId,
  hasQuota,
  isReady,
  cloudAccounts,
  installedAddOn,
  billingModel,
  name,
  cloudProvider,
}: {
  subscriptionModels: SubscriptionModels;
  setSubscriptionModel: SetSubscriptionModel;
  activeCardId: string;
  hasQuota: boolean;
  isReady: boolean;
  cloudAccounts?: BillingQuotaCloudAccounts;
  installedAddOn: any;
  billingModel: SubscriptionCommonFieldsClusterBillingModel;
  name: string;
  cloudProvider: CloudProviders;
}) => {
  const activeSubscription = subscriptionModels[activeCardId];
  const hasCloudAccounts = cloudAccounts && cloudAccounts[cloudProvider].length > 0;

  const [isOpen, setIsOpen] = React.useState(false);
  const [account, setAccount] = React.useState(activeSubscription.cloudAccount);
  React.useEffect(() => {
    // choose the default marketplace account if applicable
    if (installedAddOn && installedAddOn?.billing?.billing_marketplace_account) {
      const installedAccount = installedAddOn.billing.billing_marketplace_account;
      if (installedAddOn.billing.billing_model === billingModel) {
        setAccount(installedAccount);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installedAddOn]);
  React.useEffect(() => {
    if (activeSubscription?.billingModel === 'standard') {
      setAccount('');
    }
  }, [activeSubscription?.billingModel]);

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggle}
      isExpanded={isOpen}
      isDisabled={!isReady}
      isFullWidth
      aria-label="account menu"
      className="account-menu-toggle"
    >
      {account || SELECT_ACCOUNT_PLACEHOLDER}
    </MenuToggle>
  );

  return (
    <Card
      id={billingModel}
      isSelected={activeSubscription?.billingModel === billingModel}
      isDisabled={!hasCloudAccounts || !hasQuota || !isReady}
      onClick={() => {
        if (account) {
          // re-select
          setSubscriptionModel({
            ...subscriptionModels,
            [activeCardId]: {
              addOn: activeCardId,
              billingModel,
              cloudAccount: account,
            },
          });
        }
      }}
    >
      <CardTitle>{name}</CardTitle>
      <CardBody>Flexible usage. Pay only for the services you use.</CardBody>
      {!hasCloudAccounts || !hasQuota ? (
        <CardFooter>
          <small>Not available.</small>{' '}
          {marketplaceLinks[activeCardId] && marketplaceLinks[activeCardId][cloudProvider] && (
            <ExternalLink href={marketplaceLinks[activeCardId][cloudProvider] as string}>
              Enable in {name}.
            </ExternalLink>
          )}
        </CardFooter>
      ) : (
        <CardFooter>
          <Select
            isOpen={isOpen}
            selected={account}
            toggle={toggle}
            onSelect={(event, selection) => {
              event?.stopPropagation();
              setSubscriptionModel({
                ...subscriptionModels,
                [activeCardId]: {
                  addOn: activeCardId,
                  billingModel,
                  cloudAccount: selection as string,
                },
              });
              setAccount(selection as string);
              setIsOpen(false);
            }}
            onOpenChange={(isOpen) => setIsOpen(isOpen)}
          >
            <SelectList>
              {cloudAccounts &&
                cloudAccounts[cloudProvider].map(({ cloud_account_id: accountId }) => (
                  <SelectOption key={accountId} value={accountId}>
                    {accountId}
                  </SelectOption>
                ))}
            </SelectList>
          </Select>
        </CardFooter>
      )}
    </Card>
  );
};

export default AddOnsSubscriptionCard;
