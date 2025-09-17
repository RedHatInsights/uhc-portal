import React from 'react';
import { useParams } from 'react-router-dom';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
} from '@patternfly/react-core';

import EditButton from '~/components/common/EditButton';
import { useFetchClusterDetails } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { EDIT_BILLING_ACCOUNT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { isHypershiftCluster } from '../../../clusterDetailsHelper';

import { OverviewBillingAccountModal } from './OverviewBillingAccountModal';

export function OverviewBillingAccount() {
  const [isBillingModalOpen, setIsBillingModalOpen] = React.useState(false);

  const params = useParams();

  const { cluster } = useFetchClusterDetails(params.id || '');

  const hasFeatureGate = useFeatureGate(EDIT_BILLING_ACCOUNT);
  const isHypershift = isHypershiftCluster(cluster);
  const showEditableBillingAccount = cluster?.canEdit && hasFeatureGate && isHypershift;
  const disableChangeReason =
    !cluster?.canEdit && 'You do not have permission to change billing account.';
  const billingAccount =
    cluster?.aws?.billing_account_id || cluster?.subscription?.billing_marketplace_account || '';
  return (
    <>
      {isBillingModalOpen && (
        <OverviewBillingAccountModal
          onClose={() => {
            setIsBillingModalOpen(false);
          }}
          billingAccount={billingAccount}
          cluster={cluster}
        />
      )}

      <DescriptionListGroup>
        <DescriptionListTerm>Billing marketplace account</DescriptionListTerm>
        <DescriptionListDescription>
          {showEditableBillingAccount ? (
            <Flex>
              <FlexItem>
                <EditButton
                  data-testid="billingMarketplaceAccountLink"
                  disableReason={disableChangeReason}
                  ariaLabel="Edit billing account"
                  onClick={() => setIsBillingModalOpen(true)}
                >
                  {billingAccount}
                </EditButton>
              </FlexItem>
            </Flex>
          ) : (
            <Flex>
              <FlexItem>
                <span data-testid="billingMarketplaceAccount">{billingAccount}</span>
              </FlexItem>
            </Flex>
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
}
