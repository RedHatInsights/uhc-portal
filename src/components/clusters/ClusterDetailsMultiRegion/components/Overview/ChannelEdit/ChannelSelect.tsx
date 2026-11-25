import React from 'react';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

export type ChannelSelectProps = {
  input: {
    value?: string;
    name?: string;
    onChange?: (value: string) => void;
    onBlur?: (event: React.FocusEvent) => void;
    isDisabled?: boolean;
  };
  optionsDropdownData: {
    value: string;
    label: string;
  }[];
};

export const ChannelSelect = ({ optionsDropdownData, input }: ChannelSelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { value = '', onChange, isDisabled } = input;

  const selectedLabel =
    optionsDropdownData.find((option) => option.value === value)?.label ?? value;

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      isFullWidth
      aria-label="Channel select input"
      ouiaId="ChannelSelectInput"
      className="channel-select-menu-toggle"
    >
      {selectedLabel}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={value}
      onSelect={(_event, selection) => {
        onChange?.(String(selection));
        setIsOpen(false);
      }}
      onOpenChange={setIsOpen}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {optionsDropdownData?.map((option) => (
          <SelectOption key={option.value} value={option.value}>
            {option.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};
