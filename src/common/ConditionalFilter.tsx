import React from 'react';

import {
  Badge,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  MenuToggle,
  MenuToggleElement,
  Popper,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons/dist/esm/icons';

export const conditionalFilterType = {
  text: 'text',
  checkbox: 'checkbox',
};

type ConditionalFilterType = (typeof conditionalFilterType)[keyof typeof conditionalFilterType];

type ConditionalFilterItem = {
  type: ConditionalFilterType;
  value: string;
  label: string;
  filterValues: {
    'aria-label'?: string;
    onChange?: (event: Event, value: string) => void;
    value: string | string[];
    label?: string;
    items?: { label: string; value: string }[];
  };
};

const SearchInputBox = ({
  label,
  value,
  onChange,
  ariaLabel,
}: {
  label: string;
  value: string;
  onChange: any;
  ariaLabel?: string;
}) => (
  <ToolbarItem>
    <SearchInput
      placeholder={`Filter by ${label}`}
      value={value}
      onChange={(_event, value) => onChange(_event, value)}
      aria-label={ariaLabel}
    />
  </ToolbarItem>
);

const CheckBoxList = ({
  items, // all checkboxes
  checked, // those that are checked
  onChange,
  label,
}: {
  items: { label: string; value: string }[];
  checked: string[];
  onChange: any;
  label: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value?: string | number | undefined,
  ) => {
    let updatedSelectedItems = [...checked, value];
    if (checked.includes(value as string)) {
      updatedSelectedItems = checked.filter((id) => id !== value);
    }

    onChange(_event, updatedSelectedItems);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
      Filter by {label} {checked.length > 0 && <Badge isRead>{checked.length}</Badge>}
    </MenuToggle>
  );

  return (
    <Select
      role="menu"
      isOpen={isOpen}
      selected={checked}
      onSelect={onSelect}
      onOpenChange={(nextOpen: boolean) => setIsOpen(nextOpen)}
      toggle={toggle}
    >
      <SelectList>
        {items.map((item) => (
          <SelectOption
            hasCheckbox
            value={item.value}
            isSelected={checked.includes(item.value)}
            key={item.label}
          >
            {item.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export const ConditionalFilter = ({ items }: { items: ConditionalFilterItem[] }) => {
  // Set up attribute selector
  const attributeOptions = items.map((item) => item.label);
  const [activeAttributeMenu, setActiveAttributeMenu] = React.useState<string>(
    attributeOptions[0] || '',
  );
  const [isAttributeMenuOpen, setIsAttributeMenuOpen] = React.useState(false);
  const attributeToggleRef = React.useRef<HTMLButtonElement>(null);
  const attributeMenuRef = React.useRef<HTMLDivElement>(null);
  const attributeContainerRef = React.useRef<HTMLDivElement>(null);

  const handleAttribueMenuKeys = (event: KeyboardEvent) => {
    if (!isAttributeMenuOpen) {
      return;
    }
    if (
      attributeMenuRef.current?.contains(event.target as Node) ||
      attributeToggleRef.current?.contains(event.target as Node)
    ) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        setIsAttributeMenuOpen(!isAttributeMenuOpen);
        attributeToggleRef.current?.focus();
      }
    }
  };

  const handleAttributeClickOutside = (event: MouseEvent) => {
    if (isAttributeMenuOpen && !attributeMenuRef.current?.contains(event.target as Node)) {
      setIsAttributeMenuOpen(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleAttribueMenuKeys);
    window.addEventListener('click', handleAttributeClickOutside);
    return () => {
      window.removeEventListener('keydown', handleAttribueMenuKeys);
      window.removeEventListener('click', handleAttributeClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAttributeMenuOpen, attributeMenuRef]);

  const onAttributeToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation(); // Stop handleClickOutside from handling
    setTimeout(() => {
      if (attributeMenuRef.current) {
        const firstElement = attributeMenuRef.current.querySelector('li > button:not(:disabled)');
        if (firstElement) {
          (firstElement as HTMLElement).focus();
        }
      }
    }, 0);
    setIsAttributeMenuOpen(!isAttributeMenuOpen);
  };

  const attributeToggle = (
    <MenuToggle
      ref={attributeToggleRef}
      onClick={onAttributeToggleClick}
      isExpanded={isAttributeMenuOpen}
      icon={<FilterIcon />}
      aria-label="Select filter"
    >
      {activeAttributeMenu}
    </MenuToggle>
  );
  const attributeMenu = (
    <Menu
      ref={attributeMenuRef}
      onSelect={(_ev, itemId) => {
        setActiveAttributeMenu(itemId?.toString() as string);
        setIsAttributeMenuOpen(!isAttributeMenuOpen);
      }}
    >
      <MenuContent>
        <MenuList>
          {attributeOptions.map((attribute) => (
            <MenuItem itemId={attribute} key={attribute}>
              {attribute}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const attributeDropdown = (
    <div ref={attributeContainerRef}>
      <Popper
        trigger={attributeToggle}
        triggerRef={attributeToggleRef}
        popper={attributeMenu}
        popperRef={attributeMenuRef}
        appendTo={attributeContainerRef.current || undefined}
        isVisible={isAttributeMenuOpen}
      />
    </div>
  );

  return (
    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
      <ToolbarGroup variant="filter-group">
        <ToolbarItem>{attributeDropdown}</ToolbarItem>
        {items.map((item) => {
          if (item.label === activeAttributeMenu) {
            const { onChange, value, items: checkboxes } = item.filterValues;
            return item.type === conditionalFilterType.checkbox && checkboxes ? (
              <CheckBoxList
                items={checkboxes}
                checked={value as string[]}
                onChange={onChange}
                label={item.label}
                key={item.label}
              />
            ) : (
              <SearchInputBox
                value={value as string}
                onChange={onChange}
                label={item.label}
                ariaLabel={item.filterValues['aria-label']}
                key={item.label}
              />
            );
          }
          return null;
        })}
      </ToolbarGroup>
    </ToolbarToggleGroup>
  );
};

export default ConditionalFilter;
