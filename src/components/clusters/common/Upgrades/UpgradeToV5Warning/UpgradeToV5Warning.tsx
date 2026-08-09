import React from 'react';

import { Alert } from '@patternfly/react-core';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { isOSD, isROSA } from '~/components/clusters/common/clusterStates';
import InternalTrackingLink from '~/components/common/InternalTrackingLink';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { Organization } from '~/types/accounts_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

interface UpgradeToV5WarningProps {
  cluster: AugmentedCluster;
  isHypershift: boolean;
  organization?: Organization;
}

const getWarningTitle = (cluster: AugmentedCluster): React.ReactNode =>
  isROSA(cluster) ? (
    <>
      OpenShift v4 reaches end of life on March 31, 2028. Classic clusters cannot be upgraded to v5.
      To continue with OpenShift v5,{' '}
      <InternalTrackingLink to="/create/rosa/getstarted">
        create a new ROSA HCP cluster
      </InternalTrackingLink>
      .
    </>
  ) : (
    'OpenShift v4 reaches end of life on March 31, 2028. OpenShift 4.23 is the last supported version for OSD Classic.'
  );

const UpgradeToV5Warning = ({ cluster, isHypershift, organization }: UpgradeToV5WarningProps) => {
  const isOcp5SupportEnabled = useFeatureGate(OCP5_SUPPORT);
  const isRosaOrOsd = isROSA(cluster) || isOSD(cluster);
  const hasOcp5Capability = (organization?.capabilities ?? []).some(
    (capability) =>
      capability.name === subscriptionCapabilities.ROSA_OSD_ALLOW_OCP_5 &&
      capability.value === 'true',
  );

  if (!isOcp5SupportEnabled || !isRosaOrOsd || isHypershift || hasOcp5Capability) {
    return null;
  }

  return (
    <Alert
      variant="warning"
      isInline
      className="pf-v6-u-mb-md"
      title={getWarningTitle(cluster)}
      data-testid="classic-upgrade-to-v5-warning"
    />
  );
};

export default UpgradeToV5Warning;
