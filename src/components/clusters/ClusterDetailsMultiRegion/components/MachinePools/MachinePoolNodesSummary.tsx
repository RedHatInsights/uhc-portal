import React from 'react';

import { Button, Popover } from '@patternfly/react-core';

import { MachinePool } from '~/types/clusters_mgmt.v1';

const MachinePoolNodesSummary = ({
  isMultiZoneCluster,
  machinePool,
}: {
  isMultiZoneCluster: boolean;
  machinePool: MachinePool & { desired?: number };
}) => {
  if (!machinePool.autoscaling) {
    return `${machinePool.desired || machinePool.replicas}`;
  }

  const minNodes = (replicas: number | undefined) => {
    if (replicas === undefined) {
      return 0;
    }
    return replicas;
  };

  const autoScaleNodesText = `Min: ${minNodes(machinePool.autoscaling.min_replicas)}, Max: ${machinePool.autoscaling.max_replicas}`;
  if (isMultiZoneCluster) {
    return (
      <Popover
        bodyContent="Minimum and maximum node totals are calculated based on the number of zones."
        aria-label="help"
      >
        <Button className="nodes-count" variant="link">
          {autoScaleNodesText}
        </Button>
      </Popover>
    );
  }
  return autoScaleNodesText;
};

export default MachinePoolNodesSummary;
