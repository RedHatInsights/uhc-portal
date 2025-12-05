import React from 'react';
import { useDispatch } from 'react-redux';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import ButtonWithTooltip from '~/components/common/ButtonWithTooltip';
import EditButton from '~/components/common/EditButton';
import { openModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { ALLOW_EUS_CHANNEL } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

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
  const useEusChannel = useFeatureGate(ALLOW_EUS_CHANNEL);
  const dispatch = useDispatch();
  const disableToggleReason =
    !canToggle &&
    `You do not have permission to ${protectionEnabled ? 'disable' : 'enable'} Delete Protection. Only cluster owners, cluster editors, and Organization Administrators can ${protectionEnabled ? 'disable' : 'enable'} Delete Protection.`;

  const DeleteProtectionButton = useEusChannel ? (
    <EditButton
      data-testid="delete-protection-toggle"
      disableReason={disableToggleReason}
      isAriaDisabled={!!disableToggleReason || pending}
      ariaLabel={`${protectionEnabled ? 'Disable' : 'Enable'}`}
      onClick={() =>
        dispatch(openModal(modals.DELETE_PROTECTION, { clusterID, protectionEnabled, region }))
      }
    >
      {protectionEnabled ? 'Enabled' : 'Disabled'}
    </EditButton>
  ) : (
    <ButtonWithTooltip
      data-testid="delete-protection-toggle"
      variant="link"
      isInline
      onClick={() =>
        dispatch(openModal(modals.DELETE_PROTECTION, { clusterID, protectionEnabled, region }))
      }
      disableReason={disableToggleReason}
      isAriaDisabled={!!disableToggleReason || pending}
    >
      {`${protectionEnabled ? 'Disable' : 'Enable'}`}
    </ButtonWithTooltip>
  );

  const deleteProtectionTerm = !useEusChannel && `: ${protectionEnabled ? 'Enabled' : 'Disabled'}`;

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Delete Protection{deleteProtectionTerm}</DescriptionListTerm>
      <DescriptionListDescription>
        {!isUninstalling ? DeleteProtectionButton : <span>N/A</span>}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default DeleteProtection;
