import React from 'react';
import { useField } from 'formik';

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

const validateAutoscaleMax = (value: number, min: number, max: number): string | undefined => {
  if (Number.isNaN(value)) {
    return 'Please enter a valid number.';
  }
  return validateNumericInput(value.toString(), { min, max });
};

const AutoscaleMaxReplicasField = ({
  minNodes: initMinNodes,
  cluster,
  maxNodes: initMaxNodes,
  mpAvailZones,
}: AutoscaleMaxReplicasFieldProps) => {
  const isMultizoneMachinePool = isMPoolAz(cluster, mpAvailZones);
  const isRosa = normalizeProductID(cluster.product?.id) === normalizedProducts.ROSA;

  const minNodes = isMultizoneMachinePool ? initMinNodes / 3 : initMinNodes;
  const maxNodes = isMultizoneMachinePool ? initMaxNodes / 3 : initMaxNodes;

  const [field, meta, helpers] = useField<number>({
    name: fieldId,
    validate: (value) => validateAutoscaleMax(value, minNodes || 1, maxNodes),
  });

  const displayError = meta.touched ? meta.error : undefined;

  const onButtonPress = (plus: boolean) => () => {
    const newValue = plus ? field.value + 1 : field.value - 1;
    helpers.setValue(newValue);
  };

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
        value={field.value}
        onPlus={onButtonPress(true)}
        onMinus={onButtonPress(false)}
        onChange={(e) => helpers.setValue(Number((e.target as HTMLInputElement).value))}
        id={fieldId}
        min={minNodes || 1}
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

export default AutoscaleMaxReplicasField;
