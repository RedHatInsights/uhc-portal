import React from 'react';
import PropTypes from 'prop-types';

import { Content, Icon, Stack, StackItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import links, { channels, tools } from '../../../../../common/installLinks.mjs';

import RHCOSSection from './RHCOSSection/RHCOSSection';
import CLISection from './CLISection';
import DeveloperPreviewSection from './DeveloperPreviewSection';
import DownloadAndOSSelection from './DownloadAndOSSelection';
import PullSecretSection from './PullSecretSection';

function DownloadsAndPullSecretSection({
  token,
  showPreReleaseDocs = false,
  preReleaseDocsLink = links.INSTALL_PRE_RELEASE_INSTALLER_DOC,
  showPreReleasePageLink = true,
  preReleasePageLink = '/install/pre-release',
  children,
  pendoID,
  tool,
  channel,
  rhcos,
}) {
  return (
    <div>
      {children}
      <Stack hasGutter>
        <StackItem key="install">
          <Content component="h2">What you need to get started</Content>
          <>
            <Content component="h3">OpenShift installer</Content>
            <Content component="p">
              Download and extract the install program for your operating system and place the file
              in the directory where you will store the installation configuration files. Note: The
              OpenShift install program is only available for Linux and macOS at this time.
            </Content>
            {showPreReleaseDocs && (
              <Content component="p">
                For pre-release documentation, refer to the{' '}
                <Content
                  component="a"
                  href={preReleaseDocsLink}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  latest installer documentation{' '}
                  <Icon size="sm">
                    <ExternalLinkAltIcon />
                  </Icon>
                </Content>
                .
              </Content>
            )}
            <DownloadAndOSSelection tool={tool} channel={channel} pendoID={pendoID} />
            {showPreReleasePageLink && (
              <div>
                <DeveloperPreviewSection devPreviewLink={preReleasePageLink} />
              </div>
            )}
          </>
        </StackItem>
        <StackItem key="pull-secret">
          <Content>
            <Content component="h3">Pull secret</Content>
            <PullSecretSection token={token} pendoID={pendoID} />
          </Content>
        </StackItem>
        <StackItem key="cli">
          <Content component="h3">Command line interface</Content>
          <CLISection pendoID={pendoID} channel={channel} />
        </StackItem>
        {rhcos && (
          <StackItem key="rhcos">
            <Content component="h3">Red Hat Enterprise Linux CoreOS (RHCOS)</Content>
            <RHCOSSection token={token} pendoID={pendoID} rhcos={rhcos} />
          </StackItem>
        )}
      </Stack>
    </div>
  );
}

DownloadsAndPullSecretSection.propTypes = {
  showPreReleasePageLink: PropTypes.bool,
  showPreReleaseDocs: PropTypes.bool,
  preReleaseDocsLink: PropTypes.string,
  preReleasePageLink: PropTypes.string,
  token: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
  pendoID: PropTypes.string,
  tool: PropTypes.oneOf(Object.values(tools)).isRequired,
  channel: PropTypes.oneOf(Object.values(channels)).isRequired,
  rhcos: PropTypes.object,
};

export default DownloadsAndPullSecretSection;
