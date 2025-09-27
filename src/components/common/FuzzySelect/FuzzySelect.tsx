import React, { useCallback, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

import {
  Alert,
  Divider,
  MenuFooter,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  MenuToggleElement,
  MenuToggleProps,
  SearchInput,
  SearchInputProps,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  SelectProps,
} from '@patternfly/react-core';

import { truncateTextWithEllipsis } from '~/common/helpers';
import { FuzzySelectMatchName } from '~/components/common/FuzzySelect/components/FuzzySelectMatchName';
import { FuzzySelectOption } from '~/components/common/FuzzySelect/components/FuzzySelectOption';
import { FuzzyDataType, FuzzyEntryType } from '~/components/common/FuzzySelect/types';

import { findGroupedItemById, isFuzzyEntryGroup } from './fuzzySelectHelpers';

import './FuzzySelect.scss';

export interface FuzzySelectProps
  extends Omit<SelectProps, 'onOpenChange' | 'onOpenChangeKeys' | 'toggle' | 'selected'> {
  /** Amount of fuzziness used during search. It can be set to 0 for exact matches. Default to 0.3 */
  fuzziness?: number;
  /** Entry ID of the selected value. */
  selectedEntryId?: string;
  /** Data feeding the select options. Can be an array or a record for grouped items. */
  selectionData: FuzzyDataType;
  /** Function used to sort search results. */
  sortFn?: (a: FuzzyEntryType, b: FuzzyEntryType) => number;
  /** Object to configure a regex validation for the search value. It requires a regex and a validation message. */
  filterValidate?: { pattern: RegExp; message: string };
  /** Number of characters after which the options are truncated. */
  truncation?: number;
  /** Flag to display a popover with the full label of select options when hovering them.
   * Useful in combination with the "truncation" prop. */
  isPopover?: boolean;
  /** ID for the toggle element. */
  toggleId?: string;
  /** Callback to change the open state of the select menu. */
  onOpenChange: (isOpen: boolean) => void;
  /** Flag to disable the select component. */
  isDisabled?: boolean;
  /** Placeholder text displayed inside select toggle. Default to "Select an option". */
  placeholderText?: string;
  /** Placeholder text displayed inside the search input. Default to "Filter options". */
  inlineFilterPlaceholderText?: string;
  /** Validation status of the select. It's the same type of the PF MenuToggle status prop. */
  validated?: MenuToggleProps['status'];
  /** Footer to be displayed at the end of the select menu. */
  footer?: React.ReactNode;
  /** Style to apply to the toggle. */
  toggleStyle?: MenuToggleProps['style'];
  /** Additional UI elements to render directly below the filter input field, such as buttons, switch or help text. */
  additionalFilterControls?: React.ReactNode;
  /** Flag to include disabled results while filtering options. Default to false. */
  includeDisabledInSearchResults?: boolean;
}

const defaultSortFn = (a: FuzzyEntryType, b: FuzzyEntryType): number =>
  a.label.localeCompare(b.label);

export const FuzzySelect: React.FC<FuzzySelectProps> = (props) => {
  const {
    fuzziness,
    selectedEntryId = '',
    sortFn = defaultSortFn,
    filterValidate,
    truncation,
    selectionData,
    isOpen,
    toggleId,
    isPopover,
    onOpenChange,
    onSelect,
    isDisabled,
    placeholderText = 'Select an option',
    inlineFilterPlaceholderText = 'Filter options',
    validated,
    footer,
    toggleStyle,
    className,
    additionalFilterControls,
    includeDisabledInSearchResults = false,
    isScrollable = true,
    ...rest
  } = props;

  const [inputValue, setInputValue] = React.useState<string>('');
  const [filterValue, setFilterValue] = React.useState<string>('');
  const [selectOptions, setSelectOptions] = React.useState<FuzzyDataType>(selectionData);
  const textInputRef = React.useRef<HTMLInputElement>(null);
  const [invalidFilter, setInvalidFilter] = React.useState(false);
  const isGroupedSelect = isFuzzyEntryGroup(selectOptions);

  const NO_RESULTS = 'no results';

  React.useEffect(() => {
    if (!filterValue) {
      setSelectOptions(selectionData);
      setInvalidFilter(false);
    } else {
      if (filterValidate) {
        // feature requested: https://github.com/patternfly/patternfly-react/issues/9407
        filterValidate.pattern.lastIndex = 0;
        setInvalidFilter(!filterValidate.pattern.test(filterValue));
      }

      let selectionList: FuzzyEntryType[] = [];
      if (Array.isArray(selectionData)) {
        selectionList = selectionData;
      } else {
        Object.entries(selectionData || {}).forEach(([_group, list]) => {
          selectionList = [...selectionList, ...list];
        });
      }

      const filterText = filterValue.toLowerCase();
      const threshold = selectionList.find(({ label }) => label === filterText)
        ? 0
        : fuzziness ?? 0.3;
      const fuse = new Fuse(selectionList, {
        ignoreLocation: true,
        threshold,
        includeScore: true,
        includeMatches: true,
        // Allow to search by ID and by label, although the display order is always by label
        keys: ['label', 'entryId'],
      });

      const fuseResult = fuse
        .search<FuzzyEntryType>(filterText)
        // most relevant towards top, then by number
        .sort(
          ({ score: ax = 0, item: itemA }, { score: bx = 0, item: itemB }) =>
            ax - bx || sortFn(itemA, itemB),
        );

      const matchedEntries: FuzzyEntryType[] = [];
      const matchedEntriesByGroup: Record<string, FuzzyEntryType[]> = {};

      let hasGroupEntries = false;
      fuseResult.forEach(({ item, matches }) => {
        const shouldProcessItem = includeDisabledInSearchResults
          ? item && matches
          : item && !item.disabled && matches;
        if (shouldProcessItem) {
          if (item.groupId) {
            hasGroupEntries = true;
            if (matchedEntriesByGroup[item.groupId]) {
              matchedEntriesByGroup[item.groupId].push(item);
            } else {
              matchedEntriesByGroup[item.groupId] = [item];
            }
          } else {
            matchedEntries.push(item);
          }
        }
      });

      if (matchedEntries.length) {
        setSelectOptions(matchedEntries);
      } else if (hasGroupEntries) {
        setSelectOptions(matchedEntriesByGroup);
      } else {
        // no results
        setSelectOptions([
          {
            disabled: true,
            label: `No results found`,
            entryId: NO_RESULTS,
          },
        ]);
      }
    }
  }, [
    filterValidate,
    filterValue,
    fuzziness,
    includeDisabledInSearchResults,
    selectionData,
    sortFn,
  ]);

  const closeMenu = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const selectOption = useCallback(
    (
      value: string | number,
      label: string | number,
      _event?: React.MouseEvent<Element, MouseEvent> | undefined,
    ) => {
      setInputValue(String(label));
      setFilterValue('');
      if (selectedEntryId !== String(value)) {
        onSelect?.(_event, String(value));
      }
      closeMenu();
    },
    [closeMenu, onSelect, selectedEntryId],
  );

  const handleSelect = useCallback(
    (
      event: React.MouseEvent<Element, MouseEvent> | undefined,
      value: string | number | undefined,
    ) => {
      if (value && value !== NO_RESULTS) {
        const optionText = isGroupedSelect
          ? findGroupedItemById(selectOptions, String(value))?.label
          : selectOptions.find((option) => option.entryId === value)?.label;
        if (optionText) {
          selectOption(value, optionText, event);
        }
      }
    },
    [isGroupedSelect, selectOption, selectOptions],
  );

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setFilterValue(value);
  };

  const onToggleClick = () => {
    onOpenChange(!isOpen);
  };

  const onTextInputClear: SearchInputProps['onClear'] = (event) => {
    // preventing clearing the filter from closing the select
    event.stopPropagation();
    setFilterValue('');
  };

  useEffect(() => {
    // clearing the search field when clicking outside
    if (!isOpen && filterValue) {
      setFilterValue('');
    }
  }, [isOpen, filterValue]);

  useEffect(() => {
    // focusing the search field when opening the select. the popper is already opened
    // in the visible direction (up or down), no need to scroll
    if (isOpen) {
      textInputRef?.current?.focus({ preventScroll: true });
    }
  }, [isOpen, textInputRef]);

  useEffect(() => {
    // filling the menu toggle with the initially selected value (if present)
    if (selectedEntryId && !inputValue) {
      handleSelect(undefined, selectedEntryId);
    }
  }, [handleSelect, inputValue, selectedEntryId]);

  useEffect(() => {
    // when the selected item is cleared from the outside, reset input value
    if (!selectedEntryId) {
      setInputValue('');
    }
  }, [selectedEntryId]);

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      className="fuzzy-select__toggle"
      ref={toggleRef}
      aria-label="Options menu"
      onClick={onToggleClick}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      isFullWidth
      id={toggleId}
      status={validated}
      style={toggleStyle}
    >
      {inputValue || placeholderText}
    </MenuToggle>
  );

  const optionList = useMemo(() => {
    if (invalidFilter) {
      return (
        <SelectList aria-label="Select options list">
          <SelectOption isDisabled key="invalid-filter">
            <Alert variant="danger" isInline isPlain title={filterValidate?.message} />
          </SelectOption>
        </SelectList>
      );
    }

    if (
      Array.isArray(selectOptions) &&
      selectOptions.length === 1 &&
      selectOptions[0].entryId === NO_RESULTS
    ) {
      return (
        <SelectList aria-label="Select options list">
          <SelectOption isDisabled key="no-results">
            {selectOptions[0].label}
          </SelectOption>
        </SelectList>
      );
    }

    if (Array.isArray(selectOptions)) {
      const sortedItems = selectOptions.sort(sortFn);
      return (
        <SelectList aria-label="Select options list">
          {sortedItems.map((entry) => {
            const entryLabel = filterValue ? (
              <FuzzySelectMatchName key={entry.entryId} entry={entry} filterText={filterValue} />
            ) : (
              truncateTextWithEllipsis(entry.label, truncation)
            );
            return (
              <FuzzySelectOption
                key={entry.entryId}
                entry={entry}
                displayLabel={entryLabel}
                nonTruncatedLabel={entry.label}
                isPopover={isPopover}
              />
            );
          })}
        </SelectList>
      );
    }

    const originalOrder = Object.keys(selectionData);
    const sortedGroups = filterValue
      ? Object.entries(selectOptions).sort(
          ([groupA], [groupB]) => originalOrder.indexOf(groupA) - originalOrder.indexOf(groupB),
        )
      : Object.entries(selectOptions);

    return sortedGroups.map(([groupKey, groupEntries]) => (
      <SelectGroup label={groupKey} key={groupKey}>
        <SelectList aria-label={`Select options list for ${groupKey}`}>
          {groupEntries.map((groupEntry) => {
            const entryLabel = filterValue ? (
              <FuzzySelectMatchName
                key={groupEntry.entryId}
                entry={groupEntry}
                filterText={filterValue}
              />
            ) : (
              truncateTextWithEllipsis(groupEntry.label, truncation)
            );
            return (
              <FuzzySelectOption
                key={groupEntry.entryId}
                entry={groupEntry}
                displayLabel={entryLabel}
                nonTruncatedLabel={groupEntry.label}
                isPopover={isPopover}
              />
            );
          })}
        </SelectList>
      </SelectGroup>
    ));
  }, [
    invalidFilter,
    selectOptions,
    selectionData,
    filterValue,
    filterValidate?.message,
    sortFn,
    truncation,
    isPopover,
  ]);

  const scrollableClass = isScrollable && footer ? ' fuzzy-select--scrollable-with-footer' : '';

  return (
    <Select
      isOpen={isOpen}
      selected={selectedEntryId}
      onSelect={handleSelect}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeMenu();
        onOpenChange(isOpen);
      }}
      toggle={toggle}
      shouldFocusToggleOnSelect
      shouldFocusFirstItemOnOpen={false}
      onOpenChangeKeys={['Escape']}
      className={`openshift ${className ?? ''}${scrollableClass}`}
      isScrollable={isScrollable}
      {...rest}
    >
      <MenuSearch>
        <MenuSearchInput>
          <SearchInput
            value={filterValue}
            aria-label={inlineFilterPlaceholderText}
            onChange={onTextInputChange}
            onClear={onTextInputClear}
            placeholder={inlineFilterPlaceholderText}
            ref={textInputRef}
            name="filter"
          />
        </MenuSearchInput>
      </MenuSearch>
      <Divider />
      {additionalFilterControls}
      {optionList}
      {footer ? <MenuFooter className="fuzzy-select__footer">{footer}</MenuFooter> : null}
    </Select>
  );
};
