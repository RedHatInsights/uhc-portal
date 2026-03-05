import * as React from 'react';
import { useField } from 'formik';

import { FormGroup, NumberInput } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { normalizeProductID } from '~/common/normalize';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { isMPoolAz } from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { computeNodeHintText } from '~/components/clusters/common/ScaleSection/AutoScaleSection/AutoScaleHelper';
import ExternalLink from '~/components/common/ExternalLink';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';
import useFormikOnChange from '~/hooks/useFormikOnChange';
import { ClusterFromSubscription } from '~/types/types';

type AutoscaleMaxReplicasFieldProps = {
  minNodes: number;
  cluster: ClusterFromSubscription;
  options: number[];
  mpAvailZones?: number;
};

const fieldId = 'autoscaleMax';

const AutoscaleMaxReplicasField = ({
  minNodes: initMinNodes,
  cluster,
  options,
  mpAvailZones,
}: AutoscaleMaxReplicasFieldProps) => {
  const [field, { error, touched }] = useField<number>(fieldId);
  const onChange = useFormikOnChange(fieldId);
  const isMultizoneMachinePool = isMPoolAz(cluster, mpAvailZones);
  const isRosa = normalizeProductID(cluster.product?.id) === normalizedProducts.ROSA;

  const maxValue = options.length ? options[options.length - 1] : 0;

  const minNodes = isMultizoneMachinePool ? initMinNodes / 3 : initMinNodes;
  const maxNodes = isMultizoneMachinePool ? maxValue / 3 : maxValue;

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
        onPlus={() => onChange(field.value + 1)}
        onMinus={() => onChange(field.value - 1)}
        onChange={(e) => {
          const newValue = (e.target as any).value;
          onChange(Number(newValue));
        }}
        id={fieldId}
        min={minNodes || 1}
        max={maxNodes}
      />

      <FormGroupHelperText touched={touched} error={error}>
        {isMultizoneMachinePool && `x 3 zones = ${field.value * 3}`}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default AutoscaleMaxReplicasField;
