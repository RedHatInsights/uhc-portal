import React from 'react';
import { useField } from 'formik';

import { FormGroup, NumberInput } from '@patternfly/react-core';

import { MAINTENANCE_MIN_VALUE } from '~/components/clusters/common/machinePools/constants';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';

type MaintenanceFieldProps = {
  fieldId: string;
  fieldName: string;
  hint: string;
};

export const MaintenanceField = ({ fieldId, fieldName, hint }: MaintenanceFieldProps) => {
  const [field, { touched, error }, helpers] = useField(fieldId);
  const { setValue, setTouched } = helpers;
  return (
    <FormGroup
      fieldId={fieldId}
      label={fieldName}
      labelHelp={
        <PopoverHint
          hint={<div>{hint}</div>}
          buttonAriaLabel={`More info for ${fieldName} field`}
        />
      }
    >
      <NumberInput
        {...field}
        id={fieldId}
        onPlus={() => {
          const newValue = field.value ? field.value + 1 : 0 + 1;
          setTouched(true);
          setValue(newValue);
        }}
        onMinus={() => {
          const newValue = field.value ? field.value - 1 : 0;
          setTouched(true);
          setValue(newValue);
        }}
        onChange={(e) => {
          const newMaintenanceMaxNum = parseInt((e.target as any).value, 10);
          const newValue = Number(newMaintenanceMaxNum);
          setValue(newValue);
        }}
        unit={
          <span className="ocm-spot-instances__unit">
            {fieldId === 'nodeDrainTimeout' ? 'minutes' : 'nodes'}
          </span>
        }
        widthChars={8}
        min={MAINTENANCE_MIN_VALUE}
      />
      <FormGroupHelperText touched={touched} error={error} />
    </FormGroup>
  );
};
