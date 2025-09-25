import React from 'react';
import get from 'lodash/get';

import { Alert } from '@patternfly/react-core';

import { Link } from '~/common/routing';
import { normalizedProducts } from '~/common/subscriptionTypes';
import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import {
  ClusterAuthorizationRequestProduct_id as ClusterAuthorizationRequestProductId,
  Subscription,
  SubscriptionCommonFieldsStatus,
} from '~/types/accounts_mgmt.v1';

type TransferClusterOwnershipInfoProps = {
  subscription?: Subscription;
};

const TransferClusterOwnershipInfo = ({ subscription }: TransferClusterOwnershipInfoProps) => {
  const isAllowedProducts = [normalizedProducts.OCP, normalizedProducts.ARO].includes(
    get(subscription, 'plan.type', '') as ClusterAuthorizationRequestProductId,
  );
  if (!isAllowedProducts || !subscription?.released) {
    return null;
  }

  const alertText =
    subscription.status === SubscriptionCommonFieldsStatus.Disconnected ? (
      <>
        The transfer process will complete after{' '}
        <Link to="/register" data-testid="link">
          registering
        </Link>{' '}
        the cluster again using the same id.
      </>
    ) : (
      <>
        The transfer process will complete once the pull secret has been changed in the cluster. See{' '}
        <ExternalLink href={supportLinks.PULL_SECRET_CHANGE_KB} data-testid="external-link">
          this knowledgebase article
        </ExternalLink>{' '}
        for instructions on how to change the pull secret.
      </>
    );

  return (
    <Alert
      id="transfer-cluster-ownership-alert"
      className="pf-v6-u-mt-md"
      variant="info"
      isInline
      title="Cluster ownership transfer initiated"
    >
      {alertText}
    </Alert>
  );
};

export default TransferClusterOwnershipInfo;
