import React from 'react';
import { FieldInputProps, FieldMetaProps } from 'formik';

import {
  Flex,
  FormGroup,
  LabelProps,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectProps,
} from '@patternfly/react-core';

import { FormGroupHelperText } from '../FormGroupHelperText';
import PopoverHint from '../PopoverHint';

import './ReduxSelectDropdown.scss';

interface ReduxSelectOption {
  name: string;
  value: string;
  label?: React.ReactElement<LabelProps>;
}

interface ReduxSelectDropdownProps {
  options: ReduxSelectOption[];
  label: string;
  helpText: string;
  meta: FieldMetaProps<string>;
  input: FieldInputProps<string>;
  isDisabled: boolean;
  isFormGroup: boolean;
  isRequired: boolean;
  extendedHelpText: React.ReactNode;
}

export const ReduxSelectDropdown = ({
  options,
  label,
  helpText,
  meta: { error, touched },
  input,
  isDisabled,
  isFormGroup = true,
  isRequired,
  extendedHelpText,
  ...extraProps
}: ReduxSelectDropdownProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const onToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const onSelect: SelectProps['onSelect'] = (_event, selection) => {
    setIsExpanded(false);
    input.onChange(selection);
  };

  const toggle = (toggleRef?: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggle}
      isExpanded={isExpanded}
      isDisabled={isDisabled}
      isFullWidth
      className="redux-select-menu-toggle"
      aria-label="Options menu"
    >
      {input.value}
    </MenuToggle>
  );

  const formSelect = (
    <Select
      {...input}
      id={input.name}
      isOpen={isExpanded}
      selected={input.value}
      toggle={toggle}
      onSelect={onSelect}
      onOpenChange={setIsExpanded}
      onBlur={(event) => event.stopPropagation()}
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
      fieldId={input.name}
      label={label}
      isRequired={isRequired}
      labelHelp={extendedHelpText ? <PopoverHint hint={extendedHelpText} /> : undefined}
    >
      {formSelect}

      <FormGroupHelperText touched={touched} error={error}>
        {helpText}
      </FormGroupHelperText>
    </FormGroup>
  ) : (
    formSelect
  );
};
