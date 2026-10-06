import React from 'react';
import { useSelector } from 'react-redux';

import { Button } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons/dist/esm/icons/download-icon';

import { defaultArchitectureForOS, detectOS } from '~/components/downloads/downloadUtils';

import { channels, tools, urlsSelector } from '../../../../common/installLinks.mjs';

function DownloadOcCliButton() {
  // Determine the latest stable release URL for the OC CLI.
  const githubReleases = useSelector((state) => state.githubReleases) || {};
  const urls = urlsSelector(githubReleases);
  const detectedOs = detectOS();
  const detectedOsArchitecture = defaultArchitectureForOS(
    urls,
    tools.OC,
    channels.STABLE,
    detectedOs,
  );
  const href = detectedOsArchitecture
    ? urls[tools.OC][channels.STABLE][detectedOsArchitecture][detectedOs]
    : undefined;

  return href ? (
    <Button
      component="a"
      data-testid="download-oc-cli"
      href={href}
      variant="link"
      icon={<DownloadIcon />}
      isInline
    >
      Download OC CLI
    </Button>
  ) : null;
}

export default DownloadOcCliButton;
