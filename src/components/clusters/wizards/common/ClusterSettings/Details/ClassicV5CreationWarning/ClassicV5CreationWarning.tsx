import React from 'react';

import { Alert } from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import { Link } from '~/common/routing';
import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import useAnalytics from '~/hooks/useAnalytics';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { Capability } from '~/types/accounts_mgmt.v1';

const ROSA_HCP_WIZARD_PATH = '/create/rosa/wizard';

type ClassicV5CreationWarningProps = {
  isClassic: boolean;
  product: 'rosa' | 'osd';
};

const RosaClassicV5CreationWarningTitle = () => {
  const track = useAnalytics();

  return (
    <>
      OpenShift v5 is not supported on ROSA Classic clusters. To use OpenShift v5, please{' '}
      <Link
        to={ROSA_HCP_WIZARD_PATH}
        reloadDocument
        onClick={() =>
          track(trackEvents.CreateClusterROSA, {
            url: ROSA_HCP_WIZARD_PATH,
            path: window.location.pathname,
          })
        }
      >
        create a ROSA HCP cluster
      </Link>
      .
    </>
  );
};

const getWarningTitle = (product: 'rosa' | 'osd'): React.ReactNode => {
  if (product === 'rosa') {
    return <RosaClassicV5CreationWarningTitle />;
  }

  return 'OpenShift v5 is not supported on OSD Classic clusters.';
};

export const ClassicV5CreationWarning = ({ isClassic, product }: ClassicV5CreationWarningProps) => {
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
      title={getWarningTitle(product)}
      data-testid="classic-v5-creation-warning"
    />
  );
};
