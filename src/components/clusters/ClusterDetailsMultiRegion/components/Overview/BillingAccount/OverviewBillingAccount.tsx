import React from 'react';
import { useParams } from 'react-router-dom';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Icon,
} from '@patternfly/react-core';
import PencilAltIcon from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';

import EditButton from '~/components/common/EditButton';
import { useFetchClusterDetails } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { ALLOW_EUS_CHANNEL, EDIT_BILLING_ACCOUNT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import ButtonWithTooltip from '../../../../../common/ButtonWithTooltip';
import { isHypershiftCluster } from '../../../clusterDetailsHelper';

import { OverviewBillingAccountModal } from './OverviewBillingAccountModal';

export function OverviewBillingAccount() {
  const [isBillingModalOpen, setIsBillingModalOpen] = React.useState(false);

  const params = useParams();

  const { cluster } = useFetchClusterDetails(params.id || '');

  const hasFeatureGate = useFeatureGate(EDIT_BILLING_ACCOUNT);
  const useEusChannel = useFeatureGate(ALLOW_EUS_CHANNEL);
  const isHypershift = isHypershiftCluster(cluster);
  const showEditableBillingAccount = cluster?.canEdit && hasFeatureGate && isHypershift;
  const disableChangeReason =
    !cluster?.canEdit && 'You do not have permission to change billing account.';
  const billingAccount =
    cluster?.aws?.billing_account_id || cluster?.subscription?.billing_marketplace_account || '';

  const BillingEditButton = useEusChannel ? (
    <EditButton
      data-testid="billingMarketplaceAccountLink"
      disableReason={disableChangeReason}
      ariaLabel="Edit billing account"
      onClick={() => setIsBillingModalOpen(true)}
    >
      {billingAccount}
    </EditButton>
  ) : (
    <ButtonWithTooltip
      data-testid="billingMarketplaceAccountLink"
      isDisabled={!cluster?.canEdit} // This won't show disabled currently, but setting the tooltip anyway
      variant="link"
      isInline
      onClick={() => setIsBillingModalOpen(true)}
      disableReason={disableChangeReason}
      isAriaDisabled={!!disableChangeReason}
    >
      {billingAccount}{' '}
      <Icon>
        <PencilAltIcon color="blue" />
      </Icon>
    </ButtonWithTooltip>
  );

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
              <FlexItem>{BillingEditButton}</FlexItem>
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
