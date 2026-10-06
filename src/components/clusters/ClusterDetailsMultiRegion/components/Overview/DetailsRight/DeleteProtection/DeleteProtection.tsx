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
import { useCanUpdateDeleteProtection } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';

const DeleteProtection = ({
  protectionEnabled,
  clusterID,
  isUninstalling,
  pending,
  region,
}: {
  protectionEnabled: boolean;
  clusterID: string;
  isUninstalling?: boolean;
  pending?: boolean;
  region?: string;
}) => {
  const { canUpdateDeleteProtection, isLoading } = useCanUpdateDeleteProtection(clusterID);
  const canToggle = !!canUpdateDeleteProtection && !isLoading;
  const dispatch = useDispatch();
  const disableToggleReason =
    !canToggle &&
    `You do not have permission to ${protectionEnabled ? 'disable' : 'enable'} Delete Protection. Only cluster owners and Organization Administrators can ${protectionEnabled ? 'disable' : 'enable'} Delete Protection.`;

  const DeleteProtectionButton = (
    <EditButton
      disableReason={disableToggleReason}
      isAriaDisabled={!!disableToggleReason || pending}
      ariaLabel={`${protectionEnabled ? 'Disable' : 'Enable'} delete protection`}
      onClick={() =>
        dispatch(openModal(modals.DELETE_PROTECTION, { clusterID, protectionEnabled, region }))
      }
    >
      {protectionEnabled ? 'Enabled' : 'Disabled'}
    </EditButton>
  );

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Delete Protection</DescriptionListTerm>
      <DescriptionListDescription>
        {!isUninstalling ? DeleteProtectionButton : <span>N/A</span>}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default DeleteProtection;
