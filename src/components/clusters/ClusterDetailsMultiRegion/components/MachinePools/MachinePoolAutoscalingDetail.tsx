import React from 'react';

import { Split, SplitItem, Title } from '@patternfly/react-core';

import { MachinePoolAutoscaling } from '~/types/clusters_mgmt.v1';

const getReplicas = (replicas: number | undefined, isMultiZone: boolean) => {
  if (replicas === undefined) {
    return 0;
  }
  return isMultiZone ? replicas / 3 : replicas;
};

const MachinePoolAutoScalingDetail = ({
  isMultiZoneCluster,
  autoscaling,
  isMultiZoneMachinePool,
}: {
  isMultiZoneCluster: boolean;
  autoscaling: MachinePoolAutoscaling;
  isMultiZoneMachinePool: boolean;
}) => (
  <>
    <Title headingLevel="h4" className="pf-v6-u-mb-sm pf-v6-u-mt-lg">
      Autoscaling
    </Title>
    <Split hasGutter>
      <SplitItem>
        <Title headingLevel="h4" className="autoscale__lim">{`Min nodes ${
          isMultiZoneMachinePool ? 'per zone' : ''
        }`}</Title>
        {getReplicas(autoscaling.min_replicas, isMultiZoneMachinePool)}
      </SplitItem>
      <SplitItem>
        <Title headingLevel="h4" className="autoscale__lim">{`Max nodes ${
          isMultiZoneMachinePool ? 'per zone' : ''
        }`}</Title>
        {getReplicas(autoscaling.max_replicas, isMultiZoneMachinePool)}
      </SplitItem>
    </Split>
  </>
);

export default MachinePoolAutoScalingDetail;
