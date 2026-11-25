import React from 'react';

import modals from '~/components/common/Modal/modals';

import ButtonWithTooltip from '../../../../../common/ButtonWithTooltip';

type AddNotificationContactButtonProps = {
  canUpdateSubscription?: boolean;
  openModal: (modalId: string) => void;
};

const AddNotificationContactButton = ({
  canUpdateSubscription,
  openModal,
}: AddNotificationContactButtonProps) => (
  <ButtonWithTooltip
    disableReason={
      canUpdateSubscription
        ? null
        : 'You do not have permission to add a Notification Contact. Only cluster owners, cluster editors, and Organization Administrators can add them.'
    }
    onClick={() => openModal(modals.ADD_NOTIFICATION_CONTACT)}
    variant="secondary"
    className="access-control-add"
  >
    Add notification contact
  </ButtonWithTooltip>
);

export default AddNotificationContactButton;
