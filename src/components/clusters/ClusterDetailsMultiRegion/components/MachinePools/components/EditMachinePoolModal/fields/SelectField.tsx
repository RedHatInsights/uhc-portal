import * as React from 'react';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectProps,
} from '@patternfly/react-core';

import './SelectField.scss';

type SelectFieldProps = {
  value: string | undefined;
  fieldId: string;
  onSelect: (value: string) => void;
  isDisabled?: boolean;
  children: SelectProps['children'];
};

const SelectField = ({ value, fieldId, onSelect, isDisabled, children }: SelectFieldProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      isDisabled={isDisabled}
      ref={toggleRef}
      onClick={onToggle}
      isExpanded={isOpen}
      isFullWidth
      aria-label="select menu"
      className="select-field-menu-toggle"
    >
      {value}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={value}
      toggle={toggle}
      onSelect={(_, newValue) => {
        onSelect(newValue as string);
        setIsOpen(false);
      }}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      id={fieldId}
      isScrollable
      className="openshift"
    >
      <SelectList>{children}</SelectList>
    </Select>
  );
};

export default SelectField;
