import React, { useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  SelectProps,
} from '@patternfly/react-core';

interface PodDistruptionBudgetGraceSelectProps {
  isDisabled: boolean;
  input: {
    value: number;
    onChange: (value: number) => void;
  };
}

const PodDistruptionBudgetGraceSelect: React.FC<PodDistruptionBudgetGraceSelectProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    input: { value, onChange },
    isDisabled,
  } = props;

  const options: { [key: string]: string } = {
    '15': '15 minutes',
    '30': '30 minutes',
    '60': '1 hour',
    [2 * 60]: '2 hours',
    [4 * 60]: '4 hours',
    [8 * 60]: '8 hours',
  };

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSelect: SelectProps['onSelect'] = (_event, selection) => {
    if (selection) {
      setIsOpen(false);
      onChange(Number(selection));
    }
  };

  const toggle = (ref: React.RefObject<HTMLButtonElement>) => (
    <MenuToggle
      ref={ref}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      className="ocm-c-upgrades-pdb-select__toggle"
      data-testid="grace-period-select"
    >
      {options[value]}
    </MenuToggle>
  );

  return (
    <FormGroup label="Grace period" className="ocm-c-upgrades-pdb-select">
      <Select
        id="single-select"
        isOpen={isOpen}
        selected={value}
        onSelect={onSelect}
        onOpenChange={onToggle}
        toggle={toggle}
        shouldFocusToggleOnSelect
        popperProps={{
          direction: 'up',
        }}
      >
        <SelectList>
          {Object.keys(options).map((key) => (
            <SelectOption key={key} value={Number(key)}>
              {options[key]}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

export default PodDistruptionBudgetGraceSelect;
