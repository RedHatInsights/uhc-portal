// PersistentStorageDropdown shows a selection of storage options
// for setting on the installed a cluster.

import React from 'react';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Tooltip,
} from '@patternfly/react-core';

import { useFetchStorageQuotaValues } from '~/queries/ClusterActionsQueries/useFetchStorageQuotaValues';
import { useFetchOrganizationAndQuota } from '~/queries/common/useFetchOrganizationAndQuota';

import { noQuotaTooltip } from '../../../../common/helpers';
import { humanizeValueWithUnitGiB } from '../../../../common/units';
import ErrorBox from '../../../common/ErrorBox';
import { QuotaTypes } from '../quotaModel';
import { availableQuota } from '../quotaSelectors';

import { filterPersistentStorageValuesByQuota } from './PersistentStorageDropDownHelper';

type PersistentStorageDropdownProps = {
  input: {
    value?: string | number;
    onChange: (value: string) => void;
  };
  disabled: boolean;
  currentValue: any;
  billingModel: any;
  product: string;
  cloudProviderID: string;
  isBYOC: boolean;
  isMultiAZ: boolean;
  region: string;
};

const formatStorageLabel = (value: number) => {
  const valueWithUnit = humanizeValueWithUnitGiB(value);
  return `${valueWithUnit.value} ${valueWithUnit.unit}`;
};

const PersistentStorageDropdown = ({
  input,
  disabled,
  currentValue,
  billingModel,
  product,
  cloudProviderID,
  isBYOC,
  isMultiAZ,
  region,
}: PersistentStorageDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const {
    data: persistentStorageValues,
    isFetched: persistentStorageIsFetched,
    isError: persistentStorageIsError,
    error: persistentStorageError,
  } = useFetchStorageQuotaValues(region);

  const {
    quota: quotaList,
    isError: quotaIsError,
    error: quotaError,
    isFetched: quotaFetched,
  } = useFetchOrganizationAndQuota();

  if (persistentStorageIsFetched && !persistentStorageIsError && quotaFetched && !quotaIsError) {
    const storageQuota = availableQuota(quotaList, {
      resourceType: QuotaTypes.STORAGE,
      billingModel,
      product,
      cloudProviderID,
      isBYOC,
      // @ts-ignore
      isMultiAZ,
      resourceName: 'gp2',
    });

    const filteredStorageValues = filterPersistentStorageValuesByQuota(
      currentValue,
      persistentStorageValues,
      storageQuota,
    );
    const notEnoughQuota = filteredStorageValues.values.length <= 1;
    const isDisabled = disabled || notEnoughQuota;
    const sortedValues = filteredStorageValues.values.sort(
      (a: { value: number }, b: { value: number }) => a.value - b.value,
    );
    const selectedValue = input.value?.toString() ?? '';
    const selectedLabel =
      selectedValue !== '' && Number.isFinite(Number(selectedValue))
        ? formatStorageLabel(Number(selectedValue))
        : selectedValue;

    const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
      <MenuToggle
        ref={toggleRef}
        onClick={() => setIsOpen(!isOpen)}
        isExpanded={isOpen}
        isDisabled={isDisabled}
        isFullWidth
        aria-label="Persistent Storage"
        className="quota-dropdown"
      >
        {selectedLabel}
      </MenuToggle>
    );

    const select = (
      <Select
        isOpen={isOpen}
        selected={selectedValue}
        onSelect={(_event, selection) => {
          input.onChange(String(selection));
          setIsOpen(false);
        }}
        onOpenChange={setIsOpen}
        toggle={toggle}
        shouldFocusToggleOnSelect
        isScrollable
        maxMenuHeight="200px"
      >
        <SelectList>
          {sortedValues.map((value: { value: number }) => {
            const strValue = value.value.toString();
            return (
              <SelectOption key={strValue} value={strValue}>
                {formatStorageLabel(value.value)}
              </SelectOption>
            );
          })}
        </SelectList>
      </Select>
    );

    if (notEnoughQuota) {
      return (
        <Tooltip content={noQuotaTooltip} position="right">
          <div>{select}</div>
        </Tooltip>
      );
    }
    return select;
  }

  return persistentStorageIsError || quotaIsError ? (
    <ErrorBox
      message="Error loading persistent storage list"
      response={persistentStorageError || quotaError || {}}
    />
  ) : (
    <>
      <div className="spinner-fit-container">
        <Spinner size="lg" aria-label="Loading..." />
      </div>
      <div className="spinner-loading-text">Loading persistent storage list...</div>
    </>
  );
};

export default PersistentStorageDropdown;
