import React from 'react';

import { Skeleton } from '@patternfly/react-core';
import { ScalprumComponent } from '@scalprum/react-core';

import { AugmentedCluster } from '~/types/types';

const AIHostsClusterDetailTab = ({
  cluster,
  isVisible,
}: {
  cluster: AugmentedCluster;
  isVisible: boolean;
}) => {
  const hostClusterDetailTabProps = {
    cluster,
    isVisible,
  };

  return (
    <ScalprumComponent
      scope="assistedInstallerApp"
      module="./HostsClusterDetailTab"
      fallback={<Skeleton fontSize="sm" width="5em" />}
      {...hostClusterDetailTabProps}
    />
  );
};

export default AIHostsClusterDetailTab;
