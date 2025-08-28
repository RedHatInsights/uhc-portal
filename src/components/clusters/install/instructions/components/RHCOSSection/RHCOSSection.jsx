import React from 'react';
import PropTypes from 'prop-types';

import { Content, Stack, StackItem } from '@patternfly/react-core';

import { tools } from '../../../../../../common/installLinks.mjs';
import ExternalLink from '../../../../../common/ExternalLink';
import DownloadButton from '../DownloadButton';

import RHCOSDownloadAndSelect from './RHCOSDownloadAndSelect';

const RHCOSSection = (props) => {
  const { token, pendoID, rhcos } = props;
  const downloadButtons = (rhcosDownloads) => {
    // rhcosDownloads is an array where each item corresponds to a row of buttons
    const buttons = rhcosDownloads.map((item) => {
      const { url, archURL, buttonText, name } = item;
      /** item may be an object with field archURL when there are multi-arch variants available
       * for it. It may also be an array of such objects, which corresponds to a row of buttons
       * controlled by the same architecture selector,  */
      if ((!url && archURL) || Array.isArray(item)) {
        const key = Array.isArray(item) ? item.map((i) => i.name).join('|') : name;
        return (
          <RHCOSDownloadAndSelect key={key} rhcosDownloads={item} pendoID={pendoID} token={token} />
        );
      }
      return (
        <StackItem key={name}>
          <DownloadButton
            url={url}
            tool={tools.RHCOS}
            text={buttonText}
            name={name}
            disabled={!token}
            pendoID={pendoID}
          />
        </StackItem>
      );
    });
    return (
      <Stack hasGutter className="pf-v6-u-mt-md">
        {buttons}
      </Stack>
    );
  };
  return (
    <>
      <Content component="p">
        Download RHCOS to create machines for your cluster to use during installation.
        {rhcos.additionalInstructions && typeof rhcos.additionalInstructions === 'string' && (
          <> {rhcos.additionalInstructions}</>
        )}{' '}
        {rhcos.learnMoreURL && <ExternalLink href={rhcos.learnMoreURL}>Learn more</ExternalLink>}
      </Content>
      {rhcos.additionalInstructions && typeof rhcos.additionalInstructions !== 'string' && (
        <> {rhcos.additionalInstructions}</>
      )}
      {downloadButtons(rhcos.downloads)}
    </>
  );
};

RHCOSSection.propTypes = {
  pendoID: PropTypes.string,
  token: PropTypes.object.isRequired,
  rhcos: PropTypes.object.isRequired,
};

export default RHCOSSection;
