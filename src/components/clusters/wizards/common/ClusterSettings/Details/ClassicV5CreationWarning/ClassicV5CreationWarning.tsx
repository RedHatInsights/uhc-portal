import React from 'react';

import { Alert } from '@patternfly/react-core';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import InternalTrackingLink from '~/components/common/InternalTrackingLink';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { Capability } from '~/types/accounts_mgmt.v1';

import { CloudProviderType } from '../../..';

type ClassicV5CreationWarningProps = {
  isClassic: boolean;
  product: 'rosa' | 'osd';
  cloudProvider?: string;
};

const getWarningTitle = (product: 'rosa' | 'osd', cloudProvider?: string): React.ReactNode => {
  if (product === 'rosa') {
    return (
      <>
        OpenShift v4 reaches end of life on March 31, 2028. OpenShift 4.23 is the last supported
        version for ROSA Classic. To use OpenShift v5, please{' '}
        <InternalTrackingLink to="/create/rosa/getstarted">
          create a ROSA HCP cluster
        </InternalTrackingLink>
        .
      </>
    );
  }

  if (cloudProvider === CloudProviderType.Gcp) {
    return 'OpenShift v4 reaches end of life on March 31, 2028. OpenShift 4.23 is the last supported version for OSD Classic.';
  }

  return 'OpenShift v5 is not supported on OSD Classic clusters on AWS.';
};

export const ClassicV5CreationWarning = ({
  isClassic,
  product,
  cloudProvider,
}: ClassicV5CreationWarningProps) => {
  const isOcp5SupportEnabled = useFeatureGate(OCP5_SUPPORT);
  const organization = useGlobalState((state) => state.userProfile.organization.details);
  const hasOcp5Capability = (organization?.capabilities ?? []).some(
    (capability: Capability) =>
      capability.name === subscriptionCapabilities.ROSA_OSD_ALLOW_OCP_5 &&
      capability.value === 'true',
  );

  if (!isOcp5SupportEnabled || !isClassic || hasOcp5Capability) {
    return null;
  }

  return (
    <Alert
      variant="warning"
      isInline
      title={getWarningTitle(product, cloudProvider)}
      data-testid="classic-v5-creation-warning"
    />
  );
};
