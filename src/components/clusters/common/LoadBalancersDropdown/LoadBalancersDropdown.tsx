// LoadBalancersDropdown shows a selection of load balancer
// options for setting on the installed a cluster.

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

import { useFetchLoadBalancerQuotaValues } from '~/queries/ClusterActionsQueries/useFetchLoadBalancerQuotaValues';
import { useFetchOrganizationAndQuota } from '~/queries/common/useFetchOrganizationAndQuota';

import { noQuotaTooltip } from '../../../../common/helpers';
import ErrorBox from '../../../common/ErrorBox';
import { QuotaTypes } from '../quotaModel';
import { availableQuota } from '../quotaSelectors';

import { filterLoadBalancerValuesByQuota } from './LoadBalancersDropdownHelper';

type LoadBalancersDropdownProps = {
  input: {
    value?: string | number;
    onChange: (value: string) => void;
  };
  disabled: boolean;
  currentValue: string;
  billingModel: any;
  product: string;
  cloudProviderID: string;
  isBYOC: boolean;
  isMultiAZ: boolean;
  region: string;
};

const LoadBalancersDropdown = ({
  input,
  disabled,
  currentValue,
  billingModel,
  product,
  cloudProviderID,
  isBYOC,
  isMultiAZ,
  region,
}: LoadBalancersDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const {
    data: loadBalancerValues,
    isError: loadBalancerValuesIsError,
    error: loadBalancerValuesError,
  } = useFetchLoadBalancerQuotaValues(region);

  const {
    quota: quotaList,
    isError: quotaListIsError,
    error: quotaListError,
  } = useFetchOrganizationAndQuota();

  if (loadBalancerValues && !loadBalancerValuesIsError && quotaList && !quotaListError) {
    const query = {
      resourceType: QuotaTypes.LOAD_BALANCER,
      billingModel,
      product,
      cloudProviderID,
      isBYOC,
      isMultiAZ,
    };
    // @ts-ignore
    const quota = availableQuota(quotaList, query);

    const filteredValues = filterLoadBalancerValuesByQuota(currentValue, loadBalancerValues, quota);
    const notEnoughQuota = filteredValues.values.length <= 1;
    const isDisabled = disabled || notEnoughQuota;
    const selectedValue = input.value?.toString() ?? '';

    const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
      <MenuToggle
        ref={toggleRef}
        onClick={() => setIsOpen(!isOpen)}
        isExpanded={isOpen}
        isDisabled={isDisabled}
        isFullWidth
        aria-label="Load Balancers"
        className="quota-dropdown"
      >
        {selectedValue}
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
          {filteredValues.values.map((value: number | string) => {
            const strValue = value.toString();
            return (
              <SelectOption key={strValue} value={strValue}>
                {strValue}
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

  return loadBalancerValuesIsError || quotaListIsError ? (
    <ErrorBox
      message="Error loading load balancers list"
      response={loadBalancerValuesError || {}}
    />
  ) : (
    <>
      <div className="spinner-fit-container">
        <Spinner size="lg" aria-label="Loading..." />
      </div>
      <div className="spinner-loading-text">Loading load balancers list...</div>
    </>
  );
};

export default LoadBalancersDropdown;
