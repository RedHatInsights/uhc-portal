import React from 'react';
import { useField } from 'formik';

import { FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
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
      buttonAriaLabel="Update channels information"
      hint={
        <>
          Channels are the mechanism by which you declare the Red Hat OpenShift Service on AWS minor
          version that you intend to upgrade the cluster to. The version number in the channel
          represents the target minor version that the cluster will eventually be upgraded to. This
          differs from Channel groups, which only showed the available z-stream updates within a
          particular minor version.
          <br />
          For example, if your cluster was using the Channel group EUS, it will be migrated to your
          current cluster minor version; that is, if your cluster is on version 4.18.29, the Channel
          will default to eus-4.18.{' '}
          <ExternalLink href={docLinks.OCP_UPDATE_CHANNELS}>Learn more</ExternalLink>
        </>
      }
    />
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
        {hasChannels ? (
          versionChannels?.map((channel: string) => (
            <FormSelectOption key={channel} value={channel} label={channel} />
          ))
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
