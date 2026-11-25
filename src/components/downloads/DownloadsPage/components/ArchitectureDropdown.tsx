import React from 'react';
import { has } from 'lodash';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { urls as URLS } from '~/common/installLinks.mjs';

import { allArchitecturesForTool, architecturesForToolOS } from '../../downloadUtils';

type ArchitectureDropdownProps = {
  urls: typeof URLS;
  tool: string;
  channel: string;
  OS: string | null;
  architecture?: string;
  setArchitecture: (value: string) => void;
};

const ArchitectureDropdown = ({
  urls,
  tool,
  channel,
  OS,
  architecture,
  setArchitecture,
}: ArchitectureDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const optionsForOS = architecturesForToolOS(urls, tool, channel, OS);
  const options = allArchitecturesForTool(urls, tool, channel).filter(({ value }) =>
    has(urls, [tool, channel, value, OS ?? '']),
  );
  const selectedLabel =
    options.find(({ value }) => value === architecture)?.label ?? 'Select architecture';

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={optionsForOS.length <= 1}
      isFullWidth
      aria-label="Select architecture dropdown"
      data-testid={`arch-dropdown-${tool}`}
    >
      {selectedLabel}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={architecture}
      onSelect={(_event, selection) => {
        setArchitecture(String(selection));
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

export default ArchitectureDropdown;
