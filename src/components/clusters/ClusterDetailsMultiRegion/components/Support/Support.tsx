import React from 'react';
import { useDispatch } from 'react-redux';

import { Card, CardBody, CardTitle } from '@patternfly/react-core';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { openModal } from '~/components/common/Modal/ModalActions';
import { AugmentedCluster } from '~/types/types';

import AddNotificationContactButton from './components/AddNotificationContactButton';
import ClusterOwnerMsg from './components/ClusterOwnerMsg';
import NotificationContactsCard from './components/NotificationContactsCard';
import SupportCasesCard from './components/SupportCasesCard';

import './Support.scss';

type SupportProps = {
  isDisabled?: boolean;
  cluster: AugmentedCluster;
  isAddNotificationContactSuccess: boolean;
  isAddNotificationContactPending: boolean;
  addNotificationStatus: string;
};

const Support = ({
  isDisabled = false,
  cluster,
  isAddNotificationContactSuccess,
  isAddNotificationContactPending,
  addNotificationStatus,
}: SupportProps) => {
  const dispatch = useDispatch();

  return (
    <>
      <Card className="ocm-c-support-notification-contacts__card">
        <CardTitle className="ocm-c-support-notification-contacts__card--header">
          Notification contacts
        </CardTitle>
        <CardBody className="ocm-c-support-notification-contacts__card--body">
          <div className="support-subtitle">
            Add users to be contacted in the event of notifications about this cluster.
            <ClusterOwnerMsg email={cluster.subscription?.creator?.email} />
          </div>
          {!isDisabled && (
            <AddNotificationContactButton
              canEdit={cluster.canEdit}
              openModal={(modalId) => dispatch(openModal(modalId))}
            />
          )}
          {cluster.subscription?.id ? (
            <NotificationContactsCard
              addNotificationStatus={addNotificationStatus}
              isAddNotificationContactPending={isAddNotificationContactSuccess}
              isAddNotificationContactSuccess={isAddNotificationContactPending}
              subscriptionID={cluster.subscription?.id}
              isDisabled={!cluster.canEdit || isDisabled}
            />
          ) : null}
        </CardBody>
      </Card>
      {cluster.subscription?.id &&
      cluster.subscription?.plan?.type !== normalizedProducts.RHOIC &&
      cluster.subscription?.plan?.type !== normalizedProducts.ROVS ? (
        <Card className="ocm-c-support-support-cases__card">
          <CardTitle className="ocm-c-support-support-cases__card--header">Support cases</CardTitle>
          <CardBody className="ocm-c-support-support-cases__card--body">
            <SupportCasesCard
              subscriptionID={cluster.subscription.id}
              isDisabled={isDisabled}
              cluster={cluster}
            />
          </CardBody>
        </Card>
      ) : null}
    </>
  );
};

export default Support;
