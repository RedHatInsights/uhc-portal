import React from 'react';
import { useField } from 'formik';

import { FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import { FieldId } from '~/components/clusters/wizards/common';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { Version } from '~/types/clusters_mgmt.v1';

export type ChannelSelectFieldProps = {
  clusterVersion?: Version & { available_channels?: string[] };
};

export const ChannelSelectField = ({ clusterVersion }: ChannelSelectFieldProps) => {
  const [input] = useField(FieldId.VersionChannel);

  const versionChannels = clusterVersion?.available_channels;
  const hasChannels = !!versionChannels?.length;

  const popoverHint = (
    <PopoverHint
      buttonAriaLabel="Update channels information"
      hint={
        <>
          Channels provide recommended release versions and help control the pace of updates. Update
          channels align to a minor version, for example 4.20. To update to the next minor release,
          you might need to change the channel.{' '}
          <ExternalLink href={docLinks.OCP_UPDATE_CHANNELS}>Learn more</ExternalLink>
        </>
      }
    />
  );

  return (
    <FormGroup label="Channel" labelHelp={popoverHint} fieldId={FieldId.VersionChannel}>
      <FormSelect
        {...input}
        aria-label="Channel"
        isDisabled={!hasChannels}
        aria-disabled={!hasChannels}
      >
        {hasChannels ? (
          <>
            <FormSelectOption label="Select a channel" value="" isPlaceholder />
            {versionChannels?.map((channel: string) => (
              <FormSelectOption key={channel} value={channel} label={channel} />
            ))}
          </>
        ) : (
          <FormSelectOption
            label={clusterVersion ? 'No channels available for the selected version' : ''}
            isPlaceholder
          />
        )}
      </FormSelect>
    </FormGroup>
  );
};
