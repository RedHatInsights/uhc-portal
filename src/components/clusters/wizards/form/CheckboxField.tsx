import React from 'react';
import { Field, FieldConfig, FieldProps, FieldValidator } from 'formik';

import { Checkbox, CheckboxProps, Flex, FormGroup, FormGroupProps } from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';

interface CheckboxFieldProps {
  name: string;
  label?: string;
  validate?: FieldValidator;
  isDisabled?: boolean;
  tooltip?: React.ReactNode;
  field?: FieldConfig;
  formGroup?: FormGroupProps;
  input?: Omit<Partial<CheckboxProps>, 'ref'>;
  helperText?: React.ReactNode;
}

export const CheckboxField = ({
  name,
  label,
  validate,
  isDisabled,
  tooltip,
  field,
  formGroup,
  input,
  helperText,
}: CheckboxFieldProps) => (
  <Field name={name} validate={validate} {...field}>
    {({ field, form, meta }: FieldProps) => (
      <FormGroup fieldId={field.name} {...(validate && { isRequired: true })} {...formGroup}>
        <Flex flexWrap={{ default: 'nowrap' }}>
          <Checkbox
            id={field.name}
            label={
              tooltip ? (
                <Flex flexWrap={{ default: 'nowrap' }}>
                  {label}
                  <div className="pf-v6-u-ml-md">{tooltip && <PopoverHint hint={tooltip} />}</div>
                </Flex>
              ) : (
                label
              )
            }
            isChecked={field.value}
            isDisabled={isDisabled}
            onBlur={() => form.setFieldTouched(name, true, true)}
            onChange={(event) => {
              field.onChange(event);
              setTimeout(() => form.setFieldTouched(name, true, true));
            }}
            value={field.value || false}
            {...(!formGroup?.label && validate && { isRequired: true })}
            {...input}
          />
        </Flex>

        <FormGroupHelperText touched={meta.touched} error={meta.error}>
          {helperText}
        </FormGroupHelperText>
      </FormGroup>
    )}
  </Field>
);
