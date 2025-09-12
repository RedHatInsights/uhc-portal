import * as React from 'react';

import { FormGroup, SelectOption } from '@patternfly/react-core';

import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import TextField from '~/components/common/formik/TextField';
import { MachineTypesResponse } from '~/queries/types';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import InstanceTypeField from '../fields/InstanceTypeField';
import SelectField from '../fields/SelectField';
import SubnetField from '../fields/SubnetField';

type EditDetailsSectionProps = {
  cluster: ClusterFromSubscription;
  isEdit: boolean;
  machinePools: MachinePool[];
  currentMPId: string | undefined;
  setCurrentMPId: (currentMPId: string) => void;
  machineTypesResponse: MachineTypesResponse;
  machineTypesLoading: boolean;
  region?: string;
};

const EditDetailsSection = ({
  cluster,
  isEdit,
  region,
  machinePools,
  setCurrentMPId,
  currentMPId,
  machineTypesResponse,
  machineTypesLoading,
}: EditDetailsSectionProps) =>
  isEdit ? (
    <FormGroup fieldId="machine-pool" label="Machine pool">
      <SelectField fieldId="machine-pool" onSelect={setCurrentMPId} value={currentMPId}>
        {machinePools.map((mp) => (
          <SelectOption key={mp.id} value={mp.id}>
            {mp.id || ''}
          </SelectOption>
        ))}
      </SelectField>
    </FormGroup>
  ) : (
    <>
      <TextField fieldId="name" label="Machine pool name" isRequired />
      {isHypershiftCluster(cluster) ? (
        <SubnetField cluster={cluster} region={region} machinePools={machinePools} />
      ) : null}
      <InstanceTypeField cluster={cluster} machineTypesResponse={machineTypesResponse} />
    </>
  );

export default EditDetailsSection;
