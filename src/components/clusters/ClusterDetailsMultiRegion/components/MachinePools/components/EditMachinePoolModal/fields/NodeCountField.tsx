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

  // For multizone, min/max are per-zone values (maxNodes is already adjusted by getMaxNodeCountForMachinePool)
  const minNodes = isMultizoneMachinePool ? minNodesRequired / 3 : minNodesRequired;
  const maxNodesPerZone = isMultizoneMachinePool ? maxNodes / 3 : maxNodes;

  const [field, meta] = useField<number>({
    name: fieldId,
    validate: (value) => validateNodeCount(value, minNodes, maxNodesPerZone),
  });

  const notEnoughQuota = maxNodes < minNodesRequired;
  const isRosa = normalizeProductID(cluster.product?.id) === normalizedProducts.ROSA;
  const displayError = meta.touched ? meta.error : undefined;

  const onButtonPress = (plus: boolean) => () => {
    const newValue = plus ? field.value + 1 : field.value - 1;
    field.onChange({ target: { name: fieldId, value: newValue } });
  };

  const numberInput = (
    <NumberInput
      value={field.value}
      min={minNodes}
      max={maxNodesPerZone}
      onMinus={onButtonPress(false)}
      onChange={(event) => field.onChange((event.target as HTMLInputElement).value)}
      onPlus={onButtonPress(true)}
      inputAriaLabel="Compute nodes"
      minusBtnAriaLabel="Decrement compute nodes"
      plusBtnAriaLabel="Increment compute nodes"
      widthChars={4}
      isDisabled={notEnoughQuota}
      inputProps={{
        onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
          // strips unnecessary leading zeros
          // eslint-disable-next-line no-param-reassign
          event.target.value = Number(event.target.value).toString();
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
        {isMultizoneMachinePool && !displayError && `x 3 zones = ${field.value * 3}`}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default NodeCountField;
