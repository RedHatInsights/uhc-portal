import * as React from 'react';
import { useField } from 'formik';

import { Button, FormGroup, Icon, Popover, TextInput } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons/dist/esm/icons/help-icon';

import { FormGroupHelperText } from '../FormGroupHelperText';

type TextFieldProps = {
  fieldId: string;
  label?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  helpText?: string;
  placeHolderText?: string;
  isReadOnly?: boolean;
  ariaLabelledBy?: string;
  trimOnBlur?: boolean;
  shouldShowError?: boolean;
};

const TextField = ({
  fieldId,
  label,
  isRequired,
  isDisabled,
  helpText,
  placeHolderText,
  isReadOnly,
  ariaLabelledBy,
  trimOnBlur,
  shouldShowError,
}: TextFieldProps) => {
  const [field, { error, touched }, { setValue }] = useField(fieldId);
  const isInvalid = (touched || shouldShowError) && !!error;
  const helperTextId = `${fieldId}-helper`;
  const showHelperText = isInvalid || !!helpText;

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
        {...field}
        id={fieldId}
        validated={isInvalid ? 'error' : 'default'}
        onChange={(event, value) => {
          field.onChange(event);
        }}
        onBlur={(e) => {
          if (trimOnBlur && typeof field.value === 'string') {
            setValue(field.value.trim());
          }
          field.onBlur(e);
        }}
        isDisabled={isDisabled}
        placeholder={placeHolderText}
        readOnlyVariant={isReadOnly ? 'default' : undefined}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={showHelperText ? helperTextId : undefined}
        aria-errormessage={isInvalid ? helperTextId : undefined}
      />

      <FormGroupHelperText id={helperTextId} touched={touched || shouldShowError} error={error}>
        {helpText}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default TextField;
