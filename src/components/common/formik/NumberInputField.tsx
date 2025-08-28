import * as React from 'react';
import { useField } from 'formik';

import { Button, FormGroup, Icon, Popover, TextInput } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons/dist/esm/icons/help-icon';

import { FormGroupHelperText } from '../FormGroupHelperText';

type NumberInputFieldProps = {
  fieldId: string;
  label?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  min?: number;
  max?: number;
  helpText?: string;
};

export const NumberInputField = (props: NumberInputFieldProps) => {
  const { fieldId, label, isRequired, isDisabled, min, max, helpText } = props;
  const [field, { error, touched }] = useField(fieldId);

  const labelIcon = helpText ? (
    <Popover bodyContent={<p>{helpText}</p>}>
      <Button
        icon={
          <Icon size="md">
            <HelpIcon />
          </Icon>
        }
        variant="plain"
        isInline
      />
    </Popover>
  ) : undefined;

  return (
    <FormGroup fieldId={fieldId} label={label} labelHelp={labelIcon} isRequired={isRequired}>
      <TextInput
        type="number"
        min={min}
        max={max}
        {...field}
        id={fieldId}
        onChange={(event, value) => {
          field.onChange(event);
        }}
        isDisabled={isDisabled}
      />

      <FormGroupHelperText touched={touched} error={error} />
    </FormGroup>
  );
};
