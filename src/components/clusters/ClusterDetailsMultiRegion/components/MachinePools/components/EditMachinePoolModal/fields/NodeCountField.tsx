import * as React from 'react';
import { useField } from 'formik';

import { FormGroup, NumberInput, Tooltip } from '@patternfly/react-core';

import { noQuotaTooltip } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import { normalizeProductID } from '~/common/normalize';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { validateNumericInput } from '~/common/validators';
import { isMPoolAz } from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import ExternalLink from '~/components/common/ExternalLink';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';
import { ClusterFromSubscription } from '~/types/types';

const fieldId = 'replicas';

type NodeCountFieldProps = {
  mpAvailZones: number | undefined;
  minNodesRequired: number;
  maxNodes: number;
  cluster: ClusterFromSubscription;
};

const validateNodeCount = (value: number, min: number, max: number): string | undefined => {
  if (Number.isNaN(value)) {
    return 'Please enter a valid number.';
  }
  return validateNumericInput(value.toString(), { min, max });
};

const NodeCountField = ({
  minNodesRequired,
  maxNodes,
  cluster,
  mpAvailZones,
}: NodeCountFieldProps) => {
  const isMultizoneMachinePool = isMPoolAz(cluster, mpAvailZones);

  // For multizone, we display and input per-zone values
  const minNodesDisplay = isMultizoneMachinePool ? minNodesRequired / 3 : minNodesRequired;
  const maxNodesDisplay = isMultizoneMachinePool ? maxNodes / 3 : maxNodes;

  const [field, meta, helpers] = useField<number>({
    name: fieldId,
    validate: (value) => {
      // Validate the per-zone value for display
      const displayValue = isMultizoneMachinePool ? value / 3 : value;
      return validateNodeCount(displayValue, minNodesDisplay, maxNodesDisplay);
    },
  });

  const displayValue = isMultizoneMachinePool ? field.value / 3 : field.value;
  const notEnoughQuota = maxNodes < minNodesRequired;
  const isRosa = normalizeProductID(cluster.product?.id) === normalizedProducts.ROSA;

  const handleChange = (newValue: number) => {
    // Convert per-zone value back to total for multizone
    const valueToStore = isMultizoneMachinePool ? newValue * 3 : newValue;
    helpers.setValue(valueToStore, true);
    helpers.setTouched(true, false);
  };

  const displayError = meta.touched ? meta.error : undefined;

  const numberInput = (
    <NumberInput
      value={displayValue}
      min={minNodesDisplay}
      max={maxNodesDisplay}
      onMinus={() => handleChange(displayValue - 1)}
      onChange={(event) => {
        const newValue = Number((event.target as HTMLInputElement).value);
        handleChange(newValue);
      }}
      onPlus={() => handleChange(displayValue + 1)}
      inputAriaLabel="Compute nodes"
      minusBtnAriaLabel="Decrement compute nodes"
      plusBtnAriaLabel="Increment compute nodes"
      widthChars={4}
      isDisabled={notEnoughQuota}
    />
  );

  return (
    <FormGroup
      fieldId={fieldId}
      label={isMultizoneMachinePool ? 'Compute node count (per zone)' : 'Compute node count'}
      isRequired
      labelHelp={
        <PopoverHint
          hint={
            <>
              {constants.computeNodeCountHint}
              {isRosa && (
                <>
                  <br />
                  <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                    Learn more about worker/compute node count
                  </ExternalLink>
                </>
              )}
            </>
          }
        />
      }
    >
      {notEnoughQuota ? (
        <Tooltip content={noQuotaTooltip} position="right">
          {numberInput}
        </Tooltip>
      ) : (
        numberInput
      )}

      <FormGroupHelperText touched={!!displayError} error={displayError}>
        {isMultizoneMachinePool && !displayError && `x 3 zones = ${field.value}`}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default NodeCountField;
