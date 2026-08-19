import React from 'react';

import { Alert } from '@patternfly/react-core';

import { hasAllowOcp5Capability } from '~/common/subscriptionCapabilities';
import InternalTrackingLink from '~/components/common/InternalTrackingLink';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks/useGlobalState';

type ClassicV5CreationWarningProps = {
  isClassic: boolean;
  product: 'rosa' | 'osd';
};

const getWarningTitle = (product: 'rosa' | 'osd'): React.ReactNode => {
  if (product === 'rosa') {
    return (
      <>
        OpenShift v5 is not supported on ROSA Classic clusters. To use OpenShift v5, please{' '}
        <InternalTrackingLink to="/create/rosa/getstarted">
          create a ROSA HCP cluster
        </InternalTrackingLink>
        .
      </>
    );
  }

  return 'OpenShift v5 is not supported on OSD Classic clusters.';
};

export const ClassicV5CreationWarning = ({ isClassic, product }: ClassicV5CreationWarningProps) => {
  const isOcp5SupportEnabled = useFeatureGate(OCP5_SUPPORT);
  const organization = useGlobalState((state) => state.userProfile.organization.details);
  const hasOcp5Capability = hasAllowOcp5Capability(organization?.capabilities);

  if (!isOcp5SupportEnabled || !isClassic || hasOcp5Capability) {
    return null;
  }

  return (
    <Alert
      variant="warning"
      isInline
      title={getWarningTitle(product)}
      data-testid="classic-v5-creation-warning"
    />
  );
};
