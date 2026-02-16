import React from 'react';
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

  const [field, meta] = useField<number>({
    name: fieldId,
    validate: (value) => validateAutoscaleMin(value, minNodes, maxNodes),
  });

  const displayError = meta.touched ? meta.error : undefined;

  const onButtonPress = (plus: boolean) => () => {
    const newValue = plus ? field.value + 1 : field.value - 1;
    field.onChange({ target: { name: fieldId, value: newValue } });
  };

  return (
    <FormGroup fieldId={fieldId} label="Minimum nodes count" isRequired>
      <NumberInput
        value={field.value}
        onPlus={onButtonPress(true)}
        onMinus={onButtonPress(false)}
        onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
        id={fieldId}
        min={minNodes}
        max={maxNodes}
        inputProps={{
          onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
            // strips unnecessary leading zeros
            // eslint-disable-next-line no-param-reassign
            event.target.value = Number(event.target.value).toString();
            field.onBlur(event);
          },
        }}
      />

      <FormGroupHelperText touched={!!displayError} error={displayError}>
        {isMultizoneMachinePool && !displayError && `x 3 zones = ${field.value * 3}`}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default AutoscaleMinReplicasField;
