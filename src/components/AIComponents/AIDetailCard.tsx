import React from 'react';

import { Skeleton } from '@patternfly/react-core';
import { ScalprumComponent } from '@scalprum/react-core';

import { AugmentedCluster } from '~/types/types';

import { getClusterAIPermissions } from '../clusters/common/clusterStates';

const AIDetailCard = ({ cluster }: { cluster: AugmentedCluster }) => {
  const detailCardProps = {
    aiClusterId: cluster.aiCluster?.id,
    permissions: getClusterAIPermissions(cluster),
  };

  return (
    <ScalprumComponent
      scope="assistedInstallerApp"
      module="./AssistedInstallerDetailCard"
      fallback={<Skeleton fontSize="sm" width="5em" />}
      {...detailCardProps}
    />
  );
};

export default AIDetailCard;
