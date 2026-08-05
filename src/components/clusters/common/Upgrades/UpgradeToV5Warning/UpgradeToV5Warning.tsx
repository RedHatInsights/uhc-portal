import React from 'react';

import { Alert } from '@patternfly/react-core';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { isROSA } from '~/components/clusters/common/clusterStates';
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
      OpenShift 5 is available, but upgrading from v4 to v5 is not supported on ROSA Classic
      clusters. To use OpenShift 5,{' '}
      <InternalTrackingLink to="/create/rosa/getstarted">
        create a new ROSA HCP cluster
      </InternalTrackingLink>
      .
    </>
  ) : (
    'OpenShift 5 is available, but upgrading from v4 to v5 is not supported on OSD Classic clusters.'
  );

const UpgradeToV5Warning = ({ cluster, isHypershift, organization }: UpgradeToV5WarningProps) => {
  const isOcp5SupportEnabled = useFeatureGate(OCP5_SUPPORT);
  const hasOcp5Capability = (organization?.capabilities ?? []).some(
    (capability) =>
      capability.name === subscriptionCapabilities.ROSA_OSD_ALLOW_OCP_5 &&
      capability.value === 'true',
  );

  if (!isOcp5SupportEnabled || isHypershift || hasOcp5Capability) {
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
