import React from 'react';
import { useDispatch } from 'react-redux';

import { ACM_HUB_PROPERTY_KEY, ACM_HUB_PROPERTY_VALUE } from '~/common/acmHubConstants';
import ErrorBox from '~/components/common/ErrorBox';
import Modal from '~/components/common/Modal/Modal';
import { closeModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useTagAcmHub } from '~/queries/AcmHubQueries/useTagAcmHub';
import { useGlobalState } from '~/redux/hooks';

type ModalData = {
  clusterID: string;
  clusterName: string;
  region?: string;
  properties?: { [key: string]: string };
  shouldDisplayClusterName?: boolean;
};

type TagAcmHubDialogProps = {
  onClose: () => void;
};

const TagAcmHubDialog: React.FC<TagAcmHubDialogProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const { isSuccess, error, isError, isPending, mutate, reset: resetResponse } = useTagAcmHub();

  const modalData = useGlobalState((state) => state.modal.data) as ModalData;
  const { clusterID, clusterName, region, properties, shouldDisplayClusterName } = modalData || {};

  const isCurrentlyTagged = properties?.[ACM_HUB_PROPERTY_KEY] === ACM_HUB_PROPERTY_VALUE;

  React.useEffect(() => {
    if (isSuccess) {
      resetResponse();
      dispatch(closeModal());
      onClose();
    }
  }, [isSuccess, onClose, resetResponse, dispatch]);

  const handleConfirm = () => {
    mutate({
      clusterID,
      region,
      tag: !isCurrentlyTagged,
    });
  };

  const handleCancel = () => {
    resetResponse();
    dispatch(closeModal());
  };

  const actionText = isCurrentlyTagged
    ? 'Remove hub cluster tag'
    : 'Tag as Red Hat Advanced Cluster Management for Kubernetes (RHACM) hub cluster';
  const actionVerb = isCurrentlyTagged ? 'remove' : 'add';

  return (
    <Modal
      title={actionText}
      secondaryTitle={shouldDisplayClusterName ? clusterName : undefined}
      data-testid="tag-acm-hub-modal"
      onClose={handleCancel}
      primaryText={isCurrentlyTagged ? 'Remove tag' : 'Tag'}
      secondaryText="Cancel"
      onPrimaryClick={handleConfirm}
      onSecondaryClick={handleCancel}
      isPrimaryDisabled={isPending}
      isPending={isPending}
    >
      <>
        {isError ? (
          <ErrorBox
            message={`Error ${actionVerb}ing ACM Hub tag`}
            response={error || {}}
            data-testid="tag-acm-hub-error"
          />
        ) : null}

        <p>
          {isCurrentlyTagged
            ? 'This cluster will no longer be in the hub cluster list.'
            : 'Tagging this cluster adds it to the hub cluster list.'}
        </p>
        <p>
          {`This tag is for organizational purposes only and does not automatically ${isCurrentlyTagged ? 'uninstall or remove' : 'install'} RHACM ${isCurrentlyTagged ? 'from' : 'on'} the cluster.`}
        </p>
      </>
    </Modal>
  );
};

const TagAcmHubDialogWithModalName = TagAcmHubDialog as typeof TagAcmHubDialog & {
  modalName: string;
};
TagAcmHubDialogWithModalName.modalName = modals.TAG_ACM_HUB;

export default TagAcmHubDialogWithModalName;
