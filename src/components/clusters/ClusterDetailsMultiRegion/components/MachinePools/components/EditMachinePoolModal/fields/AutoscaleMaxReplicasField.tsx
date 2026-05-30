import React from 'react';
import { useField } from 'formik';

import { FormGroup, NumberInput } from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import { normalizeProductID } from '~/common/normalize';
import { normalizedProducts } from '~/common/subscriptionTypes';
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
  const [field, meta, helpers] = useField<number>(fieldId);
  const isMultizoneMachinePool = isMPoolAz(cluster, mpAvailZones);
  const isRosa = normalizeProductID(cluster.product?.id) === normalizedProducts.ROSA;

  const minAllowed = 1;

  const minNodes = isMultizoneMachinePool ? initMinNodes / 3 : initMinNodes;
  const maxNodes = isMultizoneMachinePool ? initMaxNodes / 3 : initMaxNodes;

  const { touched, error } = meta;

  const onButtonPress = (plus: boolean) => () => {
    const newValue = plus ? field.value + 1 : field.value - 1;
    helpers.setValue(newValue);
    helpers.setTouched(true, false);
  };

  return (
    <FormGroup
      fieldId={fieldId}
      data-testid="autoscale-max-group"
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
                  <ExternalLink href={docLinks.ROSA_WORKER_NODE_COUNT}>
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
        onChange={(e) => {
          helpers.setValue(Number((e.target as HTMLInputElement).value));
          helpers.setTouched(true, false);
        }}
        id={fieldId}
        min={Math.max(minNodes, minAllowed)}
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

export default AutoscaleMaxReplicasField;
