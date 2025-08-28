import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Field } from 'formik';
import isEqual from 'lodash/isEqual';

import { Flex, FormGroup } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { required, validateNumericInput } from '~/common/validators';
import { getMinNodesRequired } from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/machinePoolsHelper';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { MAX_NODES_INSUFFICIEN_VERSION as MAX_NODES_180 } from '~/components/clusters/common/machinePools/constants';
import { getMaxNodesHCP, getMaxWorkerNodes } from '~/components/clusters/common/machinePools/utils';
import getMinNodesAllowed from '~/components/clusters/common/ScaleSection/AutoScaleSection/AutoScaleHelper';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId as RosaFieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';
import { usePreviousProps } from '~/hooks/usePreviousProps';
import { MAX_NODES_TOTAL_249 } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { NodesInput } from './NodesInput';

export const AutoScaleEnabledInputs = () => {
  const {
    setFieldValue,
    setFieldTouched,
    getFieldProps,
    getFieldMeta,
    validateForm,
    values: {
      [RosaFieldId.Hypershift]: hypershiftValue,
      [RosaFieldId.AutoscalingEnabled]: autoscalingEnabled,
      [RosaFieldId.MachinePoolsSubnets]: machinePoolsSubnets,
      [RosaFieldId.MultiAz]: multiAz,
      [RosaFieldId.MinReplicas]: minReplicas,
      [RosaFieldId.MaxReplicas]: maxReplicas,
      [RosaFieldId.Product]: product,
      [RosaFieldId.Byoc]: byoc,
      [RosaFieldId.ClusterVersion]: clusterVersion,
    },
  } = useFormState();

  const allow249NodesOSDCCSROSA = useFeatureGate(MAX_NODES_TOTAL_249);

  const poolsLength = useMemo(
    () => machinePoolsSubnets?.length ?? 1,
    [machinePoolsSubnets?.length],
  );
  const [minErrorMessage, setMinErrorMessage] = useState<string>();
  const [maxErrorMessage, setMaxErrorMessage] = useState<string>();
  const isMultiAz = multiAz === 'true';
  const isHypershiftSelected = hypershiftValue === 'true';
  const isByoc = byoc === 'true';
  const isRosa = product === normalizedProducts.ROSA;

  const minNodesLabel = useMemo(() => {
    if (isHypershiftSelected) {
      return 'Minimum nodes per machine pool';
    }
    return isMultiAz ? 'Minimum nodes per zone' : 'Minimum node count';
  }, [isHypershiftSelected, isMultiAz]);

  const maxNodesLabel = useMemo(() => {
    if (isHypershiftSelected) {
      return 'Maximum nodes per machine pool';
    }
    return isMultiAz ? 'Maximum nodes per zone' : 'Maximum node count';
  }, [isHypershiftSelected, isMultiAz]);

  const minNodesRequired = useMemo(
    () =>
      getMinNodesRequired(
        isHypershiftSelected,
        { numMachinePools: poolsLength },
        { isDefaultMachinePool: !isHypershiftSelected, isByoc, isMultiAz },
      ),
    [poolsLength, isHypershiftSelected, isByoc, isMultiAz],
  );

  const defaultMinAllowed = useMemo(() => {
    if (isHypershiftSelected) {
      return poolsLength > 1 ? 1 : 2;
    }
    return minNodesRequired;
  }, [isHypershiftSelected, minNodesRequired, poolsLength]);

  const helperText = (
    message: React.ReactNode,
    variant: 'default' | 'indeterminate' | 'warning' | 'success' | 'error' = 'default',
  ) => (
    <FormGroupHelperText touched variant={variant}>
      {message}
    </FormGroupHelperText>
  );

  const nodesHelpText = useCallback(
    (nodes = '0') => {
      if (isHypershiftSelected) {
        return helperText(`x ${poolsLength} machine pools = ${parseInt(nodes, 10) * poolsLength}`);
      }
      return isMultiAz ? helperText(`x 3 zones = ${parseInt(nodes, 10) * 3}`) : null;
    },
    [isHypershiftSelected, isMultiAz, poolsLength],
  );

  const minNodes = useMemo(() => {
    const minNodesAllowed = getMinNodesAllowed({
      isDefaultMachinePool: !isHypershiftSelected,
      product,
      isBYOC: isByoc,
      isMultiAz,
      autoScaleMinNodesValue: undefined,
      defaultMinAllowed,
      isHypershiftWizard: isHypershiftSelected,
    });

    if (minNodesAllowed) {
      return minNodesAllowed / (isMultiAz && !isHypershiftSelected ? 3 : 1);
    }
    return undefined;
  }, [product, isByoc, isMultiAz, defaultMinAllowed, isHypershiftSelected]);

  const maxNodes = useMemo(() => {
    const maxWorkerNodes = allow249NodesOSDCCSROSA
      ? getMaxWorkerNodes(clusterVersion.raw_id)
      : MAX_NODES_180;
    if (isHypershiftSelected) {
      return Math.floor(getMaxNodesHCP(clusterVersion?.raw_id) / poolsLength);
    }
    if (isMultiAz) {
      return maxWorkerNodes / 3;
    }
    return maxWorkerNodes;
  }, [
    isMultiAz,
    isHypershiftSelected,
    poolsLength,
    allow249NodesOSDCCSROSA,
    clusterVersion?.raw_id,
  ]);

  useEffect(() => {
    if (maxReplicas) {
      // to trigger MaxReplicas field validation
      setFieldValue(RosaFieldId.MaxReplicas, maxReplicas, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minReplicas]);

  const validateNodes = (value: number) => {
    const stringValue = value?.toString();
    const requiredError = required(stringValue);
    const minNodesError = validateNumericInput(stringValue, {
      min: minNodes,
      allowZero: true,
    });
    const maxNodesError = validateNumericInput(stringValue, {
      max: maxNodes,
      allowZero: true,
    });
    return requiredError || minNodesError || maxNodesError || undefined;
  };

  const validateMaxNodes = (value: number): string | undefined => {
    const nodesError = validateNodes(value);
    if (nodesError) {
      return nodesError;
    }
    return minReplicas && value < minReplicas
      ? 'Max nodes cannot be less than min nodes.'
      : undefined;
  };

  const prevMachinePoolsSubnets = usePreviousProps(machinePoolsSubnets);

  // Validate max nodes on subnetChanges
  React.useEffect(() => {
    if (!isEqual(machinePoolsSubnets, prevMachinePoolsSubnets)) {
      setMaxErrorMessage(validateMaxNodes(maxReplicas));
      validateForm();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machinePoolsSubnets, prevMachinePoolsSubnets, maxReplicas]);

  useEffect(() => {
    if (autoscalingEnabled && minNodes) {
      const minAutoscaleValue = minReplicas ? parseInt(minReplicas, 10) : 0;
      const min = minAutoscaleValue < minNodes ? minNodes : minAutoscaleValue;

      if (min) {
        setFieldValue(RosaFieldId.MinReplicas, min);
      }
      if (!maxReplicas || (maxReplicas < min && maxReplicas < minNodes)) {
        setFieldValue(RosaFieldId.MaxReplicas, minNodes, true);
        setMaxErrorMessage(validateMaxNodes(maxReplicas));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoscalingEnabled, isMultiAz, minNodes, setFieldValue]);

  return (
    <Flex
      flexWrap={{ default: 'nowrap' }}
      spaceItems={{ default: 'spaceItemsMd' }}
      className="pf-v6-u-mt-md"
    >
      <FormGroup
        label={minNodesLabel}
        isRequired
        fieldId="nodes_min"
        className="autoscaling__nodes-formGroup"
      >
        <Field
          component={NodesInput}
          name={RosaFieldId.MinReplicas}
          type="text"
          ariaLabel="Minimum nodes"
          validate={(value: number) => validateNodes(value)}
          displayError={(_: string, error: string) => setMinErrorMessage(error)}
          hideError={() => setMinErrorMessage(undefined)}
          limit="min"
          min={minNodes}
          max={maxNodes}
          input={{
            ...getFieldProps(RosaFieldId.MinReplicas),
            onChange: (value: number) => {
              setFieldValue(RosaFieldId.MinReplicas, value, true);
              setFieldTouched(RosaFieldId.MinReplicas, true, false);
            },
          }}
          meta={getFieldMeta(RosaFieldId.MinReplicas)}
        />

        {!minErrorMessage ? nodesHelpText(minReplicas) : helperText(minErrorMessage, 'error')}
      </FormGroup>
      <FormGroup
        label={maxNodesLabel}
        isRequired
        fieldId="nodes_max"
        className="autoscaling__nodes-formGroup"
        labelHelp={
          <PopoverHint
            hint={
              <>
                {isHypershiftSelected
                  ? constants.hcpComputeNodeCountHintWizard
                  : constants.computeNodeCountHint}
                <br />
                {isRosa ? (
                  <>
                    <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                      Learn more about worker/compute node count
                    </ExternalLink>
                    <br />
                  </>
                ) : null}
              </>
            }
          />
        }
      >
        <Field
          component={NodesInput}
          name={RosaFieldId.MaxReplicas}
          type="text"
          ariaLabel="Maximum nodes"
          validate={(value: number) => validateMaxNodes(value)}
          displayError={(_: string, error: string) => setMaxErrorMessage(error)}
          hideError={() => setMaxErrorMessage(undefined)}
          limit="max"
          min={minNodes}
          max={maxNodes}
          input={{
            ...getFieldProps(RosaFieldId.MaxReplicas),
            onChange: (value: number) => {
              setFieldValue(RosaFieldId.MaxReplicas, value, true);
              setFieldTouched(RosaFieldId.MaxReplicas, true, false);
            },
          }}
          meta={getFieldMeta(RosaFieldId.MaxReplicas)}
        />
        {!maxErrorMessage ? nodesHelpText(maxReplicas) : helperText(maxErrorMessage, 'error')}
      </FormGroup>
    </Flex>
  );
};
