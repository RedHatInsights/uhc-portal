import * as React from 'react';
import { useFormikContext } from 'formik';

import { Flex, FlexItem, Spinner } from '@patternfly/react-core';

import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { getNodeOptions } from '~/components/clusters/common/machinePools/utils';
import { MachineTypesResponse } from '~/queries/types';
import { useGlobalState } from '~/redux/hooks';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import MachinePoolsAutoScalingWarning from '../../../MachinePoolAutoscalingWarning';
import { getClusterMinNodes } from '../../../machinePoolsHelper';
import ResizingAlert from '../components/ResizingAlert';
import AutoscaleMaxReplicasField from '../fields/AutoscaleMaxReplicasField';
import AutoscaleMinReplicasField from '../fields/AutoscaleMinReplicasField';
import AutoscalingField from '../fields/AutoscalingField';
import NodeCountField from '../fields/NodeCountField';
import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';

type EditNodeCountSectionProps = {
  machinePool: MachinePool | undefined;
  machinePools: MachinePool[];
  cluster: ClusterFromSubscription;
  machineTypes: MachineTypesResponse;
  allow249NodesOSDCCSROSA: boolean;
};

const EditNodeCountSection = ({
  machinePool,
  machinePools,
  cluster,
  machineTypes,
  allow249NodesOSDCCSROSA,
}: EditNodeCountSectionProps) => {
  const { values } = useFormikContext<EditMachinePoolValues>();

  const hasClusterAutoScaler = useGlobalState((state) => state.clusterAutoscaler.hasAutoscaler);
  const organization = useGlobalState((state) => state.userProfile.organization);

  const minNodesRequired = getClusterMinNodes({
    cluster,
    machineTypesResponse: machineTypes,
    machinePool,
    machinePools,
  });

  const options = React.useMemo(
    () =>
      getNodeOptions({
        cluster,
        machinePool,
        machinePools,
        machineTypeId: values.instanceType,
        machineTypes,
        quota: organization.quotaList,
        minNodes: minNodesRequired,
        editMachinePoolId: machinePool?.id,
        allow249NodesOSDCCSROSA,
      }),
    [
      cluster,
      machinePool,
      machinePools,
      values.instanceType,
      machineTypes,
      organization.quotaList,
      minNodesRequired,
      allow249NodesOSDCCSROSA,
    ],
  );

  return (
    <>
      <AutoscalingField cluster={cluster} />
      {organization.pending ? (
        <div>
          <Spinner size="md" aria-label="Loading..." />
          &nbsp;Loading quota...
        </div>
      ) : (
        <>
          {values.autoscaling ? (
            <Flex>
              <FlexItem>
                <AutoscaleMinReplicasField
                  minNodes={minNodesRequired}
                  cluster={cluster}
                  mpAvailZones={machinePool?.availability_zones?.length}
                  options={options}
                />
              </FlexItem>
              <FlexItem>
                <AutoscaleMaxReplicasField
                  mpAvailZones={machinePool?.availability_zones?.length}
                  minNodes={minNodesRequired}
                  cluster={cluster}
                  options={options}
                />
              </FlexItem>
            </Flex>
          ) : (
            <NodeCountField
              mpAvailZones={machinePool?.availability_zones?.length}
              minNodesRequired={minNodesRequired}
              cluster={cluster}
              options={options}
            />
          )}
          {!isHypershiftCluster(cluster) && (
            <MachinePoolsAutoScalingWarning
              hasClusterAutoScaler={hasClusterAutoScaler}
              hasAutoscalingMachinePools={machinePools.some((mp) => !!mp.autoscaling)}
              isEnabledOnCurrentPool={values.autoscaling}
              warningType={machinePool ? 'editMachinePool' : 'addMachinePool'}
            />
          )}
          {machinePool?.id && (
            <ResizingAlert
              autoscalingEnabled={values.autoscaling}
              autoScaleMaxNodesValue={values.autoscaleMax}
              cluster={cluster}
              machinePools={machinePools}
              selectedMachinePoolID={machinePool.id}
              replicasValue={values.replicas}
            />
          )}
        </>
      )}
    </>
  );
};

export default EditNodeCountSection;
