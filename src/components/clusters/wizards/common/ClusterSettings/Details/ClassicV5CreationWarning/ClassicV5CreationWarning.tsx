import React from 'react';

import { Alert } from '@patternfly/react-core';

import { hasAllowOcp5Capability } from '~/common/subscriptionCapabilities';
import { splitVersion } from '~/common/versionHelpers';
import InternalTrackingLink from '~/components/common/InternalTrackingLink';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks/useGlobalState';

type ClassicV5CreationWarningProps = {
  isClassic: boolean;
  product: 'rosa' | 'osd';
  selectedVersion?: string;
};

const ROSA_CLASSIC_WARNING_TITLE =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for ROSA Classic (EUS Term 1).';
const ROSA_HCP_WARNING_TITLE =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for ROSA (EUS Term 1).';
const OSD_WARNING_TITLE =
  'OpenShift v4 is reaching end of life. OpenShift 4.23 is the last supported version for OSD Classic (EUS Term 1).';

const getWarningTitle = (isClassic: boolean, product: 'rosa' | 'osd'): string => {
  if (!isClassic && product === 'rosa') {
    return ROSA_HCP_WARNING_TITLE;
  }
  return product === 'rosa' ? ROSA_CLASSIC_WARNING_TITLE : OSD_WARNING_TITLE;
};

export const ClassicV5CreationWarning = ({
  isClassic,
  product,
  selectedVersion,
}: ClassicV5CreationWarningProps) => {
  const isOcp5SupportEnabled = useFeatureGate(OCP5_SUPPORT);
  const organization = useGlobalState((state) => state.userProfile.organization.details);
  const hasOcp5Capability = hasAllowOcp5Capability(organization?.capabilities);

  const showClassicWarning = isClassic && !hasOcp5Capability;
  const showHcpV4Warning =
    !isClassic && product === 'rosa' && !!selectedVersion && splitVersion(selectedVersion)[0] === 4;

  if (!isOcp5SupportEnabled || (!showClassicWarning && !showHcpV4Warning)) {
    return null;
  }

  const showRosaHcpLink = isClassic && product === 'rosa';

  return (
    <Alert
      variant="warning"
      isInline
      title={getWarningTitle(isClassic, product)}
      data-testid="classic-v5-creation-warning"
    >
      {showRosaHcpLink ? (
        <>
          To use OpenShift v5, please{' '}
          <InternalTrackingLink to="/create/rosa/getstarted">
            create a ROSA HCP cluster
          </InternalTrackingLink>
          .
        </>
      ) : null}
    </Alert>
  );
};
