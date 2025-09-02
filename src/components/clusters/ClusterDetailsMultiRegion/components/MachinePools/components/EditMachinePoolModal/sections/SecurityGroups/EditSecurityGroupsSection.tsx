import React from 'react';

import { Alert, AlertVariant, ExpandableSection } from '@patternfly/react-core';

import { isCompatibleFeature, SupportedFeature } from '~/common/featureCompatibility';
import WithTooltip from '~/components/common/WithTooltip';
import { ClusterFromSubscription } from '~/types/types';

import EditSecurityGroupsField from './EditSecurityGroupsField';

export interface EditSecurityGroupsSectionProps {
  cluster: ClusterFromSubscription;
  isReadOnly: boolean;
  isExpandable?: boolean;
}

const EditSecurityGroupsSection = ({
  cluster,
  isReadOnly,
  isExpandable,
}: EditSecurityGroupsSectionProps) => {
  const showSecurityGroupSection = isCompatibleFeature(SupportedFeature.SECURITY_GROUPS, cluster);

  if (!showSecurityGroupSection) {
    return null;
  }

  const canNotEditMessage = 'This option cannot be edited from its original setting selection.';
  if (!isExpandable) {
    return (
      <>
        {isReadOnly ? (
          <Alert variant={AlertVariant.warning} isInline isPlain title={canNotEditMessage} />
        ) : null}
        <EditSecurityGroupsField cluster={cluster} isReadOnly={isReadOnly} />
      </>
    );
  }
  return showSecurityGroupSection ? (
    <ExpandableSection
      toggleContent={
        <WithTooltip showTooltip={isReadOnly} content={canNotEditMessage}>
          <span>Security groups</span>
        </WithTooltip>
      }
    >
      <EditSecurityGroupsField cluster={cluster} isReadOnly={isReadOnly} />
    </ExpandableSection>
  ) : null;
};

export default EditSecurityGroupsSection;
