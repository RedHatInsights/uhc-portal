import React from 'react';
import { FieldInputProps } from 'formik';

import { FormSelect, FormSelectOption, Spinner } from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';
import ErrorBox from '~/components/common/ErrorBox';

import { createChannelGroupLabel, GetInstallableVersionsResponse } from './versionSelectHelper';

interface ChannelGroupSelectFieldProps {
  field: FieldInputProps<string>;
  getInstallableVersionsResponse: GetInstallableVersionsResponse;
  isDisabled?: boolean;
}
export const ChannelGroupSelectField = ({
  field,
  getInstallableVersionsResponse,
  isDisabled,
}: ChannelGroupSelectFieldProps) => {
  const { setFieldValue } = useFormState();

  const channelGroups = React.useMemo(
    () => [
      ...new Set(getInstallableVersionsResponse?.versions?.map((version) => version.channel_group)),
    ],
    [getInstallableVersionsResponse?.versions],
  );

  React.useEffect(() => {
    if (
      getInstallableVersionsResponse.fulfilled &&
      channelGroups.length > 0 &&
      !channelGroups.includes(field.value)
    ) {
      setFieldValue(field.name, channelGroups[0]);
    }
  }, [
    getInstallableVersionsResponse.fulfilled,
    channelGroups,
    field.value,
    field.name,
    setFieldValue,
  ]);

  if (getInstallableVersionsResponse.fulfilled) {
    return (
      <FormSelect
        name={field.name}
        aria-label="Channel group"
        isDisabled={isDisabled}
        value={field.value}
        onChange={(_event, value) => {
          setFieldValue(field.name, value);
        }}
      >
        {channelGroups.map((channelGroup: any) => (
          <FormSelectOption
            key={channelGroup}
            value={channelGroup}
            label={createChannelGroupLabel(channelGroup)}
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
