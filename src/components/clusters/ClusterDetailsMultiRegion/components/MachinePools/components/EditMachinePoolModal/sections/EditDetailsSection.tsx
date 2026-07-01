import * as React from 'react';

import { FormGroup, GridItem, SelectOption } from '@patternfly/react-core';

import { normalizeProductID } from '~/common/normalize';
import { isMultiAZ } from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { MachineTypeSelection } from '~/components/clusters/common/ScaleSection/MachineTypeSelection/MachineTypeSelection';
import { useMachineTypeSelection } from '~/components/clusters/common/ScaleSection/useMachineTypeSelection';
import TextField from '~/components/common/formik/TextField';
import { WINDOWS_LICENSE_INCLUDED } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { MachineTypesResponse } from '~/queries/types';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';
import { MachinePool, NodePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription, ErrorState } from '~/types/types';

import SelectField from '../fields/SelectField';
import SubnetField from '../fields/SubnetField';
import { WindowsLicenseIncludedField } from '../fields/WindowsLicenseIncludedField';

type EditDetailsSectionProps = {
  cluster: ClusterFromSubscription;
  isEdit: boolean;
  machinePools: MachinePool[] | NodePool[];
  currentMPId: string | undefined;
  setCurrentMPId: (currentMPId: string) => void;
  machineTypesResponse: MachineTypesResponse;
  machineTypesErrorResponse?: Pick<ErrorState, 'errorMessage' | 'errorDetails' | 'operationID'>;
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
  machineTypesErrorResponse,
  machineTypesLoading,
}: EditDetailsSectionProps) => {
  const isHypershift = isHypershiftCluster(cluster);
  const allowWindowsLicenseIncluded = useFeatureGate(WINDOWS_LICENSE_INCLUDED) && isHypershift;
  const clusterVersion = cluster?.openshift_version || cluster?.version?.raw_id || '';
  const productId = normalizeProductID(cluster.product?.id);
  const cloudProviderID = cluster.cloud_provider?.id;
  const isBYOC = !!cluster.ccs?.enabled;
  const machineTypeSelectionProps = useMachineTypeSelection({
    fieldId: 'instanceType',
    machineTypesResponse,
    machineTypesErrorResponse,
    isMultiAz: isMultiAZ(cluster),
    isBYOC,
    cloudProviderID,
    productId,
    isMachinePool: true,
    billingModel:
      cluster.billing_model ??
      cluster.subscription?.cluster_billing_model ??
      SubscriptionCommonFieldsClusterBillingModel.standard,
    inModal: true,
  });

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
          currentMP={machinePools.find((mp) => mp.id === currentMPId) as NodePool}
        />
      ) : null}
    </FormGroup>
  ) : (
    <>
      <TextField fieldId="name" label="Machine pool name" isRequired />
      {isHypershift ? (
        <SubnetField cluster={cluster} region={region} machinePools={machinePools} />
      ) : null}
      <GridItem>
        <MachineTypeSelection {...machineTypeSelectionProps} />
      </GridItem>
      {allowWindowsLicenseIncluded ? (
        <WindowsLicenseIncludedField clusterVersion={clusterVersion} />
      ) : null}
    </>
  );
};

export default EditDetailsSection;
