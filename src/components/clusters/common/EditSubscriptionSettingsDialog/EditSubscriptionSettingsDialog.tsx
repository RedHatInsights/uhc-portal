import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { Content, ContentVariants, Form } from '@patternfly/react-core';

import getClusterName from '~/common/getClusterName';
import ErrorBox from '~/components/common/ErrorBox';
import Modal from '~/components/common/Modal/Modal';
import { useEditSubscription } from '~/queries/common/useEditSubscription';
import { useGlobalState } from '~/redux/hooks';
import { SubscriptionPatchRequest } from '~/types/accounts_mgmt.v1';

import {
  hasCapability,
  subscriptionCapabilities,
} from '../../../../common/subscriptionCapabilities';
import { closeModal } from '../../../common/Modal/ModalActions';
import modals from '../../../common/Modal/modals';

import EditSubscriptionSettingsFields from './EditSubscriptionSettingsFields';

type EditSubscriptionSettingsDialogProps = {
  onClose: () => void;
};

const EditSubscriptionSettingsDialog = ({ onClose }: EditSubscriptionSettingsDialogProps) => {
  const dispatch = useDispatch();

  const subscription = useGlobalState((state) => (state?.modal?.data as any)?.subscription ?? {});

  const [settings, setSettings] = useState<{ [index: string]: any }>({
    ...subscription,
    isValid: true,
  });

  const shouldDisplayClusterName = useGlobalState(
    (state) => (state?.modal?.data as any)?.shouldDisplayClusterName,
  );
  const clusterDisplayName = useGlobalState((state) => getClusterName(state?.modal?.data as any));

  const { isSuccess, error, isError, isPending, mutate, reset } = useEditSubscription();

  const handleCloseModal = React.useCallback(() => {
    reset();
    dispatch(closeModal());
  }, [dispatch, reset]);

  React.useEffect(() => {
    if (isSuccess) {
      handleCloseModal();
      onClose();
    }
  }, [handleCloseModal, isSuccess, onClose]);

  const submit = (subscriptionID: string, updates: { [index: string]: any }) => {
    const requestData = { ...updates } as SubscriptionPatchRequest;
    if (updates.socket_total && updates.system_units === 'Sockets') {
      requestData.socket_total = parseInt(`${updates.socket_total}`, 10);
      requestData.cpu_total = requestData.socket_total;
    }
    if (updates.cpu_total && updates.system_units === 'Cores/vCPU') {
      requestData.cpu_total = parseInt(`${updates.cpu_total}`, 10);
      requestData.socket_total = 1;
    }

    mutate({ subscriptionID, data: requestData });
  };

  const handleSubmit = () => {
    submit(subscription.id, settings);
  };

  return (
    <Modal
      title="Subscription settings"
      secondaryTitle={shouldDisplayClusterName ? clusterDisplayName : undefined}
      modalSize="medium"
      onClose={handleCloseModal}
      primaryText="Save"
      secondaryText="Cancel"
      onPrimaryClick={handleSubmit}
      onSecondaryClick={handleCloseModal}
      isPrimaryDisabled={!settings.isValid}
      isPending={isPending}
    >
      {isError ? (
        <ErrorBox message="Error updating subscription settings" response={error || {}} />
      ) : null}
      <Form
        onSubmit={(e) => {
          handleSubmit();
          e.preventDefault();
        }}
        className="subscription-settings form"
      >
        <Content>
          <Content component={ContentVariants.p}>
            Edit your subscription settings to receive the correct level of cluster support.
          </Content>
        </Content>
        <EditSubscriptionSettingsFields
          initialSettings={subscription}
          onSettingsChange={setSettings}
          canSubscribeStandardOCP={hasCapability(
            subscription,
            subscriptionCapabilities.SUBSCRIBED_OCP,
          )}
          canSubscribeMarketplaceOCP={hasCapability(
            subscription,
            subscriptionCapabilities.SUBSCRIBED_OCP_MARKETPLACE,
          )}
        />
      </Form>
    </Modal>
  );
};

EditSubscriptionSettingsDialog.modalName = modals.EDIT_SUBSCRIPTION_SETTINGS;

export default EditSubscriptionSettingsDialog;
