import React from 'react';
import { useField } from 'formik';

import { FormGroup, NumberInput } from '@patternfly/react-core';

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

const AutoscaleMinReplicasField = ({
  cluster,
  minNodes: initMinNodes,
  mpAvailZones,
  maxNodes: initMaxNodes,
}: AutoscaleMinReplicasFieldProps) => {
  const [field, meta, helpers] = useField<number>(fieldId);
  const isMultizoneMachinePool = isMPoolAz(cluster, mpAvailZones);

  const minNodes = isMultizoneMachinePool ? initMinNodes / 3 : initMinNodes;
  const maxNodes = isMultizoneMachinePool ? initMaxNodes / 3 : initMaxNodes;

  const { touched, error } = meta;

  const onButtonPress = (plus: boolean) => () => {
    const newValue = plus ? field.value + 1 : field.value - 1;
    helpers.setValue(newValue);
    helpers.setTouched(true, false);
  };

  return (
    <FormGroup fieldId={fieldId} label="Minimum nodes count" isRequired>
      <NumberInput
        value={field.value}
        onPlus={onButtonPress(true)}
        onMinus={onButtonPress(false)}
        onChange={(e) => {
          helpers.setValue(Number((e.target as HTMLInputElement).value));
          helpers.setTouched(true, false);
        }}
        id={fieldId}
        min={minNodes || 1}
        max={maxNodes}
        inputProps={{
          onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
            helpers.setValue(Number(event.target.value));
            field.onBlur(event);
          },
        }}
      />

      <FormGroupHelperText touched={touched} error={error}>
        {isMultizoneMachinePool && !(touched && error) && `x 3 zones = ${field.value * 3}`}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default AutoscaleMinReplicasField;
