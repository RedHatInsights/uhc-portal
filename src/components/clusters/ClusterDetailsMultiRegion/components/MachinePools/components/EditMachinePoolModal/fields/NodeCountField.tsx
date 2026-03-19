import * as React from 'react';
import { useField } from 'formik';

import { FormGroup, NumberInput, Tooltip } from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import { noQuotaTooltip } from '~/common/helpers';
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
  const [field, meta, helpers] = useField<number>(fieldId);
  const isMultizoneMachinePool = isMPoolAz(cluster, mpAvailZones);

  const minNodes = isMultizoneMachinePool ? minNodesRequired / 3 : minNodesRequired;
  const maxNodesPerZone = isMultizoneMachinePool ? maxNodes / 3 : maxNodes;

  const notEnoughQuota = maxNodes < minNodesRequired;
  const isRosa = normalizeProductID(cluster.product?.id) === normalizedProducts.ROSA;
  const { touched, error } = meta;

  const onButtonPress = (plus: boolean) => () => {
    const newValue = plus ? field.value + 1 : field.value - 1;
    helpers.setValue(newValue);
    helpers.setTouched(true, false);
  };

  const numberInput = (
    <NumberInput
      value={field.value}
      min={minNodes}
      max={maxNodesPerZone}
      onMinus={onButtonPress(false)}
      onChange={(event) => {
        helpers.setValue(Number((event.target as HTMLInputElement).value));
        helpers.setTouched(true, false);
      }}
      onPlus={onButtonPress(true)}
      inputAriaLabel="Compute nodes"
      minusBtnAriaLabel="Decrement compute nodes"
      plusBtnAriaLabel="Increment compute nodes"
      widthChars={4}
      isDisabled={notEnoughQuota}
      inputProps={{
        onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
          helpers.setValue(Number(event.target.value));
          field.onBlur(event);
        },
      }}
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
      {notEnoughQuota ? (
        <Tooltip content={noQuotaTooltip} position="right">
          {numberInput}
        </Tooltip>
      ) : (
        numberInput
      )}

      <FormGroupHelperText touched={touched} error={error}>
        {isMultizoneMachinePool && !(touched && error) && `x 3 zones = ${field.value * 3}`}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default NodeCountField;
