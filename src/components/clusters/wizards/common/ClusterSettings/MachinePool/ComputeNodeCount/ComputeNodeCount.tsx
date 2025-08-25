import React, { useMemo, useState } from 'react';
import { Field } from 'formik';

import { FormHelperText, HelperText, Tooltip } from '@patternfly/react-core';

import { noQuotaTooltip } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import { required, validateNumericInput } from '~/common/validators';
import {
  getMinNodesRequired,
  getNodeIncrement,
  getNodeIncrementHypershift,
} from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/machinePoolsHelper';
import {
  buildOptions,
  getAvailableQuota as getAvailableQuotaUtil,
  getIncludedNodes,
} from '~/components/clusters/common/machinePools/utils';
import { computeNodeHintText } from '~/components/clusters/common/ScaleSection/AutoScaleSection/AutoScaleHelper';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { MAX_NODES_TOTAL_249 } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks';

import NodeCountInput from './NodeCountInput';

type HypershiftNodesDescriptionProps = {
  isHypershift: true;
  isMultiAz?: false;
  poolsLength: number;
  sumOfTotalNodes: number;
  nodes?: never;
};

type MultiAzNodesDescriptionProps = {
  isHypershift?: false;
  isMultiAz: true;
  nodes: number;
  poolsLength?: never;
  sumOfTotalNodes?: never;
};

type TotalNodesDescriptionProps = HypershiftNodesDescriptionProps | MultiAzNodesDescriptionProps;

export const TotalNodesDescription = ({
  isHypershift,
  poolsLength,
  sumOfTotalNodes,
  isMultiAz,
  nodes,
}: TotalNodesDescriptionProps) => {
  if (isHypershift) {
    return (
      <span data-testid="compute-node-hcp-multizone-details">
        x {poolsLength} machine pools = {sumOfTotalNodes} compute nodes
      </span>
    );
  }
  return isMultiAz ? (
    <span data-testid="compute-node-multizone-details">
      × 3 zones = {Number(nodes) * 3} compute nodes
    </span>
  ) : null;
};

