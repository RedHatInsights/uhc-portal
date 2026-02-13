import * as React from 'react';
import { useField } from 'formik';

import { FormGroup, NumberInput } from '@patternfly/react-core';

import { validateNumericInput } from '~/common/validators';
import { isMPoolAz } from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { ClusterFromSubscription } from '~/types/types';

type AutoscaleMinReplicasFieldProps = {
  cluster: ClusterFromSubscription;
  minNodes: number;
  mpAvailZones?: number;
  maxNodes: number;
};

const fieldId = 'autoscaleMin';

const validateAutoscaleMin = (value: number, min: number, max: number): string | undefined => {
  if (Number.isNaN(value)) {
    return 'Please enter a valid number.';
  }
  return validateNumericInput(value.toString(), { min, max });
};

const AutoscaleMinReplicasField = ({
  cluster,
  minNodes: initMinNodes,
  mpAvailZones,
  maxNodes: initMaxNodes,
}: AutoscaleMinReplicasFieldProps) => {
  const isMultizoneMachinePool = isMPoolAz(cluster, mpAvailZones);

  const minNodes = isMultizoneMachinePool ? initMinNodes / 3 : initMinNodes;
  const maxNodes = isMultizoneMachinePool ? initMaxNodes / 3 : initMaxNodes;

  const [field, meta, helpers] = useField<number>({
    name: fieldId,
    validate: (value) => validateAutoscaleMin(value, minNodes, maxNodes),
  });

  const handleChange = (newValue: number) => {
    helpers.setValue(newValue, true);
    helpers.setTouched(true, false);
  };

  const displayError = meta.touched ? meta.error : undefined;

  return (
    <FormGroup fieldId={fieldId} label="Minimum nodes count" isRequired>
      <NumberInput
        {...field}
        onPlus={() => handleChange(field.value + 1)}
        onMinus={() => handleChange(field.value - 1)}
        onChange={(e) => {
          const newValue = Number((e.target as HTMLInputElement).value);
          handleChange(newValue);
        }}
        id={fieldId}
        min={minNodes}
        max={maxNodes}
      />

      <FormGroupHelperText touched={!!displayError} error={displayError}>
        {isMultizoneMachinePool && !displayError && `x 3 zones = ${field.value * 3}`}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default AutoscaleMinReplicasField;
