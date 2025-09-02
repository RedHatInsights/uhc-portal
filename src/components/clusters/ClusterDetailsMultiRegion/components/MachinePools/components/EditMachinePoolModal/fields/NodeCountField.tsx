import * as React from 'react';
import { useField } from 'formik';

import { FormGroup, SelectOption, Tooltip } from '@patternfly/react-core';

import { noQuotaTooltip } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import { normalizeProductID } from '~/common/normalize';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { isMPoolAz } from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import ExternalLink from '~/components/common/ExternalLink';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';
import useFormikOnChange from '~/hooks/useFormikOnChange';
import { ClusterFromSubscription } from '~/types/types';

import SelectField from './SelectField';

const fieldId = 'replicas';

type NodeCountFieldProps = {
  mpAvailZones: number | undefined;
  minNodesRequired: number;
  options: number[];
  cluster: ClusterFromSubscription;
};

const NodeCountField = ({
  minNodesRequired,
  options,
  cluster,
  mpAvailZones,
}: NodeCountFieldProps) => {
  const [field] = useField<number>(fieldId);
  const onChange = useFormikOnChange(fieldId);
  const isMultizoneMachinePool = isMPoolAz(cluster, mpAvailZones);
  const optionExists = options.includes(field.value);

  React.useEffect(() => {
    // options could not be ready yet when NodeCountField renders for the first time
    if (options.length > 0 && !optionExists) {
      onChange(minNodesRequired);
    }
  }, [optionExists, minNodesRequired, onChange, options.length]);

  const notEnoughQuota = options.length < 1;

  const isRosa = normalizeProductID(cluster.product?.id) === normalizedProducts.ROSA;

  const selectField = (
    <SelectField
      value={`${isMultizoneMachinePool ? field.value / 3 : field.value}`}
      fieldId={fieldId}
      onSelect={(newValue) => onChange(parseInt(newValue as string, 10))}
      isDisabled={notEnoughQuota}
    >
      {options.map((option) => (
        <SelectOption key={option} value={`${option}`}>
          {`${isMultizoneMachinePool ? option / 3 : option}`}
        </SelectOption>
      ))}
    </SelectField>
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
          {selectField}
        </Tooltip>
      ) : (
        selectField
      )}

      <FormGroupHelperText>
        {isMultizoneMachinePool && `x 3 zones = ${field.value}`}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default NodeCountField;
