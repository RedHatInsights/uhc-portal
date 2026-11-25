import React from 'react';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { urls as URLS } from '~/common/installLinks.mjs';

import { allOperatingSystemsForTool } from '../../downloadUtils';

type OperatingSystemDropdownProps = {
  urls: typeof URLS;
  tool: string;
  channel: string;
  OS: string | null;
  setOS: (value: string) => void;
};

const OperatingSystemDropdown = ({
  urls,
  tool,
  channel,
  OS,
  setOS,
}: OperatingSystemDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const options = allOperatingSystemsForTool(urls, tool, channel);
  const selectedLabel = options.find(({ value }) => value === OS)?.label ?? 'Select OS';

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isFullWidth
      aria-label="Select OS dropdown"
      data-testid={`os-dropdown-${tool}`}
    >
      {selectedLabel}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={OS ?? undefined}
      onSelect={(_event, selection) => {
        setOS(String(selection));
        setIsOpen(false);
      }}
      onOpenChange={setIsOpen}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {options.map(({ value, label }) => (
          <SelectOption key={value} value={value}>
            {label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export default OperatingSystemDropdown;
