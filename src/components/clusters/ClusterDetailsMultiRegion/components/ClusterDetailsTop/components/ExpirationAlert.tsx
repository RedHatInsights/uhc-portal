import React from 'react';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';

import { Alert, AlertProps, Button } from '@patternfly/react-core';

import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import { modalActions } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { HIDE_RH_MARKETPLACE } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { Cluster } from '~/types/clusters_mgmt.v1';

type ExpirationAlertProps = {
  expirationTimestamp: string;
  trialExpiration?: boolean;
  cluster?: Cluster;
  OSDRHMExpiration?: boolean;
};

const ExpirationAlert = ({
  expirationTimestamp,
  trialExpiration,
  cluster,
  OSDRHMExpiration,
}: ExpirationAlertProps) => {
  const hideRHMarketplace = useFeatureGate(HIDE_RH_MARKETPLACE);

  const dispatch = useDispatch();
  const now = dayjs.utc();
  const expirationTime = dayjs.utc(expirationTimestamp);
  const hours = expirationTime.diff(now, 'hour');
  const timeUntilExpiryString = now.to(expirationTime);
  const expirationTimeString = expirationTime.local().format('dddd, MMMM Do YYYY, h:mm a');

  const upgradeTrialClusterModal = () => {
    dispatch(
      modalActions.openModal?.(modals.UPGRADE_TRIAL_CLUSTER, {
        title: 'Upgrade cluster from Trial',
        clusterID: cluster?.id,
        cluster,
      }),
    );
  };

  if (hours <= 0) {
    return (
      <Alert
        id="expiration-alert"
        className="pf-v6-u-mt-md"
        variant="warning"
        isInline
        title="Cluster failed to delete"
        data-testid="expiration-alert-passed"
        role="alert"
      >
        <>
          {`This cluster should have been deleted ${timeUntilExpiryString} but is still running.`}{' '}
          <ExternalLink href={supportLinks.SUPPORT_HOME}>Contact our customer support</ExternalLink>
          .
        </>
      </Alert>
    );
  }

  let variant: AlertProps['variant'];
  switch (true) {
    case hours < 24:
      variant = 'danger';
      break;
    case hours < 48 && hours >= 24:
      variant = 'warning';
      break;
    default:
      variant = 'info';
  }

  let contents: string | React.ReactElement =
    `This cluster is scheduled for deletion on ${expirationTimeString}`;
  if (OSDRHMExpiration) {
    contents = hideRHMarketplace ? (
      <>Once expired, the cluster will be deleted permanently.</>
    ) : (
      <>
        Your cluster subscription was purchased from Red Hat Marketplace and will expire on
        {` ${expirationTimeString}. `}
        Once expired, the cluster will be deleted permanently. To avoid deletion, please purchase a
        new subscription from the{' '}
        <ExternalLink href="https://marketplace.redhat.com/en-us/products/red-hat-openshift-dedicated">
          Red Hat Marketplace
        </ExternalLink>{' '}
        before the expiration date.
      </>
    );
  } else if (trialExpiration) {
    contents = `Your free trial cluster will automatically be deleted on ${expirationTimeString}. Upgrade your cluster at any time to prevent deletion.`;
  }

  return (
    <Alert
      id="expiration-alert"
      className="pf-v6-u-mt-md"
      variant={variant}
      isInline
      title={`This cluster will be deleted ${timeUntilExpiryString}.`}
      data-testid="expiration-alert-will-delete"
      role="alert"
    >
      <p>{contents}</p>
      {trialExpiration && (
        <Button
          variant="secondary"
          className="pf-v6-u-mt-sm"
          data-testid="trial-button"
          onClick={() => upgradeTrialClusterModal()}
        >
          Upgrade from trial
        </Button>
      )}
    </Alert>
  );
};

export default ExpirationAlert;
