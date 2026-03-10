import * as React from 'react';

import { FormGroup, GridItem, SelectOption } from '@patternfly/react-core';

import { normalizeProductID } from '~/common/normalize';
import { isMultiAZ } from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { MachineTypeSelection } from '~/components/clusters/common/ScaleSection/MachineTypeSelection/MachineTypeSelection';
import TextField from '~/components/common/formik/TextField';
import { WINDOWS_LICENSE_INCLUDED } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { MachineTypesResponse } from '~/queries/types';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';
import { BillingModel, Cluster, MachinePool, NodePool } from '~/types/clusters_mgmt.v1';
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
        <MachineTypeSelection
          fieldId="instanceType"
          machineTypesResponse={machineTypesResponse}
          machineTypesErrorResponse={machineTypesErrorResponse}
          isMultiAz={isMultiAZ(cluster)}
          isBYOC={!!cluster.ccs?.enabled}
          cloudProviderID={cluster.cloud_provider?.id}
          productId={normalizeProductID(cluster.product?.id)}
          isMachinePool
          billingModel={
            (cluster as Cluster).billing_model ||
            ((cluster as ClusterFromSubscription).subscription
              ?.cluster_billing_model as BillingModel) ||
            SubscriptionCommonFieldsClusterBillingModel.standard
          }
          inModal
        />
      </GridItem>
      {allowWindowsLicenseIncluded ? (
        <WindowsLicenseIncludedField clusterVersion={clusterVersion} />
      ) : null}
    </>
  );
};

export default EditDetailsSection;
