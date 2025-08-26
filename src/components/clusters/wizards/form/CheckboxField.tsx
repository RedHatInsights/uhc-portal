import React from 'react';
import { Field, FieldConfig, FieldProps, FieldValidator } from 'formik';

import {
  Checkbox,
  CheckboxProps,
  Flex,
  FlexItem,
  FormGroup,
  FormGroupProps,
} from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';
import WithTooltip from '~/components/common/WithTooltip';

interface CheckboxFieldProps {
  name: string;
  label?: string;
  validate?: FieldValidator;
  isDisabled?: boolean;
  hint?: React.ReactNode;
  field?: FieldConfig;
  formGroup?: FormGroupProps;
  input?: Omit<Partial<CheckboxProps>, 'ref'>;
  helperText?: React.ReactNode;
  showTooltip?: boolean;
  tooltip?: React.ReactNode;
}

const CheckboxField = ({
  name,
  label,
  validate,
  isDisabled,
  hint,
  field,
  formGroup,
  input,
  helperText,
  showTooltip = false,
  tooltip,
}: CheckboxFieldProps) => (
  <Field name={name} validate={validate} {...field}>
    {({ field, form, meta }: FieldProps) => (
      <FormGroup fieldId={field.name} {...(validate && { isRequired: true })} {...formGroup}>
        {hint ? (
          <Flex flexWrap={{ default: 'nowrap' }} spaceItems={{ default: 'spaceItemsXs' }}>
            <FlexItem>
              <WithTooltip showTooltip={showTooltip} content={tooltip}>
                <Checkbox
                  id={field.name}
                  label={label}
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
              </WithTooltip>
            </FlexItem>
            <FlexItem>
              <PopoverHint hint={hint} />
            </FlexItem>
          </Flex>
        ) : (
          <WithTooltip showTooltip={showTooltip} content={tooltip}>
            <Checkbox
              id={field.name}
              label={label}
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
          </WithTooltip>
        )}

        <FormGroupHelperText touched={meta.touched} error={meta.error}>
          {helperText}
        </FormGroupHelperText>
      </FormGroup>
    )}
  </Field>
);

export { CheckboxField, CheckboxFieldProps };
