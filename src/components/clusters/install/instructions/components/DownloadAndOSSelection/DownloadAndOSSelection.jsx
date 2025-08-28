import React from 'react';
import PropTypes from 'prop-types';

import { Content, Grid, GridItem } from '@patternfly/react-core';

import { downloadChoice } from '~/components/downloads/downloadChoice';
import { detectOS } from '~/components/downloads/downloadUtils';

import {
  channels,
  githubReleasesToFetch,
  operatingSystems,
  tools,
  urlsSelector,
} from '../../../../../../common/installLinks.mjs';

const crcInstructionsMapping = {
  [operatingSystems.linux]: (
    <Content component="p">
      Download and extract the OpenShift Local archive for your operating system and place the
      binary in your <code>$PATH</code> .
    </Content>
  ),
  [operatingSystems.mac]: (
    <Content component="p">
      Download and open the OpenShift Local file. Opening the file will automatically start a
      step-by-step installation guide.
    </Content>
  ),
  [operatingSystems.windows]: (
    <Content component="p">
      Download and extract the OpenShift Local archive on your computer and open the installer.
      Opening the installer will automatically start a step-by-step installation guide.
    </Content>
  ),
};

const DownloadAndOSSelection = ({ githubReleases, getLatestRelease, pendoID, tool, channel }) => {
  const [selections, setSelections] = React.useState({});

  React.useEffect(() => {
    githubReleasesToFetch.forEach((repo) => {
      if (!githubReleases[repo].fulfilled) {
        getLatestRelease(repo);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const urls = urlsSelector(githubReleases);

  const OS = selections[tool]?.OS || detectOS();
  const isCRC = tool === tools.CRC;

  const chooser = downloadChoice(selections, setSelections, urls, tool, channel, {
    pendoID,
  });

  return (
    <>
      {isCRC && crcInstructionsMapping[OS]}
      <Grid hasGutter className="os-based-download">
        <GridItem md={3}>{chooser.osDropdown}</GridItem>
        <GridItem md={4}>{chooser.archDropdown}</GridItem>
        <GridItem md={5}>{chooser.downloadButton}</GridItem>
      </Grid>
    </>
  );
};

DownloadAndOSSelection.propTypes = {
  pendoID: PropTypes.string,
  tool: PropTypes.oneOf(Object.values(tools)).isRequired,
  channel: PropTypes.oneOf(Object.values(channels)).isRequired,
  githubReleases: PropTypes.object.isRequired,
  getLatestRelease: PropTypes.func.isRequired,
};

export default DownloadAndOSSelection;
