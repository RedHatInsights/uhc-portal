import React from 'react';
import { FieldInputProps } from 'formik';

import { FormSelect, FormSelectOption, Spinner } from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';
import ErrorBox from '~/components/common/ErrorBox';
import { UNSTABLE_CLUSTER_VERSIONS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks/useGlobalState';

import {
  capitalizeChannelGroup,
  channelGroups as availableChannelGroups,
  GetInstallableVersionsResponse,
  hasUnstableVersionsCapability,
} from './versionSelectHelper';

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

  const organization = useGlobalState((state) => state.userProfile.organization.details);
  const unstableOCPVersionsEnabled =
    useFeatureGate(UNSTABLE_CLUSTER_VERSIONS) && hasUnstableVersionsCapability(organization);

  const channelGroups = unstableOCPVersionsEnabled
    ? [
        ...new Set(
          getInstallableVersionsResponse?.versions?.map((version) => version.channel_group),
        ),
      ]
    : [availableChannelGroups.STABLE];

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