const ComputeNodeCount = ({
  isEditingCluster = false,
  isMachinePool = false,
}: {
  isEditingCluster?: boolean;
  isMachinePool?: boolean;
}) => {
  const {
    values: {
      [FieldId.Hypershift]: isHypershift,
      [FieldId.MultiAz]: isMultiAz,
      [FieldId.MachineType]: machineType,
      [FieldId.CloudProviderId]: cloudProviderID,
      [FieldId.Product]: product,
      [FieldId.ClusterVersion]: clusterVersion,
      [FieldId.MachinePoolsSubnets]: machinePoolsSubnets,
      [FieldId.BillingModel]: billingModel,
      [FieldId.Byoc]: byoc,
      [FieldId.NodesCompute]: nodes,
    },
    getFieldProps,
    getFieldMeta,
    setFieldValue,
    validateField,
  } = useFormState();

  // re-run validation if machine type has changed
  React.useEffect(() => {
    validateField(FieldId.NodesCompute);
  }, [machineType, validateField]);

  const machineTypes = useGlobalState((state) => state.machineTypes);
  const quota = useGlobalState((state) => state.userProfile.organization.quotaList);
  const allow249NodesOSDCCSROSA = useFeatureGate(MAX_NODES_TOTAL_249);

  const [nodesComputeErrorMessage, setNodesComputeErrorMessage] = useState<string>();

  const isMultiAzSelected = isMultiAz === 'true';
  const isByoc = byoc === 'true';
  const poolsLength = machinePoolsSubnets?.length;
  const isHypershiftSelected = isHypershift === 'true';
  const clusterVersionRawId = clusterVersion?.raw_id;
  const included = getIncludedNodes({
    isMultiAz: isMultiAzSelected,
    isHypershift: !isMachinePool,
  });

  const minNodesRequired = useMemo(
    () =>
      getMinNodesRequired(
        isHypershiftSelected,
        { numMachinePools: poolsLength },
        { isDefaultMachinePool: true, isByoc, isMultiAz: isMultiAzSelected },
      ),
    [poolsLength, isHypershiftSelected, isByoc, isMultiAzSelected],
  );

  const increment = useMemo(
    () =>
      isHypershiftSelected
        ? getNodeIncrementHypershift(poolsLength)
        : getNodeIncrement(isMultiAzSelected),
    [isHypershiftSelected, isMultiAzSelected, poolsLength],
  );

  const available = React.useMemo(
    () =>
      getAvailableQuotaUtil({
        quota,
        isByoc,
        billingModel,
        cloudProviderID,
        isMultiAz: isMultiAzSelected,
        machineTypes,
        machineTypeId: machineType,
        product,
      }),
    [
      quota,
      isByoc,
      billingModel,
      cloudProviderID,
      isMultiAzSelected,
      machineTypes,
      machineType,
      product,
    ],
  );

  const totalMaxNodes = React.useMemo(() => {
    // get the array of possible node count values to extract the max value
    const acceptableValues = buildOptions({
      included,
      available,
      isEditingCluster,
      currentNodeCount: 0,
      minNodes: minNodesRequired,
      increment,
      isHypershift: isHypershiftSelected,
      clusterVersion: clusterVersionRawId,
      allow249NodesOSDCCSROSA,
    });
    return acceptableValues[acceptableValues.length - 1];
  }, [
    included,
    available,
    minNodesRequired,
    increment,
    isHypershiftSelected,
    allow249NodesOSDCCSROSA,
    clusterVersionRawId,
    isEditingCluster,
  ]);

  const maxUserInputNodes = totalMaxNodes / increment;
  const minUserInputNodes = minNodesRequired / increment;

  let notEnoughQuota = !totalMaxNodes;

  // for BYOC lacking node quota machineType will be undefined
  if (isByoc && !isEditingCluster && !isMachinePool) {
    notEnoughQuota = !machineType || !totalMaxNodes;
  }

  const validateNodes = (value: number) => {
    const stringValue = value?.toString();
    const requiredError = required(stringValue);
    const minNodesError = validateNumericInput(stringValue, {
      min: minUserInputNodes,
      allowZero: true,
    });
    const maxNodesError = validateNumericInput(stringValue, {
      max: maxUserInputNodes,
      allowZero: true,
    });
    return requiredError || minNodesError || maxNodesError;
  };

  const fieldLabel = useMemo(() => {
    const label = 'Compute node count';
    if (isHypershiftSelected) {
      return `${label} (per machine pool)`;
    }
    return isMultiAzSelected ? `${label} (per zone)` : label;
  }, [isHypershiftSelected, isMultiAzSelected]);

  let totalNodesDescription: React.ReactNode = null;

  if (isHypershiftSelected) {
    totalNodesDescription = (
      <TotalNodesDescription
        isHypershift
        poolsLength={poolsLength}
        sumOfTotalNodes={Number(nodes) * increment}
      />
    );
  } else if (isMultiAzSelected) {
    totalNodesDescription = <TotalNodesDescription isMultiAz nodes={nodes} />;
  }

  const fieldComponent = (
    <Field
      component={NodeCountInput}
      name={FieldId.NodesCompute}
      validate={(value: number) => validateNodes(value)}
      input={{
        ...getFieldProps(FieldId.NodesCompute),
        onChange: (value: number) => {
          setFieldValue(FieldId.NodesCompute, value, true);
        },
      }}
      meta={getFieldMeta(FieldId.NodesCompute)}
      label={fieldLabel}
      extendedHelpText={
        <>
          {computeNodeHintText(isHypershiftSelected, false)}{' '}
          <ExternalLink href={links.ROSA_SERVICE_DEFINITION_COMPUTE}>
            Learn more about compute node count
          </ExternalLink>
        </>
      }
      minNodes={minUserInputNodes}
      maxNodes={maxUserInputNodes}
      buttonAriaLabel="Compute node count information"
      displayError={(_: string, error: string) => setNodesComputeErrorMessage(error)}
      hideError={() => setNodesComputeErrorMessage(undefined)}
      isDisabled={notEnoughQuota}
    />
  );

  return (
    <>
      {notEnoughQuota ? (
        <Tooltip content={noQuotaTooltip} position="left">
          {fieldComponent}
        </Tooltip>
      ) : (
        fieldComponent
      )}
      {nodesComputeErrorMessage ? (
        <FormGroupHelperText touched variant="error">
          {nodesComputeErrorMessage}
        </FormGroupHelperText>
      ) : (
        <FormHelperText>
          <HelperText>{totalNodesDescription}</HelperText>
        </FormHelperText>
      )}
    </>
  );
};

export default ComputeNodeCount;
