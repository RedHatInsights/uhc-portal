import React from 'react';

import { isROSA } from '~/components/clusters/common/clusterStates';
import { useGlobalState } from '~/redux/hooks';
import { ClusterFromSubscription } from '~/types/types';

import { MissingOCMRoleAlert } from './MissingOCMRoleAlert';

type ClusterMissingOCMRoleAlertProps = {
  cluster: ClusterFromSubscription;
};

export const ClusterMissingOCMRoleAlert = ({ cluster }: ClusterMissingOCMRoleAlertProps) => {
  const awsAccountId = cluster.subscription?.cloud_account_id;
  const userOrgId = useGlobalState((state) => state.userProfile.organization.details?.id);
  const isUserInClusterOrg = !!userOrgId && userOrgId === cluster.subscription?.organization_id;

  if (
    !isROSA(cluster) ||
    cluster.aws?.sts?.enabled !== true ||
    !awsAccountId ||
    !isUserInClusterOrg
  ) {
    return null;
  }

  return <MissingOCMRoleAlert awsAccountId={awsAccountId} />;
};
