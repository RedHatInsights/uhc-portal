import React from 'react';
import { FieldValidator, useField, useFormikContext } from 'formik';

import {
  Flex,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';

import './AddOnsFormDropdown.scss';

const SELECT_PLACEHOLDER = '-- Please Select --';

type Option = {
  value: string;
  name: string;
  label?: string;
};

type AddOnsFormDropdownProps = {
  options: Option[];
  label: string;
  name: string;
  disabled: boolean;
  isFormGroup: boolean;
  helperText: string;
  isRequired: boolean;
  extendedHelpText: string;
  fieldId: string;
  validate?: FieldValidator;
  validateOnSubmit?: boolean;
};

export const AddOnsFormDropdown = ({
  options,
  label,
  name,
  disabled,
  isFormGroup = true,
  helperText,
  isRequired,
  extendedHelpText,
  fieldId,
  validate,
  validateOnSubmit,
  ...extraProps
}: AddOnsFormDropdownProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [selectedString, setSelectedString] = React.useState<string | undefined>(undefined);
  const { setFieldValue } = useFormikContext();
  const [field, meta, form] = useField(fieldId);

  const onSelect = (
    _: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    const selectedString = options.find((option) => option.value === value);
    setSelectedString(selectedString?.name);
    setFieldValue(fieldId, value);
    setIsExpanded(false);
  };

  const selectToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      aria-label="Options menu"
      onClick={(_event) => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
      isDisabled={disabled}
      name={name}
      {...(meta.touched && meta.error && { status: 'danger' })}
      isFullWidth
      className="add-ons-form-toggle"
    >
      {selectedString || SELECT_PLACEHOLDER}
    </MenuToggle>
  );

  const formSelect = (
    <Select
      id={name}
      {...field}
      toggle={selectToggle}
      selected={field.value}
      isOpen={isExpanded}
      onSelect={onSelect}
      onBlur={() => form.setTouched(true, true)}
      shouldFocusFirstItemOnOpen
      {...extraProps}
    >
      <SelectList>
        {options.map((option) => (
          <SelectOption key={option.value} value={option.value}>
            {option.label ? (
              <Flex
                flexWrap={{ default: 'nowrap' }}
                spaceItems={{ default: 'spaceItemsSm' }}
                alignItems={{ default: 'alignItemsCenter' }}
              >
                <span>{option.name}</span>
                {option.label}
              </Flex>
            ) : (
              option.name
            )}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );

  return isFormGroup ? (
    <FormGroup
      {...(validate && { isRequired: true })}
      fieldId={name}
      label={label}
      isRequired={isRequired}
      labelHelp={extendedHelpText ? <PopoverHint hint={extendedHelpText} /> : undefined}
    >
      {formSelect}
      <FormGroupHelperText
        touched={meta.touched}
        error={meta.error}
        validateOnSubmit={validateOnSubmit}
      >
        {helperText}
      </FormGroupHelperText>
    </FormGroup>
  ) : (
    <>
      {formSelect}
      <FormGroupHelperText
        touched={meta.touched}
        error={meta.error}
        validateOnSubmit={validateOnSubmit}
      >
        {helperText}
      </FormGroupHelperText>
    </>
  );
};
