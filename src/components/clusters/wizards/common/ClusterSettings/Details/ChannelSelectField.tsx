import React from 'react';
import { useField } from 'formik';

import { FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';

import { FieldId } from '~/components/clusters/wizards/common';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { Version } from '~/types/clusters_mgmt.v1';

export type ChannelSelectFieldProps = {
  clusterVersion?: Version;
};

export const ChannelSelectField = ({ clusterVersion }: ChannelSelectFieldProps) => {
  const [input] = useField(FieldId.VersionChannel);

  // @ts-ignore - `available_channels` isn't available in API schemas yet
  const versionChannels = clusterVersion?.available_channels;
  const hasChannels = !!versionChannels?.length;

  const popoverHint = (
    <PopoverHint
      buttonAriaLabel="Version channels information"
      // todo - add real help text and a doc link
      hint={
        <>
          Lorem ipsum dolor sit amet.{' '}
          <ExternalLink href={/* links.___ */ ''}>Learn more about version channels</ExternalLink>
        </>
      }
    />
  );

  const selectOptions = hasChannels ? (
    versionChannels?.map((channel: any) => (
      <FormSelectOption key={channel} value={channel} label={channel} />
    ))
  ) : (
    <FormSelectOption label="No channels available for the selected version" />
  );

  return (
    <FormGroup
      label="Channel"
      labelHelp={popoverHint}
      fieldId={FieldId.VersionChannel}
      isRequired={hasChannels}
    >
      <FormSelect
        {...input}
        aria-label="Channel"
        isDisabled={!hasChannels}
        aria-disabled={!hasChannels}
      >
        {clusterVersion ? selectOptions : null}
      </FormSelect>
    </FormGroup>
  );
};
