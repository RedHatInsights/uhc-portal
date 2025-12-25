import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Alert, Button, Timestamp, TimestampFormat } from '@patternfly/react-core';

import getClusterName from '~/common/getClusterName';
import installLinks from '~/common/installLinks.mjs';
import { normalizedProducts } from '~/common/subscriptionTypes';
import modals from '~/components/common/Modal/modals';
import {
  SubscriptionCommonFieldsStatus,
  SubscriptionCommonFieldsSupport_level as SubscriptionCommonFieldsSupportLevel,
} from '~/types/accounts_mgmt.v1';

import { getSubscriptionLastReconciledDate } from '../../../clusterDetailsHelper';

function SubscriptionCompliancy({ cluster, openModal, canSubscribeOCP = false }) {
  const dispatch = useDispatch();
  const subscription = get(cluster, 'subscription');

  const product = get(subscription, 'plan.type');
  if (product !== normalizedProducts.OCP) {
    return null;
  }

  const supportLevel = get(subscription, 'support_level');
  if (
    supportLevel !== SubscriptionCommonFieldsSupportLevel.Eval &&
    supportLevel !== SubscriptionCommonFieldsSupportLevel.None
  ) {
    return null;
  }

  const status = get(subscription, 'status');
  if (
    status === SubscriptionCommonFieldsStatus.Archived ||
    status === SubscriptionCommonFieldsStatus.Deprovisioned
  ) {
    return null;
  }

  const lastReconcileDate = getSubscriptionLastReconciledDate(subscription);
  const clusterName = getClusterName(cluster);

  const lastChecked = lastReconcileDate ? (
    <p>
      Last checked:&nbsp;
      <Timestamp
        date={new Date(subscription.last_reconcile_date || '')}
        timeFormat={TimestampFormat.medium}
        dateFormat={TimestampFormat.short}
      />
    </p>
  ) : (
    ''
  );

  const handleEditSettings = () => {
    dispatch(openModal(modals.EDIT_SUBSCRIPTION_SETTINGS, { subscription }));
  };

  const handleArchiveCluster = () => {
    const data = {
      subscriptionID: get(subscription, 'id'),
      name: clusterName,
    };
    openModal(modals.ARCHIVE_CLUSTER, data);
  };

  const textForUsersCanEdit = canSubscribeOCP ? (
    <>
      <Button variant="link" isInline onClick={handleEditSettings}>
        Edit subscription settings
      </Button>
      {' for non-evaluation use. '}
    </>
  ) : (
    <>
      <a href={installLinks.RH_CONTACT} target="_blank" rel="noreferrer noopener">
        Contact sales
      </a>
      {' to purchase an OpenShift subscription.'}
    </>
  );

  const textForUsersCanNotEdit = (
    <>
      The cluster owner or an Organization Administrator can edit subscription settings for
      non-evaluation use.
    </>
  );

  if (supportLevel === SubscriptionCommonFieldsSupportLevel.None) {
    return (
      <Alert
        className="subscription-settings compliancy-alert pf-v6-u-mt-md"
        isInline
        variant="danger"
        title="Your 60-day OpenShift evaluation has expired"
      >
        {lastChecked}
        <p>
          Your cluster is not supported and you may stop receiving updates.{' '}
          {cluster.canEdit ? (
            <>
              {textForUsersCanEdit}{' '}
              <Button variant="link" isInline onClick={handleArchiveCluster}>
                Archive this cluster
              </Button>
              {' if it no longer exists. '}
            </>
          ) : (
            textForUsersCanNotEdit
          )}
        </p>
      </Alert>
    );
  }
  return (
    <Alert
      className="subscription-settings compliancy-alert pf-v6-u-mt-md"
      isInline
      variant="warning"
      title="OpenShift evaluation expiration date"
    >
      {lastChecked}
      <p>
        Your OpenShift evaluation will expire at{' '}
        <Timestamp
          date={subscription.eval_expiration_date}
          dateFormat={TimestampFormat.medium}
          locale="eng-GB"
        />{' '}
        {cluster.canEdit ? textForUsersCanEdit : textForUsersCanNotEdit}
      </p>
    </Alert>
  );
}

SubscriptionCompliancy.propTypes = {
  cluster: PropTypes.shape({
    creation_timestamp: PropTypes.string,
    canEdit: PropTypes.bool,
  }),
  openModal: PropTypes.func.isRequired,
  canSubscribeOCP: PropTypes.bool.isRequired,
};

export default SubscriptionCompliancy;
