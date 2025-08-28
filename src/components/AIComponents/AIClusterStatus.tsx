import React from 'react';

import { Skeleton } from '@patternfly/react-core';
import { ScalprumComponent } from '@scalprum/react-core';

const AIClusterStatus = ({ status, className }: { status?: string; className?: string }) => {
  const clusterStatusProps = {
    status: status ?? '',
    className: className ?? '',
  };

  return (
    <ScalprumComponent
      {...clusterStatusProps}
      scope="assistedInstallerApp"
      module="./ClusterStatus"
      fallback={<Skeleton fontSize="sm" width="5em" />}
    />
  );
};

export default AIClusterStatus;
