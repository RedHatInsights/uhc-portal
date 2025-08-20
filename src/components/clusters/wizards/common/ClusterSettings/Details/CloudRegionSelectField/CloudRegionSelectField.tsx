import React from 'react';
import { FieldInputProps } from 'formik';

import { FormSelect, FormSelectOption, Spinner } from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';
import ErrorBox from '~/components/common/ErrorBox';
import { GlobalState } from '~/redux/stateTypes';

import { CheckedRegion, defaultRegionID } from './validRegions';

interface CloudRegionSelectFieldProps {
  field: FieldInputProps<string>;
  cloudProviderID: string;
  regions: CheckedRegion[];
  cloudProviders: GlobalState['cloudProviders'];
  isDisabled?: boolean;
  handleCloudRegionChange?(): void;
}

export const CloudRegionSelectField = ({
  field,
  cloudProviderID,
  cloudProviders,
  regions,
  isDisabled,
  handleCloudRegionChange,
}: CloudRegionSelectFieldProps) => {
  const { setFieldValue } = useFormState();

  React.useEffect(() => {
    const selectedRegionData = regions.find((r) => r.id === field.value);
    if (!selectedRegionData || selectedRegionData.disableReason) {
      const resetRegion = defaultRegionID(regions, cloudProviderID);
      if (resetRegion) {
        setFieldValue(field.name, resetRegion);
        handleCloudRegionChange?.();
      }
    }
  }, [regions, cloudProviderID, field.value, field.name, setFieldValue, handleCloudRegionChange]);

  if (cloudProviders.fulfilled) {
    return (
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
    );
  }

  return cloudProviders.error ? (
    <ErrorBox message="Error loading region list" response={cloudProviders} />
  ) : (
    <>
      <div className="spinner-fit-container">
        <Spinner size="lg" aria-label="Loading..." />
      </div>
      <div className="spinner-loading-text">Loading region list...</div>
    </>
  );
};
