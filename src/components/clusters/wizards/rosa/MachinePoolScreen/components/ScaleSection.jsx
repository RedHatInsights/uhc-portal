import React, { useCallback, useMemo, useState } from 'react';
import { FieldArray } from 'formik';

import {
  Content,
  ContentVariants,
  ExpandableSection,
  GridItem,
  Title,
} from '@patternfly/react-core';

import {
  getWorkerNodeVolumeSizeMaxGiB,
  getWorkerNodeVolumeSizeMinGiB,
} from '~/components/clusters/common/machinePools/utils';
import { MachineTypeSelection } from '~/components/clusters/common/ScaleSection/MachineTypeSelection/MachineTypeSelection';
import { AutoScale } from '~/components/clusters/wizards/common/ClusterSettings/MachinePool/AutoScale/AutoScale';
import { canSelectImds } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import FormKeyValueList from '~/components/common/FormikFormComponents/FormKeyValueList';
import useCanClusterAutoscale from '~/hooks/useCanClusterAutoscale';
import { useFetchMachineTypes } from '~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchMachineTypes';
import { IMDS_SELECTION } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import ComputeNodeCount from '../../../common/ClusterSettings/MachinePool/ComputeNodeCount/ComputeNodeCount';

import WorkerNodeVolumeSizeSection from './WorkerNodeVolumeSizeSection/WorkerNodeVolumeSizeSection';
import ImdsSection from './ImdsSection';
import { SecurityGroupsSectionHCP } from './SecurityGroupsSectionHCP';

function ScaleSection() {
  const {
    values: {
      [FieldId.SelectedVpc]: selectedVpc,
      [FieldId.Hypershift]: isHypershift,
      [FieldId.MultiAz]: isMultiAz,
      [FieldId.CloudProviderId]: cloudProviderID,
      [FieldId.Product]: product,
      [FieldId.AutoscalingEnabled]: autoscalingEnabled,
      [FieldId.NodeLabels]: nodeLabels,
      [FieldId.ClusterVersion]: clusterVersion,
      [FieldId.InstallerRoleArn]: installerRoleArn,
      [FieldId.Region]: region,
      [FieldId.BillingModel]: billingModel,
      [FieldId.IMDS]: imds,
    },
    setFieldValue,
  } = useFormState();

  const isImdsEnabledHypershift = useFeatureGate(IMDS_SELECTION);

  const isByoc = true;
  const isMultiAzSelected = isMultiAz === 'true';
  const isHypershiftSelected = isHypershift === 'true';
  const isAutoscalingEnabled = !!autoscalingEnabled;
  const hasNodeLabels = nodeLabels?.[0]?.key ?? false;
  const [isNodeLabelsExpanded, setIsNodeLabelsExpanded] = useState(!!hasNodeLabels);
  const canAutoScale = useCanClusterAutoscale(product, billingModel) ?? false;
  const clusterVersionRawId = clusterVersion?.raw_id;

  const { minWorkerVolumeSizeGiB, maxWorkerVolumeSizeGiB } = useMemo(() => {
    const minWorkerVolumeSizeGiB = getWorkerNodeVolumeSizeMinGiB(isHypershiftSelected);
    const maxWorkerVolumeSizeGiB = getWorkerNodeVolumeSizeMaxGiB(clusterVersionRawId);
    return { minWorkerVolumeSizeGiB, maxWorkerVolumeSizeGiB };
  }, [isHypershiftSelected, clusterVersionRawId]);

  const { data: machineTypesResponse, error: machineTypesError } = useFetchMachineTypes();

  const LabelsSectionComponent = useCallback(
    () =>
      !isHypershiftSelected ? (
        <ExpandableSection
          toggleText="Add node labels"
          isExpanded={isNodeLabelsExpanded}
          onToggle={(_event, val) => setIsNodeLabelsExpanded(val)}
        >
          <Title headingLevel="h3">Node labels (optional)</Title>
          <p className="pf-v6-u-mb-md">
            Configure labels that will apply to all nodes in this machine pool.
          </p>
          <FieldArray
            component={FormKeyValueList}
            name={FieldId.NodeLabels}
            validateOnChange={false}
          />
        </ExpandableSection>
      ) : null,
    [isHypershiftSelected, isNodeLabelsExpanded],
  );

  const ImdsSectionComponent = useCallback(
    () =>
      imds ? (
        <>
          <GridItem md={8}>
            <ImdsSection
              isDisabled={!canSelectImds(clusterVersionRawId)}
              imds={imds}
              onChangeImds={(value) => setFieldValue(FieldId.IMDS, value)}
            />
          </GridItem>
          <GridItem md={4} />
        </>
      ) : null,
    [clusterVersionRawId, imds, setFieldValue],
  );

  const WorkerNodeVolumeSizeSectionComponent = useCallback(
    () => (
      <>
        <GridItem md={6}>
          <WorkerNodeVolumeSizeSection
            minWorkerVolumeSizeGiB={minWorkerVolumeSizeGiB}
            maxWorkerVolumeSizeGiB={maxWorkerVolumeSizeGiB}
          />
        </GridItem>
        <GridItem md={6} />
      </>
    ),
    [minWorkerVolumeSizeGiB, maxWorkerVolumeSizeGiB],
  );

  return (
    <>
      {/* Instance type title (only for Hypershift) */}
      {isHypershiftSelected && (
        <>
          <GridItem>
            <Title headingLevel="h3">Machine pools settings</Title>
          </GridItem>
          <GridItem md={12}>
            <Content component={ContentVariants.p}>
              These settings apply to all created machine pools. After cluster creation, you can
              alter your compute machine count at any time, but your selected default machine pool
              instance type is permanent.
            </Content>
          </GridItem>
        </>
      )}
      {/* Instance type */}
      <GridItem md={6}>
        <MachineTypeSelection
          fieldId={FieldId.MachineType}
          machineTypesResponse={machineTypesResponse}
          machineTypesErrorResponse={machineTypesError?.error}
          selectedVpc={selectedVpc}
          installerRoleArn={installerRoleArn}
          region={region}
          isMultiAz={isMultiAzSelected}
          isBYOC={isByoc}
          cloudProviderID={cloudProviderID}
          productId={product}
          billingModel={billingModel}
        />
      </GridItem>
      <GridItem md={6} />
      {/* Cluster and default machine pool autoScaling (they use the same form prop) */}
      {canAutoScale && (
        <GridItem md={12}>
          <AutoScale />
        </GridItem>
      )}
      {/* Worker nodes */}
      {!isAutoscalingEnabled ? (
        <>
          <GridItem md={6}>
            <ComputeNodeCount />
          </GridItem>
          <GridItem md={6} />
        </>
      ) : null}

      {/* IMDS */}
      {isImdsEnabledHypershift && isHypershiftSelected ? <ImdsSectionComponent /> : null}
      {!isHypershiftSelected ? <ImdsSectionComponent /> : null}
      {/* Worker node disk size */}
      <WorkerNodeVolumeSizeSectionComponent />
      {/* Labels */}
      <LabelsSectionComponent />
      <SecurityGroupsSectionHCP
        openshiftVersion={clusterVersionRawId}
        selectedVPC={selectedVpc}
        isHypershiftSelected={isHypershiftSelected}
      />
    </>
  );
}

export default ScaleSection;
