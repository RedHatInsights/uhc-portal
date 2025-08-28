import React from 'react';
import { Field, FieldConfig, FieldProps, FieldValidator } from 'formik';

import { FormGroup, FormGroupProps, TextInput, TextInputProps } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

interface FieldArrayTextInputProps {
  name: string;
  textInputClassName?: string;
  formGroupClassName?: string;
  label?: string;
  validate?: FieldValidator;
  isDisabled?: boolean;
  helperText?: React.ReactNode;
  tooltip?: React.ReactNode;
  tooltipWidth?: string;
  field?: FieldConfig;
  formGroup?: FormGroupProps;
  input?: TextInputProps;
  type?: TextInputProps['type'];
  showHelpTextOnError?: boolean;
  placeHolderText?: string;
  validateOnSubmit?: boolean;
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
}

interface HelperTextInvalidProps {
  name?: string;
  meta: FieldProps['meta'];
  helpText?: string | React.ReactNode;
  showHelpTextOnError?: boolean;
  className?: string;
}

export const HelperTextInvalid = ({
  name,
  meta,
  showHelpTextOnError,
  helpText,
  className,
}: HelperTextInvalidProps) => {
  const { error, touched } = meta;
  const additionalClasses = className ? ` ${className}` : '';
  if (touched && error) {
    if (showHelpTextOnError && typeof helpText === 'string') {
      return (
        <>
          {helpText} {error}
        </>
      );
    }
    return (
      <div
        className={`pf-v6-c-form__helper-text pf-m-error${additionalClasses}`}
        id={`${name}-helper`}
        aria-live="polite"
      >
        {showHelpTextOnError ? <span>{helpText} </span> : null}
        {error}
      </div>
    );
  }
  return null;
};

export const FieldArrayTextInput = ({
  name,
  textInputClassName,
  formGroupClassName,
  label,
  validate,
  isDisabled,
  placeHolderText,
  tooltip,
  tooltipWidth = '',
  field,
  formGroup,
  input,
  type,
  validateOnSubmit,
  onChange: propOnChange,
}: FieldArrayTextInputProps) => (
  <Field name={name} validate={validate} {...field}>
    {({ field, form, meta }: FieldProps) => (
      <FormGroup
        fieldId={field.name}
        label={label}
        className={formGroupClassName}
        {...(tooltip && { labelIcon: <PopoverHint maxWidth={tooltipWidth} hint={tooltip} /> })}
        {...(validate && { isRequired: true })}
        {...formGroup}
      >
        <TextInput
          id={field.name}
          className={textInputClassName}
          isDisabled={isDisabled}
          placeholder={placeHolderText}
          validated={
            (meta.touched && meta.error) || (validateOnSubmit && meta.error) ? 'error' : 'default'
          }
          onBlur={() => form.setFieldTouched(name, true)}
          onChange={(event, _) => {
            if (propOnChange) propOnChange(event);
            field.onChange(event);
          }}
          value={field.value || (type === 'number' ? 0 : '')}
          type={type}
          {...input}
        />
      </FormGroup>
    )}
  </Field>
);
