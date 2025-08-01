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
  isReadOnly?: boolean;
  helpText?: string;
  placeHolderText?: string;
};

const TextField = ({
  fieldId,
  label,
  isRequired,
  isDisabled,
  isReadOnly,
  helpText,
  placeHolderText,
}: TextFieldProps) => {
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
        {...field}
        id={fieldId}
        onChange={(event, value) => {
          field.onChange(event);
        }}
        isDisabled={isDisabled}
        readOnlyVariant={isReadOnly ? 'default' : undefined}
        placeholder={placeHolderText}
      />

      <FormGroupHelperText touched={touched} error={error}>
        {helpText}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default TextField;
