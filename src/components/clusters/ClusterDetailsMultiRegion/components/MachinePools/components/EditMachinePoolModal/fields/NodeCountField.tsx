import * as React from 'react';
import { useField, useFormikContext } from 'formik';

import { FormGroup, NumberInput, Tooltip } from '@patternfly/react-core';

import { noQuotaTooltip } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import { normalizeProductID } from '~/common/normalize';
import { normalizedProducts } from '~/common/subscriptionTypes';
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

const NodeCountField = ({
  minNodesRequired,
  maxNodes,
  cluster,
  mpAvailZones,
}: NodeCountFieldProps) => {
  const [field, meta] = useField<number>(fieldId);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const isMultizoneMachinePool = isMPoolAz(cluster, mpAvailZones);

  // For multizone, we display and input per-zone values
  const minNodesDisplay = isMultizoneMachinePool ? minNodesRequired / 3 : minNodesRequired;
  const maxNodesDisplay = isMultizoneMachinePool ? maxNodes / 3 : maxNodes;
  const displayValue = isMultizoneMachinePool ? field.value / 3 : field.value;

  const notEnoughQuota = maxNodes < minNodesRequired;

  const isRosa = normalizeProductID(cluster.product?.id) === normalizedProducts.ROSA;

  // Local validation error state for immediate feedback
  const [localError, setLocalError] = React.useState<string | undefined>();

  const validateValue = (value: number): string | undefined => {
    if (Number.isNaN(value)) {
      return 'Please enter a valid number.';
    }
    if (value < minNodesDisplay) {
      return `Input cannot be less than ${minNodesDisplay}.`;
    }
    if (value > maxNodesDisplay) {
      return `Input cannot be more than ${maxNodesDisplay}.`;
    }
    return undefined;
  };

  const handleChange = (newValue: number) => {
    // Validate and set local error for immediate feedback
    const validationError = validateValue(newValue);
    setLocalError(validationError);

    // Convert per-zone value back to total for multizone
    const valueToStore = isMultizoneMachinePool ? newValue * 3 : newValue;
    setFieldValue(fieldId, valueToStore, true);
    setFieldTouched(fieldId, true, false);
  };

  // Display either local validation error or Formik error
  const displayError = localError || (meta.touched ? meta.error : undefined);

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
