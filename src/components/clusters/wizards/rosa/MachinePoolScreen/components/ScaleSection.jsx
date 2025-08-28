import React, { useCallback, useMemo, useState } from 'react';
import { Field, FieldArray } from 'formik';

import {
  Content,
  ContentVariants,
  ExpandableSection,
  GridItem,
  Title,
} from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { required } from '~/common/validators';
import {
  getMinNodesRequired,
  getNodeIncrement,
  getNodeIncrementHypershift,
} from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/machinePoolsHelper';
import {
  getWorkerNodeVolumeSizeMaxGiB,
  getWorkerNodeVolumeSizeMinGiB,
} from '~/components/clusters/common/machinePools/utils';
import NodeCountInput from '~/components/clusters/common/NodeCountInput';
import { computeNodeHintText } from '~/components/clusters/common/ScaleSection/AutoScaleSection/AutoScaleHelper';
import MachineTypeSelection from '~/components/clusters/common/ScaleSection-deprecated/MachineTypeSelection';
import { AutoScale } from '~/components/clusters/wizards/common/ClusterSettings/MachinePool/AutoScale/AutoScale';
import { canSelectImds } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import FormKeyValueList from '~/components/common/FormikFormComponents/FormKeyValueList';
import useCanClusterAutoscale from '~/hooks/useCanClusterAutoscale';
import { IMDS_SELECTION, MAX_NODES_TOTAL_249 } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import WorkerNodeVolumeSizeSection from './WorkerNodeVolumeSizeSection/WorkerNodeVolumeSizeSection';
import ImdsSection from './ImdsSection';

function ScaleSection() {
  const {
    values: {
      [FieldId.SelectedVpc]: selectedVpc,
      [FieldId.Hypershift]: isHypershift,
      [FieldId.MultiAz]: isMultiAz,
      [FieldId.MachineType]: machineType,
      [FieldId.CloudProviderId]: cloudProviderID,
      [FieldId.Product]: product,
      [FieldId.AutoscalingEnabled]: autoscalingEnabled,
      [FieldId.NodeLabels]: nodeLabels,
      [FieldId.ClusterVersion]: clusterVersion,
      [FieldId.MachinePoolsSubnets]: machinePoolsSubnets,
      [FieldId.InstallerRoleArn]: installerRoleArn,
      [FieldId.Region]: region,
      [FieldId.BillingModel]: billingModel,
      [FieldId.IMDS]: imds,
    },
    setFieldValue,
    setFieldTouched,
    getFieldProps,
    getFieldMeta,
  } = useFormState();

  const isImdsEnabledHypershift = useFeatureGate(IMDS_SELECTION);

  const isByoc = true;
  const poolsLength = machinePoolsSubnets?.length;
  const isMultiAzSelected = isMultiAz === 'true';
  const isHypershiftSelected = isHypershift === 'true';
  const isAutoscalingEnabled = !!autoscalingEnabled;
  const hasNodeLabels = nodeLabels?.[0]?.key ?? false;
  const [isNodeLabelsExpanded, setIsNodeLabelsExpanded] = useState(!!hasNodeLabels);
  const canAutoScale = useCanClusterAutoscale(product, billingModel) ?? false;
  const allow249NodesOSDCCSROSA = useFeatureGate(MAX_NODES_TOTAL_249);
  const clusterVersionRawId = clusterVersion?.raw_id;

  const minNodesRequired = useMemo(
    () =>
      getMinNodesRequired(
        isHypershiftSelected,
        { numMachinePools: poolsLength },
        { isDefaultMachinePool: true, isByoc, isMultiAz: isMultiAzSelected },
      ),
    [poolsLength, isHypershiftSelected, isByoc, isMultiAzSelected],
  );

  const { minWorkerVolumeSizeGiB, maxWorkerVolumeSizeGiB } = useMemo(() => {
    const minWorkerVolumeSizeGiB = getWorkerNodeVolumeSizeMinGiB(isHypershiftSelected);
    const maxWorkerVolumeSizeGiB = getWorkerNodeVolumeSizeMaxGiB(clusterVersionRawId);
    return { minWorkerVolumeSizeGiB, maxWorkerVolumeSizeGiB };
  }, [isHypershiftSelected, clusterVersionRawId]);

  const nodeIncrement = useMemo(
    () =>
      isHypershiftSelected
        ? getNodeIncrementHypershift(poolsLength)
        : getNodeIncrement(isMultiAzSelected),
    [isHypershiftSelected, isMultiAzSelected, poolsLength],
  );
  const nonAutoScaleNodeLabel = useMemo(() => {
    const label = 'Compute node count';

    if (isHypershiftSelected) {
      return `${label} (per machine pool)`;
    }
    return isMultiAzSelected ? `${label} (per zone)` : label;
  }, [isHypershiftSelected, isMultiAzSelected]);

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
        <Field
          component={MachineTypeSelection}
          selectedVpc={selectedVpc}
          name={FieldId.MachineType}
          installerRoleArn={installerRoleArn}
          region={region}
          validate={required}
          isMultiAz={isMultiAzSelected}
          isBYOC={isByoc}
          cloudProviderID={cloudProviderID}
          product={product}
          billingModel={billingModel}
          machine_type={{
            input: {
              ...getFieldProps(FieldId.MachineType),
              onChange: (value) => {
                setFieldValue(FieldId.MachineType, value, true);
                setTimeout(() => setFieldTouched(FieldId.MachineType), 1);
              },
            },
            meta: getFieldMeta(FieldId.MachineType),
          }}
          machine_type_force_choice={{
            input: {
              ...getFieldProps(FieldId.MachineTypeForceChoice),
              onChange: (value) => setFieldValue(FieldId.MachineTypeForceChoice, value),
            },
          }}
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
            <Field
              component={NodeCountInput}
              name={FieldId.NodesCompute}
              buttonAriaLabel="Compute node count information"
              label={nonAutoScaleNodeLabel}
              isMultiAz={isMultiAzSelected}
              isByoc={isByoc}
              machineType={machineType}
              extendedHelpText={
                <>
                  {computeNodeHintText(isHypershiftSelected, false)}{' '}
                  <ExternalLink href={links.ROSA_SERVICE_DEFINITION_COMPUTE}>
                    Learn more about compute node count
                  </ExternalLink>
                </>
              }
              cloudProviderID={cloudProviderID}
              product={product}
              minNodes={minNodesRequired}
              increment={nodeIncrement}
              billingModel={billingModel}
              isHypershiftWizard={isHypershiftSelected}
              poolNumber={poolsLength}
              clusterVersion={clusterVersionRawId}
              allow249NodesOSDCCSROSA={allow249NodesOSDCCSROSA}
              input={{
                ...getFieldProps(FieldId.NodesCompute),
                onChange: (value) => setFieldValue(FieldId.NodesCompute, value),
              }}
            />
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
    </>
  );
}

export default ScaleSection;
