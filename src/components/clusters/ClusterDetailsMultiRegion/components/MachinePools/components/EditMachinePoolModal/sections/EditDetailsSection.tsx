import * as React from 'react';

import { FormGroup, SelectOption } from '@patternfly/react-core';

import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import TextField from '~/components/common/formik/TextField';
import { WINDOWS_LICENSE_INCLUDED } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { MachineTypesResponse } from '~/queries/types';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import InstanceTypeField from '../fields/InstanceTypeField';
import SelectField from '../fields/SelectField';
import SubnetField from '../fields/SubnetField';
import { WindowsLicenseIncludedField } from '../fields/WindowsLicenseIncludedField';

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
}: EditDetailsSectionProps) => {
  const isHypershift = isHypershiftCluster(cluster);
  const allowWindowsLicenseIncluded = useFeatureGate(WINDOWS_LICENSE_INCLUDED) && isHypershift;

  return isEdit ? (
    <FormGroup fieldId="machine-pool" label="Machine pool">
      <SelectField fieldId="machine-pool" onSelect={setCurrentMPId} value={currentMPId}>
        {machinePools.map((mp) => (
          <SelectOption key={mp.id} value={mp.id}>
            {mp.id || ''}
          </SelectOption>
        ))}
      </SelectField>
      {allowWindowsLicenseIncluded ? (
        <WindowsLicenseIncludedField
          isEdit
          currentMP={machinePools.find((mp) => mp.id === currentMPId)}
        />
      ) : null}
    </FormGroup>
  ) : (
    <>
      <TextField fieldId="name" label="Machine pool name" isRequired />
      {isHypershift ? <SubnetField cluster={cluster} region={region} /> : null}
      <InstanceTypeField cluster={cluster} machineTypesResponse={machineTypesResponse} />
      {allowWindowsLicenseIncluded ? <WindowsLicenseIncludedField /> : null}
    </>
  );
};

export default EditDetailsSection;
