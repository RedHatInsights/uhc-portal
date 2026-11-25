import React from 'react';
import { useField } from 'formik';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { FieldId } from '~/components/clusters/wizards/common';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { Version } from '~/types/clusters_mgmt.v1';

export type ChannelSelectFieldProps = {
  clusterVersion?: Version;
};

export const ChannelSelectField = ({ clusterVersion }: ChannelSelectFieldProps) => {
  const [{ value }, , { setValue }] = useField<string>(FieldId.VersionChannel);
  const [isOpen, setIsOpen] = React.useState(false);

  const versionChannels = clusterVersion?.available_channels;
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

  const toggleLabel = (() => {
    if (!hasChannels) {
      return clusterVersion ? 'No channels available for the selected version' : '';
    }
    return value || 'Select a channel';
  })();

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={!hasChannels}
      isFullWidth
      aria-label="Channel"
      className="channel-select-menu-toggle"
    >
      {toggleLabel}
    </MenuToggle>
  );

  return (
    <FormGroup label="Channel" labelHelp={popoverHint} fieldId={FieldId.VersionChannel}>
      <Select
        isOpen={isOpen}
        selected={value}
        onSelect={(_event, selection) => {
          setValue(String(selection));
          setIsOpen(false);
        }}
        onOpenChange={setIsOpen}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>
          {hasChannels
            ? versionChannels?.map((channel: string) => (
                <SelectOption key={channel} value={channel}>
                  {channel}
                </SelectOption>
              ))
            : null}
        </SelectList>
      </Select>
    </FormGroup>
  );
};
