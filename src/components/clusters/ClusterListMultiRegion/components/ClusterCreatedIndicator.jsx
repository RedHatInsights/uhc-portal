import React from 'react';
import dayjs from 'dayjs';
import get from 'lodash/get';
import PropTypes from 'prop-types';

import {
  Button,
  Icon,
  Popover,
  PopoverPosition,
  Timestamp,
  TimestampFormat,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

import docLinks from '~/common/docLinks.mjs';
import { getTrialEndDate, getTrialExpiresInDays } from '~/common/getTrialExpiresDates';
import { normalizedProducts } from '~/common/subscriptionTypes';
import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import { SubscriptionCommonFieldsSupport_level as SubscriptionCommonFieldsSupportLevel } from '~/types/accounts_mgmt.v1';

function ClusterCreatedIndicator({ cluster }) {
  const osdtrial = get(cluster, 'product.id') === normalizedProducts.OSDTrial;
  const managed = get(cluster, 'managed');
  const supportLevel = get(cluster, 'subscription.support_level');
  const subscription = get(cluster, 'subscription');

  if (osdtrial) {
    const trialExpiresStr = getTrialExpiresInDays(cluster, true);
    const trialEndDate = getTrialEndDate(cluster);
    const bodyContent = (
      <>
        <h1>
          <strong>Trial Cluster</strong>
        </h1>
        <p>
          Your free trial cluster will automatically be deleted in&nbsp;
          {trialExpiresStr}
          &nbsp;on&nbsp;
          <strong>{trialEndDate}</strong>
        </p>
      </>
    );
    return (
      <Popover
        position={PopoverPosition.top}
        aria-label="Trial Expiration date"
        bodyContent={bodyContent}
      >
        <Button
          variant="link"
          isInline
          className="pf-v6-u-display-inline-flex"
          icon={
            <Icon status="warning">
              <ExclamationTriangleIcon />
            </Icon>
          }
        >
          {trialExpiresStr}
          &nbsp; left
        </Button>
      </Popover>
    );
  }

  if (
    managed ||
    (supportLevel !== SubscriptionCommonFieldsSupportLevel.Eval &&
      supportLevel !== SubscriptionCommonFieldsSupportLevel.None)
  ) {
    const clusterCreationTime = get(cluster, 'creation_timestamp', false);
    if (clusterCreationTime) {
      return dayjs(cluster.creation_timestamp).format('DD MMM YYYY');
    }
    return 'N/A';
  }

  // display error that it has expired
  if (supportLevel === SubscriptionCommonFieldsSupportLevel.None) {
    return (
      <Popover
        position={PopoverPosition.top}
        bodyContent={
          <p>
            Your cluster is not{' '}
            <ExternalLink href={supportLinks.OPENSHIFT_POLICY_UPDATES} noIcon>
              supported
            </ExternalLink>
            . Edit subscription settings to continue using this cluster, or archive this cluster if
            it no longer exists. To get Red Hat support for clusters, learn more about{' '}
            <ExternalLink href={docLinks.RH_OCP_SUBSCRIPTIONS} noIcon>
              OCP subscriptions
            </ExternalLink>
            .
          </p>
        }
        aria-label="Cluster not supported"
      >
        <Button
          variant="link"
          isInline
          className="pf-v6-u-display-inline-flex"
          icon={
            <Icon status="danger">
              <ExclamationCircleIcon />
            </Icon>
          }
        >
          Not supported
        </Button>
      </Popover>
    );
  }
  const clusterCreationTime = get(cluster, 'creation_timestamp', false);
  const OCPTrialBodyContent = (
    <>
      <h1>
        <strong>OCP Cluster</strong>
      </h1>
      <p>
        Your OCP cluster is not&nbsp;
        <ExternalLink href={supportLinks.OPENSHIFT_POLICY_UPDATES} noIcon>
          supported
        </ExternalLink>
        . Your cluster will remain functional.
        {subscription.eval_expiration_date && (
          <>
            {' '}
            Please enable the support by&nbsp;
            <strong>
              <Timestamp
                date={new Date(subscription.eval_expiration_date)}
                dateFormat={TimestampFormat.medium}
                locale="en-GB"
              />
            </strong>
            .{' '}
          </>
        )}{' '}
        To get Red Hat support for clusters, learn more about{' '}
        <ExternalLink href={docLinks.RH_OCP_SUBSCRIPTIONS} noIcon>
          OCP subscriptions
        </ExternalLink>
        .
      </p>
    </>
  );
  // display creation date with warning icon for unsupported OCP clusters
  return (
    <Popover
      position={PopoverPosition.top}
      bodyContent={OCPTrialBodyContent}
      aria-label="Cluster not supported"
    >
      <Button
        variant="link"
        isInline
        className="pf-v6-u-display-inline-flex"
        icon={
          <Icon status="warning">
            <ExclamationTriangleIcon />
          </Icon>
        }
      >
        {clusterCreationTime ? dayjs(clusterCreationTime).format('DD MMM YYYY') : 'N/A'}
      </Button>
    </Popover>
  );
}

ClusterCreatedIndicator.propTypes = {
  cluster: PropTypes.shape({
    managed: PropTypes.bool,
    subscription: PropTypes.shape({
      support_level: PropTypes.string,
    }),
    creation_timestamp: PropTypes.string,
  }),
};

export default ClusterCreatedIndicator;
