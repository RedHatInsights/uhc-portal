import * as React from 'react';
import { useField, useFormikContext } from 'formik';

import { FormGroup, NumberInput } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { normalizeProductID } from '~/common/normalize';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { validateNumericInput } from '~/common/validators';
import { isMPoolAz } from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { computeNodeHintText } from '~/components/clusters/common/ScaleSection/AutoScaleSection/AutoScaleHelper';
import ExternalLink from '~/components/common/ExternalLink';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';
import { ClusterFromSubscription } from '~/types/types';

type AutoscaleMaxReplicasFieldProps = {
  minNodes: number;
  cluster: ClusterFromSubscription;
  maxNodes: number;
  mpAvailZones?: number;
};

const fieldId = 'autoscaleMax';

const AutoscaleMaxReplicasField = ({
  minNodes: initMinNodes,
  cluster,
  maxNodes: initMaxNodes,
  mpAvailZones,
}: AutoscaleMaxReplicasFieldProps) => {
  const [field, meta] = useField<number>(fieldId);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const isMultizoneMachinePool = isMPoolAz(cluster, mpAvailZones);
  const isRosa = normalizeProductID(cluster.product?.id) === normalizedProducts.ROSA;

  const minNodes = isMultizoneMachinePool ? initMinNodes / 3 : initMinNodes;
  const maxNodes = isMultizoneMachinePool ? initMaxNodes / 3 : initMaxNodes;

  // Local validation error state for immediate feedback
  const [localError, setLocalError] = React.useState<string | undefined>();

  const validateValue = (value: number): string | undefined => {
    if (Number.isNaN(value)) {
      return 'Please enter a valid number.';
    }
    return validateNumericInput(value.toString(), {
      min: minNodes || 1,
      max: maxNodes,
    });
  };

  const handleChange = (newValue: number) => {
    const validationError = validateValue(newValue);
    setLocalError(validationError);
    setFieldValue(fieldId, newValue, true);
    setFieldTouched(fieldId, true, false);
  };

  // Display either local validation error or Formik error
  const displayError = localError || (meta.touched ? meta.error : undefined);

  return (
    <FormGroup
      fieldId={fieldId}
      label="Maximum nodes count"
      isRequired
      labelHelp={
        <PopoverHint
          buttonAriaLabel="Compute node count information"
          hint={
            <>
              {computeNodeHintText(false, isHypershiftCluster(cluster))}
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
      <NumberInput
        {...field}
        onPlus={() => handleChange(field.value + 1)}
        onMinus={() => handleChange(field.value - 1)}
        onChange={(e) => {
          const newValue = Number((e.target as HTMLInputElement).value);
          handleChange(newValue);
        }}
        id={fieldId}
        min={minNodes || 1}
        max={maxNodes}
      />

      <FormGroupHelperText touched={!!displayError} error={displayError}>
        {isMultizoneMachinePool && !displayError && `x 3 zones = ${field.value * 3}`}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default AutoscaleMaxReplicasField;
