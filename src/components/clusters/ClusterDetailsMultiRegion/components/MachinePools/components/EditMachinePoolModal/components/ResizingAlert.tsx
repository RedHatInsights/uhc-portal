import * as React from 'react';

import { Alert } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { Link } from '~/common/routing';
import ExternalLink from '~/components/common/ExternalLink';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { masterResizeAlertThreshold } from './utils';

type ResizingAlertProps = {
  autoscalingEnabled: boolean;
  selectedMachinePoolID: string;
  replicasValue: number;
  cluster: ClusterFromSubscription;
  machinePools: MachinePool[];
  autoScaleMaxNodesValue: number;
};

const ResizingAlert = ({
  autoscalingEnabled,
  cluster,
  autoScaleMaxNodesValue,
  replicasValue,
  selectedMachinePoolID,
  machinePools,
}: ResizingAlertProps) => {
  const masterThreshold = masterResizeAlertThreshold({
    cluster,
    requestedNodes: autoscalingEnabled ? autoScaleMaxNodesValue : replicasValue,
    selectedMachinePoolID,
    machinePools,
  });
  return masterThreshold ? (
    <Alert
      variant="warning"
      isInline
      title={
        autoscalingEnabled
          ? `Autoscaling to a maximum node count of more than ${masterThreshold} nodes may trigger manual Red Hat SRE intervention`
          : `Scaling node count to more than ${masterThreshold} nodes may trigger manual Red Hat SRE intervention`
      }
    >
      <p>
        Node scaling is automatic and will be performed immediately. Scaling node count beyond Red
        Hat&apos;s{' '}
        <ExternalLink href={links.ROSA_AWS_CLASSIC_LIMITS_SCALE} noIcon>
          documented thresholds
        </ExternalLink>{' '}
        may trigger manual Red Hat SRE intervention to vertically scale your Infrastructure and
        Control Plane instances.{' '}
        {autoScaleMaxNodesValue &&
          'Autoscaling nodes will not trigger manual intervention until the actual node count crosses the threshold. '}
        To request that Red Hat SRE proactively increase your Infrastructure and Control Plane
        instances, please open a <Link to={`/details/${cluster.id}#support`}>support case</Link>.
      </p>
    </Alert>
  ) : null;
};

export default ResizingAlert;
