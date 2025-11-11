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
  const { clusterID, clusterName, region, properties } = modalData || {};

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

  const actionText = isCurrentlyTagged ? 'Remove ACM Hub tag' : 'Tag as ACM Hub';
  const actionVerb = isCurrentlyTagged ? 'remove' : 'add';

  return (
    <Modal
      title={actionText}
      secondaryTitle={modalData.shouldDisplayClusterName ? clusterName : undefined}
      data-testid="tag-acm-hub-modal"
      onClose={handleCancel}
      primaryText="Confirm"
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
            ? `Are you sure you want to remove the ACM Hub tag from cluster "${clusterName}"? This will remove it from the ACM Hub Clusters list.`
            : `Are you sure you want to tag cluster "${clusterName}" as an ACM Hub? This will add it to the ACM Hub Clusters list for easier fleet management.`}
        </p>

        {!isCurrentlyTagged ? (
          <p className="pf-v6-u-mt-md pf-v6-u-color-200">
            <strong>Note:</strong> This tag is for organizational purposes only and does not
            automatically install or configure Advanced Cluster Management on the cluster.
          </p>
        ) : null}
      </>
    </Modal>
  );
};

const TagAcmHubDialogWithModalName = TagAcmHubDialog as typeof TagAcmHubDialog & {
  modalName: string;
};
TagAcmHubDialogWithModalName.modalName = modals.TAG_ACM_HUB;

export default TagAcmHubDialogWithModalName;
