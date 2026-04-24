import React from 'react';
import { useField } from 'formik';

import { FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { FieldId } from '~/components/clusters/wizards/common';
import {
  filterAvailableChannelsForUnstableFeature,
  hasUnstableVersionsCapability,
} from '~/components/clusters/wizards/common/ClusterSettings/Details/versionSelectHelper';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { UNSTABLE_CLUSTER_VERSIONS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks';
import { Version } from '~/types/clusters_mgmt.v1';

export type ChannelSelectFieldProps = {
  clusterVersion?: Version;
};

export const ChannelSelectField = ({ clusterVersion }: ChannelSelectFieldProps) => {
  const [input] = useField(FieldId.VersionChannel);
  const organization = useGlobalState((state) => state.userProfile.organization.details);
  const unstableOCPVersionsEnabled =
    useFeatureGate(UNSTABLE_CLUSTER_VERSIONS) && hasUnstableVersionsCapability(organization);

  const versionChannels = filterAvailableChannelsForUnstableFeature(
    clusterVersion?.available_channels,
    unstableOCPVersionsEnabled,
    typeof input.value === 'string' ? input.value : '',
  );
  const hasChannels = !!versionChannels?.length;

  const popoverHint = (
    <PopoverHint
      buttonAriaLabel="Update channels information"
      hint={
        <>
          {constants.channelHint}{' '}
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
