import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { Content, ContentVariants } from '@patternfly/react-core';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

import getClusterName from '~/common/getClusterName';
import { ocmBaseName } from '~/common/routing';
import supportLinks from '~/common/supportLinks.mjs';
import Modal from '~/components/common/Modal/Modal';
import { useToggleSubscriptionReleased } from '~/queries/ClusterActionsQueries/useToggleSubscriptionReleased';
import { useGlobalState } from '~/redux/hooks';
import { Subscription, SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';
import { ClusterFromSubscription, ErrorState } from '~/types/types';

import ErrorBox from '../../../common/ErrorBox';
import ExternalLink from '../../../common/ExternalLink';
import { closeModal } from '../../../common/Modal/ModalActions';
import modals from '../../../common/Modal/modals';

type TransferClusterOwnershipDialogProps = {
  onClose: () => void;
};

type ModaData = {
  subscription: Subscription;
  shouldDisplayClusterName?: boolean;
};

const TransferClusterOwnershipDialog = ({ onClose }: TransferClusterOwnershipDialogProps) => {
  const dispatch = useDispatch();
  const addNotification = useAddNotification();

  const modalData: ModaData = useGlobalState((state) => state.modal.data) as ModaData;

  const {
    isPending: isToggleSubscriptionReleasedPending,
    isError: isToggleSubscriptionReleasedError,
    error: toggleSubscriptionReleasedError,
    mutate: toggleSubscriptionReleased,
    isSuccess: isToggleSubscriptionReleasedSuccess,
  } = useToggleSubscriptionReleased();

  const clusterDisplayName = useMemo(() => {
    const fakeCluster: ClusterFromSubscription = {
      subscription: modalData.subscription,
    } as ClusterFromSubscription;

    return getClusterName(fakeCluster);
  }, [modalData]);

  const subscription = useMemo(() => modalData.subscription, [modalData]);
  const shouldDisplayClusterName = useMemo(
    () => modalData.shouldDisplayClusterName ?? false,
    [modalData],
  );

  const handleSubmit = () => {
    if (subscription?.id) {
      const isReleased = subscription?.released ?? false;
      toggleSubscriptionReleased(
        { subscriptionID: subscription.id, released: !isReleased },
        {
          // NOTE - it doesn't appear that this dialog is ever called when
          // cancelling a transfer
          // Keeping code just in case this is wrong
          // See src/components/clusters/commonMultiRegion/ClusterActionsDropdown/ClusterActionsDropdownItems.jsx
          // for the code that is called on the cluster actions
          onSuccess: () => {
            if (isReleased) {
              addNotification({
                variant: 'success',
                title: 'Cluster ownership transfer canceled',
                dismissable: false,
              });
            }
          },
        },
      );
    }
  };

  const handleClose = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  useEffect(() => {
    if (isToggleSubscriptionReleasedSuccess) {
      handleClose();
      onClose();
    }
  }, [handleClose, onClose, isToggleSubscriptionReleasedSuccess]);

  return (
    <Modal
      title="Transfer cluster ownership"
      secondaryTitle={shouldDisplayClusterName ? clusterDisplayName : undefined}
      modalSize="small"
      onClose={handleClose}
      primaryText="Initiate transfer"
      secondaryText="Cancel"
      onPrimaryClick={handleSubmit}
      onSecondaryClick={handleClose}
      isPending={isToggleSubscriptionReleasedPending}
    >
      {isToggleSubscriptionReleasedError ? (
        <ErrorBox
          message="Error initiating transfer"
          response={toggleSubscriptionReleasedError?.error as ErrorState}
        />
      ) : null}
      <Content>
        <Content component={ContentVariants.p}>
          Transferring cluster ownership will allow another individual to manage this cluster. The
          steps for transferring cluster ownership are:
        </Content>
        {subscription?.status === SubscriptionCommonFieldsStatus.Disconnected ? (
          <Content component={ContentVariants.ol}>
            <Content component="li">Initiate transfer</Content>
            <Content component="li">
              <ExternalLink href={`${ocmBaseName}/register`}>Register the cluster</ExternalLink>{' '}
              within 5 days
            </Content>
          </Content>
        ) : (
          <>
            <Content component={ContentVariants.ol}>
              <Content component="li">Initiate transfer</Content>
              <Content component="li">
                <ExternalLink href={supportLinks.PULL_SECRET_CHANGE_KB}>
                  Change the cluster&apos;s pull secret
                </ExternalLink>{' '}
                within 5 days
              </Content>
            </Content>
            <Content component={ContentVariants.p}>
              The transfer is complete when OpenShift Cluster Manager receives telemetry data from
              the cluster with the new pull secret.
            </Content>
          </>
        )}
        <Content component={ContentVariants.h4}>
          If the transfer is not completed within 5 days, the procedure must be restarted.
        </Content>
      </Content>
    </Modal>
  );
};

TransferClusterOwnershipDialog.modalName = modals.TRANSFER_CLUSTER_OWNERSHIP;

export default TransferClusterOwnershipDialog;
