import React from 'react';
import { FieldInputProps } from 'formik';

import {
  Alert,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';
import ErrorBox from '~/components/common/ErrorBox';
import { useFetchGetMultiRegionAvailableRegions } from '~/queries/RosaWizardQueries/useFetchGetMultiRegionAvailableRegions';
import { ErrorState } from '~/types/types';

import { CheckedRegion, defaultRegionID } from './validRegions';

interface MultiRegionCloudRegionSelectFieldProps {
  field: FieldInputProps<string>;
  cloudProviderID: string;
  isDisabled?: boolean;
  handleCloudRegionChange?(): void;
}

const regionLabel = (region: CheckedRegion) => `${region.id}, ${region.display_name}`;

export const MultiRegionCloudRegionSelectField = ({
  field,
  cloudProviderID,
  isDisabled,
  handleCloudRegionChange,
}: MultiRegionCloudRegionSelectFieldProps) => {
  const { setFieldValue } = useFormState();
  const [regions, setRegions] = React.useState<CheckedRegion[] | undefined>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  const {
    data: multiRegions,
    isFetching,
    isError,
    error,
    isSuccess,
    isFailedRegionalizedRegions,
    isFailedGlobalRegions,
    isFailedRegionalAndGlobal,
  } = useFetchGetMultiRegionAvailableRegions();

  React.useEffect(() => {
    setRegions(multiRegions as CheckedRegion[]);
  }, [multiRegions]);

  React.useEffect(() => {
    if (regions) {
      const selectedRegionData = regions.find((r) => r.id === field.value);
      if (!selectedRegionData || selectedRegionData.disableReason) {
        const resetRegion = defaultRegionID(regions, cloudProviderID);
        if (resetRegion) {
          setFieldValue(field.name, resetRegion);
          handleCloudRegionChange?.();
        }
      }
    }
  }, [regions, cloudProviderID, field.value, field.name, setFieldValue, handleCloudRegionChange]);

  const displayWarning =
    (isFailedRegionalizedRegions || isFailedGlobalRegions) && !isFailedRegionalAndGlobal;

  if (isSuccess && !isFetching && regions) {
    const visibleRegions = regions.filter(
      // Never hide current selection.  If current region is invalid we'll
      // normally force a different selection — but that affects next render.
      (region) => !region.hide || region.id === field.value,
    );
    const selectedRegion = visibleRegions.find((region) => region.id === field.value);

    const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
      <MenuToggle
        ref={toggleRef}
        onClick={() => setIsOpen(!isOpen)}
        isExpanded={isOpen}
        isDisabled={isDisabled}
        isFullWidth
        aria-label="Region"
        className="cloud-region-combo-box"
      >
        {selectedRegion ? regionLabel(selectedRegion) : field.value}
      </MenuToggle>
    );

    return (
      <>
        <Select
          isOpen={isOpen}
          selected={field.value}
          onSelect={(_event, selection) => {
            setFieldValue(field.name, String(selection));
            handleCloudRegionChange?.();
            setIsOpen(false);
          }}
          onOpenChange={setIsOpen}
          toggle={toggle}
          shouldFocusToggleOnSelect
          isScrollable
          maxMenuHeight="20em"
        >
          <SelectList>
            {visibleRegions.map((region) => (
              <SelectOption
                key={region.id}
                value={region.id}
                isDisabled={!!region.disableReason}
                description={region.disableReason}
              >
                {regionLabel(region)}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
        {displayWarning ? (
          <Alert
            title="Some regions failed to load"
            variant="warning"
            isInline
            className="pf-v6-u-pt-sm"
          />
        ) : null}
      </>
    );
  }

  return isError ? (
    <ErrorBox
      message="Error loading region list"
      response={error as Pick<ErrorState, 'errorMessage' | 'errorDetails' | 'operationID'>}
    />
  ) : (
    <>
      <div className="spinner-fit-container">
        <Spinner size="lg" aria-label="Loading..." />
      </div>
      <div className="spinner-loading-text">Loading region list...</div>
    </>
  );
};
