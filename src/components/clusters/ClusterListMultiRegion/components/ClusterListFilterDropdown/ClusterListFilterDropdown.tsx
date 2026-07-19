import React, { useRef, useState } from 'react';

import {
  Menu,
  MenuContainer,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons/dist/esm/icons/filter-icon';

import { useNavigate } from '~/common/routing';

import { buildFilterURLParams } from '../../../../../common/queryHelpers';
import { productFilterOptions } from '../../../../../common/subscriptionTypes';

type Filter = {
  [group: string]: string[];
};

const ClusterListFilterDropdown = (props: {
  setFilter: (fiters: Filter) => void;
  currentFilters: Filter;
  isDisabled: boolean;
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { currentFilters, setFilter, isDisabled } = props;

  const filterOptions = [
    {
      key: 'plan_id',
      label: 'Cluster type',
      options: productFilterOptions,
    },
  ];

  const setFilterAndQueryParams = (filter: Filter) => {
    navigate(
      {
        search: buildFilterURLParams(filter),
      },
      { replace: true },
    );
    setFilter(filter);
  };

  const menuRef = useRef<HTMLDivElement>(null);
  const menu = (
    <Menu ref={menuRef}>
      <MenuContent>
        {filterOptions.map((group) => {
          const selected: { [key: string]: boolean } = {};
          const currentFilter: string[] = currentFilters[group.key] || [];
          currentFilter.forEach((key) => {
            selected[key] = true;
          });
          return (
            <MenuGroup label={group.label} key={`filtergroup-${group.key}`}>
              <MenuList>
                {group.options.map((option) => (
                  <MenuItem
                    hasCheckbox
                    itemId={option.key}
                    key={option.key}
                    isSelected={selected[option.key]}
                    data-testid={'cluster-type-'.concat(option.label)}
                    onClick={() => {
                      setFilterAndQueryParams({
                        ...currentFilters,
                        [group.key]: [
                          ...currentFilter.filter((key) => key !== option.key),
                          ...(currentFilter.includes(option.key) ? [] : [option.key]),
                        ],
                      });
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuGroup>
          );
        })}
      </MenuContent>
    </Menu>
  );
  const toggleRef = useRef<MenuToggleElement>(null);
  const toggle = (
    <MenuToggle
      ref={toggleRef}
      icon={<FilterIcon />}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={isDisabled}
    >
      Cluster type
    </MenuToggle>
  );

  return (
    <MenuContainer
      isOpen={isOpen}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      onOpenChangeKeys={['Escape']}
      menu={menu}
      menuRef={menuRef}
      toggle={toggle}
      toggleRef={toggleRef}
    />
  );
};

export default ClusterListFilterDropdown;
