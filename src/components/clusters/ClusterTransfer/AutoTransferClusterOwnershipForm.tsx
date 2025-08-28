import React from 'react';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { Content, ContentVariants, Form, Stack, StackItem } from '@patternfly/react-core';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

import getClusterName from '~/common/getClusterName';
import ErrorBox from '~/components/common/ErrorBox';
import TextField from '~/components/common/formik/TextField';
import Modal from '~/components/common/Modal/Modal';
import { closeModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import {
  useCreateClusterTransfer,
  useEditClusterTransfer,
} from '~/queries/ClusterActionsQueries/useClusterTransfer';
import { useFetchClusterTransfer } from '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransfer';
import { useFetchActionsPermissions } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { queryConstants } from '~/queries/queriesConstants';
import { useGlobalState } from '~/redux/hooks';
import { ClusterTransferStatus, Subscription } from '~/types/accounts_mgmt.v1';
import { ClusterFromSubscription, ErrorState } from '~/types/types';

import { TransferDetails } from '../ClusterDetailsMultiRegion/components/AccessControl/ClusterTransferOwnership/TransferDetails';

type AutoTransferClusterOwnershipFormProps = {
  onClose: () => void;
};

type ModalData = {
  subscription: Subscription;
};
const MAX_CHARACTERS = 64;
const MAX_CHARACTERS_MESSAGE = `Must be ${MAX_CHARACTERS} characters or less`;

function AutoTransferClusterOwnershipForm(props: AutoTransferClusterOwnershipFormProps) {
  const { onClose } = props;

  const dispatch = useDispatch();
  const addNotification = useAddNotification();
  const modalData: ModalData = useGlobalState((state) => state.modal.data) as ModalData;
  const {
    isPending: isPendingEdit,
    isError: isErrorEdit,
    error: errorEdit,
    mutate: transferClusterOwnership,
    isSuccess,
    reset,
  } = useCreateClusterTransfer();
  const {
    isPending: isPendingCancel,
    isError: isErrorCancel,
    error: errorCancel,
    mutate: cancelClusterTransfer,
  } = useEditClusterTransfer();
  const cluster: ClusterFromSubscription = React.useMemo(
    () =>
      ({
        subscription: modalData?.subscription,
      }) as ClusterFromSubscription,
    [modalData],
  );
  const username = useGlobalState((state) => state.userProfile.keycloakProfile.username);
  const isOwner = cluster.subscription?.creator?.username === username;
  const { canEdit } = useFetchActionsPermissions(
    cluster.subscription?.id || '',
    queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
    cluster.subscription?.status,
  );

  const clusterExternalID = cluster.subscription?.external_cluster_id || '';
  const { data, isLoading } = useFetchClusterTransfer({
    clusterExternalID,
    showPendingTransfer: true,
  });
  const transfer = data?.items?.[0] || {};
  const isTransferPending = transfer.status === ClusterTransferStatus.Pending.toLowerCase();
  const isTransferAccepted = transfer.status === ClusterTransferStatus.Accepted.toLowerCase();

  const canCancelTransfer =
    canEdit && !isPendingEdit && !isPendingCancel && !isErrorEdit && isOwner && !isTransferAccepted;

  const submitTransfer = async ({
    username,
    accountID,
    orgID,
  }: {
    username: string;
    accountID: string;
    orgID: string;
  }) => {
    if (clusterExternalID) {
      transferClusterOwnership(
        {
          clusterExternalID,
          currentOwner: cluster.subscription?.creator?.username || '',
          recipient: username,
          recipientOrgId: orgID,
          recipientAccountId: accountID,
        },
        {
          onSuccess: () => {
            addNotification({
              variant: 'success',
              title: 'Cluster ownership transfer initiated',
              dismissable: true,
            });
          },
        },
      );
    }
  };

  const handleClose = React.useCallback(() => {
    dispatch(closeModal());
    reset();
  }, [dispatch, reset]);

  const handleCancelTransfer = () => {
    cancelClusterTransfer(
      {
        transferID: transfer.id || '',
        updatedStatus: ClusterTransferStatus.Rescinded.toLowerCase(),
      },
      {
        onSuccess: () => {
          addNotification({
            variant: 'info',
            title: 'Cluster ownership transfer canceled',
            dismissable: true,
          });
          handleClose();
        },
      },
    );
  };

  React.useEffect(() => {
    if (isSuccess) {
      handleClose();
      onClose();
    }
  }, [handleClose, onClose, isSuccess]);

  const errorNotice =
    isErrorEdit || isErrorCancel ? (
      <Stack hasGutter>
        <StackItem>
          <ErrorBox
            message={`A problem occurred while ${isErrorCancel ? 'canceling transfer' : 'transfering cluster ownership'} `}
            response={(errorEdit?.error as ErrorState) || (errorCancel?.error as ErrorState)}
          />
        </StackItem>
      </Stack>
    ) : null;
  if (isLoading) {
    return null;
  }
  return isTransferPending || isTransferAccepted ? (
    <Modal
      id="transfer-in-progress-modal"
      title={`Transfer in progress for ${getClusterName(cluster)}`}
      aria-labelledby="transfer-in-progress-modal"
      onClose={handleClose}
      modalSize="medium"
      isSmall={false}
      primaryText="Cancel transfer"
      isPrimaryDisabled={!canCancelTransfer}
      secondaryText="Close"
      onSecondaryClick={handleClose}
      isSecondaryDisabled={isPendingEdit}
      onPrimaryClick={() => {
        handleCancelTransfer();
      }}
    >
      {errorNotice}
      <TransferDetails transfer={transfer} />
    </Modal>
  ) : (
    <Formik
      initialValues={{
        username: '',
        accountID: '',
        orgID: '',
      }}
      validationSchema={Yup.object({
        username: Yup.string()
          .max(MAX_CHARACTERS, MAX_CHARACTERS_MESSAGE)
          .test(
            'same-username',
            'Username must be different from the current owner',
            (value) => value !== cluster.subscription?.creator?.username,
          )
          .required('Required'),
        accountID: Yup.string()
          .max(MAX_CHARACTERS, MAX_CHARACTERS_MESSAGE)
          .test('alpha-numeric', 'Account ID must be an alpha numeric with no symbols', (value) =>
            /^[a-zA-Z0-9]+$/.test(value || ''),
          )
          .required('Required'),
        orgID: Yup.string()
          .max(MAX_CHARACTERS, MAX_CHARACTERS_MESSAGE)
          .test(
            'alpha-numeric',
            'Organization ID must be an alpha numeric with no symbols',
            (value) => /^[a-zA-Z0-9]+$/.test(value || ''),
          )
          .required('Required'),
      })}
      onSubmit={submitTransfer}
    >
      {(formik) => (
        <Modal
          id="auto-transfer-cluster-ownership-modal"
          title={`Transfer ownership of ${getClusterName(cluster)}`}
          aria-labelledby="auto-transfer-cluster-ownership-modal"
          onClose={handleClose}
          modalSize="medium"
          isSmall={false}
          primaryText="Initiate transfer"
          secondaryText="Cancel"
          onSecondaryClick={handleClose}
          onPrimaryClick={formik.submitForm}
          isPrimaryDisabled={
            !formik.isValid ||
            !formik.dirty ||
            formik.isSubmitting ||
            isPendingEdit ||
            !canEdit ||
            !isOwner ||
            !clusterExternalID
          }
          isSecondaryDisabled={formik.isSubmitting || isPendingEdit}
        >
          {clusterExternalID ? (
            <>
              <Content>
                <Content component={ContentVariants.small}>
                  You can transfer ownership of a cluster to another user in your organization or
                  another organization. By transferring cluster ownership, you give up access to the
                  cluster and its resources.
                </Content>
                <Content component={ContentVariants.p}>Account information</Content>
                <Content component={ContentVariants.small}>
                  After you initiate the transfer, the user that you specify here will receive an
                  email request to accept the ownership transfer. After the transfer is accepted,
                  only the new user can access the cluster.
                </Content>
                <Content component={ContentVariants.small}>
                  Note that the transfer request automatically expires after 15 days. You can cancel
                  the transfer at any time before it is accepted.
                </Content>
              </Content>
              <br />
              <Form>
                <TextField fieldId="username" label="Username" isRequired />
                <TextField fieldId="accountID" label="Account ID" isRequired />
                <TextField fieldId="orgID" label="Organization ID" isRequired />
              </Form>
              {errorNotice}
            </>
          ) : (
            <Content>
              <Content component={ContentVariants.small}>
                Transfer ownership will be available a few minutes after installation, once the
                cluster ID is fully registered.
              </Content>
            </Content>
          )}
        </Modal>
      )}
    </Formik>
  );
}

AutoTransferClusterOwnershipForm.modalName = modals.TRANSFER_CLUSTER_OWNERSHIP_AUTO;

export default AutoTransferClusterOwnershipForm;
