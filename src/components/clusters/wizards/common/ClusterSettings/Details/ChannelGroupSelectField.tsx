import React from 'react';
import { FieldInputProps } from 'formik';

import { FormSelect, FormSelectOption, Spinner } from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';
import ErrorBox from '~/components/common/ErrorBox';

import { GetInstallableVersionsResponse } from './versionSelectHelper';

interface ChannelGroupSelectFieldProps {
  field: FieldInputProps<string>;
  getInstallableVersionsResponse: GetInstallableVersionsResponse;
  isDisabled?: boolean;
  handleChannelGroupChange?(): void;
}
export const ChannelGroupSelectField = ({
  field,
  getInstallableVersionsResponse,
  isDisabled,
  handleChannelGroupChange,
}: ChannelGroupSelectFieldProps) => {
  const { setFieldValue } = useFormState();

  const channelGroups = [
    ...new Set(getInstallableVersionsResponse?.versions?.map((version) => version.channel_group)),
  ];

  const capitalizeChannelGroup = (channelGroup: string) => {
    if (channelGroup === 'eus') {
      return channelGroup.toUpperCase();
    }
    return channelGroup.charAt(0).toUpperCase() + channelGroup.slice(1);
  };

  if (getInstallableVersionsResponse.fulfilled) {
    return (
      <FormSelect
        name={field.name}
        aria-label="Channel group"
        isDisabled={isDisabled}
        value={field.value}
        onChange={(_event, value) => {
          setFieldValue(field.name, value);
          handleChannelGroupChange?.();
        }}
      >
        {channelGroups.map((channelGroup: any) => (
          <FormSelectOption
            key={channelGroup}
            value={channelGroup}
            label={capitalizeChannelGroup(channelGroup)}
          />
        ))}
      </FormSelect>
    );
  }

  return getInstallableVersionsResponse.error ? (
    <ErrorBox message="Error getting channel groups" response={getInstallableVersionsResponse} />
  ) : (
    <>
      <div className="spinner-fit-container">
        <Spinner size="lg" aria-label="Loading..." />
      </div>
      <div className="spinner-loading-text">Loading...</div>
    </>
  );
};
