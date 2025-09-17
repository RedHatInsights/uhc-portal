import React from 'react';
import { useDispatch } from 'react-redux';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import EditButton from '~/components/common/EditButton';
import { openModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';

const DeleteProtection = ({
  protectionEnabled,
  clusterID,
  canToggle,
  isUninstalling,
  pending,
  region,
}: {
  protectionEnabled: boolean;
  clusterID: string;
  canToggle: boolean;
  isUninstalling?: boolean;
  pending?: boolean;
  region?: string;
}) => {
  const dispatch = useDispatch();
  const disableToggleReason =
    !canToggle &&
    `You do not have permission to ${protectionEnabled ? 'disable' : 'enable'} Delete Protection. Only cluster owners, cluster editors, and Organization Administrators can ${protectionEnabled ? 'disable' : 'enable'} Delete Protection.`;

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Delete Protection</DescriptionListTerm>
      <DescriptionListDescription>
        {!isUninstalling ? (
          <EditButton
            disableReason={disableToggleReason}
            isAriaDisabled={!!disableToggleReason || pending}
            ariaLabel={`${protectionEnabled ? 'Disable' : 'Enable'}`}
            onClick={() =>
              dispatch(
                openModal(modals.DELETE_PROTECTION, { clusterID, protectionEnabled, region }),
              )
            }
          >
            {protectionEnabled ? 'Enabled' : 'Disabled'}
          </EditButton>
        ) : (
          <span>N/A</span>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default DeleteProtection;
