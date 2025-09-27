import React, { useCallback, useEffect, useState } from 'react';
import Fuse from 'fuse.js';

import {
  Content,
  MenuContainer,
  MenuToggle,
  Panel,
  PanelMain,
  PanelMainBody,
  Popover,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  TreeView,
  TreeViewDataItem,
  TreeViewSearch,
} from '@patternfly/react-core';

import './TreeViewSelect.scss';

export interface TreeViewData extends TreeViewDataItem {
  name: React.ReactNode | string;
  category?: string;
  descriptionLabel?: string;
  nameLabel?: string;
  id?: string;
  children?: TreeViewData[];
  sortingScore?: number;
}

interface TreeViewSelectProps {
  treeViewSelectionMap: TreeViewData[];
  treeViewSwitchActive: boolean;
  setTreeViewSwitchActive: React.Dispatch<React.SetStateAction<boolean>>;
  helperText?: React.ReactNode;
  includeFilterSwitch?: boolean;
  selected?: TreeViewDataItem;
  menuToggleBadge?: React.ReactNode;
  setSelected: (
    event: React.MouseEvent<Element, MouseEvent>,
    selection: TreeViewData | TreeViewDataItem,
  ) => void;
  selectionPlaceholderText?: string;
  placeholder?: string;
  switchLabelOnText?: string;
  searchPlaceholder?: string;
  allExpanded?: boolean;
  ariaLabel?: string;
}

interface TreeViewSelectMenuItemProps {
  name: React.ReactNode;
  description: string;
  popoverText?: string;
  icon?: React.ReactNode;
}

export function TreeViewSelectMenuItem(props: TreeViewSelectMenuItemProps) {
  const { name, description, popoverText, icon } = props;
  const menuItem = (
    <Split hasGutter>
      <SplitItem>
        <Stack>
          <StackItem>{name}</StackItem>
          <StackItem>
            <Content>
              <Content component="small">{description}</Content>
            </Content>
          </StackItem>
        </Stack>
      </SplitItem>
      <SplitItem isFilled />
      {icon && <SplitItem>{icon}</SplitItem>}
      <SplitItem />
    </Split>
  );

  if (popoverText) {
    return (
      <Popover triggerAction="hover" position="right" bodyContent={<div>{popoverText}</div>}>
        {menuItem}
      </Popover>
    );
  }
  return menuItem;
}

export function TreeViewSelect(props: TreeViewSelectProps) {
  const {
    helperText,
    includeFilterSwitch,
    setSelected,
    selected,
    selectionPlaceholderText,
    menuToggleBadge,
    treeViewSelectionMap,
    treeViewSwitchActive,
    setTreeViewSwitchActive,
    placeholder,
    searchPlaceholder,
    switchLabelOnText,

    ariaLabel,
    allExpanded = false,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState(treeViewSelectionMap);
  const [searchString, setSearchString] = useState('');
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [activeItems, setActiveItems] = React.useState<TreeViewData[]>([]);

  useEffect(() => {
    if (selected) setActiveItems([selected]);
  }, [selected]);

  const searchFn = useCallback(() => {
    if (searchString === '') {
      setFilteredItems(treeViewSelectionMap);
    } else {
      const filtered = treeViewSelectionMap
        .map((categoryObject) => {
          if (categoryObject.children) {
            let lowestScore = 1;
            const fuse = new Fuse<TreeViewData>(categoryObject.children, {
              keys: ['id', 'category', 'descriptionLabel', 'nameLabel'],
              shouldSort: true,
              threshold: 0.3,
              includeScore: true,
              ignoreLocation: true,
              minMatchCharLength: 1,
            });

            const filteredMachineCategory = fuse
              .search(searchString.trim())
              .map(({ item, score }) => {
                if (score && score < lowestScore) lowestScore = score;
                return item;
              });
            if (filteredMachineCategory.length > 0) {
              return {
                ...categoryObject,
                children: filteredMachineCategory,
                sortingScore: lowestScore,
              };
            }
          }
          return undefined;
        })
        .filter(Boolean) as TreeViewData[];
      filtered.sort(
        (TreeViewNodeA, TreeViewNodeB) =>
          (TreeViewNodeA.sortingScore || Infinity) - (TreeViewNodeB.sortingScore || Infinity),
      );
      setFilteredItems(filtered);
    }
  }, [searchString, treeViewSelectionMap]);

  const onSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(evt.target.value);
    searchFn();
  };

  useEffect(() => {
    searchFn();
  }, [treeViewSelectionMap, searchFn]);

  const toolbar = (
    <Toolbar className="tree-view-select-toolbar">
      <ToolbarContent>
        {includeFilterSwitch && (
          <ToolbarItem className="pf-v6-u-pt-xs pf-v6-u-pb-sm pf-v6-u-pl-md pf-v6-u-pr-sm">
            <Switch
              data-testid="display-switch"
              label={switchLabelOnText}
              isChecked={treeViewSwitchActive}
              onChange={() => {
                setTreeViewSwitchActive(!treeViewSwitchActive);
              }}
            />
          </ToolbarItem>
        )}
        <ToolbarItem>
          <TreeViewSearch
            autoComplete="off"
            className="tree-view-select-search-fullwidth pf-v6-u-pt-sm pf-v6-u-pb-sm pf-v6-u-pl-sm pf-v6-u-pr-sm pf-v6-u-w-inherit"
            placeholder={searchPlaceholder}
            onSearch={onSearch}
            aria-label={ariaLabel && `${ariaLabel} search field`}
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const getSelectionText = () => {
    if (selectionPlaceholderText) {
      return selectionPlaceholderText;
    }
    if (selected) {
      return selected;
    }
    return placeholder;
  };

  const toggle = (
    <MenuToggle
      ref={toggleRef}
      aria-label={ariaLabel && `${ariaLabel} toggle`}
      className="tree-view-select-menu-toggle"
      onClick={(e) => {
        if (!isOpen) {
          setFilteredItems(treeViewSelectionMap);
          setSearchString('');
        }
        setIsOpen(!isOpen);
      }}
      isExpanded={isOpen}
      badge={menuToggleBadge}
    >
      {getSelectionText() as React.ReactNode}
    </MenuToggle>
  );

  const menu = (
    <Panel ref={menuRef} isScrollable variant="raised" className="openshift tree-view-select-panel">
      <PanelMain className="openshift tree-view-select-panel">
        <section>
          <PanelMainBody>
            <TreeView
              className="tree-view-custom-class"
              onSelect={(event, newItem) => {
                if (newItem.id && !newItem?.children) {
                  setSelected(event, newItem);
                  setIsOpen(false);
                }
              }}
              toolbar={toolbar}
              hasSelectableNodes={false}
              allExpanded={allExpanded || searchString !== ''}
              data={filteredItems}
              useMemo
              activeItems={activeItems}
            />
          </PanelMainBody>
        </section>
      </PanelMain>
    </Panel>
  );

  return (
    <>
      <MenuContainer
        isOpen={isOpen}
        onOpenChange={(isOpen) => {
          setSearchString('');
          setIsOpen(isOpen);
        }}
        onOpenChangeKeys={['Escape']}
        menu={menu}
        menuRef={menuRef}
        toggle={toggle}
        toggleRef={toggleRef}
        popperProps={{
          width: 'trigger',
        }}
      />
      {helperText}
    </>
  );
}
