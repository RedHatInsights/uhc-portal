import React from 'react';
import { FieldInputProps } from 'formik';

import { Alert, FormSelect, FormSelectOption, Spinner } from '@patternfly/react-core';

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

export const MultiRegionCloudRegionSelectField = ({
  field,
  cloudProviderID,
  isDisabled,
  handleCloudRegionChange,
}: MultiRegionCloudRegionSelectFieldProps) => {
  const { setFieldValue } = useFormState();
  const [regions, setRegions] = React.useState<CheckedRegion[] | undefined>([]);

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
    return (
      <>
        <FormSelect
          name={field.name}
          className="cloud-region-combo-box"
          aria-label="Region"
          isDisabled={isDisabled}
          value={field.value}
          onChange={(_event, value) => {
            setFieldValue(field.name, value);
            handleCloudRegionChange?.();
          }}
        >
          {regions
            // Never hide current selection.  If current region is invalid we'll
            // normally force a different selection — but that affects next render.
            .filter((region) => !region.hide || region.id === field.value)
            .map((region) => (
              <FormSelectOption
                key={region.id}
                value={region.id}
                label={`${region.id}, ${region.display_name}`}
                isDisabled={!!region.disableReason}
              />
            ))}
        </FormSelect>
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
