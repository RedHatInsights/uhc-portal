import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FieldArray } from 'formik';
import { useDispatch } from 'react-redux';

import {
  Content,
  ContentVariants,
  ExpandableSection,
  GridItem,
  Title,
} from '@patternfly/react-core';

import { nodeKeyValueTooltipText } from '~/common/helpers';
import { validateSpotTerminationHandlerQueueUrl } from '~/common/validators';
import {
  getWorkerNodeVolumeSizeMaxGiB,
  getWorkerNodeVolumeSizeMinGiB,
} from '~/components/clusters/common/machinePools/utils';
import { MachineTypeSelection } from '~/components/clusters/common/ScaleSection/MachineTypeSelection/MachineTypeSelection';
import {
  isMachineTypeIncludedInFilteredSet,
  shouldUseRegionFilteredData,
} from '~/components/clusters/common/ScaleSection/MachineTypeSelection/machineTypeSelectionHelper';
import {
  ENHANCED_SPOT_VERSION_DISABLED_REASON,
  isEnhancedSpotVersionSupported,
  SpotInterruptionMode,
} from '~/components/clusters/common/SpotInterruptionHandling/spotInterruptionHandlingConstants';
import { SpotInterruptionHandlingFields } from '~/components/clusters/common/SpotInterruptionHandling/SpotInterruptionHandlingFields';
import { AutoScale } from '~/components/clusters/wizards/common/ClusterSettings/MachinePool/AutoScale/AutoScale';
import { canSelectImds } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import FormKeyValueList from '~/components/common/FormikFormComponents/FormKeyValueList';
import useCanClusterAutoscale from '~/hooks/useCanClusterAutoscale';
import { useFetchMachineTypes } from '~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchMachineTypes';
import { HCP_SPOT_INSTANCES, IMDS_SELECTION } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { getMachineTypesByRegionARN } from '~/redux/actions/machineTypesActions';
import { useGlobalState } from '~/redux/hooks';

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
      [FieldId.MachineType]: instanceType,
      [FieldId.SpotInterruptionHandling]: spotInterruptionHandling,
      [FieldId.SpotTerminationHandlerQueueUrl]: spotTerminationHandlerQueueUrl,
    },
    setFieldValue,
    getFieldMeta,
    setFieldTouched,
    errors,
    isValidating,
  } = useFormState();
  const dispatch = useDispatch();

  const isImdsEnabledHypershift = useFeatureGate(IMDS_SELECTION);
  const isHcpSpotInstancesEnabled = useFeatureGate(HCP_SPOT_INSTANCES);

  const isByoc = true;
  const isMultiAzSelected = isMultiAz === 'true';
  const isHypershiftSelected = isHypershift === 'true';
  const isAutoscalingEnabled = !!autoscalingEnabled;
  const hasNodeLabels = nodeLabels?.[0]?.key ?? false;
  const isSpotInterruptionEnhanced = spotInterruptionHandling === SpotInterruptionMode.Enhanced;

  const [isNodeLabelsExpanded, setIsNodeLabelsExpanded] = useState(!!hasNodeLabels);
  const [isSpotInterruptionExpanded, setIsSpotInterruptionExpanded] = useState(
    isSpotInterruptionEnhanced,
  );
  const canAutoScale = useCanClusterAutoscale(product, billingModel) ?? false;
  const clusterVersionRawId = clusterVersion?.raw_id;
  const isEnhancedSpotVersionValid = isEnhancedSpotVersionSupported(clusterVersionRawId);
  const sqsQueueUrlMeta = getFieldMeta(FieldId.SpotTerminationHandlerQueueUrl);
  const spotInterruptionQueueUrlError = errors[FieldId.SpotTerminationHandlerQueueUrl];
  const sqsQueueUrlValidationError = isSpotInterruptionEnhanced
    ? sqsQueueUrlMeta?.error ||
      (sqsQueueUrlMeta?.touched || !!spotTerminationHandlerQueueUrl?.trim()
        ? validateSpotTerminationHandlerQueueUrl(spotTerminationHandlerQueueUrl, region)
        : undefined)
    : undefined;
  const wasValidatingRef = useRef(isValidating);

  const { minWorkerVolumeSizeGiB, maxWorkerVolumeSizeGiB } = useMemo(() => {
    const minWorkerVolumeSizeGiB = getWorkerNodeVolumeSizeMinGiB(isHypershiftSelected);
    const maxWorkerVolumeSizeGiB = getWorkerNodeVolumeSizeMaxGiB(clusterVersionRawId);
    return { minWorkerVolumeSizeGiB, maxWorkerVolumeSizeGiB };
  }, [isHypershiftSelected, clusterVersionRawId]);

  const { data: machineTypesResponse, error: machineTypesError } = useFetchMachineTypes();
  const machineTypesByRegion = useGlobalState((state) => state.machineTypesByRegion);
  const useRegionFilteredData = shouldUseRegionFilteredData(product, cloudProviderID, isByoc);

  React.useEffect(() => {
    if (!installerRoleArn || !region) {
      return;
    }
    const AZs = [...new Set(selectedVpc?.aws_subnets?.map((el) => el.availability_zone))];
    dispatch(getMachineTypesByRegionARN(installerRoleArn, region, AZs));
  }, [dispatch, selectedVpc, installerRoleArn, region]);

  React.useEffect(() => {
    const availabilityOfAMachinePool =
      useRegionFilteredData &&
      instanceType &&
      !isMachineTypeIncludedInFilteredSet(instanceType?.id, machineTypesByRegion);
    setFieldValue(FieldId.MachineTypeAvailability, availabilityOfAMachinePool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFieldValue, useRegionFilteredData, instanceType]);

  React.useEffect(() => {
    // The user can go back and change the cluster version below 4.22.
    if (!isEnhancedSpotVersionValid && isSpotInterruptionEnhanced) {
      setFieldValue(FieldId.SpotInterruptionHandling, SpotInterruptionMode.Simple);
      setFieldValue(FieldId.SpotTerminationHandlerQueueUrl, '');
    }
  }, [isEnhancedSpotVersionValid, isSpotInterruptionEnhanced, setFieldValue]);

  React.useEffect(() => {
    if (wasValidatingRef.current && !isValidating && spotInterruptionQueueUrlError) {
      setIsSpotInterruptionExpanded(true);
      setFieldTouched(FieldId.SpotTerminationHandlerQueueUrl, true, false);
    }
    wasValidatingRef.current = isValidating;
  }, [isValidating, setFieldTouched, spotInterruptionQueueUrlError]);

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
            name={FieldId.NodeLabels}
            validateOnChange={false}
            render={(arrayHelpers) => (
              <FormKeyValueList
                push={arrayHelpers.push}
                remove={arrayHelpers.remove}
                addButtonDisabledTooltip={nodeKeyValueTooltipText}
              />
            )}
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
      {isHypershiftSelected && isHcpSpotInstancesEnabled ? (
        <GridItem md={10}>
          <ExpandableSection
            toggleText="Spot interruption handling"
            isExpanded={isSpotInterruptionExpanded}
            isIndented
            onToggle={(_event, isExpanded) => setIsSpotInterruptionExpanded(isExpanded)}
          >
            <SpotInterruptionHandlingFields
              mode={spotInterruptionHandling || SpotInterruptionMode.Simple}
              onModeChange={(value) => setFieldValue(FieldId.SpotInterruptionHandling, value)}
              sqsQueueUrl={spotTerminationHandlerQueueUrl || ''}
              onSqsQueueUrlChange={(value) =>
                setFieldValue(FieldId.SpotTerminationHandlerQueueUrl, value)
              }
              onSqsQueueUrlBlur={() =>
                setFieldTouched(FieldId.SpotTerminationHandlerQueueUrl, true, false)
              }
              sqsQueueUrlValidated={sqsQueueUrlValidationError ? 'error' : 'default'}
              sqsQueueUrlHelperText={sqsQueueUrlValidationError ?? undefined}
              isEnhancedDisabled={!isEnhancedSpotVersionValid}
              enhancedDisabledReason={
                isEnhancedSpotVersionValid ? undefined : ENHANCED_SPOT_VERSION_DISABLED_REASON
              }
            />
          </ExpandableSection>
        </GridItem>
      ) : null}
    </>
  );
}

export default ScaleSection;
